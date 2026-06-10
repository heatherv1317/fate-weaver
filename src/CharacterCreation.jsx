import { useState, useEffect } from 'react';
import { RACES, STATS, STAT_FULL, STAT_COLOR, generateStats, applyRaceBonuses, newCharacter, saveChar, CLASSES, GENDERS, T, WORLD, ADVENTURITE_BUFFS } from './gameData.js';
import { Btn, Card, Tag } from './components/UI.jsx';
import { generateFamily } from './tabs/RelationshipsTab.jsx';

const SCREENS = { RACE:'race', GENDER:'gender', NAME:'name', STATS:'stats', CONFIRM:'confirm' };

// Race-appropriate fantasy name pools
const RACE_NAMES = {
  human:    ['Aldric','Maren','Corvin','Sera','Dorian','Lysa','Edric','Nara','Gavin','Thea','Bryn','Cael','Alis','Rowan','Deva'],
  elf:      ['Aerindel','Sylvara','Caladwen','Elarion','Thalindra','Faelorn','Miravel','Aethos','Selenya','Vaelithor','Lirienne','Caerwyn','Ithilwen','Ornelas','Syleth'],
  dwarf:    ['Borgrak','Helda','Thordak','Grimna','Baldur','Vorda','Runik','Sigra','Durgin','Marta','Brokk','Hulda','Throrin','Dagny','Orvik'],
  halfling: ['Pip','Rosie','Clem','Tilda','Bram','Nettle','Willo','Ferdy','Sage','Merry','Ludo','Dessa','Tobbin','Flick','Hazel'],
  orc:      ['Krag','Morgha','Vroth','Ulka','Drogg','Shara','Brug','Narka','Gorash','Zura','Hrok','Vekka','Gorm','Skara','Durash'],
  tiefling: ['Ashvar','Lyxara','Malveth','Serana','Vexor','Zirael','Karzyn','Morva','Drevath','Sylvex','Xanra','Pyroth','Nyx','Valdris','Cyrith'],
  gnome:    ['Tix','Wrenli','Cogsworth','Fizzi','Bindle','Sprocket','Nessa','Zibble','Quill','Tinker','Fable','Whirli','Gimble','Pebble','Nixie'],
  dragonborn:['Kharax','Vortigal','Shezara','Thraxis','Razira','Dragneth','Xerath','Kalavex','Zorath','Viraxis','Saryx','Mordrak','Thazzar','Rhovak','Ixara'],
};

