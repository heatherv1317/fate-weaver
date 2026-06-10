import { useState } from 'react';
import { Card, Btn, Tag, SectionHeader, StatBar } from '../components/UI.jsx';
import { T, ENERGY, SEASON_LIMITS, getEnergyMax, STATS, STAT_FULL, STAT_COLOR, MEAL_TIERS, getMealEffect, getReputation, rand, chance } from '../gameData.js';

const SICKNESSES = [
  { id:'fever',      name:'Fever',         stat:'CON', drain:1, cost:5,  severity:1, desc:'A persistent heat. Manageable, for now.' },
  { id:'lungrot',    name:'Lungrot',       stat:'CON', drain:2, cost:15, severity:2, desc:'A wet cough that will not leave.' },
  { id:'plague',     name:'Plague',        stat:'CON', drain:2, cost:20, severity:3, desc:'The black spots appeared three days ago.' },
  { id:'curse',      name:'Wasting Curse', stat:'WIS', drain:1, cost:30, severity:2, desc:'Something unnatural is eating at your mind.' },
  { id:'shadowbite', name:'Shadowbite',    stat:'STR', drain:2, cost:25, severity:3, desc:'The wound from that creature never healed right.' },
  { id:'mildsore',   name:'Mild Sore',     stat:'CON', drain:1, cost:3,  severity:1, desc:'Nothing serious. Treat it before it is.' },
];

export function rollSickness(){ return SICKNESSES[Math.floor(Math.random()*SICKNESSES.length)]; }

const TRAIN_OPTIONS = [
  { stat:'STR', label:'Strength',   emoji:'💪', desc:'Lift, carry, fight.',        cost:2, energyCost:ENERGY.train },
  { stat:'DEX', label:'Agility',    emoji:'🤸', desc:'Balance, speed, precision.', cost:2, energyCost:ENERGY.train },
  { stat:'INT', label:'Study',      emoji:'📖', desc:'Read. Think. Question.',      cost:3, energyCost:ENERGY.train },
  { stat:'WIS', label:'Meditate',   emoji:'🧘', desc:'Sit with the quiet.',         cost:0, energyCost:ENERGY.train },
  { stat:'CHA', label:'Socialise',  emoji:'🗣', desc:'Learn people\'s faces.',       cost:0, energyCost:ENERGY.train },
  { stat:'CON', label:'Endurance',  emoji:'🏃', desc:'Push until it hurts.',        cost:2, energyCost:ENERGY.train },
];

function getSeasonLeft(char, key){ return Math.max(0,(SEASON_LIMITS[key]||99)-(char.seasonActions?.[key]||0)); }

function getParent(char){
  return (char.relationships||[]).find(r=>r.type==='parent' && r.alive!==false);
}

