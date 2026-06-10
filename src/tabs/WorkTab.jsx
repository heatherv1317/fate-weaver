import { useState } from 'react';
import { Card, Btn, Tag, SectionHeader } from '../components/UI.jsx';
import { T, ENERGY, SEASON_LIMITS, LOCATIONS, getSeason, getCurrentSeason, getActionSuccessChance, JOB_SEASONS, isJobAvailable, rand, chance, callAI } from '../gameData.js';

const JOBS = {
  village: [
    { id:'farm',      name:'Farm Labour',       emoji:'🌾', pay:[2,5],   skillReq:null,           desc:'Hard work. Honest pay.' },
    { id:'smithy',    name:'Smithy Assistant',  emoji:'🔨', pay:[3,7],  skillReq:{stat:'STR',min:8},     desc:'Carry, lift, learn. Needs strength — or an apprenticeship.' },
    { id:'herb',      name:'Herb Gathering',    emoji:'🌿', pay:[3,6],   skillReq:null,           desc:'Into the woods. Peaceful.', seasons:['spring','summer','autumn'] },
    { id:'guard',     name:'Night Watch',       emoji:'🛡', pay:[4,8],  skillReq:{combat:2},     desc:'Guard duty. Dull but reliable.' },
    { id:'vkitchen',  name:'Kitchen Hand',      emoji:'🍲', pay:[2,5],   skillReq:null,           desc:'Chop, stir, clean. Learn by doing.' },
    { id:'vcarpent',  name:'Carpentry Work',    emoji:'🪵', pay:[3,6],   skillReq:null,           desc:'Build fences, fix roofs, do it right.', seasons:['spring','summer','autumn'] },
    { id:'tend_animals', name:'Tend Animals',   emoji:'🐑', pay:[2,5],   skillReq:null,           desc:'Care for livestock. Patient work. Connects you to the land.' },
  ],
  town: [
    { id:'shop_asst', name:'Shop Assistant',    emoji:'🏪', pay:[5,10],  skillReq:null,           desc:'Serve customers, learn the trade. Leads to merchant class.' },
    { id:'bouncer',   name:'Tavern Bouncer',    emoji:'🍺', pay:[5,9],  skillReq:{combat:2},     desc:'Keep the peace. Occasionally fail.' },
    { id:'courier',   name:'Message Courier',   emoji:'📜', pay:[4,8],  skillReq:null,           desc:'Fast legs, sealed lips.' },
    { id:'scribe',    name:'Scribe Assistant',  emoji:'📖', pay:[6,12],  skillReq:{stat:'INT',min:8}, desc:'Copy documents. Slow but lucrative. Needs a sharp mind — or training.' },
    { id:'healer',    name:"Healer's Aide",     emoji:'💚', pay:[5,10],  skillReq:{stat:'WIS',min:8},      desc:'Mix remedies. Tend the sick. Needs wisdom — or an apprenticeship.' },
    { id:'tcook',     name:'Cook / Chef',       emoji:'🍳', pay:[6,12],  skillReq:null,           desc:'Feed people well. They remember it.' },
    { id:'tbuilder',  name:'Builder',           emoji:'🔨', pay:[7,13], skillReq:null,           desc:'Construction. There is always demand.', seasons:['spring','summer','autumn'] },
    { id:'tailoring', name:"Tailor's Bench",    emoji:'🧵', pay:[5,11], skillReq:{stat:'DEX',min:8}, desc:'Cut, stitch, fit. Deft hands — or an apprenticeship.' },
    { id:'jewelcraft',name:"Jeweller's Bench",  emoji:'💎', pay:[7,14], skillReq:{stat:'INT',min:8}, desc:'Precise, patient work. A keen eye — or an apprenticeship.' },
    
    { id:'tinnkeep',  name:'Innkeeper',         emoji:'🏨', pay:[8,14], skillReq:null,           desc:'Rooms, meals, gossip. Know everything.' },
  ],
  city: [
    { id:'city_guard',  name:'City Guard',     emoji:'🛡', pay:[5,10],  skillReq:null,              desc:'Ironspire keeps. Loyal service can lead to knighthood.', seasons:['all'] },
    { id:'city_scribe', name:'Scribe',         emoji:'📜', pay:[4,8],  skillReq:{stat:'INT',min:8}, desc:'Copy documents. Careful work. Needs a sharp mind — or training.',        seasons:['all'] },
    { id:'city_trader', name:'Shop Assistant', emoji:'🏪', pay:[3,12],  skillReq:null,              desc:'City market trade. High volume, good learning.', seasons:['all'] },
    { id:'city_healer', name:'Healer Aide',    emoji:'⚕', pay:[4,9],  skillReq:{stat:'WIS',min:8}, desc:'Assist the city physicians. Needs wisdom — or an apprenticeship.',          seasons:['all'] },
  ],
  forest: [
    { id:'for_herb',    name:'Herb Gathering', emoji:'🌿', pay:[3,7],  skillReq:null,              desc:'Useful plants if you know which ones.', seasons:['spring','summer','autumn'] },
    { id:'for_hunt',    name:'Hunting',        emoji:'🏹', pay:[3,9],  skillReq:null,              desc:'Track and take game in Verdenmere.',    seasons:['all'] },
    { id:'for_lumber',  name:'Lumber Work',    emoji:'🪵', pay:[3,8],  skillReq:null,              desc:'Fell trees. Hard on the back.',         seasons:['spring','summer','autumn'] },
    { id:'for_guide',   name:'Forest Guide',   emoji:'🧭', pay:[4,10],  skillReq:{stat:'DEX',min:8}, desc:'Lead travellers safely through. Sure-footed — or trained.',      seasons:['all'] },
    { id:'for_tend',    name:'Tend Animals',    emoji:'🐾', pay:[3,7],   skillReq:null,              desc:'Wild and domestic alike. A quiet calling.', seasons:['all'] },
  ],
  elder: [
    { id:'sage',      name:'Village Sage',      emoji:'📜', pay:[7,12], skillReq:null,           desc:'People come to you for wisdom.' },
    { id:'adviser',   name:"Noble's Adviser",   emoji:'🏛', pay:[10,16], skillReq:{persuasion:2}, desc:'Experience has value to the powerful.' },
    { id:'healer2',   name:'Senior Healer',     emoji:'💚', pay:[8,14], skillReq:{faith:2},      desc:'Decades of knowledge. They trust you.' },
    { id:'emasterch', name:'Master Chef',       emoji:'🍲', pay:[9,16], skillReq:null,           desc:'Your name means something in kitchens.' },
    { id:'emastercp', name:'Master Carpenter',  emoji:'🪵', pay:[8,14], skillReq:null,           desc:'People travel for your craft.' },
    { id:'emerchant', name:'Established Trader',emoji:'🪙', pay:[10,18], skillReq:null,           desc:'Your reputation precedes you.' },
    { id:'efarmer',   name:'Head Farmer',       emoji:'🌾', pay:[7,12], skillReq:null,           desc:'Others look to your field for the standard.' },
  ],
  mountains: [
    { id:'mine',     name:'Mining',           emoji:'⛏', pay:[7,12], skillReq:null,           desc:'Exhausting. Profitable.' },
    { id:'mtn_guide',name:'Mountain Guide',   emoji:'🧭', pay:[8,14], skillReq:{stat:'CON',min:8},   desc:'Lead travellers through passes. Hardy — or trained.' },
  ],
  ruins: [
    { id:'salvage',  name:'Salvage Work',     emoji:'🏛', pay:[5,16],  skillReq:null,           desc:'Risky. Rewarding.', riskHealth:true },
  ],
};



