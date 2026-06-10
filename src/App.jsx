import { useState, useEffect } from 'react';
import CharacterCreation from './CharacterCreation.jsx';
import GameScreen from './GameScreen.jsx';
import DynastyTree from './DynastyTree.jsx';
import AdventuritePanel from './Adventurite.jsx';
import OpeningSequence from './OpeningSequence.jsx';
import { loadCharSlot, saveCharSlot, listSaveSlots, deleteCharSlot, loadDynastyTree, loadMeta, saveMeta, ACHIEVEMENTS, T, CLASSES, WORLD, computeInheritance, uid } from './gameData.js';

export default function App(){
  const [screen, setScreen]   = useState('loading');
  const [char, setChar]       = useState(null);
  const [legacy, setLegacy]   = useState(null);
  const [slots, setSlots]     = useState([null,null,null]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [dynastyTree, setDynastyTree] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [showDynasty, setShowDynasty] = useState(false);
  const [showAdventurite, setShowAdventurite] = useState(false);
  const [gemCount, setGemCount] = useState(0);

  // Read gem count for slot screen display
  useEffect(()=>{
    try{ const g = window.localStorage.getItem('fw_adventurite'); setGemCount(g?parseInt(g):0); }catch(_){}
  },[showAdventurite, screen]);

  useEffect(()=>{
    async function init(){
      try{
      const [s, tree, m] = await Promise.all([listSaveSlots(), loadDynastyTree(), loadMeta()]);
      setSlots(s);
      setDynastyTree(tree);
      setMeta(m);
      // Auto-load if only one live save and no others
      const live = s.filter(Boolean).filter(x=>x.alive);
      if(live.length===1 && s.filter(Boolean).length===1){
        const c = await loadCharSlot(live[0].slot);
        if(c){ setChar(c); setActiveSlot(live[0].slot); setScreen('game'); return; }
      }
      setScreen('slots');
      } catch(e){ console.error('Init failed:',e); setScreen('slots'); }
    }
    init();
  },[]);

  async function handleSlotSelect(slot){
    try{
    const c = await loadCharSlot(slot);
    if(c && c.alive!==false && c.name){
      setChar(c); setActiveSlot(slot); setScreen('game');
    } else {
      // Empty or dead slot — start new character
      setActiveSlot(slot); setLegacy(null); setScreen('create');
    }
    } catch(e){ console.error('Slot select failed:',e); setActiveSlot(slot); setScreen('create'); }
  }

  async function handleSlotDelete(slot, e){
    e.stopPropagation();
    try{
    // Use a simple inline check — window.confirm unreliable on mobile webviews
    const confirmed = window.confirm ? window.confirm('Delete this save? This cannot be undone.') : true;
    if(!confirmed) return;
    await deleteCharSlot(slot);
    const s = await listSaveSlots();
    setSlots(s);
    } catch(e){ console.error('Slot delete failed:',e); }
  }

  function handleCreated(c){
    setChar(c);
    saveCharSlot(c, activeSlot);
    setScreen('opening');
  }
  function handleOpeningComplete(updatedChar){
    setChar(updatedChar);
    saveCharSlot(updatedChar, activeSlot);
    setScreen('game');
  }
  async function handleDeath({ dynasty, parent }){
    try{
    // Determine the continuing heir: eldest living child.
    const children = (parent.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false)
      .sort((a,b)=>(b.age||0)-(a.age||0));
    const heir = children[0] || null;

    // Apply strict will: compute exactly what THIS heir inherits.
    const bequest = (dynasty && heir) ? computeInheritance(parent, heir.id) : { gold:0, items:[], propertyIds:[], businesses:[] };
    const inheritedItems = bequest.items;
    const inheritedProps = (parent.properties||[]).filter(p=>bequest.propertyIds.includes(p.id))
      .map(p=>({ ...p, isHome:false, rentedOut:false, occupantName:null })); // heir re-decides home
    const inheritedBusinesses = bequest.businesses || [];

    // Save to dynasty tree
    const treeEntry = {
      name:parent.name, race:parent.race?.name, raceId:parent.race?.id, raceEmoji:parent.race?.emoji, classId:parent.classId,
      age:parent.age, legacyScore:parent.legacyScore||0,
      deathCause:parent.deathCause, generation:parent.generation||1,
      slot:activeSlot, timestamp:Date.now(),
    };
    const newTree = [...dynastyTree, treeEntry];
    setDynastyTree(newTree);
    const { saveDynastyTree } = await import('./gameData.js');
    await saveDynastyTree(treeEntry);

    // Update meta-progression
    const newMeta = {
      ...meta,
      totalLives: (meta?.totalLives||0)+1,
      bestScore:  Math.max(meta?.bestScore||0, parent.legacyScore||0),
    };
    // Check achievements
    const currentAchievements = meta?.achievements||[];
    const newAchievements = [...currentAchievements];
    for(const ach of ACHIEVEMENTS){
      if(!currentAchievements.includes(ach.id)){
        if(ach.check(parent, newMeta)) newAchievements.push(ach.id);
      }
    }
    newMeta.achievements = newAchievements;
    setMeta(newMeta);
    await saveMeta(newMeta);

    if(dynasty && parent){
      // Build a CLEAN legacy object — only the willed inheritance carries over,
      // never the parent's whole estate/relationships/stats.
      let leg = {
        name: parent.name,
        classId: parent.classId,
        generation: parent.generation||1,
        gold: bequest.gold,
        inheritedItems: inheritedItems,
        inventory: [...inheritedItems],
        properties: [...inheritedProps],
        businesses: [...inheritedBusinesses],
      };
      // Class-specific dynasty bonuses layer ON TOP of the will.
      if(parent.classId==='merchant') leg.gold = (leg.gold||0) + Math.min(150, parent.gold||0); // merchant heir: extra capital
      if(parent.classId==='farmer'){
        const alreadyHasFarm = leg.properties.some(p=>p.type==='farm');
        if(!alreadyHasFarm){
          const farmProp = { id:uid('inherited_farm'), type:'farm', name:'Inherited Farm', ownedSince:0, rentedOut:false, isHome:true };
          leg.properties = [...leg.properties, farmProp];
        }
      }
      if(parent.classId==='carpenter'){
        leg.inventory = [...leg.inventory, { id:uid('carptools'), name:"Carpenter's Tools", emoji:'🔧' }];
      }
      setLegacy(leg);
      // Clear the slot for the new character but keep the old one's slot for dynasty
      setScreen('create');
    } else {
      setLegacy(null);
      setScreen('slots');
    }
    } catch(e){ console.error('Death handler failed:',e); setScreen('slots'); }
  }

  function handleSave(updatedChar){
    setChar(updatedChar);
    saveCharSlot(updatedChar, activeSlot);
  }

  // ── SCREENS ──────────────────────────────────────────────────────────────────
  if(screen==='loading') return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px'}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',fontWeight:900,color:'#c8a84b',letterSpacing:'4px'}}>FATE WEAVER</div>
      <div style={{fontSize:'12px',color:'#4a3a1a',letterSpacing:'2px'}}>LOADING...</div>
    </div>
  );

  if(showDynasty) return (
    <DynastyTree tree={dynastyTree} meta={meta} onBack={()=>setShowDynasty(false)}/>
  );

  if(showAdventurite) return (
    <div style={{minHeight:'100vh',background:T.bg,overflowY:'auto'}}>
      <AdventuritePanel onClose={()=>setShowAdventurite(false)} char={char}/>
    </div>
  );

  if(screen==='slots') return (
    <SlotPicker slots={slots} meta={meta} gemCount={gemCount}
      onSelect={handleSlotSelect}
      onDelete={handleSlotDelete}
      onDynasty={()=>setShowDynasty(true)}
      onAdventurite={()=>setShowAdventurite(true)}
    />
  );

  if(screen==='create') return <CharacterCreation onComplete={handleCreated} legacy={legacy}/>;
  if(screen==='opening' && char) return <OpeningSequence char={char} onComplete={handleOpeningComplete}/>;
  if(screen==='game' && char) return <GameScreen char={char} onDeath={handleDeath} onSave={handleSave}/>;
  return <SlotPicker slots={slots} meta={meta} gemCount={gemCount} onSelect={handleSlotSelect} onDelete={handleSlotDelete} onDynasty={()=>setShowDynasty(true)} onAdventurite={()=>setShowAdventurite(true)}/>;
}