export default function HealthTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const trainLeft   = getSeasonLeft(char,'train');
  const apothLeft   = getSeasonLeft(char,'apothecary')||99;
  const isChild = char.age < 13;
  const parent = getParent(char);

  function askParent(){
    if(!char.sickness) return;
    const s = char.sickness;
    const parentScore = parent?.score||50;
    const parentName = parent?.name||'your parent';
    const scolded = parentScore < 50;
    const updatedRels = (char.relationships||[]).map(r=>{
      if(r.id===parent?.id) return { ...r, score: scolded ? Math.max(0,r.score-5) : r.score };
      return r;
    });
    const updated = {
      ...char, gold:char.gold, sickness:null, relationships:updatedRels,

      yearActions:[...(char.yearActions||[]), `${parentName} took you to the apothecary`],
      log:[...(char.log||[]),{ age:char.age,
        text:scolded ? `${parentName} took you to the apothecary and paid, but made sure you knew about it.`
                     : `${parentName} took you to the apothecary without a fuss. ${s.name} cleared.`,
        type:'good' }],
    };
    setResult({ text:scolded ? `${parentName} paid but scolded you the whole way home. ${s.name} cleared.`
                              : `${parentName} took you straight away. ${s.name} cleared.`, bad:false });
    onAction(updated);
  }

  function cure(){
    if(!char.sickness) return;
    const s = char.sickness;
    if(char.gold < s.cost){ setResult({text:`You can't afford the cure (${s.cost}g). You have ${char.gold}g.`,bad:true}); return; }

    const updated = {
      ...char, gold:char.gold-s.cost, sickness:null,

      yearActions:[...(char.yearActions||[]), `Visited apothecary — cured ${s.name} (−${s.cost}g)`],
      log:[...(char.log||[]),{ age:char.age, text:`Cured of ${s.name}.`, type:'good' }],
    };
    setResult({ text:`The remedy worked. ${s.name} cleared.`, bad:false });
    onAction(updated);
  }

  function rest(){
    if(!char.sickness) return;

    const s = char.sickness;
    const recovered = chance(25);
    const updated = {
      ...char,
      sickness: recovered ? null : s,
      stats: recovered ? char.stats : { ...char.stats, [s.stat]:Math.max(1,(char.stats[s.stat]||1)-Math.ceil(s.drain/2)) },

      yearActions:[...(char.yearActions||[]), recovered?'Recovered through rest':'Rested — illness persists'],
      log:[...(char.log||[]),{ age:char.age, text:recovered?'Recovered from illness.':'Rested but illness persists.', type:recovered?'good':'bad' }],
    };
    setResult({ text:recovered?'Rest was enough. You recover.':'Rest helped a little. The illness clings on.', bad:!recovered });
    onAction(updated);
  }

  function train(option){
    if(trainLeft <= 0){ setResult({text:'You have trained enough this season.',bad:true}); return; }
    if(option.cost > 0 && char.gold < option.cost){ setResult({text:`Need ${option.cost}g for this.`,bad:true}); return; }
    const gain = chance(70) ? 1 : 0;
    const updated = {
      ...char,
      gold: char.gold-(option.cost||0),
      stats: gain ? { ...char.stats, [option.stat]:Math.min(20,(char.stats[option.stat]||1)+1) } : char.stats,
      seasonActions:{ ...(char.seasonActions||{}), train:((char.seasonActions?.train)||0)+1 },
      yearActions:[...(char.yearActions||[]), `${option.label}${gain?` — ${option.stat} improved!`:''}`],
      log:[...(char.log||[]),{ age:char.age, text:`${option.label}.${gain?` ${option.stat} +1.`:''}`, type:gain?'good':'neutral' }],
    };
    setResult({ text:gain?`${option.label} — ${STAT_FULL[option.stat]} improved!`:`${option.label} — no breakthrough today, but the practice helps.`, bad:false });
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch', flex:1}}>

      {result && (
        <Card accent={result.bad?T.red:T.green}>
          <p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p>
          <Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn>
        </Card>
      )}

      {/* Health bar */}
      <SectionHeader>Condition</SectionHeader>
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <span style={{fontSize:'13px',color:T.muted}}>Health</span>
          <span style={{fontSize:'16px',fontWeight:700,color:char.health>60?T.green:char.health>30?T.gold:T.red}}>{char.health}%</span>
        </div>
        <div style={{height:'8px',background:'#1a1208',borderRadius:'4px',overflow:'hidden',border:`1px solid ${T.border}`}}>
          <div style={{height:'100%',width:`${char.health}%`,background:char.health>60?T.green:char.health>30?T.gold:T.red,borderRadius:'4px',transition:'width 0.4s'}}/>
        </div>
      </Card>

      {/* Sickness */}
      {char.sickness ? (
        <Card accent={T.red}>
          <Tag colour={T.red}>{char.sickness.name}</Tag>
          <p style={{fontSize:'12px',color:T.muted,marginTop:'6px',marginBottom:'4px'}}>{char.sickness.desc||'An illness weakens you.'}</p>
          <p style={{fontSize:'12px',color:T.red,marginBottom:'12px'}}>Draining {char.sickness.stat} by {char.sickness.drain}/year.</p>
          {/* Treatment grid */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {parent && (
              <button onClick={askParent} style={blockStyle(T.green, false)}>
                <span style={{fontSize:'24px'}}>👨‍👩‍👦</span>
                <span style={{fontSize:'12px',fontWeight:700,color:T.text}}>Ask Parent</span>
                <span style={{fontSize:'10px',color:T.green}}>They pay</span>
              </button>
            )}
            <button onClick={cure} style={blockStyle(T.green, (char.gold||0) < char.sickness.cost)}>
              <span style={{fontSize:'24px'}}>⚗</span>
              <span style={{fontSize:'12px',fontWeight:700,color:T.text}}>Apothecary</span>
              <span style={{fontSize:'10px',color:T.green}}>{char.sickness.cost}g</span>
            </button>
            <button onClick={rest} style={blockStyle(T.muted, false)}>
              <span style={{fontSize:'24px'}}>🛏</span>
              <span style={{fontSize:'12px',fontWeight:700,color:T.text}}>Rest</span>
              <span style={{fontSize:'10px',color:T.muted}}>25% chance</span>
            </button>
          </div>
        </Card>
      ) : (
        <Card style={{textAlign:'center',padding:'14px'}}>
          <p style={{fontSize:'13px',color:T.green}}>✓ No illness</p>
        </Card>
      )}

      {/* Stats */}
      <SectionHeader>Stats</SectionHeader>
      <Card>
        {STATS.map(s=><StatBar key={s} stat={s} value={char.stats?.[s]||0}/>)}
      </Card>

      {/* Training grid */}
      {char.age >= 8 && (
        <>
          <SectionHeader>Train · {trainLeft}/{SEASON_LIMITS.train||2} left this season</SectionHeader>
          <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px'}}>70% chance of +1 to the chosen stat.</p>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {TRAIN_OPTIONS.map(opt=>{
              const canDo = trainLeft>0 && (opt.cost===0||char.gold>=opt.cost);
              return (
                <button key={opt.stat} onClick={()=>train(opt)} disabled={!canDo} style={blockStyle(STAT_COLOR[opt.stat], !canDo)}>
                  <span style={{fontSize:'28px',lineHeight:1}}>{opt.emoji}</span>
                  <span style={{fontSize:'12px',fontWeight:700,color:canDo?T.text:T.muted}}>{opt.label}</span>
                  <span style={{fontSize:'10px',color:canDo?STAT_COLOR[opt.stat]:T.muted}}>
                    {opt.stat}{opt.cost>0?` · ${opt.cost}g`:''}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* MEAL PREFERENCE */}
      <SectionHeader>Meal Preference</SectionHeader>
      {(()=>{
        const hasHome   = (char.properties||[]).some(p=>p.isHome&&p.type!=='tent');
        const loc       = char.location||'village';
        const rep       = getReputation(char);
        const parentAlive = (char.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false&&!r.disowned);
        const atHome    = !char.hasMovedOut && parentAlive;
        if(atHome) return (
          <Card><p style={{fontSize:'11px',color:T.muted,fontStyle:'italic'}}>Your parents keep you fed. No need to worry about meals yet.</p></Card>
        );
        const reqMet = (t)=>{
          if(!t.req) return true;
          if(t.req==='home') return hasHome;
          if(t.req==='village') return true;
          if(t.req==='town') return ['town','city'].includes(loc);
          if(t.req==='city') return loc==='city';
          if(t.req==='banquet') return loc==='city'&&['Respected','Renowned','Beloved'].includes(rep?.label);
          return false;
        };
        return (
          <div>
            <p style={{fontSize:'10px',color:T.muted,marginBottom:'8px'}}>
              Your chosen meal is applied automatically each season. Cost deducted, health adjusted.
            </p>
            {MEAL_TIERS.filter(t=>t.id!=='none').map(tier=>{
              const met       = reqMet(tier);
              const {cost,health} = getMealEffect(char, tier);
              const selected  = char.mealPreference===tier.id;
              const canAfford = (char.gold||0) >= cost;
              return (
                <button key={tier.id}
                  onClick={()=>{ if(met) onAction({...char,mealPreference:tier.id}); }}
                  disabled={!met}
                  style={{
                    display:'flex',justifyContent:'space-between',alignItems:'center',
                    width:'100%',marginBottom:'6px',padding:'8px 10px',
                    background:selected?T.gold+'22':T.panel,
                    border:`1px solid ${selected?T.gold:met?T.border:T.border+'44'}`,
                    borderRadius:'8px',cursor:met?'pointer':'default',
                    opacity:met?1:0.45,WebkitTapHighlightColor:'transparent',
                    textAlign:'left',
                  }}
                >
                  <div>
                    <span style={{fontSize:'11px',color:selected?T.gold:met?T.text:T.muted,fontWeight:selected?700:400}}>
                      {tier.emoji} {tier.name}
                    </span>
                    <div style={{fontSize:'9px',color:T.muted,marginTop:'1px'}}>{tier.desc}</div>
                    {!met&&<div style={{fontSize:'8px',color:T.crimson,marginTop:'1px'}}>
                      {tier.req==='home'?'Requires a home':tier.req==='town'?'Requires town/city':tier.req==='city'?'Requires Ironspire':'Requires reputation'}
                    </div>}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginLeft:'8px'}}>
                    <div style={{fontSize:'10px',color:cost>0?T.gold:T.green}}>{cost>0?`${cost}g`:'Free'}</div>
                    <div style={{fontSize:'9px',color:health>0?T.green:health<0?T.red:T.muted}}>
                      {health>0?`+${health} hp`:health<0?`${health} hp`:'±0 hp'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function blockStyle(colour, disabled){
  return {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    padding:'12px 8px', gap:'4px', textAlign:'center',
    background: disabled ? T.panel+'88' : T.panel,
    border:`2px solid ${disabled ? T.border+'66' : colour}`,
    borderRadius:'12px',
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? 'default' : 'pointer',
    transition:'all 0.15s',
    WebkitTapHighlightColor:'transparent',
  };
}