function meetsSkillReq(char, req){
  if(!req) return true;
  // Stat-form requirement: { stat:'INT', min:8 }
  if(req.stat) return (char.stats?.[req.stat]||0) >= (req.min||0);
  // Skill-form requirement: { combat:1, persuasion:2, ... }
  return Object.entries(req).every(([k,v]) => (char.skills?.[k]||0) >= v);
}

// Trade jobs: a stat that lets you walk in directly, and the vendor whose
// apprenticeship unlocks the trade even below that stat.
export const TRADE_JOB = {
  smithy:      { statReq:{stat:'STR',min:8}, vendor:'blacksmith', raises:'STR' },
  herb:        { statReq:null,                vendor:'herbalist',  raises:'WIS' },
  for_herb:    { statReq:null,                vendor:'herbalist',  raises:'WIS' },
  shop_asst:   { statReq:{stat:'CHA',min:8},  vendor:'merchant',   raises:'CHA' },
  city_trader: { statReq:{stat:'CHA',min:8},  vendor:'merchant',   raises:'CHA' },
  scribe:      { statReq:{stat:'INT',min:8},  vendor:null,         raises:'INT' },
  city_scribe: { statReq:{stat:'INT',min:8},  vendor:null,         raises:'INT' },
  healer:      { statReq:{stat:'WIS',min:8},  vendor:'herbalist',  raises:'WIS' },
  city_healer: { statReq:{stat:'WIS',min:8},  vendor:'herbalist',  raises:'WIS' },
  for_guide:   { statReq:{stat:'DEX',min:8},  vendor:null,         raises:'DEX' },
  mtn_guide:   { statReq:{stat:'CON',min:8},  vendor:null,         raises:'CON' },
  tailoring:   { statReq:{stat:'DEX',min:8},  vendor:'tailor',     raises:'DEX' },
  jewelcraft:  { statReq:{stat:'INT',min:8},  vendor:'jeweller',   raises:'INT' },
};

