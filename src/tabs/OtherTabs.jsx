import { useState, useMemo } from 'react';
import { Card, Btn, Tag, SectionHeader, NPCCard } from '../components/UI.jsx';
import { T, ENERGY, SEASON_LIMITS, getEnergyMax, getActionSuccessChance, LOCATIONS, CLASSES, PROPERTY_TYPES, MARKET_ITEMS, generateWorldNPCs, getGuildRank, getQuestDays, getQuestSuccessChance, CRIME_CLEARANCE_COST, RANK_XP_THRESHOLDS, RANKS_ORDER, QUEST_TYPE_DANGER, QUEST_CLASS_SUITABILITY, DEITY_TEMPLE_COSTS, getDeityBlessing, calcQuestInjury, getDualClass, getFullReputation, FACTIONS, RITUALS, MAGIC_RESEARCH_TOPICS, CURSED_ITEMS, getCurrentSeason, SKILL_GATES, rand, chance, callAI, uid, SELL_RARITY_MULT, CONDITION_PRICE_MULT, getVendorMatch, getAffinityPriceBonus, getSellAffinityGain, getRepairCost, repairCondition, degradeCondition } from '../gameData.js';

// ── SHARED HELPERS ────────────────────────────────────────────────────────────
// Shared grid block button
function Block({ emoji, name, sub, detail, colour, disabled, active, onClick }){
  const col = colour||T.gold;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start',
      padding:'12px 8px 10px', gap:'4px', textAlign:'center',
      background: active ? col+'22' : disabled ? T.panel+'88' : T.panel,
      border:`2px solid ${active ? col : disabled ? T.border+'66' : T.border}`,
      borderRadius:'12px', cursor:disabled?'default':'pointer',
      opacity:disabled?0.55:1, transition:'all 0.15s',
      WebkitTapHighlightColor:'transparent',
    }}>
      <span style={{fontSize:'28px',lineHeight:1}}>{emoji}</span>
      <span style={{fontSize:'12px',fontWeight:700,color:disabled?T.muted:T.text,lineHeight:'1.2'}}>{name}</span>
      {sub   && <span style={{fontSize:'10px',color:T.muted,lineHeight:'1.3'}}>{sub}</span>}
      {detail && <span style={{fontSize:'10px',color:disabled?T.muted:col,fontWeight:700,marginTop:'2px'}}>{detail}</span>}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SKILLS TAB
// ══════════════════════════════════════════════════════════════════════════════
const SKILL_META = {
  combat:     { name:'Combat',     emoji:'⚔️', desc:'Fighting, weapons, defence.',       colour:T.red    },
  magic:      { name:'Arcana',     emoji:'✨', desc:'Spellcraft and magical theory.',     colour:T.purple },
  stealth:    { name:'Stealth',    emoji:'🌑', desc:'Moving unseen. Picking locks.',      colour:'#3a3a5a'},
  persuasion: { name:'Persuasion', emoji:'🗣', desc:'Talking your way in or out.',       colour:T.orange },
  survival:   { name:'Survival',   emoji:'🌲', desc:'Tracking, foraging, enduring.',     colour:T.green  },
  faith:      { name:'Faith',      emoji:'☀', desc:'Divine connection and channelling.', colour:T.gold   },
};

