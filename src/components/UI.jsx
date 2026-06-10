import { useState } from 'react';
import { T, STATS, STAT_COLOR, STAT_FULL, CLASSES, getWealthTier, getReputation } from '../gameData.js';
export { T };

// ── BUTTON ────────────────────────────────────────────────────────────────────
export function Btn({ onClick, disabled, colour, outline, children, small, full=true, style={} }){
  const bg = outline ? 'transparent' : (colour||T.gold);
  const border = `1px solid ${colour||T.gold}`;
  const textCol = outline ? (colour||T.gold) : (colour==='#c8a84b'||colour===T.gold ? '#1a1208' : '#fff');
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, border, color: textCol,
      borderRadius:'10px', padding: small ? '8px 16px' : '13px 20px',
      fontSize: small ? '13px' : '15px', fontWeight:700,
      width: full ? '100%' : 'auto',
      opacity: disabled ? 0.4 : 1,
      transition:'opacity 0.15s',
      letterSpacing:'0.3px',
      WebkitTapHighlightColor:'transparent',
      ...style,
    }}>{children}</button>
  );
}

// ── CONFIRM BUTTON (double-tap to commit) ─────────────────────────────────────
// First tap arms the button ("Tap again to confirm"); second tap within ~2s fires
// onClick. If not confirmed in time it reverts. Use for action/commit buttons so a
// stray tap never commits — replaces the tap → scroll → tap-a-second-button pattern.
export function ConfirmButton({ onClick, disabled, colour, outline, children, small, full=true, style={}, confirmLabel='Tap again to confirm' }){
  const [armed, setArmed] = useState(false);
  function handle(){
    if(disabled) return;
    if(armed){ setArmed(false); onClick && onClick(); }
    else {
      setArmed(true);
      setTimeout(()=>setArmed(false), 2000);
    }
  }
  return (
    <Btn onClick={handle} disabled={disabled} colour={armed ? T.gold : colour} outline={armed ? false : outline}
      small={small} full={full} style={style}>
      {armed ? confirmLabel : children}
    </Btn>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────
export function Card({ children, accent, style={} }){
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${accent||T.border}`,
      borderLeft: accent ? `4px solid ${accent}` : `1px solid ${T.border}`,
      borderRadius:'12px', padding:'14px',
      marginBottom:'10px',
      ...style,
    }}>{children}</div>
  );
}

// ── TAG ───────────────────────────────────────────────────────────────────────
export function Tag({ colour, children }){
  return (
    <span style={{
      display:'inline-block',
      background: colour+'22', color: colour,
      border:`1px solid ${colour}55`,
      borderRadius:'20px', padding:'3px 10px',
      fontSize:'11px', fontWeight:700,
      letterSpacing:'0.5px', textTransform:'uppercase',
    }}>{children}</span>
  );
}

// ── STAT BAR ──────────────────────────────────────────────────────────────────
export function StatBar({ stat, value, max=22 }){
  const colour = STAT_COLOR[stat];
  const pct = Math.max(0,Math.min(100,(value/max)*100));
  return (
    <div style={{marginBottom:'6px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
        <span style={{fontSize:'11px',fontWeight:700,color:T.muted,letterSpacing:'0.5px'}}>{stat}</span>
        <span style={{fontSize:'12px',fontWeight:700,color:colour}}>{value}</span>
      </div>
      <div style={{height:'6px',background:'#2a2010',borderRadius:'3px',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:colour,borderRadius:'3px',transition:'width 0.4s'}}/>
      </div>
    </div>
  );
}

// ── ENERGY BAR ────────────────────────────────────────────────────────────────
export function EnergyBar({ current, max=50 }){
  const pct = (current/max)*100;
  const colour = pct > 60 ? T.green : pct > 30 ? T.gold : T.red;
  const segments = 6;
  return (
    <div style={{padding:'0 14px 10px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',alignItems:'center'}}>
        <span style={{fontSize:'10px',fontWeight:700,color:T.muted,letterSpacing:'1px'}}>ENERGY</span>
        <span style={{fontSize:'13px',fontWeight:900,color:colour}}>{current}<span style={{fontSize:'10px',color:T.muted,fontWeight:400}}>/{max}</span></span>
      </div>
      <div style={{display:'flex',gap:'3px'}}>
        {Array.from({length:segments}).map((_,i)=>{
          const segMax = max/segments;
          const filled = current - i*segMax;
          const pctFilled = Math.max(0,Math.min(100,(filled/segMax)*100));
          return (
            <div key={i} style={{flex:1,height:'8px',background:'#1a1208',borderRadius:'3px',overflow:'hidden',border:`1px solid ${T.border}`}}>
              <div style={{height:'100%',width:`${pctFilled}%`,background:colour,borderRadius:'3px',transition:'width 0.3s'}}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPACT STAT STRIP ────────────────────────────────────────────────────────
function StatStrip({ stats }){
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'4px',padding:'6px 14px'}}>
      {STATS.map(s=>{
        const val = stats?.[s]||0;
        const pct = Math.min(100,(val/20)*100);
        return (
          <div key={s} style={{textAlign:'center'}}>
            <div style={{fontSize:'15px',fontWeight:900,color:STAT_COLOR[s],lineHeight:1}}>{val}</div>
            <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.3px',marginTop:'1px'}}>{s}</div>
            <div style={{height:'3px',background:'#2a2010',borderRadius:'2px',marginTop:'2px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:STAT_COLOR[s],borderRadius:'2px'}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CHAR HEADER ───────────────────────────────────────────────────────────────
export function CharHeader({ char, onAgeUp, ageUpLoading, energyMax:emProp, onEndRun, currentSeason, seasonStep, daysLeft, paladinDeity }){
  const [showStats, setShowStats] = useState(false);
  const cls    = char.classId ? CLASSES[char.classId] : null;
  const wealth = getWealthTier(char.gold||0);
  const rep    = getReputation(char);
  const SEASON_NAMES = ['Spring','Summer','Autumn','Winter'];
  const SEASON_ABBR  = ['SPR','SUM','AUT','WIN'];
  const step   = seasonStep||0;
  const nextSeasonName = SEASON_NAMES[(SEASON_NAMES.indexOf(currentSeason||'Spring')+1)%4];
  const seasonAbbr = SEASON_ABBR[SEASON_NAMES.indexOf(currentSeason||'Spring')]||'SPR';
  const raceLabel = (char.race?.name||'HUMAN').toUpperCase();
  const RACE_COLOURS = {
    HUMAN:'#c8a84b',ELF:'#7ecf7e',DWARF:'#cd7f32',ORC:'#7a9a50',
    HALFLING:'#f0d0a0',TIEFLING:'#b070c0',DRAGONBORN:'#c04040',GNOME:'#3a9ed0',
  };
  const raceColour = RACE_COLOURS[raceLabel]||T.muted;
  const genderSymbol = char.gender?.id==='female'?' F':char.gender?.id==='male'?' M':char.gender?.id?` ${char.gender.id.slice(0,2).toUpperCase()}`:'';
  const stepDots = ['○','○','○','○'].map((d,i)=>i<step?'●':i===step?'◉':'○').join(' ');
  const youngChild = (char.age||0) <= 6; // ages 0–6 advance a full year per press

  return (
    <div style={{background:'#120d04',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>

      {/* ROW 1: name · race chip · class chip · age · season dots · Age Up */}
      <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 10px 4px'}}>
        <div style={{flex:1,minWidth:0,overflow:'hidden'}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:700,color:T.gold,lineHeight:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {char.name||'Unknown'}
          </div>
          <div style={{display:'flex',gap:'4px',alignItems:'center',marginTop:'3px',flexWrap:'nowrap',overflow:'hidden'}}>
            <span style={{fontSize:'8px',fontWeight:700,letterSpacing:'0.8px',color:raceColour,border:`1px solid ${raceColour}55`,borderRadius:'3px',padding:'1px 4px',flexShrink:0}}>
              {raceLabel}{genderSymbol}
            </span>
            {cls && <span style={{fontSize:'8px',fontWeight:700,letterSpacing:'0.5px',color:cls.colour,border:`1px solid ${cls.colour}55`,borderRadius:'3px',padding:'1px 4px',flexShrink:0}}>
              {cls.name.toUpperCase()}
            </span>}
            {char.sickness && <span style={{fontSize:'8px',color:T.red,flexShrink:0,letterSpacing:'0.5px'}}>ILL</span>}
            {(char.criminalRecord||0)>0 && <span style={{fontSize:'8px',color:T.crimson,flexShrink:0,letterSpacing:'0.5px'}}>WANTED</span>}
          </div>
        </div>
        <div style={{textAlign:'center',flexShrink:0}}>
          <div style={{fontSize:'22px',fontWeight:900,color:'#fff',lineHeight:1}}>{char.age||0}</div>
          {!youngChild && <div style={{fontSize:'8px',color:T.muted,letterSpacing:'0.5px'}}>{seasonAbbr}</div>}
          {!youngChild && <div style={{fontSize:'8px',color:T.gold,letterSpacing:'2px',marginTop:'1px'}}>{stepDots}</div>}
        </div>
        <button onClick={onAgeUp} disabled={ageUpLoading} style={{
          background: ageUpLoading?T.border:(youngChild||step===3)?T.gold+'55':T.panel,
          border:`1px solid ${(youngChild||step===3)?T.gold:T.border}`,
          borderRadius:'8px',padding:'8px 10px',
          fontSize:'11px',fontWeight:900,
          color:(youngChild||step===3)?T.gold:T.muted,
          flexShrink:0,WebkitTapHighlightColor:'transparent',
          opacity:ageUpLoading?0.6:1,
          lineHeight:'1.3',minWidth:'56px',textAlign:'center',
        }}>
          {ageUpLoading?'...':youngChild?`AGE
UP`:(step===3?`AGE
${(char.age||0)+1}`:`+${nextSeasonName.slice(0,3).toUpperCase()}`)}
        </button>
      </div>

      {/* ROW 2: gold · health bar · days bar · stats toggle · end run */}
      <div style={{display:'flex',alignItems:'center',gap:'5px',padding:'0 10px 6px'}}>
        <span style={{fontSize:'10px',color:T.gold,fontWeight:700,flexShrink:0}}>{char.gold||0}g</span>
        <div style={{flex:1,height:'4px',background:'#1a1208',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.min(100,char.health||100)}%`,background:(char.health||100)>50?T.green:(char.health||100)>25?T.orange:T.red,borderRadius:'2px',transition:'width 0.4s'}}/>
        </div>
        <span style={{fontSize:'9px',color:T.muted,flexShrink:0}}>{char.health||100}hp</span>
        {daysLeft!==undefined&&daysLeft!==null&&(<>
          <div style={{width:'36px',height:'4px',background:'#1a1208',borderRadius:'2px',overflow:'hidden',flexShrink:0}}>
            <div style={{height:'100%',width:`${Math.min(100,(daysLeft/90)*100)}%`,background:daysLeft<20?T.orange:T.teal,borderRadius:'2px'}}/>
          </div>
          <span style={{fontSize:'9px',color:daysLeft<20?T.orange:T.muted,flexShrink:0}}>{daysLeft}d</span>
        </>)}
        <button onClick={()=>setShowStats(s=>!s)} style={{
          background:'transparent',border:`1px solid ${T.border}`,
          borderRadius:'3px',padding:'1px 5px',
          fontSize:'9px',color:showStats?T.gold:T.muted,
          cursor:'pointer',WebkitTapHighlightColor:'transparent',flexShrink:0,
        }}>{showStats?'▲':'▼ stats'}</button>
        {onEndRun&&<button onClick={onEndRun} style={{
          background:'transparent',border:'none',
          color:T.red+'66',fontSize:'10px',cursor:'pointer',
          padding:'0 2px',WebkitTapHighlightColor:'transparent',flexShrink:0,
        }}>✕</button>}
      </div>

      {/* COLLAPSED: stats + inventory + status */}
      {showStats&&(
        <div style={{borderTop:`1px solid ${T.border}22`,paddingBottom:'4px'}}>
          <div style={{padding:'8px 10px 4px',overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
            <StatStrip stats={char.stats}/>
          </div>
          {(char.inventory||[]).length>0&&(
            <div style={{padding:'2px 10px',overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
              <div style={{display:'flex',gap:'4px',flexWrap:'nowrap'}}>
                {(char.inventory||[]).slice(0,6).map((item,i)=>(
                  <span key={i} style={{fontSize:'8px',background:T.panel,border:`1px solid ${T.border}`,borderRadius:'3px',padding:'1px 4px',color:T.muted,whiteSpace:'nowrap',flexShrink:0}}>{item.name}</span>
                ))}
                {(char.inventory||[]).length>6&&<span style={{fontSize:'8px',color:T.muted}}>+{(char.inventory||[]).length-6}</span>}
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:'4px',padding:'2px 10px',flexWrap:'wrap'}}>
            {rep.label!=='Anonymous'&&<Tag colour={rep.colour}>{rep.label}</Tag>}
            {char.location&&char.location!=='village'&&<Tag colour={T.teal}>{char.location}</Tag>}
            {char.legacy&&<Tag colour={T.gold}>Gen {char.generation}</Tag>}
            {(char.properties||[]).length>0&&<Tag colour={T.teal}>{(char.properties||[]).length} prop</Tag>}
            {(char.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false)&&<Tag colour={T.green}>Married</Tag>}
          </div>
        </div>
      )}
    </div>
  );
}
// ── TAB GRID (replaces bottom nav) ───────────────────────────────────────────
const TAB_META = {
  life:          { emoji:'⧖',  label:'Life',     colour:T.gold   },
  work:          { emoji:'⚒',  label:'Work',     colour:'#cd7f32'},
  health:        { emoji:'❤',  label:'Health',   colour:T.red    },
  relationships: { emoji:'👥', label:'People',   colour:T.green  },
  skills:        { emoji:'📈', label:'Skills',   colour:T.blue   },
  inventory:     { emoji:'🎒', label:'Items',    colour:T.orange },
  crime:         { emoji:'🗡', label:'Crime',    colour:T.crimson},
  religion:      { emoji:'☀',  label:'Faith',    colour:T.gold   },
  world:         { emoji:'🗺', label:'World',    colour:T.teal   },
  magic:         { emoji:'✨', label:'Magic',    colour:T.purple },
  property:      { emoji:'🏠', label:'Property', colour:T.teal   },
  guild:         { emoji:'⚔️',  label:'Guild',    colour:T.orange  },
  business:      { emoji:'🏪', label:'Business', colour:T.gold    },
  goingout:      { emoji:'🌙', label:'Go Out',   colour:T.purple  },
};


// ── PORTRAIT SYSTEM ──────────────────────────────────────────────────────────
// Flat SVG portraits per race×gender, age layers applied on top
// Base face data per race×gender

export function NPCCard({ npc, onInteract, interactLabel='Talk', disabled=false }){
  const race = npc.race||'human';
  const RACE_COLS = {human:'#c8a84b',elf:'#7ecf7e',dwarf:'#cd7f32',orc:'#7a9a50',halfling:'#f0d0a0',tiefling:'#b070c0',dragonborn:'#c04040',gnome:'#3a9ed0'};
  const raceColNPC = RACE_COLS[race]||'#c8a84b';
  const cls = npc.classId ? CLASSES[npc.classId] : null;

  return (
    <div style={{
      background:T.panel,border:`1px solid ${T.border}`,borderRadius:'12px',
      padding:'10px 12px',display:'flex',gap:'10px',alignItems:'center',marginBottom:'8px',
    }}>
      <div style={{
        width:40,height:40,background:T.panelAlt,borderRadius:'10px',
        border:`1px solid ${cls?.colour||T.border}`,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,
        position:'relative',
      }}>
        <span style={{fontSize:'9px',fontWeight:700,color:raceColNPC,letterSpacing:'0.5px'}}>{race.slice(0,3).toUpperCase()}</span>
        {cls && <span style={{fontSize:'8px',color:cls.colour,marginTop:'1px'}}>{cls.name.slice(0,3)}</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,color:T.text,fontSize:'13px',marginBottom:'1px',
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{npc.name}</div>
        <div style={{fontSize:'10px',color:T.muted}}>
          {race.charAt(0).toUpperCase()+race.slice(1)}{npc.gender?` · ${npc.gender}`:''} · {npc.job||cls?.name||'Villager'} · age {npc.age||'?'}
        </div>
        {npc.sexuality && <div style={{fontSize:'9px',color:T.teal,marginTop:'1px'}}>{npc.sexuality}</div>}
        {npc.stats && (
          <div style={{fontSize:'9px',color:T.muted,marginTop:'2px',letterSpacing:'0.3px'}}>
            STR {npc.stats.STR} · CON {npc.stats.CON} · DEX {npc.stats.DEX} · INT {npc.stats.INT} · WIS {npc.stats.WIS} · CHA {npc.stats.CHA}
          </div>
        )}
        {npc.wealth && <div style={{fontSize:'9px',color:T.gold,marginTop:'1px'}}>{npc.wealth}</div>}
      </div>
      {onInteract && (
        <Btn onClick={onInteract} colour={T.teal} small full={false} disabled={disabled}>{interactLabel}</Btn>
      )}
    </div>
  );
}

export function BottomNav({ tabs, active, onChange }){
  // Renamed BottomNav but now renders as a vertical side nav on the left
  return (
    <div style={{
      width:'56px',
      flexShrink:0,
      background:'#0a0800',
      borderRight:`1px solid ${T.border}`,
      display:'flex',
      flexDirection:'column',
      overflowY:'auto',
      WebkitOverflowScrolling:'touch',
      paddingTop:'6px',
      paddingBottom:'env(safe-area-inset-bottom, 6px)',
    }}>
      {tabs.map(tab=>{
        const meta = TAB_META[tab]||{emoji:'?',label:tab,colour:T.muted};
        const isActive = active===tab;
        return (
          <button key={tab} onClick={()=>onChange(tab)} style={{
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            padding:'10px 4px',
            background: isActive ? meta.colour+'22' : 'transparent',
            border:'none',
            borderLeft: isActive ? `3px solid ${meta.colour}` : '3px solid transparent',
            color: isActive ? meta.colour : T.muted,
            fontSize:'9px', fontWeight: isActive ? 700 : 400,
            width:'100%',
            minHeight:'52px',
            WebkitTapHighlightColor:'transparent',
            transition:'all 0.15s',
            cursor:'pointer',
            lineHeight:1.2,
          }}>
            <span style={{fontSize:'18px',lineHeight:1,marginBottom:'3px'}}>{meta.emoji}</span>
            <span style={{fontSize:'8px',letterSpacing:'0.2px'}}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── EVENT FEED ITEM ───────────────────────────────────────────────────────────
export function FeedItem({ entry }){
  const colours = { good:T.green, bad:T.red, quest:T.gold, death:'#666', neutral:T.muted };
  const c = colours[entry.type]||T.muted;
  return (
    <div style={{display:'flex',gap:'10px',padding:'10px 0',borderBottom:`1px solid ${T.border}22`}}>
      <div style={{minWidth:'8px',height:'8px',borderRadius:'50%',background:c,marginTop:'6px',flexShrink:0}}/>
      <div style={{flex:1}}>
        <span style={{fontSize:'11px',color:T.muted,marginRight:'8px'}}>Age {entry.age}</span>
        <span style={{fontSize:'14px',color:T.text,lineHeight:'1.5'}}>{entry.text}</span>
      </div>
    </div>
  );
}

// ── SPINNER ───────────────────────────────────────────────────────────────────
export function Spinner({ label='...' }){
  return (
    <div style={{textAlign:'center',padding:'24px',color:T.muted}}>
      <div style={{fontSize:'24px',animation:'spin 1s linear infinite',display:'inline-block'}}>✦</div>
      <p style={{fontSize:'13px',marginTop:'8px'}}>{label}</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }){
  return (
    <div style={{position:'fixed',inset:0,background:'#000000cc',zIndex:100,display:'flex',alignItems:'flex-end'}}
      onClick={e=>{ if(e.target===e.currentTarget && onClose) onClose(); }}>
      <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'18px 18px 0 0',width:'100%',maxHeight:'85vh',overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'20px 16px 30px', paddingBottom:'calc(30px + env(safe-area-inset-bottom, 0px))'}}>
        <div style={{width:'40px',height:'4px',background:T.border,borderRadius:'2px',margin:'0 auto 16px'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:'15px',color:T.gold,fontWeight:700}}>{title}</span>
          {onClose && <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,fontSize:'22px',padding:'4px'}}>×</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
export function SectionHeader({ children }){
  return (
    <div style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:T.goldDim,letterSpacing:'1.5px',textTransform:'uppercase',padding:'14px 0 8px',borderBottom:`1px solid ${T.border}`,marginBottom:'12px'}}>
      {children}
    </div>
  );
}