function randomName(raceId) {
  const pool = RACE_NAMES[raceId] || RACE_NAMES.human;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function CharacterCreation({ onComplete, legacy }){
  const [screen, setScreen] = useState(SCREENS.RACE);
  const [name, setName]     = useState('');
  const [raceId, setRaceId] = useState(null);
  const [stats, setStats]   = useState(null);
  const [rollsLeft, setRolls] = useState(3);
  const [gender, setGender]     = useState(null);

  const race = RACES.find(r=>r.id===raceId);
  const finalStats = stats && race ? applyRaceBonuses(stats, race) : stats;

  // Roll once automatically the first time the player reaches STATS
  useEffect(()=>{
    if(screen===SCREENS.STATS && stats===null){ setStats(generateStats()); setRolls(3); }
  },[screen]);

  function rollStats(){ if(rollsLeft<=0) return; setStats(generateStats()); setRolls(r=>r-1); }

  function handleRandomName(){
    setName(randomName(raceId));
  }

  async function confirm(){
    try{
    // Load and apply Adventurite buff loadout
    let buffBonuses = {statBonus:{},goldBonus:0,healthBonus:0,sicknessMod:0,questBonus:0,startGuildRank:null,startDevotion:{},destined:false,longevityBonus:0,allStats:0};
    try{
      const loadoutStr = window.localStorage.getItem('fw_buff_loadout');
      const loadout = loadoutStr ? JSON.parse(loadoutStr) : [];
      for(const buffId of loadout){
        const buff = ADVENTURITE_BUFFS.find(b=>b.id===buffId);
        if(!buff) continue;
        const eff = buff.effect||{};
        if(eff.statBonus) Object.entries(eff.statBonus).forEach(([s,v])=>{ buffBonuses.statBonus[s]=(buffBonuses.statBonus[s]||0)+v; });
        if(eff.goldBonus)    buffBonuses.goldBonus    += eff.goldBonus;
        if(eff.healthBonus)  buffBonuses.healthBonus  += eff.healthBonus;
        if(eff.sicknessMod)  buffBonuses.sicknessMod  += eff.sicknessMod;
        if(eff.questBonus)   buffBonuses.questBonus   += eff.questBonus;
        if(eff.longevityBonus) buffBonuses.longevityBonus += eff.longevityBonus;
        if(eff.startGuildRank) buffBonuses.startGuildRank = eff.startGuildRank;
        if(eff.startDevotion)  Object.entries(eff.startDevotion).forEach(([d,v])=>{ buffBonuses.startDevotion[d]=v; });
        if(eff.destined) buffBonuses.destined = true;
        if(eff.allStats !== undefined) buffBonuses.allStats += eff.allStats;
      }
    } catch(e){ console.error('Buff loadout error',e); }

    // Apply stat buffs and allStats bonus
    const boostedStats = {...finalStats};
    Object.entries(buffBonuses.statBonus).forEach(([s,v])=>{ boostedStats[s]=Math.min(20,(boostedStats[s]||1)+v); });
    if(buffBonuses.allStats > 0){
      ['STR','DEX','INT','WIS','CHA','CON'].forEach(s=>{ boostedStats[s]=Math.min(20,(boostedStats[s]||1)+buffBonuses.allStats); });
    }
    if(buffBonuses.destined){ const ds=['STR','DEX','INT','WIS','CHA','CON'][Math.floor(Math.random()*6)]; boostedStats[ds]=Math.max(boostedStats[ds]||1,12); }

    const char = newCharacter({
      name: name.trim()||'Unnamed', race, stats:{...boostedStats},
      gender: gender||GENDERS[0],
      age:0, gold: Math.min(300, buffBonuses.goldBonus) + (legacy?.gold||0),
      health: Math.min(120, 100 + buffBonuses.healthBonus),
      guildRank: buffBonuses.startGuildRank || 'G',
      devotion: Object.keys(buffBonuses.startDevotion).length > 0 ? buffBonuses.startDevotion : {},
      sicknessBuff: buffBonuses.sicknessMod,
      questBuff: buffBonuses.questBonus,
      longevityBuff: buffBonuses.longevityBonus,
      generation: legacy ? (legacy.generation||1)+1 : 1,
      legacy: legacy ? { parentName:legacy.name, parentClass:legacy.classId, bonusStat:null } : null,
      properties: legacy?.properties ? [...legacy.properties] : [],
      businesses: legacy?.businesses ? [...legacy.businesses] : [],
      inventory:  legacy?.inventory  ? [...legacy.inventory]  : [],
    });
    if(legacy?.classId && CLASSES[legacy.classId]){
      const ps = CLASSES[legacy.classId].primary;
      if(ps){ char.stats[ps]=Math.min(20,(char.stats[ps]||1)+2); if(char.legacy) char.legacy.bonusStat=ps; }
    }
    char.relationships = generateFamily(char);
    onComplete(char); // App.handleCreated saves to the correct slot
    } catch(e){ console.error('Character creation failed:',e); }
  }

  const stepIndex = Object.values(SCREENS).indexOf(screen);

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{background:'#0a0800',padding:'14px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,color:T.gold,letterSpacing:'3px'}}>FATE WEAVER</span>
        <span style={{fontSize:'11px',color:T.muted}}>Character Creation</span>
      </div>

      {/* Progress */}
      <div style={{display:'flex',gap:'6px',padding:'14px 16px 0',justifyContent:'center'}}>
        {Object.values(SCREENS).map((s,i)=>(
          <div key={s} style={{height:'4px',flex:1,maxWidth:'60px',borderRadius:'2px',background:stepIndex>=i?T.gold:T.border,transition:'background 0.3s'}}/>
        ))}
      </div>

      <div style={{padding:'16px',paddingBottom:'calc(16px + env(safe-area-inset-bottom, 0px))',flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
        {legacy && (
          <Card accent={T.gold} style={{marginBottom:'14px'}}>
            <p style={{fontSize:'13px',color:T.text}}>⭐ <strong style={{color:T.gold}}>Legacy:</strong> Child of {legacy.name}. A head start awaits.</p>
          </Card>
        )}

        {/* RACE — emoji grid blocks */}
        {screen===SCREENS.RACE && (
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold,marginBottom:'6px'}}>Choose your race</h2>
            <p style={{fontSize:'13px',color:T.muted,marginBottom:'16px'}}>Your blood shapes what comes naturally.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
              {RACES.map(r=>(
                <button key={r.id} onClick={()=>setRaceId(r.id)}
                  style={{
                    padding:'14px 10px',
                    border:`2px solid ${raceId===r.id?T.gold:T.border}`,
                    borderRadius:'12px',
                    background:raceId===r.id?T.gold+'22':T.panel,
                    cursor:'pointer',
                    textAlign:'center',
                    transition:'all 0.15s',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',
                  }}>
                  <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'1px',color:T.gold,fontFamily:"'Cinzel',serif"}}>{r.name.toUpperCase()}</span>
                  <div style={{fontWeight:700,fontSize:'13px',color:raceId===r.id?T.gold:T.text,fontFamily:"'Cinzel',serif"}}>{r.name}</div>
                  <div style={{fontSize:'10px',color:T.muted,lineHeight:'1.3'}}>{r.desc}</div>
                  {r.flavour && raceId===r.id && <div style={{fontSize:'9px',color:T.gold,marginTop:'3px',lineHeight:'1.5',fontStyle:'italic',padding:'0 2px'}}>{r.flavour}</div>}
                  {raceId===r.id && (
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',justifyContent:'center',marginTop:'4px'}}>
                      {Object.entries(r.bonuses).map(([k,v])=>(
                        <span key={k} style={{fontSize:'9px',fontWeight:700,padding:'2px 6px',borderRadius:'10px',background:v>0?T.green+'22':T.red+'22',color:v>0?T.green:T.red}}>{k} {v>0?`+${v}`:v}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <Btn onClick={()=>setScreen(SCREENS.GENDER)} disabled={!raceId} colour={T.gold}>Continue →</Btn>
          </div>
        )}

        {/* NAME — after race, with random generator */}
        {screen===SCREENS.GENDER && (
          <div style={{padding:'16px'}}>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold,marginBottom:'8px',textAlign:'center'}}>Who are you?</h2>
            <p style={{fontSize:'13px',color:T.muted,textAlign:'center',marginBottom:'20px',fontStyle:'italic'}}>This shapes how the world of Aldenmere sees you.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {GENDERS.map(g=>(
                <button key={g.id} onClick={()=>{ setGender(g); setScreen(SCREENS.NAME); }} style={{
                  padding:'16px',background:T.panel,border:`1px solid ${T.border}`,borderRadius:'12px',
                  color:T.text,fontSize:'14px',textAlign:'left',cursor:'pointer',
                  WebkitTapHighlightColor:'transparent',
                }}>
                  <div style={{fontWeight:700,color:T.gold,marginBottom:'3px'}}>{g.label}</div>
                  <div style={{fontSize:'11px',color:T.muted}}>{g.pronouns.sub} / {g.pronouns.obj} / {g.pronouns.pos}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen===SCREENS.NAME && (
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold,marginBottom:'6px'}}>What is your name?</h2>
            <p style={{fontSize:'13px',color:T.muted,marginBottom:'20px'}}>This is the name they will remember — or forget.</p>

            {/* Race reminder */}
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',background:T.panel,border:`1px solid ${T.border}`,borderRadius:'8px',marginBottom:'16px'}}>
              <span style={{fontSize:'10px',fontWeight:700,letterSpacing:'1px',color:T.gold}}>{race?.name?.toUpperCase()}</span>
              <span style={{fontSize:'12px',color:T.muted}}>{race?.name} name</span>
            </div>

            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name..."
              maxLength={24} autoFocus
              style={{width:'100%',padding:'14px',fontSize:'18px',fontFamily:"'Cinzel',serif",background:T.panel,border:`2px solid ${T.border}`,borderRadius:'8px',color:T.text,marginBottom:'10px',outline:'none',boxSizing:'border-box'}}
              onKeyDown={e=>e.key==='Enter'&&name.trim()&&setScreen(SCREENS.STATS)}/>

            <button onClick={handleRandomName}
              style={{width:'100%',padding:'10px',marginBottom:'16px',background:'transparent',border:`1px dashed ${T.gold}66`,borderRadius:'8px',color:T.gold,fontSize:'13px',cursor:'pointer',fontFamily:"'Cinzel',serif",letterSpacing:'0.5px',transition:'all 0.15s'}}>
              ✨ Random {race?.name} Name
            </button>

            <div style={{display:'flex',gap:'10px'}}>
              <Btn onClick={()=>setScreen(SCREENS.RACE)} colour={T.muted} style={{flex:1}}>← Back</Btn>
              <Btn onClick={()=>setScreen(SCREENS.STATS)} disabled={!name.trim()} colour={T.gold} style={{flex:2}}>Roll Stats →</Btn>
            </div>
          </div>
        )}

        {/* STATS */}
        {screen===SCREENS.STATS && (
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold,marginBottom:'6px'}}>Your Stats</h2>
            <p style={{fontSize:'13px',color:T.muted,marginBottom:'14px'}}>Rolled by fate. <strong style={{color:T.text}}>{rollsLeft}</strong> reroll{rollsLeft!==1?'s':''} left.</p>
            {finalStats && (
              <Card style={{marginBottom:'14px'}}>
                {STATS.map(s=>(
                  <div key={s} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                    <span style={{width:'36px',fontSize:'10px',fontWeight:700,color:STAT_COLOR[s],letterSpacing:'0.5px'}}>{s}</span>
                    <div style={{flex:1,height:'8px',background:'#1a1208',borderRadius:'4px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(finalStats[s]/20)*100}%`,background:STAT_COLOR[s],borderRadius:'4px',transition:'width 0.4s'}}/>
                    </div>
                    <span style={{width:'28px',textAlign:'right',fontWeight:700,fontSize:'15px',color:STAT_COLOR[s]}}>{finalStats[s]}</span>
                    <span style={{width:'80px',fontSize:'11px',color:T.muted}}>{STAT_FULL[s]}</span>
                    {race?.bonuses?.[s] && (
                      <span style={{fontSize:'10px',color:race.bonuses[s]>0?T.green:T.red,width:'24px',textAlign:'right'}}>{race.bonuses[s]>0?'+':''}{race.bonuses[s]}</span>
                    )}
                  </div>
                ))}
              </Card>
            )}
            <div style={{display:'flex',gap:'10px',marginBottom:'10px'}}>
              <Btn onClick={()=>setScreen(SCREENS.NAME)} colour={T.muted} style={{flex:1}}>← Back</Btn>
              <Btn onClick={rollStats} disabled={rollsLeft===0} colour={T.green} style={{flex:2}}>🎲 Reroll ({rollsLeft})</Btn>
            </div>
            <Btn onClick={()=>setScreen(SCREENS.CONFIRM)} colour={T.gold}>Accept →</Btn>
          </div>
        )}

        {/* CONFIRM */}
        {screen===SCREENS.CONFIRM && (
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold,marginBottom:'14px'}}>Ready to begin?</h2>
            <Card accent={T.gold} style={{marginBottom:'14px'}}>
              <div style={{marginBottom:'10px'}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:T.gold}}>{name}</div>
                <div style={{fontSize:'12px',color:T.muted}}>{race?.name}{gender?' · '+gender.label:''}</div>
              </div>
              <p style={{fontSize:'12px',color:T.muted,fontStyle:'italic',marginBottom:'12px'}}>{race?.desc}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                {STATS.map(s=>(
                  <div key={s} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'2px 0'}}>
                    <span style={{color:T.muted}}>{STAT_FULL[s]}</span>
                    <span style={{fontWeight:700,color:STAT_COLOR[s]}}>{finalStats?.[s]}</span>
                  </div>
                ))}
              </div>
            </Card>
            <p style={{fontSize:'12px',color:T.muted,textAlign:'center',marginBottom:'14px',fontStyle:'italic'}}>
              Your class will reveal itself through the choices you make.
            </p>
            <div style={{display:'flex',gap:'10px'}}>
              <Btn onClick={()=>setScreen(SCREENS.STATS)} colour={T.muted} style={{flex:1}}>← Back</Btn>
              <Btn onClick={confirm} colour={T.gold} style={{flex:2}}>Begin your life →</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