// A trade job is shown if the player meets its stat requirement OR has apprenticed into it.
export function isTradeUnlocked(char, jobId){
  const t = TRADE_JOB[jobId];
  if(!t) return true; // not a gated trade — always available
  if(!t.statReq || meetsSkillReq(char, t.statReq)) return true;
  return (char.apprenticeships||[]).includes(jobId);
}
// While apprenticed and below the next proficiency level, a trade pays nothing.
export function isApprenticeUnpaid(char, jobId){
  if(!(char.apprenticeships||[]).includes(jobId)) return false;
  const xp = (char.jobXP||{})[jobId]||0;
  // Still an apprentice until the first proficiency level (XP 5 = Apprentice→next).
  return xp < 5;
}


function GridBlock({ emoji, name, sub, detail, danger, disabled, active, colour, onClick }){
  const col = colour || T.gold;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start',
      padding:'12px 8px 10px',
      background: active ? col+'22' : disabled ? T.panel+'88' : T.panel,
      border:`2px solid ${active ? col : disabled ? T.border+'66' : T.border}`,
      borderRadius:'12px', cursor: disabled ? 'default' : 'pointer',
      textAlign:'center', gap:'4px',
      opacity: disabled ? 0.55 : 1,
      transition:'all 0.15s',
      WebkitTapHighlightColor:'transparent',
    }}>
      <span style={{fontSize:'28px', lineHeight:1}}>{emoji}</span>
      <span style={{fontSize:'12px', fontWeight:700, color: disabled ? T.muted : T.text, lineHeight:'1.2'}}>{name}</span>
      {sub && <span style={{fontSize:'10px', color:T.muted, lineHeight:'1.3'}}>{sub}</span>}
      {detail && <span style={{fontSize:'10px', color: danger ? T.red : col, fontWeight:700, marginTop:'2px'}}>{detail}</span>}
    </button>
  );
}

