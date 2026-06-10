import { useState, useEffect } from 'react';
import { Card, Btn, Tag, SectionHeader, Modal } from './components/UI.jsx';
import { T, ADVENTURITE_BUFFS, ACHIEVEMENT_QUESTS, DAILY_TASK_POOL, getDailyTasks, rollBuff, checkAchievements } from './gameData.js';

const FW_KEYS = {
  gems:        'fw_adventurite',
  owned:       'fw_buffs_owned',
  loadout:     'fw_buff_loadout',
  daily:       'fw_daily_tasks',
  achievements:'fw_achievements',
};

function getTodayStr(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export default function AdventuritePanel({ onClose, char }){
  const [gems,    setGems]    = useState(0);
  const [owned,   setOwned]   = useState([]);
  const [loadout, setLoadout] = useState([]);
  const [daily,   setDaily]   = useState({date:'',tasks:[],completed:[]});
  const [achieved,setAchieved]= useState([]);
  const [tab,     setTab]     = useState('daily');
  const [rollResult, setRollResult] = useState(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(()=>{
    async function load(){
      try{
        const [g,o,l,d,a] = await Promise.all([
          window.localStorage.getItem(FW_KEYS.gems),
          window.localStorage.getItem(FW_KEYS.owned),
          window.localStorage.getItem(FW_KEYS.loadout),
          window.localStorage.getItem(FW_KEYS.daily),
          window.localStorage.getItem(FW_KEYS.achievements),
        ]);
        setGems(g?parseInt(g):0);
        setOwned(o?JSON.parse(o):[]);
        setLoadout(l?JSON.parse(l):[]);
        const today = getTodayStr();
        const savedDaily = d?JSON.parse(d):{date:'',tasks:[],completed:[]};
        if(savedDaily.date !== today){
          const newTasks = getDailyTasks(today);
          const freshDaily = {date:today, tasks:newTasks, completed:[]};
          setDaily(freshDaily);
          window.localStorage.setItem(FW_KEYS.daily, JSON.stringify(freshDaily));
        } else { setDaily(savedDaily); }
        setAchieved(a?JSON.parse(a):[]);
      } catch(e){ console.error('Adventurite load error',e); }
      setLoaded(true);
    }
    load();
  },[]);

  async function saveAll(newGems, newOwned, newLoadout, newAchieved){
    try{
      if(newGems!==undefined){ setGems(newGems); window.localStorage.setItem(FW_KEYS.gems, String(newGems)); }
      if(newOwned!==undefined){ setOwned(newOwned); window.localStorage.setItem(FW_KEYS.owned, JSON.stringify(newOwned)); }
      if(newLoadout!==undefined){ setLoadout(newLoadout); window.localStorage.setItem(FW_KEYS.loadout, JSON.stringify(newLoadout)); }
      if(newAchieved!==undefined){ setAchieved(newAchieved); window.localStorage.setItem(FW_KEYS.achievements, JSON.stringify(newAchieved)); }
    } catch(e){ console.error('Adventurite save error',e); }
  }

  function claimDaily(task){
    if(daily.completed.includes(task.id)) return;
    if(char && !task.check(char)) return;
    const newCompleted = [...daily.completed, task.id];
    const newGems = gems + task.gems;
    const newDaily = {...daily, completed:newCompleted};
    setDaily(newDaily);
    window.localStorage.setItem(FW_KEYS.daily, JSON.stringify(newDaily));
    saveAll(newGems);
  }

  function doRollBuff(){
    if(gems < 15) return;
    const buff = rollBuff(owned);
    const newOwned = owned.includes(buff.id) ? owned : [...owned, buff.id];
    saveAll(gems-15, newOwned);
    setRollResult(buff);
  }

  function toggleLoadout(buffId){
    if(loadout.includes(buffId)){
      saveAll(undefined, undefined, loadout.filter(id=>id!==buffId));
    } else {
      if(loadout.length >= 3) return;
      saveAll(undefined, undefined, [...loadout, buffId]);
    }
  }

  function checkCharAchievements(){
    if(!char) return;
    const newUnlocked = checkAchievements(char);
    const toAdd = newUnlocked.filter(id=>!achieved.includes(id));
    if(toAdd.length > 0){
      const newAchieved = [...achieved, ...toAdd];
      const gemBonus = toAdd.reduce((s,id)=>{
        const ach = ACHIEVEMENT_QUESTS.find(a=>a.id===id);
        return s + (ach?.gems||0);
      },0);
      saveAll(gems+gemBonus, undefined, undefined, newAchieved);
      alert(`Achievement unlocked! +${gemBonus} gems`);
    }
  }

  const RARITY_COLOURS = {common:T.muted, uncommon:T.teal, rare:T.gold, legendary:'#e060ff'};

  if(!loaded) return <div style={{padding:'20px',color:T.muted,textAlign:'center'}}>Loading...</div>;

  return (
    <div style={{background:T.bg,minHeight:'100%',padding:'12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'16px',color:T.gold,fontWeight:700}}>✦ Adventurite</div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <span style={{fontSize:'12px',color:T.gold,fontWeight:700}}>{gems} 💎</span>
          <Btn onClick={onClose} colour={T.muted} outline small>Close</Btn>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:'4px',marginBottom:'12px',overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
        {['daily','achievements','buffs','loadout'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'6px 12px',borderRadius:'6px',border:`1px solid ${tab===t?T.gold:T.border}`,
            background:tab===t?T.gold+'22':T.panel,color:tab===t?T.gold:T.muted,
            fontSize:'10px',fontWeight:700,cursor:'pointer',flexShrink:0,letterSpacing:'0.5px',
            WebkitTapHighlightColor:'transparent',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* DAILY TASKS */}
      {tab==='daily'&&(
        <div>
          <p style={{fontSize:'10px',color:T.muted,marginBottom:'10px'}}>3 tasks daily. Resets at midnight. Complete them in your current life to claim gems.</p>
          {daily.tasks.map(task=>{
            const done = daily.completed.includes(task.id);
            const canClaim = char && task.check(char) && !done;
            return (
              <Card key={task.id} style={{marginBottom:'8px',opacity:done?0.5:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'12px',color:done?T.muted:T.text,fontWeight:600}}>{task.desc}</div>
                    <div style={{fontSize:'9px',color:T.gold,marginTop:'2px'}}>+{task.gems} 💎 · {task.diff}</div>
                  </div>
                  {done
                    ? <span style={{fontSize:'10px',color:T.green,fontWeight:700}}>✓ Done</span>
                    : <Btn onClick={()=>claimDaily(task)} colour={canClaim?T.gold:T.muted} outline={!canClaim} small disabled={!canClaim}>
                        {canClaim?'Claim':'Locked'}
                      </Btn>
                  }
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {tab==='achievements'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <p style={{fontSize:'10px',color:T.muted}}>Complete these across any character to earn gems.</p>
            <Btn onClick={checkCharAchievements} colour={T.teal} outline small>Check</Btn>
          </div>
          {ACHIEVEMENT_QUESTS.map(ach=>{
            const done = achieved.includes(ach.id);
            return (
              <Card key={ach.id} style={{marginBottom:'6px',opacity:done?0.6:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'11px',color:done?T.muted:T.text,fontWeight:600}}>{ach.name}</div>
                    <div style={{fontSize:'9px',color:T.muted,marginTop:'1px'}}>{ach.desc}</div>
                  </div>
                  <span style={{fontSize:'10px',color:done?T.green:T.gold,fontWeight:700,flexShrink:0,marginLeft:'8px'}}>
                    {done?'✓':''}{ach.gems} 💎
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* BUFFS */}
      {tab==='buffs'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
            <p style={{fontSize:'10px',color:T.muted}}>15 💎 per roll. You own {owned.length} buff{owned.length!==1?'s':''}.</p>
            <Btn onClick={doRollBuff} colour={gems>=15?T.gold:T.muted} disabled={gems<15} small>Roll (15 💎)</Btn>
          </div>
          {rollResult && (
            <Card style={{marginBottom:'10px',border:`1px solid ${RARITY_COLOURS[rollResult.rarity]}`}}>
              <div style={{fontSize:'10px',color:T.muted,marginBottom:'2px',letterSpacing:'0.5px'}}>YOU ROLLED</div>
              <div style={{fontSize:'13px',color:RARITY_COLOURS[rollResult.rarity],fontWeight:700}}>{rollResult.name}</div>
              <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{rollResult.desc}</div>
              <div style={{fontSize:'9px',color:RARITY_COLOURS[rollResult.rarity],marginTop:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>{rollResult.rarity}</div>
              <Btn onClick={()=>setRollResult(null)} colour={T.muted} outline small style={{marginTop:'8px'}}>Dismiss</Btn>
            </Card>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            {ADVENTURITE_BUFFS.filter(b=>owned.includes(b.id)).map(buff=>{
              const equipped = loadout.includes(buff.id);
              return (
                <Card key={buff.id} style={{border:`1px solid ${equipped?RARITY_COLOURS[buff.rarity]:T.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <span style={{fontSize:'11px',color:RARITY_COLOURS[buff.rarity],fontWeight:700}}>{buff.name}</span>
                      <span style={{fontSize:'8px',color:T.muted,marginLeft:'6px',textTransform:'uppercase'}}>{buff.rarity}</span>
                      <div style={{fontSize:'9px',color:T.muted,marginTop:'2px'}}>{buff.desc}</div>
                    </div>
                    <Btn onClick={()=>toggleLoadout(buff.id)}
                      colour={equipped?T.gold:T.muted} outline={!equipped} small
                      disabled={!equipped&&loadout.length>=3}>
                      {equipped?'Unequip':'Equip'}
                    </Btn>
                  </div>
                </Card>
              );
            })}
            {owned.length===0&&<p style={{fontSize:'11px',color:T.muted,textAlign:'center',padding:'20px'}}>No buffs yet. Roll to collect them.</p>}
          </div>
        </div>
      )}

      {/* LOADOUT */}
      {tab==='loadout'&&(
        <div>
          <p style={{fontSize:'10px',color:T.muted,marginBottom:'10px'}}>Up to 3 equipped buffs apply to every new character automatically.</p>
          {loadout.length===0&&<p style={{fontSize:'11px',color:T.muted,textAlign:'center',padding:'20px'}}>No buffs equipped. Go to Buffs to equip some.</p>}
          {loadout.map((id,i)=>{
            const buff = ADVENTURITE_BUFFS.find(b=>b.id===id);
            if(!buff) return null;
            return (
              <Card key={id} style={{marginBottom:'6px',border:`1px solid ${RARITY_COLOURS[buff.rarity]}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <span style={{fontSize:'11px',color:RARITY_COLOURS[buff.rarity],fontWeight:700}}>{i+1}. {buff.name}</span>
                    <div style={{fontSize:'9px',color:T.muted,marginTop:'1px'}}>{buff.desc}</div>
                  </div>
                  <Btn onClick={()=>toggleLoadout(id)} colour={T.muted} outline small>Remove</Btn>
                </div>
              </Card>
            );
          })}
          <div style={{marginTop:'12px',padding:'8px',background:T.panel,borderRadius:'8px',border:`1px solid ${T.border}`}}>
            <div style={{fontSize:'9px',color:T.muted,marginBottom:'4px',letterSpacing:'0.5px'}}>SLOTS</div>
            <div style={{display:'flex',gap:'6px'}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:'28px',height:'28px',borderRadius:'6px',
                  background:loadout[i]?T.gold+'33':T.panelAlt,
                  border:`1px solid ${loadout[i]?T.gold:T.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'10px',color:loadout[i]?T.gold:T.muted}}>
                  {loadout[i]?'✦':'○'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
