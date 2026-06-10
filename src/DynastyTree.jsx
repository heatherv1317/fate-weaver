import { T, CLASSES, ACHIEVEMENTS, getLegacyRating } from './gameData.js';
import { Btn, Card, Tag, SectionHeader } from './components/UI.jsx';

export default function DynastyTree({ tree, meta, onBack }){
  const achievements = meta?.achievements||[];
  const totalLives = meta?.totalLives||0;
  const bestScore  = meta?.bestScore||0;

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:'#0a0800',padding:'14px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,color:T.gold,letterSpacing:'3px'}}>FATE WEAVER</span>
        <Btn onClick={onBack} colour={T.muted} small full={false}>← Back</Btn>
      </div>

      <div style={{padding:'16px',flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>

        {/* Summary */}
        <SectionHeader>Dynasty Legacy</SectionHeader>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
          {[
            {label:'Lives Lived',  value:totalLives},
            {label:'Best Score',   value:bestScore},
            {label:'Achievements', value:achievements.length},
          ].map(item=>(
            <div key={item.label} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'10px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'20px',fontWeight:900,color:T.gold}}>{item.value}</div>
              <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Family tree */}
        {tree.length === 0 ? (
          <Card style={{textAlign:'center',padding:'20px'}}>
            <p style={{color:T.muted,fontSize:'13px'}}>No lives recorded yet. Play your first character to begin the dynasty.</p>
          </Card>
        ) : (
          <>
            <SectionHeader>The Lineage</SectionHeader>
            {[...tree].reverse().map((entry, i)=>{
              const cls = entry.classId ? CLASSES[entry.classId] : null;
              const lr = getLegacyRating(entry.legacyScore||0);
              return (
                <div key={i} style={{
                  display:'flex',alignItems:'flex-start',gap:'12px',
                  padding:'12px',marginBottom:'8px',
                  background:T.panel,border:`1px solid ${T.border}`,
                  borderRadius:'10px',
                }}>
                  <div style={{fontSize:'24px',flexShrink:0}}>{entry.raceEmoji||'👤'}{cls?.emoji||''}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:'14px',color:T.gold,fontWeight:700}}>{entry.name}</div>
                    <div style={{fontSize:'11px',color:T.muted,marginTop:'2px'}}>
                      {entry.race} · {cls?.name||'Unknown path'} · Died age {entry.age}
                    </div>
                    <div style={{fontSize:'11px',color:T.muted,marginTop:'1px',fontStyle:'italic'}}>{entry.deathCause||'Cause unknown'}</div>
                    <div style={{display:'flex',gap:'6px',marginTop:'6px',flexWrap:'wrap'}}>
                      <Tag colour={T.gold}>{lr.emoji} {lr.label}</Tag>
                      <Tag colour={T.muted}>{entry.legacyScore||0} pts</Tag>
                      {entry.generation > 1 && <Tag colour={T.purple}>Gen {entry.generation}</Tag>}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Achievements */}
        <SectionHeader>Achievements</SectionHeader>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'16px'}}>
          {ACHIEVEMENTS.map(ach=>{
            const unlocked = achievements.includes(ach.id);
            return (
              <div key={ach.id} style={{
                padding:'12px',background:T.panel,
                border:`1px solid ${unlocked?T.gold:T.border}`,
                borderRadius:'10px',opacity:unlocked?1:0.4,
              }}>
                <div style={{fontSize:'20px',marginBottom:'4px'}}>{ach.emoji}</div>
                <div style={{fontSize:'12px',fontWeight:700,color:unlocked?T.gold:T.muted}}>{ach.title}</div>
                <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{ach.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