export default function WorkTab({ char, onAction }){
  const [result, setResult]           = useState(null);
  const [tapState, setTapState]         = useState({}); // {id: firstTapTime}
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  // Generate quests once per render-cycle — stable within a year, fresh on age-up

  const loc = char.location||'village';
  const currentSeason = getCurrentSeason(char);
  const seasonActions  = char.seasonActions||{};
  const workDone       = seasonActions.work||0;
  const questDone      = seasonActions.quest||0;
  const jobs = (char.age >= 55
    ? [...(JOBS.elder||[]), ...(JOBS[loc]||JOBS.village)]
    : (JOBS[loc]||JOBS.village)
  ).filter(job => isJobAvailable(job.id, currentSeason))
   .filter(job => isTradeUnlocked(char, job.id));

  async function doJob(job){
    try{
    if(workDone >= 4){ setResult({text:'You have worked four shifts this season — enough for now.',bad:true}); return; }
    if(!meetsSkillReq(char, job.skillReq)){ setResult({text:"You don't meet the skill requirements for this.",bad:true}); return; }
    // Crime record blocks city jobs when record >= 3
    const record = char.criminalRecord||0;
    if(record >= 3 && loc==='city'){ setResult({text:'The city gates are watched. Find work elsewhere.',bad:true}); return; }
    if(record >= 2 && ['noble','spy','scribe'].includes(job.id)){ setResult({text:'Your reputation precedes you. They will not take you on.',bad:true}); return; }
    setLoading(true);
    // Job proficiency tracking
    const jobXP = (char.jobXP||{});
    const currentXP = jobXP[job.id]||0;
    const newXP = currentXP + 1;
    const oldLevel = currentXP>=60?4:currentXP>=30?3:currentXP>=15?2:currentXP>=5?1:0;
    const newLevel = newXP>=60?4:newXP>=30?3:newXP>=15?2:newXP>=5?1:0;
    const levelledUp = newLevel > oldLevel;
    const levelNames = ['Novice','Apprentice','Skilled','Expert','Master'];
    const profMult = 1 + (newLevel * 0.1); // +10% pay per level
    const pay = Math.round(rand(job.pay[0], job.pay[1]) * profMult);
    let health = 0;
    if(job.riskHealth && chance(30)) health = -rand(5,15);
    // Class bonus: civilian classes earn more at matching jobs
    const classId = char.classId||'';
    const classJobBonus =
      (classId==='merchant' && ['shop_asst','city_trader','tinnkeep','emerchant'].includes(job.id)) ? rand(3,8) :
      (classId==='chef'     && ['tcook','vkitchen','emasterch'].includes(job.id))                   ? rand(3,8) :
      (classId==='carpenter'&& ['vcarpent','tbuilder','emastercp'].includes(job.id))                ? rand(3,8) :
      (classId==='farmer'   && ['tend_animals','farm','efarmer'].includes(job.id))                  ? rand(2,6) :
      (classId==='knight'   && ['city_guard','guard'].includes(job.id))                             ? rand(3,7) :
      (classId==='druid'    && ['tend_animals','for_tend','herb','for_herb'].includes(job.id))       ? rand(3,7) : 0;

    // Season affects income: Autumn boosts farmers/merchants, Winter hurts outdoor jobs
    const season = getSeason(char.age);
    const farmerJobs  = ['farm','tend_animals','herb','for_herb','efarmer'];
    const outdoorJobs = ['for_hunt','for_guide','for_tend','mine','mtn_guide','herb','farm','tend_animals','salvage'];
    const merchantJobs = ['shop_asst','city_trader','tinnkeep','emerchant'];
    const seasonBonus =
      season==='Autumn' && farmerJobs.includes(job.id)   ? rand(3,8) :
      season==='Autumn' && merchantJobs.includes(job.id) ? rand(2,5) :
      season==='Summer' && outdoorJobs.includes(job.id)  ? rand(1,4) :
      season==='Winter' && outdoorJobs.includes(job.id)  ? -rand(2,6) : 0;

    const grossPay = Math.max(1, pay + classJobBonus + seasonBonus);
    // Apprentice trades earn nothing until you reach the next proficiency level.
    const unpaidApprentice = isApprenticeUnpaid(char, job.id);
    const totalPay = unpaidApprentice ? 0 : grossPay;
    // Working a trade can raise its governing stat.
    const trade = TRADE_JOB[job.id];
    let statRaise = null;
    if(trade?.raises && chance(25)){
      statRaise = trade.raises;
    }
    // Jobs nudge class affinities — working a kitchen nudges chef, smithy nudges fighter, etc.
    const JOB_AFFINITY = {
      farm:{'fighter':0.5,'ranger':0.3,'farmer':0.5},
      tend_animals:{'druid':1,'farmer':0.5,'ranger':0.5},
      for_tend:{'druid':1,'ranger':0.5},
      smithy:{'fighter':1,'carpenter':0.5},
      vcarpent:{'carpenter':1,'fighter':0.3},
      vkitchen:{'chef':1,'farmer':0.3},
      herb:{'druid':1,'ranger':0.5},
      for_herb:{'druid':1,'ranger':0.5},
      guard:{'fighter':1,'paladin':0.5},
      city_guard:{'fighter':1,'paladin':1,'knight':1},
      shop_asst:{'merchant':1,'bard':0.3},
      city_trader:{'merchant':1,'bard':0.5},
      tcook:{'chef':1,'merchant':0.3},
      tbuilder:{'carpenter':1,'fighter':0.3},
      tinnkeep:{'merchant':0.5,'bard':1},
      hunt:{'ranger':1,'druid':0.3},
      for_hunt:{'ranger':1,'druid':0.3},
      mine:{'fighter':0.5,'carpenter':0.3},
      healer:{'cleric':1,'druid':0.5},
      scribe:{'mage':1,'cleric':0.3},
      courier:{'rogue':0.5,'ranger':0.3},
      efarmer:{'farmer':1,'druid':0.3},
    };
    const jobAffBonus = JOB_AFFINITY[job.id]||{};
    const newAffinities = { ...(char.affinities||{}) };
    Object.entries(jobAffBonus).forEach(([k,v])=>{
      if(v>0) newAffinities[k] = (newAffinities[k]||0)+v;
    });

    // Graduation: reaching the first proficiency level ends the unpaid apprenticeship.
    const graduated = unpaidApprentice && newLevel >= 1;
    // Mastery: reaching Master (level 4) in a trade flags it for the shop-buy offer.
    const justMasteredTrade = newLevel >= 4 && oldLevel < 4 && !!TRADE_JOB[job.id];
    const newMasteredTrades = justMasteredTrade && !(char.masteredTrades||[]).includes(job.id)
      ? [...(char.masteredTrades||[]), job.id]
      : (char.masteredTrades||[]);
    const newStats = statRaise
      ? { ...char.stats, [statRaise]: Math.min(20, (char.stats?.[statRaise]||1)+1) }
      : char.stats;

    const updated = {
      ...char,
      gold: char.gold + totalPay,
      stats: newStats,
      masteredTrades: newMasteredTrades,
      health: Math.max(1, char.health + health),
      affinities: newAffinities,
      seasonActions: { ...seasonActions, work:workDone+1 },
      jobXP: { ...(char.jobXP||{}), [job.id]:newXP },
      yearActions: [...(char.yearActions||[]), unpaidApprentice ? `Apprenticed as ${job.name} (no pay yet)` : `Worked as ${job.name} — earned ${totalPay}g${classJobBonus>0?' (class bonus)':''}`],
      log: [...(char.log||[]),
        ...(statRaise?[{age:char.age,text:`Working the ${job.name} sharpened your ${statRaise}. +1 ${statRaise}.`,type:'good'}]:[]),
        ...(graduated?[{age:char.age,text:`You finished your apprenticeship as ${job.name}. The work pays now.`,type:'good'}]:[]),
        ...(levelledUp?[{age:char.age,text:`Your ${job.name} skill reached ${levelNames[newLevel]}!`,type:'good'}]:[]),
        ...(justMasteredTrade?[{age:char.age,text:`You are now a Master of the ${job.name}. You could open your own shop.`,type:'good'}]:[]),
        { age:char.age, text:unpaidApprentice ? `Apprenticed as ${job.name}. No pay yet — keep at it.` : `Worked as ${job.name}. Earned ${totalPay}g.${health<0?' Took some damage.':''}`, type:'good' }
      ],
    };
    setLoading(false);
    setSelected(null);
    setResult({ text:unpaidApprentice ? `${job.emoji} ${job.name} — apprentice work, no pay yet.${statRaise?` +1 ${statRaise}.`:''}` : `${job.emoji} ${job.name} — ${totalPay}g earned.${statRaise?` +1 ${statRaise}.`:''}${health<0?` Took ${Math.abs(health)} damage.`:''}`, bad:health<0 });
    onAction(updated);
    } catch(e){ console.error('doJob failed:',e); setLoading(false); setResult({text:'Something went wrong.',bad:true}); }
  }


  const selJob   = selected?.type==='job'   ? selected.item : null;

  return (
    <div style={{padding:'12px 14px', overflowY:'auto', WebkitOverflowScrolling:'touch', flex:1}}>

      {result && (
        <Card accent={result.bad?T.red:T.green} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p>
          <Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn>
        </Card>
      )}

      {/* JOBS */}
      <SectionHeader>Jobs — {currentSeason} · {workDone}/4 shifts this season</SectionHeader>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px'}}>
        {jobs.map(job=>{
          const canDo = meetsSkillReq(char, job.skillReq) && workDone < 4;
          const isSelected = selJob?.id === job.id;
          return (
            <GridBlock key={job.id}
              emoji={job.emoji} name={job.name}
              sub={job.desc}
              detail={`${job.pay[0]}–${job.pay[1]}g`}
              disabled={!canDo} active={isSelected} colour={T.gold}
              onClick={()=>{
                const now = Date.now();
                const last = tapState[job.id]||0;
                if(isSelected && now - last < 700){
                  // Double-tap on already-selected job — execute immediately
                  setTapState({});
                  doJob(job);
                } else {
                  // First tap — select to show detail card
                  setTapState({[job.id]:now});
                  setSelected(isSelected ? null : {type:'job',item:job});
                }
              }}
            />
          );
        })}
      </div>

      {selJob && (
        <Card accent={T.gold} style={{marginBottom:'16px'}}>
          <p style={{fontSize:'13px',color:T.text,marginBottom:'4px'}}><strong style={{color:T.gold}}>{selJob.emoji} {selJob.name}</strong></p>
          <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px'}}>{selJob.desc}</p>
          {selJob.skillReq && <p style={{fontSize:'11px',color:T.muted,marginBottom:'8px'}}>Requires: {Object.entries(selJob.skillReq).map(([k,v])=>`${k} ${v}`).join(', ')}</p>}
          {selJob.riskHealth && <p style={{fontSize:'11px',color:T.red,marginBottom:'8px'}}>⚠ Health risk</p>}
          <Btn onClick={()=>doJob(selJob)} disabled={loading} colour={T.gold}>{loading?'Working…':`Work — earn ${selJob.pay[0]}–${selJob.pay[1]}g`}</Btn>
        </Card>
      )}


      {/* JOB PROFICIENCY SUMMARY */}
      {Object.keys(char.jobXP||{}).length > 0 && (
        <div style={{padding:'4px 0'}}>
          <p style={{fontSize:'10px',color:T.muted,letterSpacing:'0.5px',marginBottom:'4px'}}>PROFICIENCY</p>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {Object.entries(char.jobXP||{}).filter(([,v])=>v>0).map(([jobId,xp])=>{
              const level = xp>=60?4:xp>=30?3:xp>=15?2:xp>=5?1:0;
              const pct = level>=4?100:level===3?(xp-30)/30*100:level===2?(xp-15)/15*100:level===1?(xp-5)/10*100:(xp/5)*100;
              const labels = ['Novice','Apprentice','Skilled','Expert','Master'];
              const allJobs = Object.values(JOBS).flat();
              const job = allJobs.find(j=>j.id===jobId);
              if(!job) return null;
              return (
                <div key={jobId} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'6px',padding:'4px 8px',minWidth:'100px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'9px',color:T.text}}>{job.emoji} {job.name}</span>
                    <span style={{fontSize:'9px',color:T.gold}}>{labels[level]}</span>
                  </div>
                  <div style={{height:'3px',background:'#1a1208',borderRadius:'2px'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:level>=3?T.gold:T.teal,borderRadius:'2px',transition:'width 0.4s'}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}