export function SkillsTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const skills = char.skills||{};
  const studyLeft = Math.max(0,(SEASON_LIMITS.study||2)-(char.seasonActions?.study||0));

  function train(skillId){
    if(studyLeft <= 0){ setResult({text:'You have studied enough this season.',bad:true}); return; }
    const gain = chance(60) ? 1 : 0;
    const updated = {
      ...char,
      skills: gain ? { ...skills, [skillId]:(skills[skillId]||0)+1 } : skills,
      seasonActions:{ ...(char.seasonActions||{}), study:((char.seasonActions?.study||0)+1) },
      yearActions:[...(char.yearActions||[]), `Practised ${SKILL_META[skillId].name}${gain?' — improved!':''}`],
      log:[...(char.log||[]),{ age:char.age, text:`Trained ${SKILL_META[skillId].name}.${gain?' Improved!':''}`, type:gain?'good':'neutral' }],
    };
    setResult({ text:gain?`${SKILL_META[skillId].name} improved to ${(skills[skillId]||0)+1}!`:"You practised. No breakthrough — but you're building it.", bad:false });
    setSelected(null);
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.green}><p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}
      <SectionHeader>Skills · {studyLeft}/{SEASON_LIMITS.study||2} left this season</SectionHeader>
      <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px'}}>2 study sessions per season. 60% chance of improvement.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
        {Object.entries(SKILL_META).map(([id,meta])=>{
          const level = skills[id]||0;
          const canDo = studyLeft > 0;
          const isSelected = selected===id;
          return (
            <Block key={id}
              emoji={meta.emoji} name={meta.name}
              sub={`Level ${level}`}
              detail=''
              colour={meta.colour} disabled={!canDo} active={isSelected}
              onClick={()=>setSelected(isSelected?null:id)}
            />
          );
        })}
      </div>

      {selected && (
        <Card accent={SKILL_META[selected].colour} style={{marginBottom:'12px'}}>
          <p style={{fontSize:'13px',fontWeight:700,color:T.text,marginBottom:'4px'}}>{SKILL_META[selected].emoji} {SKILL_META[selected].name} — Level {skills[selected]||0}</p>
          <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px'}}>{SKILL_META[selected].desc}</p>
          <div style={{height:'4px',background:'#1a1208',borderRadius:'2px',overflow:'hidden',marginBottom:'10px'}}>
            <div style={{height:'100%',width:`${Math.min(100,((skills[selected]||0)/10)*100)}%`,background:SKILL_META[selected].colour,borderRadius:'2px'}}/>
          </div>
          {/* Show skill gates */}
          {(SKILL_GATES[selected]||[]).map((gate,i)=>(
            <div key={`k-${i}`} style={{fontSize:'10px',padding:'3px 0',color:(skills[selected]||0)>=gate.level?T.green:T.muted,display:'flex',gap:'6px',alignItems:'center'}}>
              <span>{(skills[selected]||0)>=gate.level?'✓':'○'}</span>
              <span>Level {gate.level}: {gate.unlock}</span>
            </div>
          ))}
          <div style={{height:'8px'}}/>
          <Btn onClick={()=>train(selected)} colour={SKILL_META[selected].colour}>Practise ({studyLeft} left this season)</Btn>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MARKET + INVENTORY TAB
// ══════════════════════════════════════════════════════════════════════════════

// ── MARKET ITEMS BY CATEGORY ─────────────────────────────────────────────────
const MARKET = {
  weapons: [
    { id:'dagger',      name:'Iron Dagger',      emoji:'🗡',  price:8,   bonus:{stat:'STR',v:1},  desc:'Small. Sharp. Reliable.' },
    { id:'sword',       name:'Steel Sword',       emoji:'⚔️', price:30,  bonus:{stat:'STR',v:2},  desc:'A proper weapon.' },
    { id:'axe',         name:'Battle Axe',        emoji:'🪓',  price:25,  bonus:{stat:'STR',v:2},  desc:'Heavy. Decisive.' },
    { id:'bow',         name:'Shortbow',          emoji:'🏹',  price:18,  bonus:{stat:'DEX',v:1},  desc:'Distance is safety.' },
    { id:'crossbow',    name:'Crossbow',          emoji:'🎯',  price:35,  bonus:{stat:'DEX',v:2},  desc:'Slow to reload. Hard to miss.' },
    { id:'staff',       name:'Wooden Staff',      emoji:'🪄',  price:12,  bonus:{stat:'INT',v:1},  desc:'For the learned traveller.' },
    { id:'warhammer',   name:'Warhammer',         emoji:'🔨',  price:40,  bonus:{stat:'STR',v:3},  desc:'Expensive. Worth it.' },
  ],
  armour: [
    { id:'leatherarmour',  name:'Leather Armour',   emoji:'🛡',  price:20,  bonus:{stat:'CON',v:1},  desc:"It'll do." },
    { id:'chainmail',      name:'Chainmail',         emoji:'🔗',  price:50,  bonus:{stat:'CON',v:2},  desc:'Heavy but reassuring.' },
    { id:'platearmour',    name:'Plate Armour',      emoji:'🥋',  price:120, bonus:{stat:'CON',v:3},  desc:'Expensive, hot, nearly impenetrable.' },
    { id:'shield',         name:'Round Shield',      emoji:'🛡',  price:15,  bonus:{stat:'CON',v:1},  desc:'Stops things.' },
    { id:'cloak',          name:"Traveller's Cloak", emoji:'🧥',  price:10,  bonus:{stat:'DEX',v:1},  desc:'Practical in all weathers.' },
  ],
  mounts: [
    { id:'horse',       name:'Horse',              emoji:'🐴',  price:80,  bonus:{},               desc:'Halves travel energy. A solid investment.', travelDiscount:true },
    { id:'warhorse',    name:'Warhorse',           emoji:'🐎',  price:200, bonus:{stat:'STR',v:1}, desc:'Trained for battle. Commands respect.', travelDiscount:true },
    { id:'mule',        name:'Mule',               emoji:'🫏',  price:30,  bonus:{},               desc:'Stubborn but cheap. Reduces travel cost.', travelDiscount:true },
  ],
  supplies: [
    { id:'potion',      name:'Health Potion',      emoji:'🧪',  price:10,  bonus:{health:20},       desc:'Restores 20 health.' },
    { id:'herbs',       name:'Healing Herbs',      emoji:'🌿',  price:5,   bonus:{health:10},       desc:"Nature's medicine." },
    { id:'rations',     name:'Travel Rations',     emoji:'🎒',  price:8,   bonus:{health:5},        desc:'Keeps you going on the road.' },
    { id:'antidote',    name:'Antidote',           emoji:'🫙',  price:20,  bonus:{health:15},       desc:'Cures poisons and mild curses.' },
    { id:'torch',       name:'Torch Bundle',       emoji:'🔦',  price:3,   bonus:{},               desc:'Useful in dark places.' },
  ],
  tools: [
    { id:'grimoire',    name:'Spell Grimoire',     emoji:'📖',  price:30,  bonus:{stat:'INT',v:2}, desc:'Ancient knowledge.' },
    { id:'talisman',    name:'Lucky Talisman',     emoji:'🍀',  price:18,  bonus:{stat:'CHA',v:1}, desc:'May or may not work.' },
    { id:'lockpicks',   name:'Lockpicks',          emoji:'🗝️',  price:15,  bonus:{stat:'DEX',v:1}, desc:'For doors that should stay closed.' },
    { id:'herbkit',     name:'Herbalist Kit',      emoji:'⚗️',  price:22,  bonus:{stat:'WIS',v:1}, desc:'Identify and prepare plants.' },
    { id:'carptools',   name:"Carpenter's Tools",  emoji:'🔧',  price:25,  bonus:{stat:'STR',v:1}, desc:'For building things that last.' },
    { id:'cookware',    name:'Cookware Set',       emoji:'🍳',  price:18,  bonus:{stat:'WIS',v:1}, desc:'A good cook is never without work.' },
    { id:'scales',      name:"Merchant's Scales",  emoji:'⚖️',  price:20,  bonus:{stat:'CHA',v:1}, desc:'Trust but verify.' },
  ],
};

// ── SEASONAL / WORLD-STATE SELL PRICE MODIFIERS ──────────────────────────────
function getSellModifier(item, char){
  const season = getCurrentSeason(char);
  const worldEvent = char.activeWorldEvent||'';
  const isWar = worldEvent.toLowerCase().includes('war') || worldEvent.toLowerCase().includes('siege') || worldEvent.toLowerCase().includes('battle');
  const isProsperity = worldEvent.toLowerCase().includes('prosperity') || worldEvent.toLowerCase().includes('festival') || worldEvent.toLowerCase().includes('harvest');
  const id = item.id||'';
  const name = (item.name||'').toLowerCase();

  // Food / herbs
  if(id.includes('herb')||id.includes('salve')||id.includes('tonic')||id.includes('antidote')||name.includes('herb')||name.includes('food')){
    if(season==='Winter') return {mod:1.5, label:'❄ Winter demand'};
    if(season==='Summer'||season==='Autumn') return {mod:0.7, label:'🌾 Harvest surplus'};
    return {mod:1.0, label:null};
  }
  // Furs / warmth / cloak
  if(id.includes('cloak')||id.includes('fur')||name.includes('cloak')||name.includes('fur')||name.includes('warm')){
    if(season==='Winter') return {mod:1.4, label:'❄ Winter demand'};
    if(season==='Summer') return {mod:0.6, label:'☀ Off season'};
    return {mod:1.0, label:null};
  }
  // Travel gear
  if(id.includes('map')||id.includes('rope')||id.includes('pack')||id.includes('satchel')||name.includes('travel')){
    if(season==='Spring'||season==='Summer') return {mod:1.3, label:'🌸 Travel season'};
    if(season==='Winter') return {mod:0.7, label:'❄ Low demand'};
    return {mod:1.0, label:null};
  }
  // Weapons / armour
  if(id.includes('sword')||id.includes('shield')||id.includes('chainmail')||id.includes('dagger')||item.statBonus?.STR){
    if(isWar) return {mod:1.8, label:'⚔ War prices'};
    return {mod:1.0, label:null};
  }
  // Luxury / jewellery
  if(id.includes('ring')||id.includes('necklace')||id.includes('earring')||id.includes('signet')||id.includes('jewel')||name.includes('fine')){
    if(isProsperity) return {mod:1.4, label:'🎉 Festive demand'};
    if(worldEvent.toLowerCase().includes('plague')||worldEvent.toLowerCase().includes('famine')) return {mod:0.5, label:'💀 Low demand'};
    return {mod:1.0, label:null};
  }
  // Tools / craft
  if(id.includes('tool')||id.includes('lantern')||name.includes('tool')||name.includes('craft')){
    if(worldEvent.toLowerCase().includes('rebuild')||worldEvent.toLowerCase().includes('growth')) return {mod:1.3, label:'🔨 Rebuilding demand'};
    return {mod:1.0, label:null};
  }
  return {mod:1.0, label:null};
}

function getBaseSellPrice(item){
  const raw = (item.cost||item.price||5) * 0.45;
  const rarityMult = SELL_RARITY_MULT[item.rarity||'common'] || 1.0;
  const condMult = CONDITION_PRICE_MULT[item.condition||'pristine'] ?? 1.0;
  return Math.max(1, Math.floor(raw * rarityMult * condMult));
}

// ── QUEST LOOT TABLES ─────────────────────────────────────────────────────────
const LOOT_TABLES = {
  combat:   [{id:'monster_fang',name:'Monster Fang',emoji:'🦷',cost:10,desc:'A blacksmith or charm-maker would buy this.'},{id:'thick_pelt',name:'Thick Pelt',emoji:'🟫',cost:12,desc:'Heavy fur. Worth more in winter.'},{id:'beast_sinew',name:'Beast Sinew',emoji:'🪢',cost:7,desc:'Tough cord. Bowyers want it.'},{id:'battered_sword',name:'Battered Sword',emoji:'⚔️',cost:8,desc:'A fighter dropped this.',statBonus:{STR:1}}],
  bandit:   [{id:'bandit_stash',name:"Bandit's Stash",emoji:'💰',cost:20,isGold:true,desc:'Ill-gotten coin.'},{id:'notched_blade',name:'Notched Blade',emoji:'🗡️',cost:9,statBonus:{STR:1},desc:'Used hard, but serviceable.'},{id:'stolen_goods',name:'Stolen Goods',emoji:'📦',cost:14,stolen:true,desc:'Best sold quietly.'}],
  undead:   [{id:'bone_dust',name:'Bone Dust',emoji:'🦴',cost:11,desc:'Alchemists pay for this.'},{id:'grave_ring',name:'Tarnished Grave-Ring',emoji:'💍',cost:22,desc:'A jeweller could clean it up.'},{id:'grave_iron',name:'Grave-Iron Shard',emoji:'⛓️',cost:13,desc:'Cold to the touch. Smiths want it.'}],
  dragon:   [{id:'dragon_scale',name:'Dragon Scale',emoji:'🐉',cost:60,desc:'Worth a fortune to the right buyer.'},{id:'charred_fang',name:'Charred Fang',emoji:'🦷',cost:35,desc:'Still warm.'},{id:'cinder_gem',name:'Cinder-Gem',emoji:'💎',cost:50,desc:'A jeweller would pay dearly.'}],
  critter:  [{id:'slime_core',name:'Slime Core',emoji:'🟢',cost:5,desc:'Gelatinous. Alchemists use them.'},{id:'hare_pelt',name:'Horned Hare Pelt',emoji:'🐇',cost:4,desc:'Small but soft.'}],
  chore:    [{id:'found_copper',name:'Found Copper',emoji:'🪙',cost:3,isGold:true,desc:'Turned up in the sweepings.'},{id:'lost_button',name:'Lost Button',emoji:'🔘',cost:2,desc:'Someone will want it back. Or not.'}],
  dungeon:  [{id:'old_relic',name:'Old Relic',emoji:'🏺',cost:25,desc:'Ancient. Possibly valuable.'},{id:'dungeon_herb',name:'Strange Mushroom',emoji:'🍄',cost:8,consumable:true,healAmount:10,desc:'Glows faintly. Probably fine.'},{id:'dusty_tome',name:'Dusty Tome',emoji:'📖',cost:18,statBonus:{INT:1},desc:'Someone spent a long time writing this.'}],
  nature:   [{id:'rare_herb',name:'Rare Herb',emoji:'🌿',cost:15,consumable:true,healAmount:20,desc:'Hard to find. Healer would pay well.'},{id:'beast_hide',name:'Beast Hide',emoji:'🦌',cost:10,desc:'Good leather if cured.'},{id:'forest_fruit',name:'Forest Fruit',emoji:'🍎',cost:4,consumable:true,healAmount:5,desc:'Sweet. Probably safe.'}],
  fetch:    [{id:'surplus_herbs',name:'Surplus Herbs',emoji:'🌿',cost:6,desc:'Gathered more than the job needed.'},{id:'lost_trinket',name:'Lost Trinket',emoji:'🔮',cost:8,statBonus:{CHA:1},desc:'Nobody claimed it.'}],
  social:   [{id:'favour_token',name:'Favour Token',emoji:'📜',cost:20,desc:'Someone owes you something.'},{id:'trinket',name:'Trinket',emoji:'🔮',cost:8,statBonus:{CHA:1},desc:'Odd little thing. People notice it.'}],
  generic:  [{id:'misc_loot',name:'Scavenged Goods',emoji:'📦',cost:6,desc:'Mixed salvage. Sellable.'},{id:'silver_piece',name:'Silver Piece',emoji:'💰',cost:10,isGold:true,desc:'Found during the job.'}],
};

// Loot tier scaling by quest danger type — dangerous fights drop more & better.
const LOOT_VALUE_MULT = { critter:0.6, chore:0.5, fetch:0.7, combat:1.0, bandit:1.1, undead:1.2, dungeon:1.3, dragon:2.0, nature:0.9, social:1.0 };

// Rarity odds by quest source: dangerous quests can yield rare/legendary loot;
// chores and gathering stay common. Weights are [common, uncommon, rare, legendary].
const QUEST_RARITY_WEIGHTS = {
  chore:   [88, 12, 0, 0],
  fetch:   [80, 18, 2, 0],
  critter: [78, 20, 2, 0],
  nature:  [65, 28, 6, 1],
  social:  [70, 25, 5, 0],
  combat:  [55, 32, 11, 2],
  bandit:  [52, 33, 13, 2],
  undead:  [45, 35, 16, 4],
  dungeon: [40, 36, 18, 6],
  dragon:  [22, 33, 30, 15],
};
const RARITY_ORDER = ['common','uncommon','rare','legendary'];
// Bonus value multiplier for a rolled rarity (a rare drop is worth far more).
const LOOT_RARITY_VALUE = { common:1.0, uncommon:1.6, rare:2.8, legendary:5.0 };
function rollLootRarity(questType){
  const w = QUEST_RARITY_WEIGHTS[questType] || [80,18,2,0];
  const total = w.reduce((s,x)=>s+x,0);
  let r = Math.random()*total;
  for(let i=0;i<w.length;i++){ r -= w[i]; if(r<=0) return RARITY_ORDER[i]; }
  return 'common';
}

export function rollQuestLoot(questType, opts={}){
  const { success=true } = opts;
  const pool = LOOT_TABLES[questType] || LOOT_TABLES.generic;
  const base = pool[Math.floor(Math.random()*pool.length)];
  const mult = LOOT_VALUE_MULT[questType] ?? 1.0;
  // Reduced loot on failure: you scavenged something, but less of it.
  const failMult = success ? 1 : 0.5;
  // Source-based rarity: the danger of the quest shapes how good the drop is.
  const rarity = base.isGold ? 'common' : rollLootRarity(questType);
  const rarityMult = LOOT_RARITY_VALUE[rarity] || 1.0;
  const cost = Math.max(1, Math.round((base.cost||5) * mult * failMult * rarityMult));
  const namePrefix = rarity==='legendary' ? 'Pristine ' : rarity==='rare' ? 'Fine ' : '';
  return {...base, cost, rarity,
    name: namePrefix && !base.isGold ? namePrefix+base.name : base.name,
    condition: base.isGold ? undefined : 'good',
    id:`loot_${Date.now()}_${Math.floor(Math.random()*1000)}`};
}

// Drop chance for a fighting quest, scaling with danger. Reduced (not zero) on failure.
export function questLootDropChance(questType, success){
  const danger = { critter:30, chore:25, fetch:35, combat:55, bandit:60, undead:65, dungeon:70, dragon:85, nature:45, social:30 }[questType] ?? 40;
  return success ? danger : Math.round(danger*0.4);
}

// Scavenge roll for gathering/chore work: luck + WIS (perception). Returns an item or null.
export function rollScavenge(char, questType){
  if(!['fetch','chore','critter'].includes(questType)) return null;
  const wis = char.stats?.WIS||1;
  const dex = char.stats?.DEX||1;
  const baseChance = 15 + wis*2 + Math.floor(dex*0.5);
  if(Math.random()*100 >= baseChance) return null;
  // Exceptional find: a rare flower/herb worth real coin — best sold to the herbalist.
  const exceptional = (wis >= 12) && (Math.random()*100 < 12);
  if(exceptional){
    const finds = [
      {name:'Moonpetal Bloom', emoji:'🌸'}, {name:'Wild Mandrake Root', emoji:'🌿'},
      {name:'Silverleaf Flower', emoji:'🌼'}, {name:'Embercap Mushroom', emoji:'🍄'},
    ];
    const f = finds[Math.floor(Math.random()*finds.length)];
    return {id:uid('find'), name:f.name, emoji:f.emoji, cost:rand(40,70), rarity:'rare', condition:'pristine',
      desc:'A rare find — the herbalist would pay dearly for this.'};
  }
  const pool = questType==='fetch'
    ? [{id:'surplus_herbs',name:'Surplus Herbs',emoji:'🌿',cost:6,desc:'You gathered more than the job needed.'}]
    : [{id:'found_copper',name:'Found Copper',emoji:'🪙',cost:rand(2,5),isGold:true,desc:'Turned up in the sweepings.'},{id:'odd_trinket',name:'Odd Trinket',emoji:'🪡',cost:rand(3,8),desc:'Something useful in the rubbish.'}];
  const pick = pool[Math.floor(Math.random()*pool.length)];
  return {...pick, id:`find_${Date.now()}_${Math.floor(Math.random()*1000)}`};
}

// ── NPC PERCEPTION + STEALING (shared by market vendors and social NPCs) ──────
// Perception is 0–100. Vendors who catch you stealing refuse to serve you (score 0
// + a refused flag), and you must trade in another town.
export function getVendorPerception(char, loc, vendorId){
  return char.vendorPerception?.[loc]?.[vendorId] ?? 30;
}
export function isVendorRefusing(char, loc, vendorId){
  return !!(char.vendorRefused?.[loc]?.[vendorId]);
}
function withVendorPerception(char, loc, vendorId, newScore, refused){
  const vp = {...(char.vendorPerception||{})};
  vp[loc] = {...(vp[loc]||{}), [vendorId]: Math.max(0, Math.min(100, newScore))};
  const out = {...char, vendorPerception:vp};
  if(refused){
    const vr = {...(char.vendorRefused||{})};
    vr[loc] = {...(vr[loc]||{}), [vendorId]: true};
    out.vendorRefused = vr;
  }
  return out;
}

// Talk: small CHA-based perception gain. Uses one season NPC interaction.
export function talkToNPC(char, loc, vendorId, currentScore){
  const cha = char.stats?.CHA||1;
  const gain = 3 + Math.floor(cha/3) + (chance(40)?2:0);
  return { updated: withVendorPerception(char, loc, vendorId, currentScore + gain), gain };
}

// Steal: uses the crime model. Catch chance reduced by stealth skill + location mod.
// On success you take gold or an item; perception drops sharply. If caught:
// criminalRecord +1, a fine, and the vendor refuses to serve you thereafter.
export function stealFromNPC(char, loc, vendorId, vendorName, currentScore){
  const stealth = char.skills?.stealth||0;
  const locCatchMod = LOCATIONS[loc]?.crimeCatchMod||0;
  const guardRaised = isVendorRefusing(char, loc, vendorId) ? 25 : 0;
  // Base catch chance ~45, reduced by stealth, modified by location and prior offences.
  const catchChance = Math.max(8, Math.min(95, 45 - stealth*5 + locCatchMod + guardRaised + (currentScore<15?10:0)));
  const caught = chance(catchChance);
  if(caught){
    const fine = rand(10, 30) + (LOCATIONS[loc]?.crimeClearanceMod||0);
    let updated = withVendorPerception(char, loc, vendorId, 0, true);
    updated = {
      ...updated,
      gold: Math.max(0, (char.gold||0) - fine),
      criminalRecord: (char.criminalRecord||0) + 1,
      log: [...(char.log||[]),{ age:char.age, text:`Caught stealing from ${vendorName}. Fined ${fine}g. They will not serve you again here.`, type:'bad' }],
    };
    return { updated, caught:true, fine };
  }
  // Success: steal gold or an item.
  const stealGold = chance(50);
  let updated = withVendorPerception(char, loc, vendorId, Math.max(0, currentScore - 25));
  let gainedText;
  if(stealGold){
    const amt = rand(3, 12) + stealth;
    updated = { ...updated, gold:(updated.gold||0)+amt };
    gainedText = `${amt}g`;
  } else {
    const stolen = { id:uid('stolen'), name:'Pilfered Goods', emoji:'📦', cost:rand(6,16), stolen:true, desc:'Lifted from a vendor. Best sold to a fence.' };
    updated = { ...updated, inventory:[...(updated.inventory||[]), {...stolen, boughtAge:char.age}] };
    gainedText = stolen.name;
  }
  updated = { ...updated, log:[...(updated.log||[]),{ age:char.age, text:`You stole ${gainedText} from ${vendorName} unnoticed. They trust you less now.`, type:'neutral' }] };
  return { updated, caught:false, gainedText };
}


// ── MARKET TAB ───────────────────────────────────────────────────────────────
export function InventoryTab({ char, onAction }){
  const [shop, setShop]         = useState('blacksmith');
  const [showWill, setShowWill]  = useState(false);
  const [tapState, setTapState] = useState({});
  const [result, setResult]     = useState(null);
  const [npcModal, setNpcModal] = useState(null);
  const [sellConfirm, setSellConfirm] = useState(null); // item index to sell
  const [haggledItem, setHaggledItem] = useState(null); // {item, discountedCost}

  const worldNPCs = useMemo(()=>{
    const loc = char.location||'village';
    if(char.marketNPCs?.[loc]) return char.marketNPCs[loc];
    return generateWorldNPCs(loc, char.generation||1);
  }, [char.location, char.generation]);

  const bagCap = 5 + ((char.inventory||[]).filter(i=>i.isBag).reduce((s,b)=>s+(b.bagSize||0),0));
  const carried = (char.inventory||[]).length;
  const canIdentify = ['mage','cleric','warlock'].includes(char.classId||'');
  const cursedStock = useMemo(()=>{
    if(!CURSED_ITEMS) return [];
    const items = Object.values(CURSED_ITEMS);
    if(!items.length) return [];
    const seed = (char.age||0)*31 + (char.location||'village').length;
    return items.filter((_,i)=>((seed+i*7)%10)===0);
  }, [char.age, char.location]);

  const locShops = LOCATIONS[char.location||'village']?.shops || ['blacksmith','herbalist','merchant'];
  const SHOPS = [
    { id:'general',    label:'General Store', emoji:'🏪' },
    { id:'blacksmith', label:'Blacksmith',    emoji:'⚒' },
    { id:'herbalist',  label:'Herbalist',     emoji:'🌿' },
    { id:'merchant',   label:'Merchant',      emoji:'🪙' },
    { id:'tents',      label:'Tents & Bags',  emoji:'⛺' },
    { id:'tailor',     label:'Tailor',        emoji:'🧵' },
    { id:'jeweller',   label:'Jeweller',      emoji:'💎' },
  ].filter(s => s.id==='general' || locShops.includes(s.id));

  const shopNPC = worldNPCs.find(n=>n.id===shop) || worldNPCs[SHOPS.findIndex(s=>s.id===shop)] || {name:'Trader',race:'human',age:35};
  const curLoc = char.location||'village';
  const vendorScore = getVendorPerception(char, curLoc, shop);
  const vendorRefusing = isVendorRefusing(char, curLoc, shop);

  function effectiveCost(item){
    if(haggledItem?.item?.id===item.id) return haggledItem.discountedCost;
    return item.cost;
  }

  function buyItem(item){
    if(vendorRefusing){ setResult({text:`${shopNPC.name} refuses to serve you after you stole from them. Try another town.`,bad:true}); return; }
    const cost = effectiveCost(item);
    const now = Date.now();
    const last = tapState[item.id]||0;
    if(now - last < 700){
      setTapState({});
      if((char.gold||0) < cost){ setResult({text:'Not enough gold.',bad:true}); return; }
      if(carried >= bagCap && !item.isBag){
        setResult({text:`Bag full (${carried}/${bagCap}). Go to General Store to sell items first.`,bad:true});
        return;
      }
      let updated = {
        ...char,
        gold: (char.gold||0)-cost,
        inventory: [...(char.inventory||[]), {...item, condition:'pristine', boughtAge:char.age, boughtCost:cost}],
        hasRing: item.isRing ? true : char.hasRing,
        log: [...(char.log||[]),{age:char.age,text:`Bought ${item.name} for ${cost}g.`,type:'good'}],
      };
      if(item.statBonus){
        const newStats = {...updated.stats};
        Object.entries(item.statBonus).forEach(([k,v])=>{ newStats[k]=Math.min(20,(newStats[k]||1)+v); });
        updated.stats = newStats;
      }
      // If item is gold (quest loot coin etc)
      if(item.isGold){ updated.gold=(updated.gold||0)+item.cost; updated.inventory=(updated.inventory||[]).filter(i=>i.id!==item.id); }
      setHaggledItem(null);
      setResult({text:`${item.name} purchased for ${cost}g.`,bad:false});
      onAction(updated);
    } else {
      setTapState({[item.id]:now});
      setResult({text:`${item.name} — ${cost}g. Tap again to confirm.`,bad:false});
    }
  }

  function haggle(item){
    if(vendorRefusing){ setResult({text:`${shopNPC.name} will not deal with you here.`,bad:true}); return; }
    const cha = char.stats?.CHA||1;
    const perception = getVendorPerception(char, curLoc, shop);
    const affinityBonus = getAffinityPriceBonus(perception);
    const success = Math.random()*100 < (40 + cha*5 + affinityBonus*100);
    if(success){
      // A vendor who likes you knocks more off the price.
      const discountRate = 0.15 + affinityBonus;
      const discount = Math.max(1, Math.floor(item.cost*discountRate));
      const newCost = Math.max(1, item.cost-discount);
      setHaggledItem({item, discountedCost:newCost});
      const trust = affinityBonus > 0.05 ? ' (they like you)' : '';
      setResult({text:`You talked ${shopNPC.name} down by ${discount}g${trust}. Price now ${newCost}g.`,bad:false});
    } else {
      setHaggledItem(null);
      setResult({text:`${shopNPC.name} didn't budge.`,bad:true});
    }
  }

  function sellItem(idx){
    const item = (char.inventory||[])[idx];
    if(!item) return;
    const {mod, label} = getSellModifier(item, char);
    const base = getBaseSellPrice(item);
    // Vendor-matching: selling the right goods to the right specialist pays a premium.
    // The general store always buys at flat rate (the lazy path still works).
    const match = getVendorMatch(item);
    const matched = shop !== 'general' && match && match.vendorId === shop;
    const vendorMult = matched ? match.mult : 1.0;
    // Affinity: a vendor who likes you pays more.
    const perception = getVendorPerception(char, curLoc, shop);
    const affinityBonus = getAffinityPriceBonus(perception);
    const price = Math.max(1, Math.round(base * mod * vendorMult * (1 + affinityBonus)));
    const extraLabels = [];
    if(label) extraLabels.push(label);
    if(matched) extraLabels.push('🎯 right buyer');
    if(affinityBonus > 0.05) extraLabels.push('🤝 trusted');
    const labelStr = extraLabels.length ? ` (${extraLabels.join(', ')})` : '';
    let updated = {
      ...char,
      gold: (char.gold||0)+price,
      inventory: (char.inventory||[]).filter((_,i)=>i!==idx),
      log: [...(char.log||[]),{age:char.age,text:`Sold ${item.name} for ${price}g${labelStr}.`,type:'good'}],
    };
    // Selling raises the vendor's opinion of you, scaled by item rarity.
    const gain = getSellAffinityGain(item);
    updated = withVendorPerception(updated, curLoc, shop, perception + gain);
    // Remove stat bonuses if item had them
    if(item.statBonus){
      const newStats={...updated.stats};
      Object.entries(item.statBonus).forEach(([k,v])=>{ newStats[k]=Math.max(1,(newStats[k]||1)-v); });
      updated = {...updated, stats:newStats};
    }
    setResult({text:`Sold ${item.name} for ${price}g${labelStr}`,bad:false});
    setSellConfirm(null);
    onAction(updated);
  }

  const items = shop==='general' ? [] : (MARKET_ITEMS[shop]||[]);

  function repairItem(idx){
    const item = (char.inventory||[])[idx];
    if(!item) return;
    if((item.condition||'pristine')==='pristine'){ setResult({text:`${item.name} is already in perfect condition.`,bad:true}); return; }
    const cost = getRepairCost(item);
    if((char.gold||0) < cost){ setResult({text:`Repairing ${item.name} costs ${cost}g. You have ${char.gold||0}g.`,bad:true}); return; }
    const repaired = { ...item, condition: repairCondition(item.condition||'worn') };
    const inv = (char.inventory||[]).map((it,i)=> i===idx ? repaired : it);
    const updated = { ...char, gold:(char.gold||0)-cost, inventory:inv,
      log:[...(char.log||[]),{age:char.age,text:`Repaired ${item.name} to ${repaired.condition} for ${cost}g.`,type:'good'}] };
    setResult({text:`${item.name} repaired to ${repaired.condition} for ${cost}g.`,bad:false});
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      <SectionHeader>Market</SectionHeader>

      {/* Bag status */}
      <Card style={{marginBottom:'10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
          <span style={{fontSize:'12px',color:T.muted}}>🎒 Carrying {carried}/{bagCap} items</span>
          {carried>=bagCap&&<span style={{fontSize:'10px',color:T.red,fontWeight:700}}>Full — sell at General Store</span>}
        </div>
        {(char.inventory||[]).length>0&&(
          <div style={{marginTop:'4px'}}>
            {(char.inventory||[]).map((item,i)=>{
              const {mod,label} = getSellModifier(item,char);
              const sellPrice = Math.max(1,Math.round(getBaseSellPrice(item)*mod));
              return (
                <div key={`bag-${i}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:`1px solid ${T.border}22`}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',flex:1,minWidth:0}}>
                    <span style={{fontSize:'14px'}}>{item.emoji||'📦'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <span style={{fontSize:'11px',color:T.text,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}{item.rarity&&item.rarity!=='common'?` · ${item.rarity}`:''}</span>
                      {item.condition&&item.condition!=='pristine'&&<span style={{fontSize:'9px',color:item.condition==='broken'||item.condition==='damaged'?T.red:T.muted}}>{item.condition}</span>}
                      {label&&<span style={{fontSize:'9px',color:T.gold,marginLeft:item.condition&&item.condition!=='pristine'?'6px':'0'}}>{label}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'4px',alignItems:'center',flexShrink:0}}>
                    {shop==='blacksmith' && item.statBonus && (item.condition||'pristine')!=='pristine' && (
                      <button onClick={()=>repairItem(i)} style={{fontSize:'9px',background:T.teal+'33',border:`1px solid ${T.teal}`,borderRadius:'4px',color:T.teal,cursor:'pointer',padding:'2px 5px',WebkitTapHighlightColor:'transparent'}}>Repair {getRepairCost(item)}g</button>
                    )}
                    {(item.healAmount||item.statTemp||item.consumable)&&(
                      <button onClick={()=>{
                        let updated={...char};
                        if(item.healAmount) updated.health=Math.min(100,(updated.health||100)+item.healAmount);
                        if(item.statTemp){
                          const ns={...updated.stats};
                          Object.entries(item.statTemp).forEach(([s,v])=>{ns[s]=Math.min(20,(ns[s]||1)+v);});
                          updated.stats=ns;
                          updated.statTemps=[...(updated.statTemps||[]),{stat:Object.keys(item.statTemp)[0],v:Object.values(item.statTemp)[0],expiresAge:(updated.age||0)+1}];
                        }
                        if(item.curePoison||item.consumable) updated.sickness=null;
                        updated.inventory=(updated.inventory||[]).filter((_,idx)=>idx!==i);
                        updated.log=[...(updated.log||[]),{age:updated.age,text:`Used ${item.name}.`,type:'good'}];
                        setResult({text:`Used ${item.name}.`,bad:false});
                        onAction(updated);
                      }} style={{fontSize:'9px',background:T.green+'33',border:`1px solid ${T.green}`,borderRadius:'4px',color:T.green,cursor:'pointer',padding:'2px 5px',WebkitTapHighlightColor:'transparent'}}>Use</button>
                    )}
                    {sellConfirm===i ? (
                      <>
                        <span style={{fontSize:'9px',color:T.gold}}>{sellPrice}g</span>
                        <button onClick={()=>sellItem(i)} style={{fontSize:'9px',background:T.gold+'33',border:`1px solid ${T.gold}`,borderRadius:'4px',color:T.gold,cursor:'pointer',padding:'2px 5px',WebkitTapHighlightColor:'transparent'}}>Confirm</button>
                        <button onClick={()=>setSellConfirm(null)} style={{fontSize:'9px',background:'transparent',border:`1px solid ${T.border}`,borderRadius:'4px',color:T.muted,cursor:'pointer',padding:'2px 5px',WebkitTapHighlightColor:'transparent'}}>✕</button>
                      </>
                    ) : (
                      <button onClick={()=>setSellConfirm(i)} style={{fontSize:'9px',background:T.muted+'22',border:`1px solid ${T.border}`,borderRadius:'4px',color:T.muted,cursor:'pointer',padding:'2px 5px',WebkitTapHighlightColor:'transparent'}}>Sell {sellPrice}g</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {(char.inventory||[]).length===0&&<p style={{fontSize:'11px',color:T.muted,fontStyle:'italic',marginTop:'4px'}}>Bag empty.</p>}
      </Card>

      {result&&<Card accent={result.bad?T.red:T.green} style={{marginBottom:'8px'}}><p style={{fontSize:'12px',color:result.bad?T.red:T.green}}>{result.text}</p><button onClick={()=>setResult(null)} style={{fontSize:'9px',color:T.muted,background:'transparent',border:'none',cursor:'pointer',marginTop:'4px'}}>Dismiss</button></Card>}

      {/* Shop tabs */}
      <div style={{display:'flex',gap:'4px',marginBottom:'12px',overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'4px'}}>
        {SHOPS.map(s=>(
          <button key={s.id} onClick={()=>{setShop(s.id);setResult(null);setHaggledItem(null);}} style={{
            padding:'6px 10px',background:shop===s.id?T.gold+'22':T.panel,
            border:`1px solid ${shop===s.id?T.gold:T.border}`,borderRadius:'8px',
            color:shop===s.id?T.gold:T.muted,fontSize:'10px',cursor:'pointer',
            flexShrink:0,WebkitTapHighlightColor:'transparent',whiteSpace:'nowrap',
          }}>{s.emoji} {s.label}</button>
        ))}
      </div>

      {/* General Store — sell anything */}
      {shop==='general' && (
        <Card>
          <p style={{fontSize:'12px',color:T.gold,fontWeight:700,marginBottom:'4px'}}>🏪 General Store</p>
          <p style={{fontSize:'11px',color:T.muted,marginBottom:'12px',lineHeight:'1.5'}}>
            The general store will buy anything. Prices vary by season and world events.
          </p>
          {(char.inventory||[]).length===0 ? (
            <p style={{fontSize:'11px',color:T.muted,fontStyle:'italic'}}>Your bag is empty — nothing to sell.</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {(char.inventory||[]).map((item,i)=>{
                const {mod,label} = getSellModifier(item,char);
                const sellPrice = Math.max(1,Math.round(getBaseSellPrice(item)*mod));
                return (
                  <div key={`gs-${i}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px',background:T.panelAlt,borderRadius:'8px',border:`1px solid ${T.border}`}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <span style={{fontSize:'16px'}}>{item.emoji||'📦'}</span>
                        <div>
                          <span style={{fontSize:'12px',color:T.text,fontWeight:700}}>{item.name}</span>
                          {label&&<span style={{fontSize:'9px',color:T.gold,marginLeft:'6px'}}>{label}</span>}
                        </div>
                      </div>
                      <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>
                        Base: {getBaseSellPrice(item)}g
                        {mod!==1&&<span style={{color:mod>1?T.green:T.red,marginLeft:'4px'}}>× {mod.toFixed(1)} = {sellPrice}g</span>}
                      </div>
                    </div>
                    <div style={{flexShrink:0,marginLeft:'8px'}}>
                      {sellConfirm===i ? (
                        <div style={{display:'flex',gap:'4px'}}>
                          <button onClick={()=>sellItem(i)} style={{fontSize:'11px',background:T.gold+'33',border:`1px solid ${T.gold}`,borderRadius:'6px',color:T.gold,cursor:'pointer',padding:'4px 8px',fontWeight:700,WebkitTapHighlightColor:'transparent'}}>Sell {sellPrice}g</button>
                          <button onClick={()=>setSellConfirm(null)} style={{fontSize:'11px',background:'transparent',border:`1px solid ${T.border}`,borderRadius:'6px',color:T.muted,cursor:'pointer',padding:'4px 8px',WebkitTapHighlightColor:'transparent'}}>✕</button>
                        </div>
                      ) : (
                        <button onClick={()=>setSellConfirm(i)} style={{fontSize:'11px',background:T.muted+'22',border:`1px solid ${T.border}`,borderRadius:'6px',color:T.muted,cursor:'pointer',padding:'4px 8px',WebkitTapHighlightColor:'transparent'}}>Sell</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Shop NPC and items */}
      {shop!=='general' && (
        <>
          <NPCCard npc={{...shopNPC,job:SHOPS.find(s=>s.id===shop)?.label}} onInteract={()=>setNpcModal(shopNPC)} interactLabel="Talk"/>

          {/* Vendor perception like-bar */}
          <div style={{margin:'2px 0 10px',padding:'6px 8px',background:T.panel,borderRadius:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
              <span style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px'}}>{shopNPC.name.toUpperCase()} · OPINION OF YOU</span>
              <span style={{fontSize:'9px',color:vendorRefusing?T.red:vendorScore>=60?T.green:vendorScore>=30?T.gold:T.orange}}>
                {vendorRefusing?'REFUSES YOU':vendorScore>=70?'Trusts you':vendorScore>=45?'Friendly':vendorScore>=25?'Neutral':'Wary'}
              </span>
            </div>
            <div style={{height:'5px',background:'#1a1208',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${vendorRefusing?0:vendorScore}%`,background:vendorRefusing?T.red:vendorScore>=60?T.green:vendorScore>=30?T.gold:T.orange,transition:'width 0.4s'}}/>
            </div>
          </div>
          {vendorRefusing && (
            <Card accent={T.red} style={{marginBottom:'10px'}}>
              <p style={{fontSize:'11px',color:T.red}}>{shopNPC.name} caught you stealing and will no longer trade with you here. Visit a vendor in another town.</p>
            </Card>
          )}

          {/* Items */}
          {items.map(item=>{
            const cost = effectiveCost(item);
            const isHaggled = haggledItem?.item?.id===item.id;
            return (
              <Card key={item.id} style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'20px'}}>{item.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,color:T.text,fontSize:'13px'}}>{item.name}</div>
                      <div style={{fontSize:'10px',color:T.muted}}>{item.desc}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginLeft:'8px'}}>
                    {isHaggled&&<div style={{fontSize:'9px',color:T.muted,textDecoration:'line-through'}}>{item.cost}g</div>}
                    <div style={{fontWeight:700,color:isHaggled?T.green:T.gold,fontSize:'13px'}}>{cost}g</div>
                    {item.statBonus&&Object.entries(item.statBonus).map(([k,v])=>(
                      <div key={k} style={{fontSize:'9px',color:T.green}}>+{v} {k}</div>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  <Btn onClick={()=>buyItem(item)} colour={tapState[item.id]?T.green:T.gold} disabled={(char.gold||0)<cost} small>
                    {tapState[item.id]?'Confirm':isHaggled?`Buy ${cost}g ✓`:`Buy ${cost}g`}
                  </Btn>
                  {!isHaggled&&<Btn onClick={()=>haggle(item)} colour={T.muted} outline small>Haggle</Btn>}
                </div>
              </Card>
            );
          })}

          {/* Cursed items */}
          {cursedStock.length > 0 && (
            <div style={{marginTop:'8px',borderTop:`1px solid ${T.border}33`,paddingTop:'8px'}}>
              <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px',marginBottom:'6px'}}>UNUSUAL ITEMS</div>
              {cursedStock.map(item=>{
                const identified = (char.identifiedItems||[]).includes(item.id);
                return (
                  <Card key={item.id} style={{marginBottom:'6px',border:`1px solid ${T.crimson}44`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontSize:'11px',color:T.text}}>{item.emoji} {item.name}</div>
                        <div style={{fontSize:'9px',color:T.muted}}>{item.price}g · +{item.bonus.v} {item.bonus.stat}</div>
                        {identified&&<div style={{fontSize:'9px',color:T.red,marginTop:'2px'}}>⚠ Cursed: {item.curse}</div>}
                        {!identified&&canIdentify&&<div style={{fontSize:'9px',color:T.purple,marginTop:'2px'}}>Cast Identify to reveal</div>}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                        {canIdentify&&!identified&&(
                          <Btn small colour={T.purple} outline onClick={()=>{
                            onAction({...char,identifiedItems:[...(char.identifiedItems||[]),item.id]});
                            setResult({text:`Identify reveals: ${item.curse}`,bad:true});
                          }}>Identify</Btn>
                        )}
                        <Btn small colour={T.crimson} outline onClick={()=>{
                          if((char.gold||0)<item.price){setResult({text:`Need ${item.price}g.`,bad:true});return;}
                          const stat=item.bonus.stat; const ns={...char.stats,[stat]:Math.min(20,(char.stats?.[stat]||1)+item.bonus.v)};
                          onAction({...char,gold:(char.gold||0)-item.price,stats:ns,
                            inventory:[...(char.inventory||[]),{...item,cursed:true,seasonsOwned:0}],
                            log:[...(char.log||[]),{age:char.age,text:`Bought ${item.name}.`,type:'neutral'}]});
                          setResult({text:`You bought ${item.name}.`,bad:false});
                        }}>Buy {item.price}g</Btn>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* NPC interaction modal */}
          {npcModal&&(
            <Card accent={T.gold} style={{marginBottom:'10px'}}>
              <p style={{fontSize:'12px',color:T.gold,fontWeight:700,marginBottom:'6px'}}>Talking to {npcModal.name}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                <Btn onClick={()=>{
                  const key = `${curLoc}:${shop}`;
                  const used = char.seasonNpcInteractions?.[key]||0;
                  if(used >= 2){ setResult({text:`${npcModal.name} has had enough of your company this season.`,bad:true}); setNpcModal(null); return; }
                  const { updated, gain } = talkToNPC(char, curLoc, shop, vendorScore);
                  const u2 = {...updated, seasonNpcInteractions:{...(updated.seasonNpcInteractions||{}), [key]:used+1}};
                  setResult({text:`You chat with ${npcModal.name}. They warm to you a little. (+${gain} opinion)`,bad:false});
                  setNpcModal(null);
                  onAction(u2);
                }} colour={T.teal} outline small disabled={(char.seasonNpcInteractions?.[`${curLoc}:${shop}`]||0)>=2}>
                  {(char.seasonNpcInteractions?.[`${curLoc}:${shop}`]||0)>=2 ? 'Talked enough this season' : `Talk a while · ${2-(char.seasonNpcInteractions?.[`${curLoc}:${shop}`]||0)} left`}
                </Btn>
                <Btn onClick={()=>{
                  const { updated, caught, fine, gainedText } = stealFromNPC(char, curLoc, shop, npcModal.name, vendorScore);
                  if(caught) setResult({text:`Caught! ${npcModal.name} fined you ${fine}g and refuses to serve you here now.`,bad:true});
                  else setResult({text:`You pocketed ${gainedText} from ${npcModal.name} unseen.`,bad:false});
                  setNpcModal(null);
                  onAction(updated);
                }} colour={T.crimson} outline small>Steal from them (risky)</Btn>
                <Btn onClick={()=>{setResult({text:`${npcModal.name} listens but says nothing useful.`,bad:false});setNpcModal(null);}} colour={T.muted} outline small>Just browsing</Btn>
                <Btn onClick={()=>{
                  if(vendorRefusing){setResult({text:`${npcModal.name} will not teach you anything now.`,bad:true});setNpcModal(null);return;}
                  // Which Work-tab trade this vendor teaches
                  const VENDOR_TRADE = { blacksmith:'smithy', herbalist:'herb', merchant:'shop_asst', tailor:'tailoring', jeweller:'jewelcraft' };
                  const tradeJob = VENDOR_TRADE[shop];
                  if(!tradeJob){ setResult({text:`${npcModal.name} has no trade to teach.`,bad:true}); setNpcModal(null); return; }
                  if((char.apprenticeships||[]).includes(tradeJob)){ setResult({text:`You are already apprenticed in this trade. Practise it in the Work tab.`,bad:false}); setNpcModal(null); return; }
                  // Relationship gate: must be at least Neutral (25+).
                  if(vendorScore < 25){ setResult({text:`${npcModal.name} barely knows you. Spend some time with them first.`,bad:true}); setNpcModal(null); return; }
                  const cha = char.stats?.CHA||1;
                  const success = Math.random()*100 < (vendorScore*0.5 + cha*4);
                  if(!success){ setResult({text:`${npcModal.name} is not convinced you are ready. Try again when they trust you more.`,bad:true}); setNpcModal(null); return; }
                  onAction({...char,
                    apprenticeships:[...(char.apprenticeships||[]), tradeJob],
                    log:[...(char.log||[]),{age:char.age,text:`${npcModal.name} took you on as an apprentice. The trade is now open to you in the Work tab — though it pays nothing until you find your feet.`,type:'good'}]});
                  setResult({text:`${npcModal.name} took you on. Practise the trade in the Work tab — no pay until you reach the next level.`,bad:false});
                  setNpcModal(null);
                }} colour={T.teal} outline small>Ask to apprentice (you)</Btn>
                {(char.relationships||[]).some(r=>r.type==='child'&&r.alive!==false&&(r.age||0)>=8&&(r.age||0)<18) && (
                  <Btn onClick={()=>{
                    if(vendorRefusing){setResult({text:`${npcModal.name} will not take your child on now.`,bad:true});setNpcModal(null);return;}
                    const VENDOR_TRADE = { blacksmith:'smithy', herbalist:'herbalism', merchant:'trade', tailor:'tailoring', jeweller:'jewelcraft' };
                    const VENDOR_STAT = { blacksmith:'STR', herbalist:'WIS', merchant:'CHA', tailor:'DEX', jeweller:'INT' };
                    const tradeName = VENDOR_TRADE[shop];
                    if(!tradeName){ setResult({text:`${npcModal.name} has no trade to teach.`,bad:true}); setNpcModal(null); return; }
                    const FEE = 30;
                    if((char.gold||0) < FEE){ setResult({text:`Placing a child as an apprentice costs ${FEE}g.`,bad:true}); setNpcModal(null); return; }
                    if(vendorScore < 25){ setResult({text:`${npcModal.name} does not know you well enough to take your child on.`,bad:true}); setNpcModal(null); return; }
                    const cha = char.stats?.CHA||1;
                    const success = Math.random()*100 < (vendorScore*0.5 + cha*4);
                    if(!success){ setResult({text:`${npcModal.name} declined to take your child on. Build more goodwill first.`,bad:true}); setNpcModal(null); return; }
                    // Place the eldest eligible child without a trade
                    const kids = (char.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false&&(r.age||0)>=8&&(r.age||0)<18&&!r.trade).sort((a,b)=>(b.age||0)-(a.age||0));
                    const kid = kids[0];
                    if(!kid){ setResult({text:`None of your children are the right age, or they already have a trade.`,bad:true}); setNpcModal(null); return; }
                    const stat = VENDOR_STAT[shop];
                    const newRels = (char.relationships||[]).map(r=> r.id===kid.id ? {...r, trade:tradeName, stats:{...(r.stats||{}), [stat]:Math.min(20,((r.stats||{})[stat]||5)+1)}} : r);
                    onAction({...char, gold:(char.gold||0)-FEE, relationships:newRels,
                      log:[...(char.log||[]),{age:char.age,text:`You paid ${FEE}g for ${npcModal.name} to take ${kid.name} on as a ${tradeName} apprentice.`,type:'good'}]});
                    setResult({text:`${kid.name} is now apprenticed as a ${tradeName} (+1 ${stat}). ${FEE}g paid.`,bad:false});
                    setNpcModal(null);
                  }} colour={T.gold} outline small>Apprentice your child (30g)</Btn>
                )}
                <Btn onClick={()=>setNpcModal(null)} colour={T.muted} small>Leave</Btn>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Will */}
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'10px',marginTop:'6px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <span style={{fontSize:'11px',color:T.muted,letterSpacing:'0.5px'}}>⚖ LAST WILL & TESTAMENT</span>
          <Btn onClick={()=>setShowWill(s=>!s)} colour={T.muted} outline small>{showWill?'Close':'Write Will'}</Btn>
        </div>
        {showWill&&(()=>{
          const children=(char.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false);
          const will=char.willInstructions||{};
          const heirs=[...children];
          if(char.spouse){const sr=(char.relationships||[]).find(r=>r.id===char.spouse&&r.alive!==false);if(sr)heirs.unshift(sr);}
          return (
            <Card style={{padding:'10px',marginBottom:'8px'}}>
              <p style={{fontSize:'10px',color:T.muted,marginBottom:'8px',fontStyle:'italic',lineHeight:'1.5'}}>Choose who inherits your estate.</p>
              {heirs.length===0&&<p style={{fontSize:'10px',color:T.muted}}>No heirs. Consider adoption.</p>}
              {heirs.length>0&&(
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  {['gold','property','items'].map(cat=>(
                    <div key={cat}>
                      <p style={{fontSize:'10px',color:T.muted,marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>{cat}</p>
                      <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                        <button onClick={()=>onAction({...char,willInstructions:{...will,[cat]:'split'}})}
                          style={{fontSize:'9px',padding:'3px 8px',background:will[cat]==='split'?T.teal+'33':T.panel,border:`1px solid ${will[cat]==='split'?T.teal:T.border}`,borderRadius:'4px',color:will[cat]==='split'?T.teal:T.muted,cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>Split evenly</button>
                        {heirs.map(h=>(
                          <button key={h.id} onClick={()=>onAction({...char,willInstructions:{...will,[cat]:h.id}})}
                            style={{fontSize:'9px',padding:'3px 8px',background:will[cat]===h.id?T.gold+'33':T.panel,border:`1px solid ${will[cat]===h.id?T.gold:T.border}`,borderRadius:'4px',color:will[cat]===h.id?T.gold:T.muted,cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>{h.name}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
// CRIME TAB
// ══════════════════════════════════════════════════════════════════════════════
const CRIMES = [
  { id:'pickpocket', name:'Pickpocket',    emoji:'✋', desc:'Light fingers in the crowd.',       energyCost:ENERGY.crime,      reward:[3,12],   caught:20, minAge:13 },
  { id:'burglary',   name:'Burglary',      emoji:'🏠', desc:"Empty the merchant's back room.",  energyCost:ENERGY.crime,      reward:[10,30],  caught:30, minAge:15 },
  { id:'fraud',      name:'Fraud',         emoji:'📜', desc:'Fake documents. Forged seals.',     energyCost:ENERGY.crime,      reward:[15,40],  caught:25, minAge:16 },
  { id:'blackmail',  name:'Blackmail',     emoji:'🖤', desc:'Everyone has a secret.',            energyCost:ENERGY.majorCrime, reward:[20,60],  caught:35, minAge:18 },
  { id:'heist',      name:'The Big Heist', emoji:'💎', desc:'Something ambitious. Very risky.',  energyCost:ENERGY.majorCrime, reward:[50,120], caught:50, minAge:20 },
];

export function CrimeTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  // Count crimes by tracking a separate counter, not by dividing energy (majorCrime costs more energy)
  const crimeDone = char.crimesDoneThisYear || 0;

  function commit(crime){
    if((char.seasonActions?.crime||0) >= (SEASON_LIMITS.crime||1)){ setResult({text:'You have done enough criminal work this season.',bad:true}); return; }
    if(crimeDone >= 3){ setResult({text:"You've pushed your luck enough this year.",bad:true}); return; }
    const stealthBonus = (char.skills?.stealth||0)*5;
    const locCatchMod  = LOCATIONS[char.location||'village']?.crimeCatchMod||0;
    const caughtChance = Math.max(5, crime.caught - stealthBonus + locCatchMod);
    const caught = chance(caughtChance);
    const reward = caught ? 0 : rand(crime.reward[0], crime.reward[1]);
    const fine = caught ? rand(10,30) : 0;
    const updated = {
      ...char,
      gold: Math.max(0, char.gold+reward-fine),
      criminalRecord: caught ? (char.criminalRecord||0)+1 : char.criminalRecord,
      crimesDoneThisYear: (char.crimesDoneThisYear||0)+1,
      seasonActions:{ ...(char.seasonActions||{}), crime:((char.seasonActions?.crime||0)+1) },
      yearActions:[...(char.yearActions||[]), caught?`Caught for ${crime.name} (−${fine}g)`:`${crime.name} — got away with ${reward}g`],
      log:[...(char.log||[]),{ age:char.age, text:caught?`Caught committing ${crime.name}. Fined ${fine}g.`:`${crime.name} — ${reward}g richer.`, type:caught?'bad':'good' }],
    };
    setResult({ text:caught?`Caught. Fined ${fine}g. Your record grows.`:`Clean getaway. ${reward}g.`, bad:caught });
    setSelected(null);
    onAction(updated);
  }

  const available = CRIMES.filter(c=>c.minAge<=char.age);
  const record = char.criminalRecord||0;
  // Consequences of criminal record
  const cityBanned     = record >= 3;  // barred from city jobs
  const jobPenalty     = record >= 2;  // some employers refuse you
  const pricePenalty   = record >= 1;  // shops charge more
  const talkdownLocked = record >= 4;  // can't use persuasion to escape charges

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.green}><p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}
      {record > 0 && (
        <Card accent={T.red} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'12px',color:T.red,fontWeight:700,marginBottom:'6px'}}>⚠ Criminal Record: {record} offence{record!==1?'s':''}</p>
          <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
            {pricePenalty && <p style={{fontSize:'11px',color:T.orange}}>• Merchants charge you 20% more</p>}
            {jobPenalty   && <p style={{fontSize:'11px',color:T.orange}}>• Some employers will not deal with you</p>}
            {cityBanned   && <p style={{fontSize:'11px',color:T.red}}>• City gates are watched — city jobs unavailable</p>}
            {talkdownLocked && <p style={{fontSize:'11px',color:T.red}}>• Your reputation precedes you. Persuasion has limits.</p>}
          </div>
          <div style={{marginTop:'8px'}}>
            {(()=>{
              const locClearMod = LOCATIONS[char.location||'village']?.crimeClearanceMod||0;
              const clearCost = CRIME_CLEARANCE_COST + locClearMod;
              return (char.gold||0)>=clearCost
                ? <Btn onClick={()=>{
                    const updated={...char,gold:(char.gold||0)-clearCost,criminalRecord:Math.max(0,record-1),
                      log:[...(char.log||[]),{age:char.age,text:`Paid ${clearCost}g to have a record expunged.`,type:'good'}]};
                    setResult({text:`Record reduced. ${clearCost}g paid.`,bad:false}); onAction(updated);
                  }} colour={T.orange} outline small>Pay {clearCost}g — clear one offence</Btn>
                : <p style={{fontSize:'10px',color:T.red}}>Need {clearCost}g to clear one offence{locClearMod>0?' (higher here — city watch)':''}.</p>;
            })()
            }
          </div>
        </Card>
      )}
      <SectionHeader>Criminal Activities · {crimeDone}/3 this year</SectionHeader>
      <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px'}}>Stealth skill reduces chance of being caught.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
        {available.map(crime=>{
          const canDo = (char.seasonActions?.crime||0) < (SEASON_LIMITS.crime||1);
          const isSelected = selected===crime.id;
          return (
            <Block key={crime.id}
              emoji={crime.emoji} name={crime.name}
              sub={crime.desc}
              detail={`${crime.reward[0]}–${crime.reward[1]}g · ${crime.caught}% caught`}
              colour={T.crimson} disabled={!canDo} active={isSelected}
              onClick={()=>setSelected(isSelected?null:crime.id)}
            />
          );
        })}
      </div>

      {selected && (()=>{
        const crime = CRIMES.find(c=>c.id===selected);
        if(!crime) return null;
        const stealthBonus = (char.skills?.stealth||0)*5;
        const effectiveCaught = Math.max(5, crime.caught-stealthBonus);
        return (
          <Card accent={T.crimson} style={{marginBottom:'12px'}}>
            <p style={{fontSize:'13px',fontWeight:700,color:T.text,marginBottom:'4px'}}>{crime.emoji} {crime.name}</p>
            <p style={{fontSize:'12px',color:T.muted,marginBottom:'6px'}}>{crime.desc}</p>
            <p style={{fontSize:'11px',color:T.gold,marginBottom:'2px'}}>Reward: {crime.reward[0]}–{crime.reward[1]}g</p>
            <p style={{fontSize:'11px',color:T.red,marginBottom:'8px'}}>Catch chance: {effectiveCaught}%{stealthBonus>0?` (reduced by stealth)`:''}</p>
            <Btn onClick={()=>commit(crime)} colour={T.crimson}>Commit</Btn>
          </Card>
        );
      })()}

      {/* ── BLACK MARKET (fence) — town & city only ──────────────────────────── */}
      {(()=>{
        const loc = char.location||'village';
        const isUrban = (loc==='town'||loc==='city');
        if(!isUrban) return (
          <Card style={{marginTop:'8px'}}>
            <SectionHeader>Black Market</SectionHeader>
            <p style={{fontSize:'11px',color:T.muted,fontStyle:'italic'}}>No fence operates out here. You would need to be in a town or city to move stolen goods.</p>
          </Card>
        );
        const sellable = (char.inventory||[]).filter(i=>!i.isTent && !i.isBag);
        function fence(item, idx){
          // Reduced payout vs honest vendors; small stealth-scaled catch risk.
          const stealth = char.skills?.stealth||0;
          const base = Math.max(1, Math.floor((item.cost||item.price||5)*0.30)); // worse than 45% honest rate
          const locCatchMod = LOCATIONS[loc]?.crimeCatchMod||0;
          const catchChance = Math.max(4, Math.min(80, 20 - stealth*4 + locCatchMod));
          const caught = chance(catchChance);
          if(caught){
            const fine = rand(8,20);
            const updated = {
              ...char,
              gold: Math.max(0,(char.gold||0)-fine),
              criminalRecord:(char.criminalRecord||0)+1,
              inventory:(char.inventory||[]).filter((_,i)=>i!==idx),
              log:[...(char.log||[]),{age:char.age,text:`The watch caught you fencing ${item.name}. Goods seized, fined ${fine}g.`,type:'bad'}],
            };
            setResult({text:`Caught fencing ${item.name}! Fined ${fine}g, goods seized.`,bad:true});
            onAction(updated);
            return;
          }
          const updated = {
            ...char,
            gold:(char.gold||0)+base,
            inventory:(char.inventory||[]).filter((_,i)=>i!==idx),
            log:[...(char.log||[]),{age:char.age,text:`Fenced ${item.name} for ${base}g, no questions asked.`,type:'neutral'}],
          };
          setResult({text:`Fenced ${item.name} for ${base}g.`,bad:false});
          onAction(updated);
        }
        return (
          <Card style={{marginTop:'8px'}}>
            <SectionHeader>Black Market</SectionHeader>
            <p style={{fontSize:'11px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>A fence pays less than an honest shop — and there is always a chance the watch is watching. Stealth lowers the risk. Stolen goods are best moved here.</p>
            {!sellable.length && <p style={{fontSize:'11px',color:T.muted}}>You have nothing to fence.</p>}
            {sellable.map((item,idx)=>{
              const realIdx = (char.inventory||[]).indexOf(item);
              const offer = Math.max(1, Math.floor((item.cost||item.price||5)*0.30));
              return (
                <Card key={`${item.id}_${idx}`} style={{marginBottom:'6px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'12px',color:T.text}}>{item.emoji} {item.name}{item.stolen?' 🩸':''}</div>
                      <div style={{fontSize:'9px',color:T.muted}}>Fence offer: {offer}g</div>
                    </div>
                    <Btn onClick={()=>fence(item, realIdx)} colour={T.crimson} small outline full={false}>Fence {offer}g</Btn>
                  </div>
                </Card>
              );
            })}
          </Card>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RELIGION TAB
// ══════════════════════════════════════════════════════════════════════════════
const DEITIES = [
  { id:'solara',   name:'Solara',   emoji:'☀️', domain:'Sun, healing, harvest.',   blessStat:'WIS', colour:'#f5c842' },
  { id:'morthas',  name:'Morthas',  emoji:'🌑', domain:'Death, secrets, justice.', blessStat:'INT', colour:'#5a4a8a' },
  { id:'ferrus',   name:'Ferrus',   emoji:'⚒',  domain:'Forge, war, endurance.',   blessStat:'STR', colour:'#c04040' },
  { id:'sylvara',  name:'Sylvara',  emoji:'🌲', domain:'Forest, beasts, growth.',  blessStat:'DEX', colour:'#4a9e52' },
  { id:'orindel',  name:'Orindel',  emoji:'⚡', domain:'Storm, chance, travellers.',blessStat:'CON', colour:'#3a6ea8' },
  { id:'vexara',   name:'Vexara',   emoji:'🎭', domain:'Lies, charm, performance.',  blessStat:'CHA', colour:'#b060c0' },
];

export function ReligionTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const worshipped = char.worshippedDeity;
  const blessings = char.blessings||[];

  function pray(deity){
    if((char.seasonActions?.worship||0) >= (SEASON_LIMITS.worship||4)){ setResult({text:'No worship time left this season.',bad:true}); return; }
    const newDevotion = { ...(char.devotion||{}), [deity.id]:((char.devotion||{})[deity.id]||0)+5 };
    const updated = {
      ...char,
      worshippedDeity: deity.id,
      devotion: newDevotion,
      seasonActions:{ ...(char.seasonActions||{}), worship:((char.seasonActions?.worship||0)+1) },
      yearActions:[...(char.yearActions||[]), `Prayed to ${deity.name}`],
      log:[...(char.log||[]),{ age:char.age, text:`Prayed to ${deity.name}. +5 devotion.`, type:'neutral' }],
    };
    setResult({ text:`You prayed to ${deity.name}. Your faith deepens.`, bad:false });
    setSelected(null);
    onAction(updated);
  }

  function worship(deity){
    if((char.seasonActions?.worship||0) >= (SEASON_LIMITS.worship||4)){ setResult({text:'You have worshipped enough this season.',bad:true}); return; }
    const templeCost = DEITY_TEMPLE_COSTS[deity.id]||{gold:15,days:7};
    if((char.gold||0) < templeCost.gold){ setResult({text:`Temple offering to ${deity.name} requires ${templeCost.gold}g. You have ${char.gold||0}g.`,bad:true}); return; }
    if((char.questDaysUsed||0)+templeCost.days > 90){ setResult({text:`Temple visit takes ${templeCost.days} days — not enough season days left.`,bad:true}); return; }
    const newDev = { ...(char.devotion||{}), [deity.id]:((char.devotion||{})[deity.id]||0)+15 };
    const newBlessing = getDeityBlessing({...char,devotion:newDev,worshippedDeity:deity.id});
    const levelledUp = newBlessing && newBlessing.level > (getDeityBlessing(char)||{}).level;
    const updated = {
      ...char,
      worshippedDeity: deity.id,
      devotion: newDev,
      gold: (char.gold||0)-templeCost.gold,
      questDaysUsed: (char.questDaysUsed||0)+templeCost.days,
      blessings: newBlessing ? [...new Set([...(char.blessings||[]),deity.id])] : (char.blessings||[]),
      seasonActions:{ ...(char.seasonActions||{}), worship:((char.seasonActions?.worship||0)+1) },
      log:[...(char.log||[]),{ age:char.age, text:`Worshipped at the temple of ${deity.name}. +15 devotion.${levelledUp?` Devotion level ${newBlessing.level} reached!`:''}`, type:levelledUp?'good':'neutral' }],
      yearActions:[...(char.yearActions||[]), `Worshipped ${deity.name}`],
    };
    setResult({ text:levelledUp?`Your devotion to ${deity.name} reaches a new level. A blessing stirs.`:`You worship at the temple of ${deity.name}. The faith deepens.`, bad:false });
    setSelected(null);
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.green}><p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}

      <SectionHeader>Worship</SectionHeader>
      <p style={{fontSize:'11px',color:T.muted,marginBottom:'12px'}}>Pray free (+5 devotion). Visit a temple for deeper faith (+15 devotion, costs gold and days). Devotion unlocks blessings.</p>

      {worshipped && (()=>{
        const d = DEITIES.find(x=>x.id===worshipped);
        const dev = (char.devotion||{})[worshipped]||0;
        return d ? (
          <Card accent={d.colour} style={{marginBottom:'12px'}}>
            <p style={{fontSize:'13px',fontWeight:700,color:d.colour,marginBottom:'2px'}}>{d.emoji} {d.name}</p>
            <p style={{fontSize:'11px',color:T.muted}}>Devotion: {dev}</p>
            {blessings.includes(worshipped) && <p style={{fontSize:'10px',color:T.green,marginTop:'2px'}}>✓ Blessed</p>}
          </Card>
        ) : null;
      })()}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        {DEITIES.map(deity=>{
          const dev = (char.devotion||{})[deity.id]||0;
          const isWorshipped = worshipped===deity.id;
          const isSelected = selected===deity.id;
          const templeCost = DEITY_TEMPLE_COSTS[deity.id]||{gold:15,days:7};
          return (
            <Block key={deity.id}
              emoji={deity.emoji} name={deity.name}
              sub={deity.domain}
              detail={`Devotion ${dev}`}
              colour={deity.colour} active={isWorshipped||isSelected}
              onClick={()=>setSelected(isSelected?null:deity.id)}
            />
          );
        })}
      </div>

      {selected && (()=>{
        const deity = DEITIES.find(d=>d.id===selected);
        if(!deity) return null;
        const dev = (char.devotion||{})[deity.id]||0;
        const templeCost = DEITY_TEMPLE_COSTS[deity.id]||{gold:15,days:7};
        const worshipLeft = Math.max(0,(SEASON_LIMITS.worship||4)-(char.seasonActions?.worship||0));
        return (
          <Card accent={deity.colour} style={{marginTop:'12px'}}>
            <p style={{fontSize:'13px',fontWeight:700,color:T.text,marginBottom:'4px'}}>{deity.emoji} {deity.name}</p>
            <p style={{fontSize:'11px',color:T.muted,marginBottom:'6px'}}>{deity.domain}</p>
            <p style={{fontSize:'11px',color:T.muted,marginBottom:'2px'}}>Devotion: {dev} · Worship sessions left: {worshipLeft}</p>
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <Btn onClick={()=>pray(deity)} colour={deity.colour} disabled={worshipLeft<=0} small>🙏 Pray (free)</Btn>
              <Btn onClick={()=>worship(deity)} colour={deity.colour} outline disabled={worshipLeft<=0||(char.gold||0)<templeCost.gold} small>⛪ Temple ({templeCost.gold}g)</Btn>
            </div>
          </Card>
        );
      })()}
    </div>
  );
}

export function WorldTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const hasMount = (char.inventory||[]).some(i=>['horse','warhorse','mule'].includes(i.id));
  const currentSeasonName = ['Spring','Summer','Autumn','Winter'][((char.currentSeasonStep||0)+(char.startSeasonIdx||0))%4];
  const isWinter2 = currentSeasonName==='Winter';
  const travelDone = Math.floor((char.questDaysUsed||0) / 14); // each trip = 14 days

  function calcTravelDays(loc){
    const base = loc.travelDays||14;
    const mountMult = hasMount ? 0.6 : 1;
    const winterMult = isWinter2 ? 1.4 : 1;
    return Math.ceil(base * mountMult * winterMult);
  }

  function travel(locId, loc){
    if(char.location===locId){ setResult({text:"You're already here.",bad:true}); return; }
    const days = calcTravelDays(loc);
    const cost = loc.travelCost||0;
    if(char.age < (loc.unlockAge||0)){ setResult({text:`You need to be at least ${loc.unlockAge} to make this journey.`,bad:true}); return; }
    if((char.gold||0) < cost){ setResult({text:`Travel to ${loc.name} costs ${cost}g. You have ${char.gold||0}g.`,bad:true}); return; }
    if((char.questDaysUsed||0)+days > 90){ setResult({text:`This journey takes ${days} days — not enough season days left (${Math.max(0,90-(char.questDaysUsed||0))} remaining).`,bad:true}); return; }

    const homeLoc = char.homeLocation || 'village';
    const goingHome = (locId === homeLoc);
    const parentAlive = (char.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false);

    let updated = {
      ...char,
      location: locId,
      gold: (char.gold||0) - cost,
      questDaysUsed: (char.questDaysUsed||0) + days,
      yearActions: [...(char.yearActions||[]), `Travelled to ${loc.name}`],
      log: [...(char.log||[]),{ age:char.age, text:`Travelled to ${loc.name}. ${days} days, ${cost>0?cost+'g':'free'}.`, type:'neutral' }],
    };

    if(goingHome && char.hasMovedOut && parentAlive){
      // Returning to the family home — ask to move back in.
      if((char.age||0) <= 18){
        updated.hasMovedOut = false;
        updated.log = [...updated.log,{ age:char.age, text:'You came home. Your parents took you back in without a word of argument.', type:'good' }];
        setResult({ text:`You arrived in ${loc.name} and moved back into the family home.`, bad:false });
        onAction(updated);
        return;
      } else {
        // Over 18: hard check, heavily CHA + parent relationship dependent.
        const parentRel = (char.relationships||[]).find(r=>r.type==='parent'&&r.alive!==false);
        const parentScore = parentRel?.score ?? 40;
        const cha = char.stats?.CHA||1;
        const acceptChance = Math.min(70, cha*3 + parentScore*0.4);
        if(chance(acceptChance)){
          updated.hasMovedOut = false;
          updated.log = [...updated.log,{ age:char.age, text:'You asked to move back in. After a long pause, they agreed.', type:'good' }];
          setResult({ text:`You arrived in ${loc.name}. Your parents agreed to take you back in.`, bad:false });
        } else {
          updated.log = [...updated.log,{ age:char.age, text:'You asked to move back in. They said no — gently, but firmly. You are a grown adult now.', type:'bad' }];
          setResult({ text:`You arrived in ${loc.name}, but your parents would not take you back in. You will need your own place.`, bad:true });
        }
        onAction(updated);
        return;
      }
    }

    // Travelling away from home = you have left the family home.
    if(!goingHome && !char.hasMovedOut){
      updated.hasMovedOut = true;
      updated.log = [...updated.log,{ age:char.age, text:'Leaving home behind, you set out on your own.', type:'neutral' }];
    }

    setResult({ text:`You arrived in ${loc.name}. The journey took ${days} days${cost>0?` and ${cost}g`:''}.`, bad:false });
    onAction(updated);
  }

  const currentLoc = LOCATIONS[char.location||'village'];

  if((char.age||0) < 16){
    return (
      <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
        <SectionHeader>World</SectionHeader>
        <Card accent={T.muted} style={{marginTop:'12px'}}>
          <p style={{fontSize:'13px',color:T.muted,textAlign:'center',padding:'8px 0'}}>🔒 Available from age 16</p>
          <p style={{fontSize:'11px',color:T.muted,textAlign:'center'}}>You are too young to travel or join factions on your own.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.green}><p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}

      {currentLoc && (
        <>
          <SectionHeader>Current Location</SectionHeader>
          <Card accent={T.teal} style={{marginBottom:'12px'}}>
            <p style={{fontSize:'15px',fontWeight:700,color:T.text}}>{currentLoc.emoji} {currentLoc.name}</p>
            <p style={{fontSize:'12px',color:T.muted,marginTop:'4px'}}>{currentLoc.desc}</p>
          </Card>
        </>
      )}

      <SectionHeader>Travel · {Math.max(0,90-(char.questDaysUsed||0))} season days remaining</SectionHeader>
      <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px'}}>Travel costs vary by destination.{hasMount?' Mount reduces journey time.':''}{isWinter2?' Winter roads add time.':''} Gold and season days required.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        {Object.entries(LOCATIONS).map(([id,loc])=>{
          const isCurrent = char.location===id;
          const locked = char.age < loc.unlockAge;
          const cantAfford = char.gold < loc.travelCost;
          const daysUsed = char.questDaysUsed||0;
    const days = calcTravelDays(loc);
    const cantTravel = !days || (char.gold||0)<(loc.travelCost||0) || (daysUsed+days)>90 || char.age<(loc.unlockAge||0);
          const disabled = isCurrent || locked || cantAfford || cantTravel;
          return (
            <Block key={id}
              emoji={loc.emoji} name={loc.name}
              sub={isCurrent ? '— here —' : loc.desc}
              detail={locked ? `Age ${loc.unlockAge}+` : `${loc.travelCost>0?loc.travelCost+'g · ':''}${calcTravelDays(loc)} days${isWinter2?' ❄':''}`}
              colour={isCurrent?T.teal:T.gold} disabled={disabled} active={isCurrent}
              onClick={()=>!disabled && travel(id,loc)}
            />
          );
        })}
      </div>

      {/* FACTIONS */}
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'10px',marginTop:'6px'}}>
        <SectionHeader>Factions</SectionHeader>
        {[
          { id:'consortium', name:'Merchant Consortium', emoji:'🏪', fee:20, desc:'Market prices -10%. Access to rare trade items and merchant quests.',
            canJoin: char.classId==='merchant'||((char.gold||0)>=100&&(char.stats?.CHA||0)>=8) },
          { id:'templeOrder', name:'Temple Order', emoji:'⛪', fee:10, desc:'Temple costs halved. Holy quests and healing discounts.',
            canJoin: Object.values(char.devotion||{}).some(v=>v>=75) },
        ].map(f=>{
          const isMember = char.faction===f.id;
          return (
            <Card key={f.id} style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:T.gold}}>{f.emoji} {f.name}</div>
                  <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{f.desc}</div>
                  <div style={{fontSize:'9px',color:T.muted,marginTop:'2px'}}>Annual fee: {f.fee}g</div>
                  {isMember&&<div style={{fontSize:'9px',color:T.green,marginTop:'2px',fontWeight:700}}>✓ Member</div>}
                </div>
                {!isMember&&f.canJoin&&!char.faction&&(
                  <Btn small colour={T.gold} onClick={()=>{
                    if((char.gold||0)<f.fee){setResult({text:`Need ${f.fee}g to join.`,bad:true});return;}
                    const upd={...char,faction:f.id,gold:(char.gold||0)-f.fee,log:[...(char.log||[]),{age:char.age,text:`Joined the ${f.name}.`,type:'good'}]};
                    setResult({text:`You joined the ${f.name}.`,bad:false});onAction(upd);
                  }}>Join</Btn>
                )}
                {!isMember&&!f.canJoin&&!char.faction&&<span style={{fontSize:'9px',color:T.muted}}>Requirements not met</span>}
                {isMember&&(
                  <Btn small colour={T.red} outline onClick={()=>{
                    const isTemple=f.id==='templeOrder';
                    const newDev=isTemple?Object.fromEntries(Object.entries(char.devotion||{}).map(([k])=>[k,0])):char.devotion;
                    const upd={...char,faction:null,devotion:newDev,log:[...(char.log||[]),{age:char.age,text:`Left the ${f.name}.${isTemple?' Your devotion crumbles.':''}`,type:'bad'}]};
                    setResult({text:`You left the ${f.name}.`,bad:true});onAction(upd);
                  }}>Leave</Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAGIC TAB
// ══════════════════════════════════════════════════════════════════════════════
const SPELLS = [
  // Level 0 — available from the start
  { id:'heal',     name:'Healing Touch',     emoji:'💚', desc:'Restore 20hp. Removes minor sickness.',            cost:ENERGY.studyMagic, minMagicSkill:0,
    special:'heal', effect:{health:20} },
  // Level 1
  { id:'bolt',     name:'Arcane Bolt',        emoji:'⚡', desc:'+2 STR this year. Good before dangerous work.',    cost:ENERGY.studyMagic, minMagicSkill:1,
    special:'tempstat', effect:{stat:'STR',v:2,duration:'year'} },
  { id:'ward',     name:'Mystic Ward',        emoji:'🛡', desc:'Absorbs the next 15 damage you take.',             cost:ENERGY.studyMagic, minMagicSkill:1,
    special:'ward', effect:{ward:15} },
  // Level 2
  { id:'scry',     name:'Scrying',            emoji:'👁', desc:"See next year's world event before it arrives.",  cost:ENERGY.studyMagic, minMagicSkill:2,
    special:'scry', effect:{} },
  { id:'mend',     name:'Mending',            emoji:'🔧', desc:'Repair one item or property. Saves 1yr upkeep.',  cost:ENERGY.studyMagic, minMagicSkill:2,
    special:'mend', effect:{} },
  // Level 4
  { id:'conjure',  name:'Conjuration',        emoji:'✨', desc:'Conjure gold from nothing. 10–30g.',               cost:ENERGY.studyMagic, minMagicSkill:4,
    special:'gold', effect:{gold:'conjure'} },
  { id:'transmute',name:'Transmutation',      emoji:'🔮', desc:'Permanently boost your lowest stat by 1.',        cost:ENERGY.studyMagic, minMagicSkill:4,
    special:'boost_lowest', effect:{} },
  // Level 5
  { id:'ritual',   name:'Dark Ritual',        emoji:'🌑', desc:'INT+3, CON+1 — costs 20hp. Power has a price.',   cost:ENERGY.studyMagic, minMagicSkill:5,
    special:'ritual', effect:{stat:'INT',v:3,health:-20} },
  // Level 7
  { id:'immortal', name:'Rite of Longevity',  emoji:'🕯', desc:'Staves off old age. +5 years before death check.', cost:ENERGY.studyMagic*2, minMagicSkill:7,
    special:'longevity', effect:{} },
];

export function MagicTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const magicSkill = char.skills?.magic||0;
  const activeWard = char.activeWard||0;
  const magicLeft = Math.max(0,(SEASON_LIMITS.study||2)-(char.seasonActions?.magic||0));
  const cls = char.classId ? CLASSES[char.classId] : null;

  function castSpell(spell){
    if(magicLeft <= 0){ setResult({text:'You have cast enough spells this season.',bad:true}); return; }
    if(magicSkill < spell.minMagicSkill){ setResult({text:`Requires Arcana level ${spell.minMagicSkill}.`,bad:true}); return; }
    const eff = spell.effect;
    let updated = { ...char, stats:{...char.stats},
      energyUsed:{ ...char.energyUsed, study:(char.energyUsed?.study||0)+spell.cost },
      seasonActions:{ ...char.seasonActions, magic:(char.seasonActions?.magic||0)+1 },
      yearActions:[...(char.yearActions||[]), `Cast ${spell.name}`],
    };
    let txt = `${spell.name} cast.`;
    let bad = false;

    switch(spell.special){
      case 'heal':
        updated.health = Math.min(100,(updated.health||100)+20);
        // Remove minor sickness
        if(updated.sickness && ['mildsore','fever'].includes(updated.sickness.id)){
          updated.sickness = null; txt = 'Healed 20hp. The minor ailment lifted.';
        } else { txt = 'Healed 20hp.'; }
        break;
      case 'tempstat':
        updated.stats[eff.stat] = Math.min(20,(updated.stats[eff.stat]||1)+eff.v);
        txt = `Arcane surge — ${eff.stat} +${eff.v} this year.`;
        break;
      case 'ward':
        updated.activeWard = (updated.activeWard||0)+15;
        txt = 'A ward settles around you. Next 15 damage absorbed.';
        break;
      case 'scry':{
        const WORLD_EVENTS_LOCAL = [
          'A plague moves through the region.',
          'War comes to the border.',
          'A long drought grips the land.',
          'A bountiful harvest year approaches.',
          'A grand festival will bring prosperity.',
          'Bandit activity will surge on the roads.',
          'A bitter winter is coming.',
          'Prosperous trade winds are turning your way.',
        ];
        const next = WORLD_EVENTS_LOCAL[Math.floor(Math.random()*WORLD_EVENTS_LOCAL.length)];
        txt = `The scrying shows: ${next} You feel prepared.`;
        updated.stats.WIS = Math.min(20,(updated.stats.WIS||1)+1);
        break;
      }
      case 'mend':
        if((updated.properties||[]).length>0){
          const year = updated.age;
          // Mark first property as mended — skip one year of maintenance
          updated.properties = (updated.properties||[]).map((p,i)=>i===0?{...p,mendedAge:year}:p);
          txt = `You mended your ${updated.properties[0].name}. No maintenance cost next year.`;
        } else { txt = 'Nothing to mend right now.'; }
        break;
      case 'gold':{
        const g = rand(10,30);
        updated.gold = (updated.gold||0)+g;
        txt = `${g}g materialised from the aether.`;
        break;
      }
      case 'boost_lowest':{
        const s = Object.entries(updated.stats).sort((a,b)=>a[1]-b[1])[0];
        updated.stats[s[0]] = Math.min(20,s[1]+1);
        txt = `${s[0]} was your weakest. It improved to ${s[1]+1}.`;
        break;
      }
      case 'ritual':
        updated.stats.INT = Math.min(20,(updated.stats.INT||1)+3);
        updated.stats.CON = Math.min(20,(updated.stats.CON||1)+1);
        updated.health = Math.max(1,(updated.health||100)-20);
        txt = 'INT +3, CON +1. The price was 20hp. Worth it. Probably.';
        bad = true;
        break;
      case 'longevity':
        updated.longevityBonus = (updated.longevityBonus||0)+5;
        txt = 'The rite of longevity is complete. Time moves differently around you now.';
        break;
      default:
        if(eff.stat) updated.stats[eff.stat] = Math.min(20,(updated.stats[eff.stat]||1)+(eff.v||1));
        if(eff.health) updated.health = Math.max(1,Math.min(100,(updated.health||100)+eff.health));
    }
    updated.log = [...(char.log||[]),{ age:char.age, text:txt, type:bad?'bad':'good' }];
    setResult({ text:txt, bad });
    setSelected(null);
    onAction(updated);
  }

  function studyMagic(){
    if((char.seasonActions?.magic||0) >= (SEASON_LIMITS.study||2)){ setResult({text:'You have studied enough magic this season.',bad:true}); return; }
    if(magicLeft <= 0){ setResult({text:'You have studied enough magic this season.',bad:true}); return; }
    const gain = chance(55) ? 1 : 0;
    const updated = {
      ...char,
      skills: gain ? { ...char.skills, magic:(char.skills?.magic||0)+1 } : char.skills,
      energyUsed:{ ...char.energyUsed, study:(char.energyUsed?.study||0)+ENERGY.studyMagic },
      seasonActions:{ ...char.seasonActions, magic:(char.seasonActions?.magic||0)+1 },
      yearActions:[...(char.yearActions||[]), `Studied arcane theory${gain?' — Arcana improved!':''}`],
      log:[...(char.log||[]),{ age:char.age, text:`Studied magic.${gain?' Arcana improved!':''}`, type:gain?'good':'neutral' }],
    };
    setResult({ text:gain?`Arcana improved to ${(char.skills?.magic||0)+1}!`:'You studied. The understanding builds slowly.', bad:false });
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.purple}><p style={{fontSize:'13px',color:result.bad?T.red:T.purple}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}

      {/* Active ward indicator */}
      {(char.activeWard||0) > 0 && (
        <Card accent={T.purple} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'13px',color:T.purple,fontWeight:700}}>🛡 Active Ward: {char.activeWard} damage absorbed</p>
          <p style={{fontSize:'11px',color:T.muted,marginTop:'3px'}}>Your mystic ward will absorb the next {char.activeWard} points of damage.</p>
        </Card>
      )}

      <SectionHeader>Your Magic</SectionHeader>
      <Card accent={T.purple} style={{marginBottom:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontSize:'13px',color:T.text}}>{cls?.emoji} {cls?.name||'Mage'}</p>
            <p style={{fontSize:'11px',color:T.muted}}>Arcana Level: {magicSkill}</p>
          </div>
          <Btn onClick={studyMagic} disabled={magicLeft<=0} colour={T.purple} small full={false}>
            📖 Study ({magicLeft} left)
          </Btn>
        </div>
      </Card>

      <SectionHeader>Spells</SectionHeader>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
        {SPELLS.map(spell=>{
          const canCast = magicLeft>0 && magicSkill>=spell.minMagicSkill;
          const isSelected = selected===spell.id;
          const isDark = spell.effect?.health<0;
          return (
            <Block key={spell.id}
              emoji={spell.emoji} name={spell.name}
              sub={spell.desc}
              detail={`Arcana ${spell.minMagicSkill}+`}
              colour={isDark?T.crimson:T.purple} disabled={!canCast} active={isSelected}
              onClick={()=>setSelected(isSelected?null:spell.id)}
            />
          );
        })}
      </div>

      {selected && (()=>{
        const spell = SPELLS.find(s=>s.id===selected);
        if(!spell) return null;
        const isDark = spell.effect?.health<0;
        return (
          <Card accent={isDark?T.crimson:T.purple} style={{marginBottom:'12px'}}>
            <p style={{fontSize:'13px',fontWeight:700,color:T.text,marginBottom:'4px'}}>{spell.emoji} {spell.name}</p>
            <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px'}}>{spell.desc}</p>
            {isDark && <p style={{fontSize:'11px',color:T.red,marginBottom:'8px'}}>⚠ Costs {Math.abs(spell.effect.health)} health</p>}
            <Btn onClick={()=>castSpell(spell)} colour={isDark?T.crimson:T.purple}>Cast</Btn>
          </Card>
        );
      })()}

      {/* RITUALS */}
      {RITUALS.filter(r=>r.class_req.includes(char.classId||'')).length > 0 && (
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'10px',marginTop:'6px'}}>
          <SectionHeader>Rituals</SectionHeader>
          {RITUALS.filter(r=>r.class_req.includes(char.classId||'')).map(ritual=>{
            const statReq = ritual.statReq||{};
            const meetsStats = Object.entries(statReq).every(([s,v])=>(char.stats?.[s]||0)>=v);
            return (
              <Card key={ritual.id} style={{marginBottom:'8px',opacity:meetsStats?1:0.6}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:T.purple}}>{ritual.name}</div>
                    <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{ritual.effect}</div>
                    <div style={{fontSize:'9px',color:T.muted,marginTop:'2px'}}>{ritual.cost.gold}g · {ritual.cost.days} days</div>
                    {!meetsStats&&<div style={{fontSize:'9px',color:T.red,marginTop:'2px'}}>Requires: {Object.entries(statReq).map(([s,v])=>`${s} ${v}+`).join(', ')}</div>}
                  </div>
                  <Btn small colour={T.purple} disabled={!meetsStats} onClick={()=>{
                    if((char.gold||0)<ritual.cost.gold){setResult({text:`Need ${ritual.cost.gold}g.`,bad:true});return;}
                    if((char.questDaysUsed||0)+ritual.cost.days>90){setResult({text:`Need ${ritual.cost.days} season days.`,bad:true});return;}
                    const upd={...ritual.apply({...char}),gold:(char.gold||0)-ritual.cost.gold,questDaysUsed:(char.questDaysUsed||0)+ritual.cost.days,
                      seasonActions:{...(char.seasonActions||{}),studyMagic:((char.seasonActions?.studyMagic||0)+1)},
                      log:[...(char.log||[]),{age:char.age,text:`Performed: ${ritual.name}.`,type:'good'}]};
                    setResult({text:`${ritual.name} performed.`,bad:false});onAction(upd);
                  }}>Perform</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MAGIC RESEARCH */}
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'10px',marginTop:'6px'}}>
        <SectionHeader>Magical Research</SectionHeader>
        <p style={{fontSize:'10px',color:T.muted,marginBottom:'8px',lineHeight:'1.5'}}>
          One research topic at a time. Costs gold each season you continue. Pause at any time — progress preserved.
        </p>
        {(()=>{
          const activeId = char.activeResearch||null;
          const activeTopic = activeId ? MAGIC_RESEARCH_TOPICS.find(t=>t.id===activeId) : null;
          const progress = (char.researchProgress||{})[activeId||'']||0;
          const completed = char.completedResearch||[];
          return (
            <>
              {activeTopic && (
                <Card accent={T.blue} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'12px',fontWeight:700,color:T.blue}}>{activeTopic.name}</div>
                      <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{activeTopic.unlock}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0,marginLeft:'8px'}}>
                      <div style={{fontSize:'10px',color:T.gold}}>{activeTopic.goldPerSeason}g/season</div>
                      <div style={{fontSize:'9px',color:T.muted}}>Season {progress}/{activeTopic.seasons}</div>
                    </div>
                  </div>
                  <div style={{height:'6px',background:'#1a1208',borderRadius:'3px',marginBottom:'8px'}}>
                    <div style={{height:'100%',width:`${Math.min(100,Math.round(progress/activeTopic.seasons*100))}%`,background:T.blue,borderRadius:'3px',transition:'width 0.4s'}}/>
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    <Btn small colour={T.blue} onClick={()=>{
                      if((char.gold||0)<activeTopic.goldPerSeason){setResult({text:`Need ${activeTopic.goldPerSeason}g to continue.`,bad:true});return;}
                      if((char.seasonActions?.studyMagic||0)>0){setResult({text:'Already researched this season.',bad:true});return;}
                      const newProgress=progress+1;
                      const complete=newProgress>=activeTopic.seasons;
                      let upd={...char,gold:(char.gold||0)-activeTopic.goldPerSeason,
                        researchProgress:{...(char.researchProgress||{}),[activeId]:newProgress},
                        seasonActions:{...(char.seasonActions||{}),studyMagic:((char.seasonActions?.studyMagic||0)+1)},
                        log:[...(char.log||[]),{age:char.age,text:complete?`Research complete: ${activeTopic.name}!`:`Continued: ${activeTopic.name}. Season ${newProgress}/${activeTopic.seasons}.`,type:complete?'good':'neutral'}]};
                      if(complete){
                        upd.activeResearch=null;
                        upd.completedResearch=[...completed,activeId];
                        if(activeTopic.effect?.permStat){const ns={...upd.stats};Object.entries(activeTopic.effect.permStat).forEach(([s,v])=>{ns[s]=Math.min(20,(ns[s]||1)+v);});upd.stats=ns;}
                        if(activeTopic.effect?.wardBonus) upd.wardBonus=(upd.wardBonus||0)+activeTopic.effect.wardBonus;
                        if(activeTopic.effect?.ageSlowMod) upd.ageSlowMod=true;
                        if(activeTopic.effect?.relFloor) upd.relFloor=activeTopic.effect.relFloor;
                        setResult({text:`Breakthrough! ${activeTopic.unlock}`,bad:false});
                      } else {
                        setResult({text:`Research progresses. ${activeTopic.seasons-newProgress} season${activeTopic.seasons-newProgress!==1?'s':''} remaining.`,bad:false});
                      }
                      onAction(upd);
                    }}>Continue ({activeTopic.goldPerSeason}g)</Btn>
                    <Btn small colour={T.muted} outline onClick={()=>{
                      onAction({...char,activeResearch:null,log:[...(char.log||[]),{age:char.age,text:`Paused research on ${activeTopic.name}.`,type:'neutral'}]});
                      setResult({text:'Research paused. Progress preserved.',bad:false});
                    }}>Pause</Btn>
                  </div>
                </Card>
              )}
              {!activeTopic && (
                <>
                  <p style={{fontSize:'11px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>Choose a topic to begin or resume.</p>
                  {MAGIC_RESEARCH_TOPICS.filter(t=>!completed.includes(t.id)).map(topic=>{
                    const prog=(char.researchProgress||{})[topic.id]||0;
                    const pct=Math.min(100,Math.round(prog/topic.seasons*100));
                    const meetsStats=Object.entries(topic.statReq||{}).every(([s,v])=>(char.stats?.[s]||0)>=v);
                    return (
                      <Card key={topic.id} style={{marginBottom:'8px',opacity:meetsStats?1:0.55}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:'12px',fontWeight:700,color:meetsStats?T.text:T.muted}}>{topic.name}</div>
                            <div style={{fontSize:'10px',color:T.muted,marginTop:'2px'}}>{topic.desc}</div>
                            <div style={{fontSize:'10px',color:T.green,marginTop:'2px'}}>{topic.unlock}</div>
                            {!meetsStats&&<div style={{fontSize:'9px',color:T.red,marginTop:'2px'}}>Requires: {Object.entries(topic.statReq||{}).map(([s,v])=>`${s} ${v}+`).join(', ')}</div>}
                          </div>
                          <div style={{textAlign:'right',flexShrink:0,marginLeft:'8px'}}>
                            <div style={{fontSize:'10px',color:T.gold,fontWeight:700}}>{topic.goldPerSeason}g/season</div>
                            <div style={{fontSize:'9px',color:T.muted}}>{topic.seasons-prog} seasons left</div>
                          </div>
                        </div>
                        {prog>0&&<div style={{height:'3px',background:'#1a1208',borderRadius:'2px',marginBottom:'6px'}}><div style={{height:'100%',width:`${pct}%`,background:T.teal,borderRadius:'2px'}}/></div>}
                        <Btn small colour={T.blue} disabled={!meetsStats} onClick={()=>{
                          onAction({...char,activeResearch:topic.id,log:[...(char.log||[]),{age:char.age,text:`Began research: ${topic.name}.`,type:'neutral'}]});
                          setResult({text:`Research begun: ${topic.name}.`,bad:false});
                        }}>{prog>0?'Resume':'Begin'} Research</Btn>
                      </Card>
                    );
                  })}
                </>
              )}
              {completed.length>0&&(
                <div style={{marginTop:'8px'}}>
                  <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px',marginBottom:'4px'}}>COMPLETED</div>
                  {MAGIC_RESEARCH_TOPICS.filter(t=>completed.includes(t.id)).map(t=>(
                    <div key={t.id} style={{fontSize:'10px',color:T.green,padding:'2px 0'}}>✓ {t.name}</div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTY TAB
// ══════════════════════════════════════════════════════════════════════════════
export function PropertyTab({ char, onAction }){
  const [result, setResult]       = useState(null);
  const [selected, setSelected]   = useState(null);
  const [rentTarget, setRentTarget] = useState(null);
  const [propView, setPropView]       = useState('own');
  const [propertyResult, setPropertyResult] = useState(null);
  const properties = char.properties||[];

  const living = (char.relationships||[]).filter(r=>r.alive!==false);
  const currentHome = properties.find(p=>p.isHome);
  const homeCap = currentHome ? (PROPERTY_TYPES[currentHome.type]?.capacity||2) : 2;
  const household = (char.household||[]);

  function buyProperty(typeKey){
    const pt = PROPERTY_TYPES[typeKey];
    if(!pt) return;
    if(pt.rentOnly || (pt.buyPrice||0)<=0){ setResult({text:`${pt.name} can only be rented, not bought.`,bad:true}); return; }
    const locMult = LOCATIONS[char.location||'village']?.propertyMult||1.0;
    const actualPrice = Math.round(pt.buyPrice * locMult);
    if((char.gold||0) < actualPrice){ setResult({text:`You need ${actualPrice}g in ${LOCATIONS[char.location||'village']?.name||'this location'}. You have ${char.gold||0}g.`,bad:true}); return; }
    const newProp = {
      id: uid(`prop_${typeKey}`),
      type: typeKey,
      name: pt.name,
      location: char.location||'village',
      ownedSince: char.age,
      rentedOut: false,
      occupantName: null,
      isHome: properties.length === 0,
    };
    const updated = {
      ...char, gold:(char.gold||0)-actualPrice,
      properties:[...properties, newProp],
      yearActions:[...(char.yearActions||[]), `Purchased ${pt.name} in ${LOCATIONS[char.location||'village']?.name||'?'} (−${actualPrice}g)`],
      log:[...(char.log||[]),{ age:char.age, text:`Bought a ${pt.name} in ${LOCATIONS[char.location||'village']?.name||'?'} for ${actualPrice}g.`, type:'good' }],
    };
    setResult({ text:`You now own a ${pt.name} in ${LOCATIONS[char.location||'village']?.name||'?'}.${properties.length===0?' You move in.':''}`, bad:false });
    setSelected(null);
    onAction(updated);
  }

  function setHome(propId){
    const updated = {
      ...char,
      properties: properties.map(p=>({ ...p, isHome: p.id===propId && !p.rentedOut })),
      log:[...(char.log||[]),{ age:char.age, text:'Moved into new home.', type:'neutral' }],
    };
    setResult({ text:'You settle into your new home.', bad:false });
    onAction(updated);
  }

  function toggleRent(propId){
    const prop = properties.find(p=>p.id===propId);
    if(!prop) return;
    if(!prop.rentedOut && prop.isHome){ setResult({text:"You can't rent out your own home while living in it.",bad:true}); return; }
    const renting = !prop.rentedOut;
    const pt = PROPERTY_TYPES[prop.type];
    const updated = {
      ...char,
      properties: properties.map(p=>p.id===propId ? { ...p, rentedOut:renting, occupantName:renting?'Tenants':null } : p),
      log:[...(char.log||[]),{ age:char.age, text:renting?`Rented out ${prop.name} for ${pt.income}g/year.`:`Stopped renting ${prop.name}.`, type:'neutral' }],
    };
    setResult({ text:renting?`Now earning ${pt.income}g/year from ${prop.name}.`:`${prop.name} is no longer rented out.`, bad:false });
    onAction(updated);
  }

  function sellProperty(propId){
    const prop = properties.find(p=>p.id===propId);
    if(!prop) return;
    const pt = PROPERTY_TYPES[prop.type];
    const sellPrice = Math.floor(pt.buyPrice * 0.7);
    const updated = {
      ...char, gold:char.gold+sellPrice,
      properties: properties.filter(p=>p.id!==propId),
      yearActions:[...(char.yearActions||[]), `Sold ${prop.name} (+${sellPrice}g)`],
      log:[...(char.log||[]),{ age:char.age, text:`Sold ${prop.name} for ${sellPrice}g.`, type:'good' }],
    };
    setResult({ text:`Sold ${prop.name} for ${sellPrice}g.`, bad:false });
    onAction(updated);
  }

  const rentalIncome = properties.filter(p=>p.rentedOut).reduce((sum,p)=>sum+(PROPERTY_TYPES[p.type]?.income||0),0);

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      {result && (<Card accent={result.bad?T.red:T.green}><p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p><Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'8px'}}>Dismiss</Btn></Card>)}

      {/* Mortgage / rent status */}
      {char.mortgage && <Card accent={T.orange} style={{marginBottom:'8px'}}><p style={{fontSize:'12px',color:T.orange,fontWeight:700}}>⚠ Mortgage: {char.mortgage.totalDebt}g left · {char.mortgage.annualPayment}g/yr</p></Card>}
      {char.rentedProperty && <Card accent={T.teal} style={{marginBottom:'8px'}}><p style={{fontSize:'12px',color:T.teal}}>🏠 Renting {PROPERTY_TYPES[char.rentedProperty.type]?.name} · {char.rentedProperty.annualRent}g/yr</p></Card>}

      {/* Owned properties */}
      {properties.length > 0 && (
        <>
          <SectionHeader>Your Properties{rentalIncome>0?` · ${rentalIncome}g/year income`:''}</SectionHeader>
          {properties.map(prop=>{
            const pt = PROPERTY_TYPES[prop.type];
            return (
              <Card key={prop.id} accent={prop.isHome?T.teal:prop.rentedOut?T.gold:T.border} style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                  <div>
                    <p style={{fontSize:'14px',fontWeight:700,color:T.text}}>{pt?.emoji} {prop.name}</p>
                    <p style={{fontSize:'11px',color:T.muted}}>
                      Capacity: {pt?.capacity} · Owned since age {prop.ownedSince}
                      {prop.isHome?' · 🏠 Home':''}
                      {prop.rentedOut?` · 💰 ${pt?.income}g/yr`:''}
                      {prop.location?` · ${LOCATIONS[prop.location]?.name||prop.location}`:''}
                    </p>
                  </div>
                  <Tag colour={prop.isHome?T.teal:prop.rentedOut?T.gold:T.muted}>
                    {prop.isHome?'Home':prop.rentedOut?'Rented':'Empty'}
                  </Tag>
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  {!prop.isHome && !prop.rentedOut && (
                    <Btn onClick={()=>setHome(prop.id)} colour={T.teal} small full={false}>Move in</Btn>
                  )}
                  <Btn onClick={()=>toggleRent(prop.id)} colour={prop.rentedOut?T.muted:T.gold} small full={false} outline={prop.rentedOut}>
                    {prop.rentedOut?'Stop renting':'Rent out'}
                  </Btn>
                  <Btn onClick={()=>sellProperty(prop.id)} colour={T.red} small full={false} outline>
                    Sell ({Math.floor((PROPERTY_TYPES[prop.type]?.buyPrice||0)*0.7)}g)
                  </Btn>
                </div>
              </Card>
            );
          })}
        </>
      )}

      {properties.length === 0 && (
        <Card style={{marginBottom:'12px'}}>
          <p style={{fontSize:'13px',color:T.muted}}>You own no property. You rent or stay where you can.</p>
        </Card>
      )}

      {/* Rent */}
      <SectionHeader>Rent a Property</SectionHeader>
      <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>
        Renting requires less gold upfront. Rent increases every 3 years. Eviction if you miss payment.
        {' '}<span style={{color:T.gold}}>Prices reflect {LOCATIONS[char.location||'village']?.name||'your location'}.</span>
      </p>
      {Object.entries(PROPERTY_TYPES).filter(([k])=>k!=='plot').map(([key,pt])=>{
        const locMult = LOCATIONS[char.location||'village']?.propertyMult||1.0;
        const locRent = Math.round(pt.annualRent * locMult);
        return (
          <Card key={key} style={{marginBottom:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontWeight:700,color:T.text}}>{pt.emoji} {pt.name}</span>
              <Tag colour={T.teal}>{locRent}g/yr</Tag>
            </div>
            <p style={{fontSize:'10px',color:T.muted,marginBottom:'4px'}}>{pt.desc} · Capacity: {pt.capacity} people</p>
            <Btn onClick={()=>{
              if((char.gold||0)<locRent){ setResult({text:`Need ${locRent}g for first year's rent.`,bad:true}); return; }
              if(char.rentedProperty){ setResult({text:'Already renting a property.',bad:true}); return; }
              const updated={...char,gold:(char.gold||0)-locRent,
                rentedProperty:{type:key,annualRent:locRent,yearsRented:1,location:char.location||'village'},
                log:[...(char.log||[]),{age:char.age,text:`Rented a ${pt.name} in ${LOCATIONS[char.location||'village']?.name||'?'}. ${locRent}g/year.`,type:'good'}]};
              setResult({text:`Now renting a ${pt.name}.`,bad:false}); onAction(updated);
            }} colour={T.teal}>Rent {locRent}g/yr</Btn>
          </Card>
        );
      })}

      {/* Buy or Mortgage */}
      <SectionHeader>Buy or Mortgage</SectionHeader>
      <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>
        Buy outright or 20% deposit with annual repayments. Miss two → repossession.{' '}
        <span style={{color:T.gold}}>Prices in {LOCATIONS[char.location||'village']?.name||'your location'}.</span>
      </p>
      {char.age<18 && <p style={{fontSize:'10px',color:T.orange,marginBottom:'8px'}}>Must be 18 to mortgage.</p>}
      {Object.entries(PROPERTY_TYPES).filter(([key,pt])=>!pt.rentOnly && (pt.buyPrice||0)>0).map(([key,pt])=>{
        const locMult = LOCATIONS[char.location||'village']?.propertyMult||1.0;
        const locPrice = Math.round(pt.buyPrice * locMult);
        const dep=Math.ceil(locPrice*0.2); const pay=Math.ceil(locPrice*0.08);
        return (
          <Card key={key} style={{marginBottom:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontWeight:700,color:T.text}}>{pt.emoji} {pt.name}</span>
              <Tag colour={T.gold}>{locPrice}g</Tag>
            </div>
            <p style={{fontSize:'10px',color:T.muted,marginBottom:'4px'}}>Income {pt.income}g/yr · Upkeep {pt.annualUpkeep}g/yr · Capacity: {pt.capacity}</p>
            <div style={{display:'flex',gap:'6px'}}>
              <Btn onClick={()=>buyProperty(key)} colour={T.gold} disabled={(char.gold||0)<locPrice} small>Buy {locPrice}g</Btn>
              {key!=='plot' && !pt.rentOnly && <Btn onClick={()=>{
                if(char.age<18||(char.gold||0)<dep||char.mortgage){setResult({text:char.mortgage?'Already mortgaged.':'Need deposit or be 18.',bad:true});return;}
                const np={id:uid('mp'),type:key,name:pt.name,location:char.location||'village',ownedSince:char.age,rentedOut:false,isHome:true};
                const mg={propertyId:np.id,totalDebt:locPrice-dep,annualPayment:pay,missedPayments:0};
                onAction({...char,gold:(char.gold||0)-dep,properties:[...(char.properties||[]),np],mortgage:mg,
                  log:[...(char.log||[]),{age:char.age,text:`Mortgaged ${pt.name} in ${LOCATIONS[char.location||'village']?.name||'?'}. ${dep}g down, ${pay}g/yr.`,type:'good'}]});
                setResult({text:`Mortgage started. ${pay}g/year.`,bad:false});
              }} colour={T.teal} disabled={char.age<18||(char.gold||0)<dep||!!char.mortgage} small>Mortgage {dep}g</Btn>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── QUEST ACCEPT BUTTON ───────────────────────────────────────────────────────
function QuestAcceptButton({ quest, char, questDays, canAfford, successPct, onAction, setResult, guildRank, nextRank }){
  const [tapped, setTapped] = useState(false);
  function accept(){
    if(!tapped){ setTapped(true); setTimeout(()=>setTapped(false),1500); return; }
    setTapped(false);
    const success = Math.random()*100 < successPct;
    const { injuryChance, deathChance } = calcQuestInjury(quest, char, success);
    const questDeath = !success && Math.random()*100 < deathChance;
    const injured    = !questDeath && !success && Math.random()*100 < injuryChance;
    const healthLoss = questDeath ? (char.health||100) : injured ? rand(10,30) : 0;
    const forcedRest = injured && healthLoss > 20;
    const injuryText = injured ? `Injured — lost ${healthLoss}hp.${forcedRest?' Forced to rest (season used up).':''}` : '';
    const xpGain   = success ? quest.xp : Math.floor(quest.xp*0.3);
    const rawPay   = success ? rand(quest.pay[0], quest.pay[1]) : 0;
    const newXP    = (char.guildXP||0)+xpGain;
    // Rank cap: cannot rise above F before age 16. XP still banks.
    const FCAP_IDX = RANKS_ORDER.indexOf('F');
    const uncapped = RANKS_ORDER.reduce((r,rank)=>newXP>=(RANK_XP_THRESHOLDS[rank]||0)?rank:r, char.guildRank||'G');
    let newRank = uncapped;
    if((char.age||0) < 16 && RANKS_ORDER.indexOf(uncapped) > FCAP_IDX){
      newRank = 'F'; // held at F until 16
    }
    const rankUp   = newRank !== (char.guildRank||'G');

    // ── Party reward split (pay + gold loot split across player + members) ──────
    const partySize = (char.partyMembers||[]).length;
    const shares    = 1 + partySize;

    // ── Loot: thematic by quest type, full on success / reduced on failure ──────
    const bagCap = 5 + ((char.inventory||[]).filter(i=>i.isBag).reduce((s,b)=>s+(b.bagSize||0),0));
    const bagFull = (char.inventory||[]).length >= bagCap;
    let lootItem = null;
    let goldLoot = 0;
    const dropChance = questLootDropChance(quest.questType, success);
    if(chance(dropChance)){
      const drop = rollQuestLoot(quest.questType, {success});
      if(drop.isGold){ goldLoot = drop.cost; }
      else if(!bagFull){ lootItem = drop; }
    }
    // ── Scavenge: gathering/chore work can turn up surplus, luck + WIS ──────────
    let scavengeItem = null;
    if(success){
      const sc = rollScavenge(char, quest.questType);
      if(sc){
        if(sc.isGold){ goldLoot += sc.cost; }
        else if(!bagFull && !lootItem){ scavengeItem = sc; }
      }
    }

    // Split pay and gold loot; player keeps one share (rounded).
    const totalGold = rawPay + goldLoot;
    const playerGold = Math.round(totalGold / shares);
    const pay = playerGold; // for messaging
    const splitNote = partySize>0 ? ` (split ${shares} ways)` : '';

    // Gear wears with use: a quest degrades one piece of the player's equipment a
    // step (weapons/armour — items carrying a stat bonus). Worn gear sells for less,
    // gives less bonus, and eventually needs repair at the blacksmith.
    const gearIdx = (char.inventory||[]).findIndex(it =>
      it.statBonus && (it.condition||'pristine') !== 'broken' && !it.isBag && !it.consumable);
    const degradedBase = gearIdx >= 0
      ? (char.inventory||[]).map((it,i)=> i===gearIdx ? {...it, condition:degradeCondition(it.condition||'pristine')} : it)
      : (char.inventory||[]);
    const wornItem = gearIdx >= 0 ? degradedBase[gearIdx] : null;
    const newInventory = [
      ...degradedBase,
      ...(lootItem ? [{...lootItem, condition:lootItem.condition||'good', boughtAge:char.age}] : []),
      ...(scavengeItem ? [{...scavengeItem, condition:scavengeItem.condition||'good', boughtAge:char.age}] : []),
    ];
    const updated = {
      ...char,
      gold: (char.gold||0)+playerGold,
      guildXP: newXP,
      guildRank: newRank,
      health: questDeath ? 0 : Math.max(1,(char.health||100)-healthLoss),
      questDaysUsed: forcedRest ? 90 : (char.questDaysUsed||0)+questDays,
      inventory: newInventory,
      seasonCompletedQuests: success ? [...(char.seasonCompletedQuests||[]), quest.id] : (char.seasonCompletedQuests||[]),
      seasonFailedQuests: success ? (char.seasonFailedQuests||[]) : [...(char.seasonFailedQuests||[]), quest.id],
      lastQuestYear: success ? (char.age||0) : (char.lastQuestYear||0),
      deathCause: questDeath ? `Killed on a ${quest.rank}-rank quest: ${quest.name}` : char.deathCause,
      log: [...(char.log||[]),{ age:char.age,
        text: questDeath ? `You did not come back from "${quest.name}".` :
              success ? `Completed "${quest.name}". +${playerGold}g${splitNote}, +${xpGain}xp.${rankUp?` ★ Rank ${newRank}!`:''}${lootItem?` Found: ${lootItem.name}.`:''}${scavengeItem?` Scavenged: ${scavengeItem.name}.`:''}${goldLoot?` (+loot gold)`:''}` :
              `"${quest.name}" failed. +${xpGain}xp.${lootItem?` Scavenged: ${lootItem.name}.`:''}${injuryText?' '+injuryText:''}`,
        type: questDeath?'bad':success?'good':'bad' }],
    };
    setResult({text: success ? `Quest complete. +${playerGold}g${splitNote}.${lootItem?` Found: ${lootItem.name}.`:''}${scavengeItem?` Scavenged: ${scavengeItem.name}.`:''}${rankUp?` ★ ${newRank}-Rank!`:''}` : `Failed.${lootItem?` Scavenged ${lootItem.name}.`:''}${injuryText?' '+injuryText:''}`, bad:!success});
    onAction(updated);
  }
  return (
    <Btn onClick={accept} colour={tapped?T.green:T.gold} disabled={!canAfford} full={false} small>
      {tapped ? 'Confirm?' : `Accept Quest (${questDays} days)`}
    </Btn>
  );
}

export function GuildTab({ char, onAction }){
  const [view, setView] = useState('rank'); // 'rank' | 'party' | 'join'
  const [result, setResult] = useState(null);

  const guildXP    = char.guildXP||0;
  const guildRank  = char.guildRank||'G';
  const RANKS = RANKS_ORDER;
  const RANK_XP = RANK_XP_THRESHOLDS;
  const rankIdx = RANKS.indexOf(guildRank);
  const nextRank = RANKS[rankIdx+1];
  const nextXP   = nextRank ? RANK_XP[nextRank] : null;
  const xpToNext = nextXP ? nextXP - guildXP : null;

  // Generate party NPCs for current location
  const partyNPCs = [
    { id:'p1', name:'Rael',  rank:'G', fee:5,  cha:8 },
    { id:'p2', name:'Sora',  rank:'F', fee:15, cha:12 },
    { id:'p3', name:'Orik',  rank:'D', fee:30, cha:9  },
    { id:'p4', name:'Lithe', rank:'C', fee:50, cha:14 },
  ];

  function recruit(npc){
    if((char.age||0) < 16){ setResult({text:'You are too young to recruit a party.',bad:true}); return; }
    if((char.gold||0) < npc.fee){ setResult({text:`Recruiting ${npc.name} costs ${npc.fee}g. You have ${char.gold||0}g.`,bad:true}); return; }
    const rankDiff = RANKS.indexOf(npc.rank) - rankIdx;
    const base = rankDiff <= 0 ? 85 : rankDiff===1 ? 55 : rankDiff===2 ? 30 : 15;
    const chaBonus = ((char.stats?.CHA||1)-8)*3;
    const success = chance(Math.min(95, Math.max(5, base+chaBonus)));
    if(success){
      const updated = {
        ...char,
        partyMembers:[...(char.partyMembers||[]),{...npc}],
        gold:(char.gold||0)-npc.fee,
        log:[...(char.log||[]),{age:char.age,text:`${npc.name} (${npc.rank}-rank) joined your party.`,type:'good'}],
      };
      setResult({text:`${npc.name} agreed to join. ${npc.fee}g paid.`,bad:false});
      onAction(updated);
    } else {
      setResult({text:`${npc.name} declined.${rankDiff>0?' They think you are not ready.':''}`,bad:true});
    }
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      <SectionHeader>Adventurers Guild</SectionHeader>

      {/* Rank card */}
      <Card style={{marginBottom:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'16px',color:T.gold,fontWeight:700}}>{guildRank}-Rank</div>
            <div style={{fontSize:'11px',color:T.muted,marginTop:'2px'}}>{['G-Rank — Novice','F-Rank — Apprentice','E-Rank — Journeyman','D-Rank — Seasoned','C-Rank — Veteran','B-Rank — Expert','A-Rank — Master','S-Rank — Hero'][rankIdx]}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'20px',fontWeight:900,color:T.gold}}>{guildXP} XP</div>
            {xpToNext && <div style={{fontSize:'10px',color:T.muted}}>{xpToNext} to {nextRank}-rank</div>}
          </div>
        </div>
        {nextXP && (
          <div style={{height:'6px',background:'#1a1208',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${Math.min(100,((guildXP-RANK_XP[guildRank])/(nextXP-RANK_XP[guildRank]))*100)}%`,background:T.gold,borderRadius:'3px',transition:'width 0.5s'}}/>
          </div>
        )}
      </Card>

      {/* View tabs */}
      <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>
        {[['rank','My Rank'],['party','My Party'],['join','Find Party']].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{
            flex:1,padding:'8px 4px',background:view===v?T.gold+'22':T.panel,
            border:`1px solid ${view===v?T.gold:T.border}`,borderRadius:'8px',
            color:view===v?T.gold:T.muted,fontSize:'11px',cursor:'pointer',
            WebkitTapHighlightColor:'transparent',
          }}>{l}</button>
        ))}
      </div>

      {result && <Card accent={result.bad?T.red:T.green} style={{marginBottom:'10px'}}><p style={{fontSize:'12px',color:result.bad?T.red:T.green}}>{result.text}</p></Card>}

      {/* Rank view — shows quests by tier */}
      {view==='rank' && (
        <>
          {/* Season days tracker */}
          {(()=>{
            const daysLeft = Math.max(0, 90 - (char.questDaysUsed||0));
            const pct = (daysLeft/90)*100;
            return (
              <Card style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                  <span style={{fontSize:'11px',color:T.muted}}>Season days remaining</span>
                  <span style={{fontSize:'11px',color:daysLeft<20?T.orange:T.gold,fontWeight:700}}>{daysLeft} / 90</span>
                </div>
                <div style={{height:'4px',background:'#1a1208',borderRadius:'2px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:daysLeft<20?T.orange:T.teal,borderRadius:'2px',transition:'width 0.5s'}}/>
                </div>
              </Card>
            );
          })()}

          <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px',fontStyle:'italic'}}>Quests cost days. You have 90 per season. Party members reduce time. Double-tap to accept.</p>

          {(()=>{
            const QUEST_POOL = {
              YOUTH:[
                {id:'y1',name:'Slime in the Cellar',  rank:'G',days:3, pay:[1,4], xp:6, questType:'critter', desc:'A harmless cellar-slime has moved into the guild storeroom. Poke it out with a broom.'},
                {id:'y2',name:'Horned Hare Roundup',  rank:'G',days:4, pay:[2,5], xp:7, questType:'critter', desc:'Burrow-hares are trampling the herb beds. Round them up — mind the little horns.'},
                {id:'y3',name:'Find the Miller\'s Cat',rank:'G',days:2, pay:[1,3], xp:5, questType:'fetch',   desc:'The miller\'s cat is up a tree again. Coax it down.'},
                {id:'y4',name:'Lost Charm in the Reeds',rank:'G',days:3,pay:[2,4], xp:6, questType:'fetch',   desc:'A child dropped a luck-charm by the millpond. Wade in and find it.'},
                {id:'y5',name:'Pixie-Cap Gathering',  rank:'G',days:4, pay:[2,6], xp:7, questType:'fetch',   desc:'Gather glowing pixie-caps from the safe edge of the wood. Do not go deep.'},
                {id:'y6',name:'Sweep the Guild Hall', rank:'G',days:2, pay:[1,3], xp:4, questType:'chore',   desc:'The hall floor will not sweep itself. The quartermaster pays in coppers.'},
                {id:'y7',name:'Sort the Bounty Boards',rank:'G',days:2,pay:[1,3], xp:4, questType:'chore',   desc:'Re-pin the notices, oldest at the bottom. Tidy work for tidy coin.'},
              ],
              G:[
                {id:'g1',name:'Missing Goat',      rank:'G',days:7, pay:[3,8],  xp:10, questType:'fetch',  desc:'A farmer near Thornhaven lost his goat in the Verdenmere. Find it and bring it back.'},
                {id:'g2',name:'Sealed Letter',     rank:'G',days:5, pay:[4,7],  xp:8,  questType:'fetch',  desc:'Deliver a sealed letter to the Thornhaven inn. Ask no questions.'},
                {id:'g3',name:'Rat Infestation',   rank:'G',days:3, pay:[2,5],  xp:7,  questType:'combat', desc:'The Thornhaven mill has a rat problem. Handle it before the winter grain is ruined.'},
                {id:'g4',name:'Night Watch',       rank:'G',days:14,pay:[6,12], xp:12, questType:'escort', desc:"Guard a Crestfall merchant's warehouse through the night."},
                {id:'g5',name:'Herb Run',          rank:'G',days:7, pay:[5,9],  xp:9,  questType:'fetch',  desc:'Gather a list of herbs from the Verdenmere edge. Nothing dangerous.'},
              ],
              F:[
                {id:'f1',name:'Bandit Scouting',   rank:'F',days:14,pay:[10,18],xp:25, questType:'scouting', desc:'Scout the road between Thornhaven and Crestfall. Report bandit positions — do not engage.'},
                {id:'f2',name:'Cave Recovery',     rank:'F',days:14,pay:[8,14], xp:20, questType:'dungeon',  desc:'Recover stolen goods from a cave north of Thornhaven.'},
                {id:'f3',name:'Missing Child',     rank:'F',days:10,pay:[12,20],xp:28, questType:'scouting', desc:'A child from Crestfall wandered into the Verdenmere two days ago.'},
                {id:'f4',name:'Merchant Escort',   rank:'F',days:14,pay:[10,16],xp:22, questType:'escort',   desc:'Escort a merchant safely from Thornhaven to Ironspire and back.'},
                {id:'f5',name:'Haunted Cellar',    rank:'F',days:7, pay:[9,15], xp:18, questType:'undead',   desc:'Something is in the cellar of an old Crestfall house. The family will not go down there.'},
              ],
              E:[
                {id:'e1',name:'Bandit Camp',       rank:'E',days:21,pay:[18,30],xp:45, questType:'bandit',   desc:'Clear the bandit camp on the north road between Crestfall and the Ashen Peaks. Leave no stragglers.'},
                {id:'e2',name:'Creature Hunt',     rank:'E',days:14,pay:[20,35],xp:50, questType:'combat',   desc:'Something is eating livestock near the Ashen Peaks foothills. Three farms already abandoned.'},
                {id:'e3',name:'Stolen Relic',      rank:'E',days:21,pay:[22,38],xp:48, questType:'dungeon',  desc:'A relic was stolen from the temple of Ferrus in Crestfall. The priests want it back quietly.'},
                {id:'e4',name:'Haunted Mill',      rank:'E',days:14,pay:[16,28],xp:42, questType:'undead',   desc:'The old mill east of Crestfall has been abandoned for three seasons. Find out why.'},
                {id:'e5',name:"Noble's Contract", rank:'E',days:21,pay:[25,40],xp:50, questType:'negotiation', desc:"A noble in Ironspire needs something handled. He is being vague about the details."},
              ],
              D:[
                {id:'d1',name:'Monster Hunt',      rank:'D',days:30,pay:[30,55],xp:80, questType:'combat',   desc:'A creature is preying on travellers on the Thornhaven–Crestfall road.'},
                {id:'d2',name:'City Contract',     rank:'D',days:21,pay:[35,60],xp:85, questType:'negotiation', desc:"A noble in Ironspire needs a problem handled. Discretion required."},
                {id:'d3',name:'Ruin Mapping',      rank:'D',days:30,pay:[28,50],xp:75, questType:'dungeon',  desc:'Map a section of the Old Realm. Do not go below the third level.'},
                {id:'d4',name:'Smuggler Ring',     rank:'D',days:21,pay:[32,58],xp:82, questType:'scouting', desc:"Break up a smuggling operation running through Crestfall's docks."},
              ],
              C:[
                {id:'c1',name:'Dangerous Bounty',  rank:'C',days:45,pay:[55,90], xp:140, questType:'assassination', desc:"A dangerous criminal. Wanted dead or alive. Mostly dead."},
                {id:'c2',name:'Deep Ruin Dive',    rank:'C',days:45,pay:[50,85], xp:130, questType:'dungeon',      desc:'Retrieve an artefact from the deeper levels of the Old Realm.'},
                {id:'c3',name:'Political Contract',rank:'C',days:30,pay:[60,100],xp:150, questType:'negotiation',  desc:"A noble needs something done quietly. Someone will not be alive afterward."},
              ],
              B:[
                {id:'b1',name:'Dragon Sign',       rank:'B',days:60,pay:[100,180],xp:250, questType:'dragon',  desc:'Investigate signs of dragon activity near the Ashen Peaks. Do not provoke it.'},
                {id:'b2',name:'Sealed Vault',      rank:'B',days:60,pay:[120,200],xp:270, questType:'magical', desc:'A sealed vault in the Old Realm has opened. Something came out.'},
                {id:'b3',name:'Royal Errand',      rank:'B',days:45,pay:[90,160], xp:240, questType:'escort',  desc:"A royal courier needs an escort through hostile territory."},
              ],
              A:[
                {id:'a1',name:'The Lich Beneath',  rank:'A',days:75,pay:[200,350],xp:500, questType:'undead',  desc:'Something ancient and undying has woken beneath the Ashen Peaks.'},
                {id:'a2',name:'Royal Crisis',      rank:'A',days:60,pay:[180,300],xp:480, questType:'negotiation', desc:'A crisis at the court of Aldenmere. Lives depend on the outcome.'},
                {id:'a3',name:'The Stirring',      rank:'A',days:75,pay:[220,380],xp:520, questType:'magical', desc:'Something that should be sleeping is not. Magic is behaving strangely across the realm.'},
              ],
              S:[
                {id:'s1',name:'The Final Seal',    rank:'S',days:90,pay:[500,900], xp:1000, questType:'magical', desc:'The seals holding something terrible back are cracking. You may be the only one who can stop it.'},
                {id:'s2',name:"Kingdom's End",    rank:'S',days:90,pay:[600,1000],xp:1000, questType:'combat',  desc:'Aldenmere itself is under threat. This is what heroes are for.'},
                {id:'s3',name:'The Last God',      rank:'S',days:90,pay:[400,800], xp:1000, questType:'magical', desc:'One god remains. It has chosen you. You did not get a say.'},
              ],
            };

            const RANKS = RANKS_ORDER;
            const done = new Set([...(char.seasonCompletedQuests||[]), ...(char.seasonFailedQuests||[])]);
            const daysLeft = Math.max(0, 90-(char.questDaysUsed||0));
            const available = [];
            const rankIdx = RANKS.indexOf(guildRank);
            // Youth quests are always on the board — low value, low XP, safe.
            available.push(...QUEST_POOL.YOUTH);
            if(rankIdx>0) available.push(...(QUEST_POOL[RANKS[rankIdx-1]]||[]).slice(0,2));
            available.push(...(QUEST_POOL[guildRank]||[]));
            if(nextRank) available.push(...(QUEST_POOL[nextRank]||[]).slice(0,2));
            const locQuestTypes = LOCATIONS[char.location||'village']?.questTypes || null;
            // Under 16: only safe quest types are shown. Dangerous content is hidden entirely.
            const SAFE_TYPES = ['chore','critter','fetch'];
            const isYouth = (char.age||0) < 16;
            const shown = available.filter(q=>
              !done.has(q.id) &&
              (!locQuestTypes || locQuestTypes.includes(q.questType) || !q.questType) &&
              (!isYouth || SAFE_TYPES.includes(q.questType))
            );

            if(!shown.length) return <Card><p style={{fontSize:'12px',color:T.muted,fontStyle:'italic'}}>No quests available. Age up to find new contracts.</p></Card>;

            return shown.map(q=>{
              const isFailed = (char.seasonFailedQuests||[]).includes(q.id);
              const rankDiff = RANKS_ORDER.indexOf(q.rank) - RANKS_ORDER.indexOf(guildRank);
              const isAbove = rankDiff === 1;
              const isLocked = rankDiff >= 2;
              const isBelow = rankIdx>0 && q.rank===RANKS[rankIdx-1];
              const questDays = getQuestDays(q, char);
              const canAfford = daysLeft >= questDays;
              const { chance:rawSuccessPct, classBonus, partyClassBonus, partyRankBonus } = getQuestSuccessChance(q, char);
              const aboveRankPenalty = rankDiff === 1 ? -20 : 0;
              const successPct = Math.max(5, rawSuccessPct + aboveRankPenalty);
              const [tapId, setTapId] = [char.questTapId, ()=>{}]; // handled via local state below

              return (
                <Card key={q.id} accent={isAbove?T.orange:isBelow?T.muted:T.gold} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                    <div style={{flex:1,paddingRight:'8px'}}>
                      <div style={{display:'flex',gap:'6px',alignItems:'center',marginBottom:'2px'}}>
                        <div style={{fontWeight:700,color:isLocked?T.muted:isFailed?T.red:T.text,fontSize:'13px'}}>{q.name}</div>
                        {isFailed&&<span style={{fontSize:'9px',color:T.red,fontWeight:700,background:T.red+'22',padding:'1px 5px',borderRadius:'3px'}}>FAILED</span>}
                        {isLocked&&<span style={{fontSize:'9px',color:T.muted,fontWeight:700,background:T.panel,padding:'1px 5px',borderRadius:'3px'}}>LOCKED</span>}
                      </div>
                      <div style={{fontSize:'10px',color:isAbove?T.orange:T.muted}}>
                        {q.rank}-rank · {questDays} days · {q.pay[0]}–{q.pay[1]}g · +{q.xp}xp
                        {isAbove?' · ⚠ above rank':''}
                      </div>
                    </div>
                    {/* Success rate badge */}
                    <div style={{
                      background:successPct>=70?T.green+'33':successPct>=40?T.orange+'33':T.red+'33',
                      border:`1px solid ${successPct>=70?T.green:successPct>=40?T.orange:T.red}`,
                      borderRadius:'8px',padding:'4px 8px',textAlign:'center',flexShrink:0,
                    }}>
                      <div style={{fontSize:'14px',fontWeight:900,color:successPct>=70?T.green:successPct>=40?T.orange:T.red}}>{successPct}%</div>
                      <div style={{fontSize:'8px',color:T.muted}}>success</div>
                    </div>
                  </div>

                  <p style={{fontSize:'11px',color:T.muted,fontStyle:'italic',marginBottom:'8px'}}>{q.desc}</p>

                  {/* Success breakdown */}
                  <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'8px'}}>
                    {classBonus>0&&<span style={{fontSize:'9px',background:T.green+'22',color:T.green,padding:'2px 6px',borderRadius:'4px'}}>Class +{classBonus}%</span>}
                    {classBonus<0&&<span style={{fontSize:'9px',background:T.red+'22',color:T.red,padding:'2px 6px',borderRadius:'4px'}}>Class {classBonus}%</span>}
                    {partyClassBonus>0&&<span style={{fontSize:'9px',background:T.teal+'22',color:T.teal,padding:'2px 6px',borderRadius:'4px'}}>Party class +{partyClassBonus}%</span>}
                    {partyRankBonus>0&&<span style={{fontSize:'9px',background:T.blue+'22',color:T.blue,padding:'2px 6px',borderRadius:'4px'}}>Party rank +{partyRankBonus}%</span>}
                    {isAbove&&<span style={{fontSize:'9px',background:T.orange+'22',color:T.orange,padding:'2px 6px',borderRadius:'4px'}}>Above rank −25%</span>}
                    {!canAfford&&<span style={{fontSize:'9px',background:T.red+'22',color:T.red,padding:'2px 6px',borderRadius:'4px'}}>⚠ Need {questDays} days ({daysLeft} left)</span>}
                  </div>

                  {!isFailed && !isLocked && <QuestAcceptButton quest={q} char={char} questDays={questDays} canAfford={canAfford} successPct={successPct} onAction={onAction} setResult={setResult} guildRank={guildRank} nextRank={nextRank}/>}
                </Card>
              );
            });
          })()}
        </>
      )}

      {/* Party view */}
      {view==='party' && (
        <>
          <SectionHeader>Your Party</SectionHeader>
          {!(char.partyMembers||[]).length && <p style={{fontSize:'12px',color:T.muted,fontStyle:'italic'}}>You are adventuring solo.</p>}
          {(char.partyMembers||[]).map(m=>(
            <Card key={m.id} style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:700,color:T.text}}>{m.name}</div>
                  <div style={{fontSize:'11px',color:T.muted}}>{m.rank}-Rank</div>
                </div>
                <Btn onClick={()=>{
                  const updated={...char,partyMembers:(char.partyMembers||[]).filter(p=>p.id!==m.id)};
                  setResult({text:`${m.name} has left the party.`,bad:false});
                  onAction(updated);
                }} colour={T.red} small full={false}>Remove</Btn>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Join / Recruit view */}
      {view==='join' && (char.age||0) < 16 && (
        <Card><p style={{fontSize:'12px',color:T.muted,fontStyle:'italic'}}>You are too young to lead a party. Come back at sixteen — for now, the safe jobs are yours alone.</p></Card>
      )}
      {view==='join' && (char.age||0) >= 16 && (
        <>
          <SectionHeader>Available Adventurers</SectionHeader>
          <p style={{fontSize:'11px',color:T.muted,marginBottom:'10px'}}>Recruiting costs gold. Higher-rank adventurers are harder to persuade. CHA helps. Quest rewards are split across the whole party.</p>
          {partyNPCs.map(npc=>{
            const diff = RANKS.indexOf(npc.rank) - rankIdx;
            const alreadyIn = (char.partyMembers||[]).some(m=>m.id===npc.id);
            return (
              <Card key={npc.id} style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,color:T.text}}>{npc.name}</div>
                    <div style={{fontSize:'11px',color:diff>0?T.orange:T.muted}}>{npc.rank}-Rank · {npc.fee}g fee{diff>0?` · ${diff} rank${diff>1?'s':''} above you`:''}</div>
                  </div>
                  <Btn onClick={()=>recruit(npc)} colour={diff>0?T.orange:T.green} small full={false} disabled={alreadyIn}>
                    {alreadyIn?'In party':'Recruit'}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GOING OUT TAB — meets NPCs, starts relationships, available from age 16
// ══════════════════════════════════════════════════════════════════════════════
export function GoingOutTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [metNPC, setMetNPC] = useState(null);
  const attractedTo = char.sexuality==='asexual' ? [] :
    char.sexuality==='gay' ? [char.gender?.id||'male'] :
    char.sexuality==='straight' ? (char.gender?.id==='male'?['female']:['male']) :
    ['male','female','nonbinary'];

  const VENUES = [
    { id:'dance', name:'Village Dance', emoji:'💃', desc:'Music, movement, warm firelight.', chaBonus:5 },
    { id:'pub',   name:'The Tavern',    emoji:'🍺', desc:'Loud, crowded, good for stories.', chaBonus:0 },
    { id:'festival', name:'Festival',  emoji:'🎪', desc:'Everyone is here. Best odds.',     chaBonus:10 },
  ];

  const NPC_NAMES = ['Aldric','Seren','Wren','Calder','Petra','Tamsin','Oswin','Lira','Brix','Nessa','Freya','Gavril'];
  const NPC_JOBS  = ['merchant','farmer','healer','carpenter','guard','bard','scribe','herbalist'];
  const WEALTH    = ['Modest','Comfortable','Wealthy','Poor'];
  const GEND      = ['male','female','nonbinary'];

  function goOut(venue){
    if((char.seasonActions?.goingOut||0) >= (SEASON_LIMITS.goingOut||2)){ setResult({text:'You have been out enough this season.',bad:true}); return; }
    const cha = char.stats?.CHA||1;
    const meetChance = Math.min(90, 30 + cha*3 + venue.chaBonus);
    const met = chance(meetChance);

    if(!met){
      const updated={...char,seasonActions:{...(char.seasonActions||{}),goingOut:((char.seasonActions?.goingOut||0)+1)}};
      setResult({text:`A pleasant evening at ${venue.name}. Nobody new tonight.`,bad:false});
      setMetNPC(null);
      onAction(updated);
      return;
    }

    // Generate an NPC
    const seed = Date.now();
    const npcGender = GEND[seed%3];
    const npcName = NPC_NAMES[seed%NPC_NAMES.length];
    const npcJob  = NPC_JOBS[(seed+1)%NPC_JOBS.length];
    const npcWealth = WEALTH[(seed+2)%WEALTH.length];
    const npcAge  = (char.age||16) + Math.floor(Math.random()*10)-4;
    const isRomantic = attractedTo.includes(npcGender) && chance(40);

    const npc = { id:`npc_${seed}`, name:npcName, gender:npcGender, age:Math.max(16,npcAge), job:npcJob, wealth:npcWealth, score:30 };
    setMetNPC({ npc, isRomantic });

    const updated={
      ...char,
      seasonActions:{...(char.seasonActions||{}),goingOut:((char.seasonActions?.goingOut||0)+1)},
      pendingNPC: npc,
    };
    onAction(updated);
  }

  function talkSocial(){
    const npc = metNPC.npc;
    const key = `npc:${npc.id}`;
    const used = char.seasonNpcInteractions?.[key]||0;
    if(used >= 2){ setResult({text:`${npc.name} has enjoyed your company enough for one season.`,bad:true}); return; }
    const cha = char.stats?.CHA||1;
    const gain = 4 + Math.floor(cha/3) + (chance(40)?3:0);
    const newScore = Math.min(100, (npc.score||30) + gain);
    const upNpc = {...npc, score:newScore};
    setMetNPC({...metNPC, npc:upNpc});
    onAction({...char, pendingNPC:upNpc, seasonNpcInteractions:{...(char.seasonNpcInteractions||{}), [key]:used+1}});
    setResult({text:`You and ${npc.name} talk easily. They like you a little more. (+${gain})`,bad:false});
  }

  function stealSocial(){
    const npc = metNPC.npc;
    const stealth = char.skills?.stealth||0;
    const loc = char.location||'village';
    const locCatchMod = LOCATIONS[loc]?.crimeCatchMod||0;
    const catchChance = Math.max(8, Math.min(95, 45 - stealth*5 + locCatchMod));
    const caught = chance(catchChance);
    if(caught){
      const fine = rand(8,24);
      const updated = {
        ...char,
        gold: Math.max(0,(char.gold||0)-fine),
        criminalRecord:(char.criminalRecord||0)+1,
        pendingNPC:null,
        log:[...(char.log||[]),{age:char.age,text:`You tried to rob ${npc.name} and got caught. Fined ${fine}g. They storm off.`,type:'bad'}],
      };
      setResult({text:`Caught! ${npc.name} raised the alarm. Fined ${fine}g.`,bad:true});
      setMetNPC(null);
      onAction(updated);
      return;
    }
    const stealGold = chance(50);
    let updated = {...char, pendingNPC:null};
    let gainedText;
    if(stealGold){
      const amt = rand(3,14)+stealth;
      updated.gold = (updated.gold||0)+amt;
      gainedText = `${amt}g`;
    } else {
      const stolen = { id:uid('stolen'), name:'Pilfered Goods', emoji:'📦', cost:rand(6,16), stolen:true, desc:'Lifted from someone. Best sold to a fence.' };
      updated.inventory = [...(updated.inventory||[]), {...stolen, boughtAge:char.age}];
      gainedText = stolen.name;
    }
    updated.log = [...(char.log||[]),{age:char.age,text:`You quietly lifted ${gainedText} from ${npc.name}.`,type:'neutral'}];
    setResult({text:`You stole ${gainedText} from ${npc.name} unnoticed.`,bad:false});
    setMetNPC(null);
    onAction(updated);
  }

  function addAsFriend(npc){
    const updated={
      ...char,
      relationships:[...(char.relationships||[]),{...npc,type:'friend',alive:true}],
      pendingNPC:null,
      log:[...(char.log||[]),{age:char.age,text:`You met ${npc.name} at a gathering. There is something there.`,type:'good'}],
    };
    setResult({text:`${npc.name} is now a friend.`,bad:false});
    setMetNPC(null);
    onAction(updated);
  }

  function addAsInterest(npc){
    const updated={
      ...char,
      relationships:[...(char.relationships||[]),{...npc,type:'interest',alive:true,score:30}],
      pendingNPC:null,
      log:[...(char.log||[]),{age:char.age,text:`You met ${npc.name}. Something about them stayed with you.`,type:'good'}],
    };
    setResult({text:`${npc.name} caught your interest.`,bad:false});
    setMetNPC(null);
    onAction(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
      <SectionHeader>Going Out</SectionHeader>

      {(char.age||0) < 16 ? (
        <Card accent={T.muted} style={{marginTop:'12px'}}>
          <p style={{fontSize:'13px',color:T.muted,textAlign:'center',padding:'8px 0'}}>🔒 Available from age 16</p>
          <p style={{fontSize:'11px',color:T.muted,textAlign:'center'}}>You are too young to go out on your own.</p>
        </Card>
      ) : (
        <>
          <p style={{fontSize:'12px',color:T.muted,marginBottom:'12px',fontStyle:'italic'}}>Meet people. Make friends. See what happens.</p>

          {result && <Card accent={result.bad?T.red:T.green} style={{marginBottom:'10px'}}><p style={{fontSize:'12px',color:result.bad?T.red:T.green}}>{result.text}</p></Card>}

          {metNPC && (
            <Card accent={T.gold} style={{marginBottom:'12px'}}>
              <p style={{fontSize:'12px',color:T.gold,fontWeight:700,marginBottom:'8px'}}>You met someone</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'10px',fontSize:'12px'}}>
                <span style={{color:T.muted}}>Name</span><span style={{color:T.text,fontWeight:700}}>{metNPC.npc.name}</span>
                <span style={{color:T.muted}}>Age</span><span style={{color:T.text}}>{metNPC.npc.age}</span>
                <span style={{color:T.muted}}>Race</span><span style={{color:T.text,textTransform:'capitalize'}}>{metNPC.npc.race||'Human'}</span>
                <span style={{color:T.muted}}>Gender</span><span style={{color:T.text,textTransform:'capitalize'}}>{metNPC.npc.gender}</span>
                <span style={{color:T.muted}}>Wealth</span><span style={{color:T.text}}>{metNPC.npc.wealth}</span>
                <span style={{color:T.muted}}>Work</span><span style={{color:T.text,textTransform:'capitalize'}}>{metNPC.npc.job}</span>
              </div>
              {/* Like-bar */}
              <div style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                  <span style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px'}}>HOW MUCH THEY LIKE YOU</span>
                  <span style={{fontSize:'9px',color:(metNPC.npc.score||30)>=60?T.green:(metNPC.npc.score||30)>=30?T.gold:T.orange}}>{metNPC.npc.score||30}/100</span>
                </div>
                <div style={{height:'5px',background:'#1a1208',borderRadius:'3px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${metNPC.npc.score||30}%`,background:(metNPC.npc.score||30)>=60?T.green:(metNPC.npc.score||30)>=30?T.gold:T.orange,transition:'width 0.4s'}}/>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <Btn onClick={talkSocial} colour={T.teal} small outline disabled={(char.seasonNpcInteractions?.[`npc:${metNPC.npc.id}`]||0)>=2}>
                  {(char.seasonNpcInteractions?.[`npc:${metNPC.npc.id}`]||0)>=2 ? 'Talked enough' : `Talk · ${2-(char.seasonNpcInteractions?.[`npc:${metNPC.npc.id}`]||0)} left`}
                </Btn>
                <Btn onClick={stealSocial} colour={T.crimson} small outline>Steal</Btn>
                <Btn onClick={()=>addAsFriend(metNPC.npc)} colour={T.teal} small>Add as Friend</Btn>
                {metNPC.isRomantic && <Btn onClick={()=>addAsInterest(metNPC.npc)} colour={T.gold} small>Show Interest</Btn>}
                <Btn onClick={()=>setMetNPC(null)} colour={T.muted} small outline>Move on</Btn>
              </div>
            </Card>
          )}

          {VENUES.map(v=>(
            <Card key={v.id} style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                <div>
                  <span style={{fontSize:'18px',marginRight:'8px'}}>{v.emoji}</span>
                  <span style={{fontWeight:700,color:T.text}}>{v.name}</span>
                </div>
                <Tag colour={T.muted}>{Math.max(0,(SEASON_LIMITS.goingOut||2)-(char.seasonActions?.goingOut||0))} outings left</Tag>
              </div>
              <p style={{fontSize:'12px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>{v.desc}</p>
              <Btn onClick={()=>goOut(v)} colour={T.gold} disabled={(char.seasonActions?.goingOut||0)>=(SEASON_LIMITS.goingOut||2)}>Go out</Btn>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