// ── SLOT PICKER SCREEN ────────────────────────────────────────────────────────
function SlotPicker({ slots, meta, gemCount=0, onSelect, onDelete, onDynasty, onAdventurite }){
  const achievements = meta?.achievements||[];
  const totalLives = meta?.totalLives||0;
  const bestScore  = meta?.bestScore||0;

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:'#0a0800',padding:'16px',borderBottom:`1px solid ${T.border}`,textAlign:'center'}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:900,color:T.gold,letterSpacing:'4px'}}>FATE WEAVER</div>
        <div style={{fontSize:'10px',color:T.muted,letterSpacing:'2px',marginTop:'2px'}}>{WORLD.kingdom.toUpperCase()}</div>
      </div>

      <div style={{padding:'16px',flex:1,overflowY:'auto'}}>

        {/* Adventurite — prominent banner button */}
        <button onClick={onAdventurite} style={{
          width:'100%',padding:'14px 16px',marginBottom:'16px',
          background:`linear-gradient(135deg, ${T.gold}22, #e060ff18)`,
          border:`1.5px solid ${T.gold}`,borderRadius:'14px',cursor:'pointer',
          display:'flex',justifyContent:'space-between',alignItems:'center',
          WebkitTapHighlightColor:'transparent',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'26px'}}>💎</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',color:T.gold,fontWeight:700}}>Adventurite</div>
              <div style={{fontSize:'10px',color:T.muted}}>Buffs · Daily Goals · Milestones</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{gemCount}</div>
            <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px'}}>GEMS</div>
          </div>
        </button>

        {/* Meta stats */}
        {totalLives > 0 && (
          <div style={{display:'flex',gap:'12px',marginBottom:'16px',justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{totalLives}</div>
              <div style={{fontSize:'10px',color:T.muted}}>LIVES</div>
            </div>
            <div style={{width:'1px',background:T.border}}/>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{bestScore}</div>
              <div style={{fontSize:'10px',color:T.muted}}>BEST SCORE</div>
            </div>
            <div style={{width:'1px',background:T.border}}/>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{achievements.length}</div>
              <div style={{fontSize:'10px',color:T.muted}}>ACHIEVEMENTS</div>
            </div>
          </div>
        )}

        <p style={{fontSize:'13px',color:T.muted,marginBottom:'14px',textAlign:'center'}}>Choose a save slot</p>

        {/* Save slots */}
        {[0,1,2].map(i=>{
          const slot = slots[i];
          return (
            <button key={i} onClick={()=>onSelect(i)} style={{
              width:'100%',padding:'16px',marginBottom:'10px',
              background:slot?T.panelAlt:T.panel,
              border:`1px solid ${slot?T.border:T.border+'88'}`,
              borderRadius:'12px',cursor:'pointer',textAlign:'left',
              WebkitTapHighlightColor:'transparent',
            }}>
              {slot ? (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',color:slot.alive?T.gold:T.muted,fontWeight:700}}>{slot.name}</div>
                    <div style={{fontSize:'12px',color:T.muted,marginTop:'3px'}}>
                      {slot.race} · Age {slot.age}
                      {slot.classId && ` · ${CLASSES[slot.classId]?.emoji} ${CLASSES[slot.classId]?.name}`}
                      {!slot.alive && <span style={{color:T.red}}> · Deceased</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <span style={{fontSize:'11px',color:T.muted}}>Slot {i+1}</span>
                    <button onClick={(e)=>onDelete(i,e)} style={{
                      background:'transparent',border:`1px solid ${T.red}44`,borderRadius:'6px',
                      color:T.red,fontSize:'11px',padding:'3px 8px',cursor:'pointer',
                    }}>✕</button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:'center',color:T.muted,fontSize:'13px',padding:'4px 0'}}>
                  ＋ New Character — Slot {i+1}
                </div>
              )}
            </button>
          );
        })}

        {/* Dynasty button */}
        {totalLives > 0 && (
          <button onClick={onDynasty} style={{
            width:'100%',padding:'12px',marginTop:'8px',
            background:'transparent',border:`1px solid ${T.gold}44`,
            borderRadius:'12px',cursor:'pointer',color:T.gold,fontSize:'13px',
            WebkitTapHighlightColor:'transparent',
          }}>
            ⭐ View Dynasty Tree ({totalLives} {totalLives===1?'life':'lives'})
          </button>
        )}
      </div>
    </div>
  );
}
