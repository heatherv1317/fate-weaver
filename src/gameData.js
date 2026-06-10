// ── THEME ────────────────────────────────────────────────────────────────────
export const T = {
  bg:       '#0e0b06',
  panel:    '#1c1508',
  panelAlt: '#241c0a',
  border:   '#3a2e14',
  gold:     '#c8a84b',
  goldDim:  '#8a7230',
  text:     '#f0e6cc',
  muted:    '#8a7a5a',
  red:      '#c04040',
  green:    '#4a9e52',
  blue:     '#3a6ea8',
  purple:   '#7b52e0',
  teal:     '#2a8a7a',
  orange:   '#c8683a',
  crimson:  '#8a1a1a',
};

// ── WORLD ────────────────────────────────────────────────────────────────────
export const WORLD = {
  name:     'Aldenmere',
  kingdom:  'the Kingdom of Aldenmere',
  village:  'Thornhaven',
  town:     'Crestfall',
  city:     'Ironspire',
  forest:   'the Verdenmere',
  mountains:'the Ashen Peaks',
  ruins:    'the Old Realm',
  lore:     'A world where the old gods sleep, magic is fading, and ordinary lives carry extraordinary weight.',
};

// ── RACES ────────────────────────────────────────────────────────────────────
export const RACES = [
  { id:'human',      name:'Human',      emoji:'', desc:'Adaptable. No gifts, no curses. Only will.',           bonuses:{STR:1,DEX:1,INT:1,WIS:1,CHA:1,CON:1}, flavour:'You were born like most in Aldenmere — with nothing decided yet.' },
  { id:'elf',        name:'Elf',        emoji:'',  desc:'Ancient and patient. Grace in everything.',            bonuses:{DEX:2,INT:2,WIS:1,STR:-1}, flavour:'Elves feel the weight of years differently. You were already old before the world had words for what you were.' },
  { id:'dwarf',      name:'Dwarf',      emoji:'',  desc:'Born of stone. They endure what breaks others.',       bonuses:{CON:3,STR:2,CHA:-1}, flavour:'Among dwarves, you are expected to last. The mountain teaches patience to its children before anything else.' },
  { id:'orc',        name:'Orc',        emoji:'',  desc:'Powerful and feared. Strength is their birthright.',  bonuses:{STR:3,CON:2,INT:-1,CHA:-1}, flavour:'People stepped aside for you before you learned to speak. You are still deciding how to feel about that.' },
  { id:'halfling',   name:'Halfling',   emoji:'',  desc:'Small, overlooked, impossibly lucky.',                 bonuses:{DEX:3,CHA:2,STR:-2}, flavour:'You were smaller than the other children and keenly aware of it. That awareness became something useful.' },
  { id:'tiefling',   name:'Tiefling',   emoji:'',  desc:'Touched by infernal blood. The world fears them.',    bonuses:{CHA:2,INT:2,WIS:-1}, flavour:'The world made up its mind about you before you had a chance to introduce yourself. You learned to use that.' },
  { id:'dragonborn', name:'Dragonborn', emoji:'',  desc:'Scaled and proud. Ancient fire in their lungs.',      bonuses:{STR:2,CHA:2,CON:1,DEX:-1}, flavour:'There is old fire in your lineage. It does not always make things easier. It does make them more interesting.' },
  { id:'gnome',      name:'Gnome',      emoji:'',  desc:'Curious and inventive. Tinkerers of the impossible.', bonuses:{INT:3,DEX:1,CON:-1}, flavour:'You took apart the first thing you could reach and tried to put it back better. That instinct never left you.' },
];

// ── CLASSES ──────────────────────────────────────────────────────────────────
export const CLASSES = {
  // ── COMBAT ────────────────────────────────────────────────────────────────
  fighter:   { name:'Fighter',   emoji:'⚔️',  colour:'#c04040', primary:'STR', magic:false },
  ranger:    { name:'Ranger',    emoji:'🏹',  colour:'#4a9e52', primary:'DEX', magic:false },
  mage:      { name:'Mage',      emoji:'✨',  colour:'#7b52e0', primary:'INT', magic:true  },
  cleric:    { name:'Cleric',    emoji:'☀️',  colour:'#c8a84b', primary:'WIS', magic:true  },
  rogue:     { name:'Rogue',     emoji:'🗝️',  colour:'#3a3a5a', primary:'DEX', magic:false },
  bard:      { name:'Bard',      emoji:'🎶',  colour:'#c8683a', primary:'CHA', magic:false },
  paladin:   { name:'Paladin',   emoji:'🛡️',  colour:'#c8a84b', primary:'STR', magic:true  },
  druid:     { name:'Druid',     emoji:'🌿',  colour:'#2a8a7a', primary:'WIS', magic:true  },
  barbarian: { name:'Barbarian', emoji:'💢',  colour:'#8a1a1a', primary:'STR', magic:false },
  warlock:   { name:'Warlock',   emoji:'🌑',  colour:'#5a2d82', primary:'CHA', magic:true  },
  // ── CIVILIAN ─────────────────────────────────────────────────────────────
  merchant:  { name:'Merchant',  emoji:'🪙',  colour:'#c8a84b', primary:'CHA', magic:false },
  farmer:    { name:'Farmer',    emoji:'🌾',  colour:'#7a9a3a', primary:'CON', magic:false },
  chef:      { name:'Chef',      emoji:'🍲',  colour:'#c8683a', primary:'WIS', magic:false },
  carpenter: { name:'Carpenter', emoji:'🪵',  colour:'#8a6030', primary:'STR', magic:false },
};

// ── STATS ────────────────────────────────────────────────────────────────────
export const STATS = ['STR','DEX','INT','WIS','CHA','CON'];
export const STAT_FULL  = { STR:'Strength', DEX:'Dexterity', INT:'Intelligence', WIS:'Wisdom', CHA:'Charisma', CON:'Constitution' };
export const STAT_COLOR = { STR:'#c04040', DEX:'#3a9ed0', INT:'#7b52e0', WIS:'#c8a84b', CHA:'#c8683a', CON:'#4a9e52' };

// ── LOCATIONS ────────────────────────────────────────────────────────────────
export const LOCATIONS = {
  // travelCost = gold, travelDays = season days (before mount/winter modifier)
  village:    { name:'Thornhaven',  emoji:'🏡', desc:'A small settlement in Aldenmere. Safe, quiet, limited.',                 unlockAge:0,  travelCost:0,  travelDays:0,
    propertyMult:1.0, crimeCatchMod:0,   crimeClearanceMod:0,
    shops:['blacksmith','herbalist','tents','merchant'],
    questTypes:['chore','critter','fetch','combat','escort','scouting'],
    npcWealth:['poor','modest','comfortable'], npcJobs:['farmer','guard','carpenter','healer','herbalist','blacksmith'] },
  town:       { name:'Crestfall',   emoji:'🏘', desc:'A market town. Guilds, opportunities — and dangers.',                   unlockAge:13, travelCost:8,  travelDays:7,
    propertyMult:1.4, crimeCatchMod:+5,  crimeClearanceMod:+10,
    shops:['blacksmith','herbalist','tents','merchant','tailor'],
    questTypes:['chore','critter','fetch','combat','escort','scouting','dungeon','undead','bandit'],
    npcWealth:['poor','modest','comfortable','wealthy'], npcJobs:['merchant','guard','carpenter','healer','bard','scribe','innkeeper'] },
  city:       { name:'Ironspire',   emoji:'🏰', desc:'The great city of Aldenmere. Wealth, crime, and ambition.',              unlockAge:16, travelCost:20, travelDays:14,
    propertyMult:2.5, crimeCatchMod:+15, crimeClearanceMod:+30,
    shops:['blacksmith','herbalist','tents','merchant','tailor','jeweller'],
    questTypes:['escort','negotiation','assassination','scouting','undead','magical'],
    npcWealth:['modest','comfortable','wealthy'], npcJobs:['merchant','guard','scribe','healer','bard','noble','lawyer'] },
  forest:     { name:'Verdenmere',  emoji:'🌲', desc:'Ancient woods. Druidic paths and wild creatures.',                      unlockAge:10, travelCost:3,  travelDays:5,
    propertyMult:0.6, crimeCatchMod:-10, crimeClearanceMod:-15,
    shops:['herbalist','tents','merchant'],
    questTypes:['chore','critter','fetch','combat','scouting','nature','dungeon'],
    npcWealth:['poor','modest'], npcJobs:['ranger','druid','hunter','herbalist','carpenter'] },
  mountains:  { name:'Ashen Peaks', emoji:'⛰', desc:'Dwarven holds and harsh passes. Rich with ore.',                        unlockAge:18, travelCost:30, travelDays:21,
    propertyMult:0.8, crimeCatchMod:-5,  crimeClearanceMod:-5,
    shops:['blacksmith','tents','merchant'],
    questTypes:['combat','dungeon','dragon','scouting'],
    npcWealth:['poor','modest','comfortable'], npcJobs:['miner','carpenter','guard','blacksmith','merchant'] },
  ruins:      { name:'Old Realm',   emoji:'🏛', desc:'Ruins of an older age. Crumbling glory. Treasure and terrible things.', unlockAge:20, travelCost:15, travelDays:14,
    propertyMult:0.5, crimeCatchMod:-15, crimeClearanceMod:-20,
    shops:['tents','merchant'],
    questTypes:['dungeon','undead','magical','dragon','assassination'],
    npcWealth:['poor','modest'], npcJobs:['guard','mage','rogue','ranger'] },
};

// ── PROPERTY TYPES ────────────────────────────────────────────────────────────
export const PROPERTY_MAINTENANCE = {
  plot:1, cottage:0, house:2, farm:4, tavern:8, manor:20,
};

export const PROPERTY_RENT = {
  plot:2, cottage:5, house:12, farm:18, tavern:30, manor:55,
};

export const PROPERTY_MORTGAGE_RATE = 0.20; // 20% deposit, annual repayments = 8% of value

export const PROPERTY_TYPES = {
  plot:    { name:'Plot of Land',  emoji:'🌱', buyPrice:0,    annualRent:2,  capacity:0, income:0,  annualUpkeep:1,  rentOnly:true, desc:'A piece of land. Rent only — cannot be purchased.' },
  cottage: { name:'Cottage',       emoji:'🏠', buyPrice:120,  annualRent:8,  capacity:2, income:9,  annualUpkeep:0,  desc:'A small one-room dwelling. Modest but yours.' },
  house:   { name:'House',         emoji:'🏡', buyPrice:300,  annualRent:18, capacity:4, income:22, annualUpkeep:2,  desc:'Room for a family. A real home.' },
  farm:    { name:'Farm',          emoji:'🌾', buyPrice:500,  annualRent:25, capacity:5, income:34, annualUpkeep:4,  desc:'Land and outbuildings. Good harvest income.' },
  tavern:  { name:'Tavern',        emoji:'🍺', buyPrice:800,  annualRent:40, capacity:6, income:58, annualUpkeep:8,  desc:'Always busy. Requires staff to maximise.' },
  manor:   { name:'Manor House',   emoji:'🏰', buyPrice:2000, annualRent:80, capacity:12,income:115,annualUpkeep:20, desc:'A statement. Prestige and space.' },
};

// ── CALENDAR SYSTEM ──────────────────────────────────────────────────────────
// Each year = 4 seasons. Each season = 3 months. Each month = 4 weeks = ~30 days.
// One Age Up = one full year (4 seasons). Player acts within each season.
// Quests take weeks/months. Jobs take days within a season.

export const SEASONS = ['Spring','Summer','Autumn','Winter'];
export const MONTHS_PER_SEASON = 3;
export const WEEKS_PER_MONTH   = 4;
export const DAYS_PER_MONTH    = 30;
export const DAYS_PER_SEASON   = 90; // 3 months × 30 days

// How many days each action takes within a season
export const ACTION_DAYS = {
  work:        14,  // ~2 weeks per job shift
  train:       7,   // 1 week
  socialise:   3,   // a few days
  goingOut:    2,
  worship:     1,
  study:       14,
  apothecary:  3,
  crime:       7,
  travel:      14,
  rest:        7,
};

// Quest day costs per rank (min–max)
export const QUEST_DAYS = {
  G:{ min:7,  max:14 },
  F:{ min:14, max:21 },
  E:{ min:21, max:30 },
  D:{ min:30, max:45 },
  C:{ min:45, max:60 },
  B:{ min:60, max:75 },
  A:{ min:75, max:90 },
  S:{ min:90, max:90 },
};

// Calculate quest days after party time reduction
export function getQuestDays(quest, char){
  const base = quest.days || QUEST_DAYS[quest.rank]?.min || 7;
  const members = char.partyMembers||[];
  if(!members.length) return base;
  const RANK_NUM = {G:1,F:2,E:3,D:4,C:5,B:6,A:7,S:8};
  const avg = members.reduce((s,m)=>s+(RANK_NUM[m.rank]||1),0)/members.length;
  const reduction = Math.min(0.5, (avg-1)*0.05); // 5% per rank above G, max 50%
  return Math.max(1, Math.round(base * (1-reduction)));
}

// Calculate quest success chance with class suitability
export const QUEST_TYPE_DANGER = {
  chore:         { injuryBase:0,  deathBase:0  },
  critter:       { injuryBase:3,  deathBase:0  },
  fetch:         { injuryBase:2,  deathBase:0  },
  scouting:      { injuryBase:8,  deathBase:2  },
  escort:        { injuryBase:10, deathBase:3  },
  combat:        { injuryBase:20, deathBase:8  },
  dungeon:       { injuryBase:18, deathBase:7  },
  bandit:        { injuryBase:15, deathBase:5  },
  undead:        { injuryBase:18, deathBase:8  },
  assassination: { injuryBase:20, deathBase:10 },
  negotiation:   { injuryBase:5,  deathBase:1  },
  magical:       { injuryBase:15, deathBase:6  },
  dragon:        { injuryBase:35, deathBase:20 },
};

export const QUEST_CLASS_SUITABILITY = {
  assassination: { primary:['rogue'], secondary:['warlock','ranger'] },
  combat:        { primary:['fighter'], secondary:['barbarian','paladin','ranger'] },
  dungeon:       { primary:['fighter','rogue'], secondary:['mage','ranger','carpenter'] },
  magical:       { primary:['mage'], secondary:['warlock','druid','cleric'] },
  escort:        { primary:['paladin'], secondary:['fighter','ranger'] },
  healing:       { primary:['cleric'], secondary:['druid'] },
  negotiation:   { primary:['bard','merchant'], secondary:['cleric','rogue','chef'] },
  provisioning:  { primary:['chef'], secondary:['farmer','merchant'] },
  construction:  { primary:['carpenter'], secondary:['farmer','fighter'] },
  scouting:      { primary:['ranger'], secondary:['druid','rogue'] },
  bandit:        { primary:['fighter'], secondary:['barbarian','paladin'] },
  fetch:         { primary:[], secondary:[] }, // any class, no penalty
  chore:         { primary:[], secondary:[] }, // any class, no penalty
  critter:       { primary:['ranger','druid'], secondary:['fighter','barbarian'] },
  undead:        { primary:['cleric'], secondary:['paladin','mage'] },
  dragon:        { primary:['fighter','paladin','mage'], secondary:[] },
};

export function getQuestSuccessChance(quest, char){
  const RANK_IDX = {G:0,F:1,E:2,D:3,C:4,B:5,A:6,S:7};
  const charRankIdx = RANK_IDX[char.guildRank||'G']||0;
  const questRankIdx = RANK_IDX[quest.rank||'G']||0;
  const rankDiff = questRankIdx - charRankIdx;
  let base = rankDiff > 0 ? 35 : rankDiff < 0 ? 85 : 60;

  // Class suitability
  const suitability = QUEST_CLASS_SUITABILITY[quest.questType||'fetch']||{primary:[],secondary:[]};
  const cls = char.classId||'';
  let classBonus = 0;
  if(suitability.primary.includes(cls)) classBonus = 25;
  else if(suitability.secondary.includes(cls)) classBonus = 10;
  else if(cls && quest.questType !== 'fetch') classBonus = -15;
  else if(!cls) classBonus = -10;

  // Party bonuses
  const members = char.partyMembers||[];
  let partyClassBonus = 0;
  let partyRankBonus = 0;
  const RANK_NUM = {G:1,F:2,E:3,D:4,C:5,B:6,A:7,S:8};
  const avgRank = members.length ? members.reduce((s,m)=>s+(RANK_NUM[m.rank]||1),0)/members.length : 1;
  partyRankBonus = Math.round((avgRank-1)*5);
  for(const m of members){
    const mc = m.classId||m.class||'';
    if(suitability.primary.includes(mc) && partyClassBonus < 20) partyClassBonus = 20;
    else if(suitability.secondary.includes(mc) && partyClassBonus < 10) partyClassBonus = 10;
  }

  const total = base + classBonus + partyClassBonus + partyRankBonus;
  return { chance: Math.min(95, Math.max(5, total)), base, classBonus, partyClassBonus, partyRankBonus };
}

// Days remaining in current season
export function getSeasonDaysLeft(char){
  const used = (char.questDaysUsed||0) + ((char.seasonActions?.work||0)*14);
  return Math.max(0, 90 - used);
}

// Per-season action limits (resets each season, not each year)
export const SEASON_LIMITS = {
  work:      4,  // max 4 job shifts per season
  train:     2,
  socialise: 3,
  goingOut:  2,
  worship:   4,
  study:     2,
  crime:     1,
  npcTalk:   3,  // chatting up vendors/strangers to raise their opinion
  // No quest limit — quests are limited by season days remaining (90 days/season)
  travel:    1,
};

// Dummy ENERGY export so old imports don't crash — no longer used for limits
export const ENERGY = { MAX:50, work:0, train:0, socialise:0, quest:0,
  goingOut:0, worship:0, study:0, studyMagic:0, crime:0, majorCrime:0,
  apothecary:0, meditate:0, pray:0, browse:0, talk:0, checkInventory:0,
  travel:0, duel:0 };

// ── ADVENTURITE META-SYSTEM ──────────────────────────────────────────────────
export const ACHIEVEMENT_QUESTS = [
  { id:'ach_carpenter',    name:'Master Carpenter',     desc:'Become a Carpenter through proficiency.',          gems:3  },
  { id:'ach_rankB',        name:'Guild Elite',          desc:'Reach Adventurers Guild Rank B.',                  gems:8  },
  { id:'ach_paladin',      name:'Holy Warrior',         desc:'Become a Paladin through devotion.',               gems:10 },
  { id:'ach_tavern',       name:'Innkeeper',            desc:'Own a tavern.',                                     gems:5  },
  { id:'ach_femaleBarbarian', name:'She-Berserker',    desc:'Play as a female barbarian.',                       gems:6  },
  { id:'ach_age80',        name:'Elder',               desc:'Survive to age 80.',                                gems:8  },
  { id:'ach_5children',    name:'Many Children',        desc:'Have 5 or more children.',                         gems:6  },
  { id:'ach_sRank',        name:'Legend',              desc:'Reach Adventurers Guild Rank S.',                   gems:15 },
  { id:'ach_married',      name:'Together',            desc:'Marry and have at least one child.',                gems:4  },
  { id:'ach_masterJob',    name:'Master of the Trade', desc:'Reach level 4 proficiency in any job.',            gems:5  },
  { id:'ach_paladin_solara',name:'Sun Knight',         desc:'Become a Paladin of Solara.',                       gems:8  },
  { id:'ach_wealthy',      name:'Wealthy',             desc:'Accumulate 500 gold.',                              gems:7  },
  { id:'ach_dynasty3',     name:'Dynasty',             desc:'Play 3 consecutive dynasty characters.',            gems:10 },
  { id:'ach_3properties',  name:'Landlord',            desc:'Own 3 or more properties.',                         gems:6  },
  { id:'ach_devotion3',    name:'True Believer',       desc:'Reach devotion level 3 with any deity.',            gems:7  },
];

export const DAILY_TASK_POOL = [
  { id:'dt_work2',    desc:'Work 2 shifts',           check:(c)=>(c.seasonActions?.work||0)>=2,        gems:1, diff:'easy'   },
  { id:'dt_work4',    desc:'Work 4 shifts',           check:(c)=>(c.seasonActions?.work||0)>=4,        gems:2, diff:'medium' },
  { id:'dt_pray',     desc:'Pray once',               check:(c)=>(c.yearActions||[]).some(a=>a.includes('Prayed')), gems:1, diff:'easy' },
  { id:'dt_worship',  desc:'Visit a temple',         check:(c)=>(c.yearActions||[]).some(a=>a.includes('Worshipped')), gems:2, diff:'medium' },
  { id:'dt_travel',   desc:'Travel to a new location', check:(c)=>c.location&&c.location!=='village',  gems:2, diff:'medium' },
  { id:'dt_quest',    desc:'Complete a quest',        check:(c)=>(c.seasonCompletedQuests||[]).length>0, gems:3, diff:'medium' },
  { id:'dt_friend',   desc:'Make a new friend',      check:(c)=>(c.relationships||[]).some(r=>r.type==='friend'&&r.score>=60), gems:2, diff:'medium' },
  { id:'dt_marry',    desc:'Get married',            check:(c)=>!!c.spouse,                             gems:5, diff:'hard'   },
  { id:'dt_guild',    desc:'Join the guild',         check:(c)=>c.guildJoined,                          gems:1, diff:'easy'   },
  { id:'dt_property', desc:'Own a property',         check:(c)=>(c.properties||[]).length>0,            gems:4, diff:'hard'   },
  { id:'dt_sick',     desc:'Survive a sickness',     check:(c)=>(c.log||[]).some(l=>l.text&&l.text.includes('Recovered')), gems:2, diff:'medium' },
  { id:'dt_ageup',    desc:'Age up once',            check:(c)=>(c.age||0)>0,                           gems:1, diff:'easy'   },
  { id:'dt_crime',    desc:'Commit a crime',         check:(c)=>(c.criminalRecord||0)>0,                gems:2, diff:'medium' },
  { id:'dt_adopt',    desc:'Adopt a child',          check:(c)=>(c.relationships||[]).some(r=>r.adopted), gems:4, diff:'hard' },
  { id:'dt_paladin',  desc:'Become a paladin',       check:(c)=>!!c.paladinDeity,                       gems:8, diff:'hard'   },
];

export const ADVENTURITE_BUFFS = [
  { id:'buf_str2',    name:'+2 Starting STR',     desc:'Born stronger.',                    effect:{statBonus:{STR:2}},         rarity:'common'  },
  { id:'buf_dex2',    name:'+2 Starting DEX',     desc:'Born quicker.',                     effect:{statBonus:{DEX:2}},         rarity:'common'  },
  { id:'buf_int2',    name:'+2 Starting INT',     desc:'Born sharper.',                     effect:{statBonus:{INT:2}},         rarity:'common'  },
  { id:'buf_wis2',    name:'+2 Starting WIS',     desc:'Born wiser.',                       effect:{statBonus:{WIS:2}},         rarity:'common'  },
  { id:'buf_cha2',    name:'+2 Starting CHA',     desc:'Born charming.',                    effect:{statBonus:{CHA:2}},         rarity:'common'  },
  { id:'buf_con2',    name:'+2 Starting CON',     desc:'Born hardy.',                       effect:{statBonus:{CON:2}},         rarity:'common'  },
  { id:'buf_gold30',  name:'+30 Starting Gold',   desc:'Inherited a little something.',     effect:{goldBonus:30},              rarity:'common'  },
  { id:'buf_gold60',  name:'+60 Starting Gold',   desc:'A meaningful inheritance.',          effect:{goldBonus:60},              rarity:'uncommon'},
  { id:'buf_friend',  name:'Born With a Friend',  desc:'Start with a childhood friend.',    effect:{startFriend:true},          rarity:'uncommon'},
  { id:'buf_solara',  name:"Solara's Favour",    desc:'Start with Solara devotion 20.',    effect:{startDevotion:{solara:20}}, rarity:'uncommon'},
  { id:'buf_guild',   name:'Guild Legacy',        desc:'Start as F-rank in the guild.',     effect:{startGuildRank:'F'},        rarity:'uncommon'},
  { id:'buf_health',  name:'Vigorous',            desc:'+20 starting health.',              effect:{healthBonus:20},            rarity:'common'  },
  { id:'buf_quest5',  name:'Seasoned',            desc:'+5% all quest success rates.',      effect:{questBonus:5},              rarity:'uncommon'},
  { id:'buf_sickness',name:'Hardy Constitution', desc:'-5% sickness chance each year.',    effect:{sicknessMod:-5},            rarity:'uncommon'},
  { id:'buf_property',name:'Small Inheritance',  desc:'Start with a rented room already.', effect:{startProperty:true},        rarity:'rare'    },
  { id:'buf_skill',   name:'Gifted',             desc:'Start with one skill at level 1.',  effect:{startSkill:true},           rarity:'rare'    },
  { id:'buf_paladin', name:'Faithful Blood',     desc:'Start with devotion 10 to a random deity.', effect:{faithBlood:true},  rarity:'rare'    },
  { id:'buf_stats4',  name:'Blessed Birth',      desc:'+1 to all stats.',                  effect:{allStats:1},                rarity:'rare'    },
  { id:'buf_longevity',name:'Long-Lived',        desc:'Natural death chance reduced 20%.', effect:{longevityBonus:20},         rarity:'rare'    },
  { id:'buf_legend',  name:'Destined',           desc:'One random stat starts at 12.',     effect:{destined:true},             rarity:'legendary'},
];

export function getBuffRarity(rarity){ return {common:0.55,uncommon:0.30,rare:0.12,legendary:0.03}[rarity]||0; }
export function rollBuff(ownedBuffIds=[]){
  const available = ADVENTURITE_BUFFS.filter(b=>!ownedBuffIds.includes(b.id));
  if(!available.length) return ADVENTURITE_BUFFS[Math.floor(Math.random()*ADVENTURITE_BUFFS.length)];
  const roll = Math.random();
  let cumulative = 0;
  const byRarity = ['legendary','rare','uncommon','common'];
  for(const rarity of byRarity){
    const pool = available.filter(b=>b.rarity===rarity);
    if(!pool.length) continue;
    const chance = getBuffRarity(rarity);
    // Adjust: legendary only if roll < 0.03, rare < 0.15, etc
    if(rarity==='legendary' && roll < 0.03) return pool[Math.floor(Math.random()*pool.length)];
    if(rarity==='rare' && roll >= 0.03 && roll < 0.15) return pool[Math.floor(Math.random()*pool.length)];
    if(rarity==='uncommon' && roll >= 0.15 && roll < 0.45) return pool[Math.floor(Math.random()*pool.length)];
    if(rarity==='common' && roll >= 0.45) return pool[Math.floor(Math.random()*pool.length)];
  }
  return available[Math.floor(Math.random()*available.length)];
}

// Daily task generation — 3 random tasks, seed by date
export function getDailyTasks(dateStr){
  const seed = dateStr.split('-').reduce((a,b)=>a*100+parseInt(b),0);
  // Seeded Fisher-Yates shuffle — different result per element index
  const arr = [...DAILY_TASK_POOL];
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(((seed*(i+1)*2654435761)>>>0)/4294967296*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr.slice(0,3);
}

// ── MEAL SYSTEM ──────────────────────────────────────────────────────────────
export const MEAL_TIERS = [
  { id:'none',          name:'Nothing',           cost:0,  health:-8, desc:'No food this season.',                    req:null,       emoji:'💀' },
  { id:'scraps',        name:'Scraps',            cost:0,  health:-5, desc:'Whatever you can find.',                  req:null,       emoji:'🗑' },
  { id:'bread',         name:'Bread & Water',     cost:1,  health:0,  desc:'Keeps you alive. Nothing more.',          req:null,       emoji:'🍞' },
  { id:'tavern_cheap',  name:'Tavern Meal',       cost:3,  health:2,  desc:'Simple fare at the local inn.',           req:'village',  emoji:'🍲' },
  { id:'home_basic',    name:'Basic Home-Cooked', cost:2,  health:3,  desc:'Simple and filling.',                     req:'home',     emoji:'🥘' },
  { id:'home_decent',   name:'Decent Home-Cooked',cost:5,  health:5,  desc:'A proper meal at your own table.',        req:'home',     emoji:'🍽' },
  { id:'home_luxury',   name:'Luxury Home-Cooked',cost:10, health:7,  desc:'The best your kitchen can offer.',        req:'home',     emoji:'👨‍🍳' },
  { id:'tavern_dinner', name:'Tavern Dinner',     cost:8,  health:6,  desc:'A good meal and a warm fire.',            req:'town',     emoji:'🍖' },
  { id:'fine_dining',   name:'Fine Dining',       cost:15, health:8,  desc:"Ironspire's finest establishments.",     req:'city',     emoji:'🥩' },
  { id:'banquet',       name:'Noble Banquet',     cost:30, health:10, desc:"Feasting with the city's elite.",        req:'banquet',  emoji:'🏰' },
];

export function getMealEffect(char, tier){
  const isChef    = char.classId==='chef';
  const isFarmer  = char.classId==='farmer';
  const isHomeMeal = tier.id.startsWith('home_');
  let cost   = tier.cost;
  let health = tier.health;
  if(isHomeMeal && isChef)  { cost = Math.max(0, cost-Math.floor(cost/2)); health += 2; }
  if(isHomeMeal && isFarmer){ cost = Math.max(0, cost-1); }
  return { cost, health };
}

export const CRIME_CLEARANCE_COST = 50;
export const RANK_XP_THRESHOLDS = {G:0,F:300,E:700,D:1500,C:2800,B:4500,A:7000,S:11000};
export const RANKS_ORDER = ['G','F','E','D','C','B','A','S'];

// ── FACTION SYSTEM ────────────────────────────────────────────────────────────
export const FACTIONS = {
  consortium: {
    id:'consortium', name:'Merchant Consortium', emoji:'🏪',
    joinReq: (char)=> char.classId==='merchant' || ((char.gold||0)>=100 && (char.stats?.CHA||0)>=8),
    annualFee: 20,
    benefits: ['Market prices -10%','Access to rare trade items','Merchant quest pool'],
    leaveConsequence: 'lose all standing, double fee to rejoin',
  },
  templeOrder: {
    id:'templeOrder', name:'Temple Order', emoji:'⛪',
    joinReq: (char)=>{ const d=char.devotion||{}; return Object.values(d).some(v=>v>=75); },
    annualFee: 10,
    benefits: ['Temple costs halved','Holy quest pool','Healing discounts'],
    leaveConsequence: 'apostasy — devotion drops to 0, cannot rejoin for 5 years',
  },
};

export function checkAchievements(char, prevChar){
  const unlocked = [];
  const checks = {
    ach_carpenter: ()=> char.classId==='carpenter',
    ach_rankB: ()=> ['B','A','S'].includes(char.guildRank||''),
    ach_paladin: ()=> !!char.paladinDeity,
    ach_tavern: ()=> (char.properties||[]).some(p=>p.type==='tavern'),
    ach_femaleBarbarian: ()=> char.gender?.id==='female' && char.classId==='barbarian',
    ach_age80: ()=> (char.age||0)>=80,
    ach_5children: ()=> (char.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false).length>=5,
    ach_sRank: ()=> char.guildRank==='S',
    ach_married: ()=> !!char.spouse && (char.relationships||[]).some(r=>r.type==='child'),
    ach_masterJob: ()=> Object.values(char.jobXP||{}).some(v=>v>=60),
    ach_wealthy: ()=> (char.gold||0)>=500,
    ach_3properties: ()=> (char.properties||[]).length>=3,
    ach_devotion3: ()=> Object.values(char.devotion||{}).some(v=>v>=200),
  };
  for(const [id, fn] of Object.entries(checks)){
    try{ if(fn()) unlocked.push(id); } catch(_){}
  }
  return unlocked;
} // gold cost to clear one criminal record point

export const YEARLY_LIMITS = {
  crime:3, study:8, work:12, train:8, pray:999, quest:4, travel:4, socialise:12,
};

// Compatibility stub
export function getEnergyMax(){ return 100; }
export function getTravelCost(){ return 0; }

// ── WEALTH TIERS ─────────────────────────────────────────────────────────────
export const WEALTH_TIERS = [
  { id:'destitute', name:'Destitute', colour:'#8B4513', min:-Infinity, max:0   },
  { id:'poor',      name:'Poor',      colour:'#a0522d', min:1,   max:50        },
  { id:'modest',    name:'Modest',    colour:'#6b7280', min:51,  max:200       },
  { id:'comfortable',name:'Comfortable',colour:'#4a7c59',min:201, max:600     },
  { id:'wealthy',   name:'Wealthy',   colour:'#b8860b', min:601, max:2000      },
  { id:'rich',      name:'Rich',      colour:'#daa520', min:2001,max:10000     },
  { id:'noble',     name:'Noble',     colour:'#4169e1', min:10001,max:Infinity },
];
export function getWealthTier(g) { return WEALTH_TIERS.find(t=>g>=t.min&&g<=t.max)||WEALTH_TIERS[0]; }

// ── SEASON HELPERS ────────────────────────────────────────────────────────────
// Gendered race emojis
export function getRaceEmoji(raceId, genderId){
  const f = genderId==='female';
  const nb = genderId==='nonbinary';
  const emojis = {
    human:      f?'👩':'🧑',
    elf:        f?'🧝‍♀️':'🧝‍♂️',
    dwarf:      f?'👩‍🦱':'🧔',
    orc:        f?'💚':'🟢',
    halfling:   f?'🧒‍♀️':'🧒‍♂️',
    tiefling:   f?'😈':'👿',
    dragonborn: f?'🐲':'🐉',
    gnome:      f?'🔮':'🔬',
  };
  return emojis[raceId]||'🧑';
}

export function getSeason(age, startSeasonIdx){ const idx=(startSeasonIdx||0); return SEASONS[(age+idx)%4]; }
export function getCurrentSeason(char){
  const step = char.currentSeasonStep||0;
  const startIdx = char.startSeasonIdx||0;
  return SEASONS[(step + startIdx) % 4];
}
export const SEASON_EFFECTS = {
  Spring: { desc:'New growth. Roads are passable.', travelBonus:0, farmBonus:1  },
  Summer: { desc:'Long days. Good for work.',       travelBonus:0, farmBonus:2  },
  Autumn: { desc:'Harvest time. Markets are full.', travelBonus:0, farmBonus:3  },
  Winter: { desc:'Hard going. Stay warm.',          travelBonus:3, farmBonus:-1 }, // extra travel cost
};

// ── REPUTATION ────────────────────────────────────────────────────────────────
export function getReputation(char){
  const crimes = char.criminalRecord||0;
  const quests = (char.quests||[]).length;
  const props  = (char.properties||[]).length;
  const score  = quests*3 + props*5 - crimes*8;
  if(score >= 30) return { label:'Renowned',   colour:'#c8a84b', score };
  if(score >= 15) return { label:'Respected',  colour:'#4a9e52', score };
  if(score >= 5)  return { label:'Known',       colour:'#8a7a5a', score };
  if(score >= 0)  return { label:'Anonymous',  colour:'#8a7a5a', score };
  if(score >= -10)return { label:'Suspect',    colour:'#c8683a', score };
  return               { label:'Notorious',  colour:'#c04040', score };
}

// ── LEGACY SCORE ──────────────────────────────────────────────────────────────
export function calcLegacyScore(char){
  let score = 0;
  score += Math.min(500, char.gold||0) * 0.05;                   // gold (capped at 25 pts)
  score += (char.quests||[]).length * 5;                         // quests
  score += (char.properties||[]).length * 10;                    // properties owned
  score += (char.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false).length * 15; // children raised
  score += char.classId ? 20 : 0;                                // class achieved
  score += (char.criminalRecord||0) * -5;                        // crimes
  score += char.age > 70 ? 20 : char.age > 50 ? 10 : 0;         // longevity
  score += ((char.skills&&Object.values(char.skills).reduce((a,b)=>a+b,0))||0) * 2; // skills
  return Math.max(0, Math.round(score));
}

// ── INHERITANCE ───────────────────────────────────────────────────────────────
// Strict will: each category (gold/property/items) goes where the will names.
// The heir the player continues as receives only the share willed to them.
// Anything not assigned falls to the surviving spouse; if none, to the government
// (lost to the estate). Class bonuses are layered on by the caller, not here.
//
// willInstructions shape: { gold:<heirId|'split'|undefined>, property:..., items:... }
// Returns { gold, items:[...], propertyIds:[...] } for the chosen heir.
export function computeInheritance(parent, heirId){
  const will = parent.willInstructions || {};
  const children = (parent.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false);
  const spouseRel = parent.spouse ? (parent.relationships||[]).find(r=>r.id===parent.spouse&&r.alive!==false) : null;
  const heirs = spouseRel ? [spouseRel, ...children] : [...children];
  const heirCount = Math.max(1, heirs.length);
  const spouseAlive = !!spouseRel;

  // Resolve a single category to the share THIS heir receives.
  // assigned: the will value for the category (heirId | 'split' | undefined)
  // fullValue: total available; splitShare: this heir's fair fraction
  function shareFor(assigned, fullValue, splitShare){
    if(assigned === heirId) return fullValue;          // willed directly to this heir
    if(assigned === 'split') return splitShare;        // split evenly — heir gets fraction
    if(assigned === undefined || assigned === null){
      // Unassigned → surviving spouse, else government (nothing for this heir
      // unless this heir IS the surviving spouse).
      if(spouseAlive && heirId === spouseRel.id) return fullValue;
      return 0;                                        // escheats to spouse or crown
    }
    return 0;                                          // willed to a different heir
  }

  const totalGold = Math.min(150, parent.gold||0);     // cap preserved
  const gold = Math.round(shareFor(will.gold, totalGold, Math.floor(totalGold/heirCount)));

  // Items: max 3 of the parent's non-consumed items form the bequeathable estate.
  const estateItems = (parent.inventory||[]).filter(i=>!i.consumed).slice(0,3);
  let items = [];
  if(will.items === heirId || (will.items === undefined && spouseAlive && heirId === spouseRel?.id)){
    items = estateItems;
  } else if(will.items === 'split'){
    // Deal items round-robin; this heir gets their slice
    const idx = heirs.findIndex(h=>h.id===heirId);
    if(idx >= 0) items = estateItems.filter((_,i)=>i % heirCount === idx);
  }

  // Property: similar logic. 'split' gives this heir a proportional slice of props.
  const estateProps = (parent.properties||[]);
  let propertyIds = [];
  if(will.property === heirId || (will.property === undefined && spouseAlive && heirId === spouseRel?.id)){
    propertyIds = estateProps.map(p=>p.id);
  } else if(will.property === 'split'){
    const idx = heirs.findIndex(h=>h.id===heirId);
    if(idx >= 0) propertyIds = estateProps.filter((_,i)=>i % heirCount === idx).map(p=>p.id);
  }

  // Businesses: inherit alongside property, same will-share logic. Uses will.property
  // as the governing instruction (shops travel with the estate the same way).
  const estateBiz = (parent.businesses||[]);
  let businesses = [];
  if(will.property === heirId || (will.property === undefined && spouseAlive && heirId === spouseRel?.id)){
    businesses = estateBiz;
  } else if(will.property === 'split'){
    const idx = heirs.findIndex(h=>h.id===heirId);
    if(idx >= 0) businesses = estateBiz.filter((_,i)=>i % heirCount === idx);
  }

  return { gold, items, propertyIds, businesses };
}

export function getLegacyRating(score){
  if(score >= 200) return { label:'Legend',      emoji:'🌟' };
  if(score >= 120) return { label:'Memorable',   emoji:'✦' };
  if(score >= 60)  return { label:'Notable',     emoji:'◈' };
  if(score >= 20)  return { label:'Ordinary',    emoji:'○' };
  return                  { label:'Forgotten',   emoji:'·' };
}

// ── STAT AGEING ──────────────────────────────────────────────────────────────
// After age 60: small chance each year to lose DEX or STR
export function applyStatAgeing(char){
  const age = char.age||0;
  if(age < 60) return char;
  let stats = { ...char.stats };
  const log = [];
  // DEX declines from 60
  if(chance((age-60)*1.5) && stats.DEX > 5){
    stats.DEX = Math.max(1, stats.DEX-1);
    log.push({ age, text:'Your reflexes have slowed a little this year.', type:'bad' });
  }
  // STR declines from 65
  if(age >= 65 && chance((age-65)*1.5) && stats.STR > 5){
    stats.STR = Math.max(1, stats.STR-1);
    log.push({ age, text:'Your body reminds you of its limits.', type:'bad' });
  }
  return { ...char, stats, log:[...(char.log||[]),...log] };
}

// ── SPOUSE DETAILS ────────────────────────────────────────────────────────────
const SPOUSE_DETAILS = [
  'a weaver from the eastern quarter',"the blacksmith's eldest",'a former traveller who stayed',
  'a herbalist who knows the old names of things',"the miller's youngest",'a soldier who came home changed',
  'a merchant who dealt in rare things','a farmer who inherited difficult land','a scholar who never finished their studies',
  'a carpenter who builds things to last','a cook whose name everyone knows',"a storyteller who collects other people's endings",
];
export function randomSpouseDetail(){ return SPOUSE_DETAILS[Math.floor(Math.random()*SPOUSE_DETAILS.length)]; }

// ── GENDER & SEXUALITY ───────────────────────────────────────────────────────
export const GENDERS = [
  { id:'male',       label:'Male',        pronouns:{ sub:'he',  obj:'him',  pos:'his'  } },
  { id:'female',     label:'Female',      pronouns:{ sub:'she', obj:'her',  pos:'her'  } },
  { id:'nonbinary',  label:'Non-binary',  pronouns:{ sub:'they',obj:'them', pos:'their'} },
];
export const SEXUALITIES = [
  { id:'straight',   label:'Straight',   attractedTo:{ male:['female'], female:['male'], nonbinary:['male','female'] } },
  { id:'gay',        label:'Gay',        attractedTo:{ male:['male'], female:['female'], nonbinary:['nonbinary'] } },
  { id:'bisexual',   label:'Bisexual',   attractedTo:{ male:['male','female','nonbinary'], female:['male','female','nonbinary'], nonbinary:['male','female','nonbinary'] } },
  { id:'asexual',    label:'Asexual',    attractedTo:{ male:[], female:[], nonbinary:[] } },
];
export function getAttractedTo(char){
  const sex = SEXUALITIES.find(s=>s.id===char.sexuality);
  const gid = char.gender?.id||'male';
  return sex?.attractedTo?.[gid]||[];
}
export function canHaveBioBaby(char){
  // Bio baby only possible between male and female, non-asexual
  const spouse = (char.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false);
  if(!spouse) return false;
  if(char.sexuality==='asexual') return false;
  const charGender = char.gender?.id;
  const spouseGender = spouse.gender||'male';
  return (charGender==='male'&&spouseGender==='female')||(charGender==='female'&&spouseGender==='male');
}

// ── ADVENTURERS GUILD RANKS ───────────────────────────────────────────────────
export const GUILD_RANKS = ['G','F','E','D','C','B','A','S'];
export const GUILD_RANK_LABELS = {
  G:'G-Rank — Novice', F:'F-Rank — Apprentice', E:'E-Rank — Journeyman',
  D:'D-Rank — Seasoned', C:'C-Rank — Veteran', B:'B-Rank — Expert',
  A:'A-Rank — Master', S:'S-Rank — Hero',
};
export const GUILD_RANK_XP = { G:0, F:50, E:150, D:300, C:500, B:800, A:1200, S:2000 };
export function getGuildRank(xp){
  const ranks = GUILD_RANKS;
  for(let i=ranks.length-1;i>=0;i--){
    if((xp||0)>=GUILD_RANK_XP[ranks[i]]) return ranks[i];
  }
  return 'G';
}
export function getNextRank(rank){ const i=GUILD_RANKS.indexOf(rank); return i<GUILD_RANKS.length-1?GUILD_RANKS[i+1]:null; }
export function getRankIndex(rank){ return GUILD_RANKS.indexOf(rank||'G'); }

// ── MARKET NPC GENERATION ─────────────────────────────────────────────────────
const MARKET_FIRST = ['Aldric','Maren','Edric','Sybil','Oswin','Freya','Torben','Isolde','Brix','Calder','Nessa','Wren','Gavril','Lira','Thane','Petra','Coran','Tam','Celia','Ysolde'];
const MARKET_LAST  = ['the Smith','the Wise','of Crestfall','the Elder','Ironhand','Goldleaf','Stoneback','Fairweather','the Quick','of the Hills'];
export function generateMarketNPCs(location, generation){
  // Seeded by location+generation so same NPCs appear all life, fresh each generation
  const seed = location.charCodeAt(0) + (generation||1)*37;
  const rng = (n) => { let x = Math.sin(seed+n)*10000; return x-Math.floor(x); };
  const pick = (arr,n) => arr[Math.floor(rng(n)*arr.length)];
  return [
    { id:'blacksmith', role:'Blacksmith',   emoji:'⚒', name:`${pick(MARKET_FIRST,1)} ${pick(MARKET_LAST,2)}` },
    { id:'herbalist',  role:'Herbalist',    emoji:'🌿', name:`${pick(MARKET_FIRST,3)} ${pick(MARKET_LAST,4)}` },
    { id:'merchant',   role:'Merchant',     emoji:'🪙', name:`${pick(MARKET_FIRST,5)} ${pick(MARKET_LAST,6)}` },
    { id:'tailor',     role:'Tailor',       emoji:'🧵', name:`${pick(MARKET_FIRST,7)} ${pick(MARKET_LAST,8)}` },
    { id:'jeweller',   role:'Jeweller',     emoji:'💎', name:`${pick(MARKET_FIRST,9)} ${pick(MARKET_LAST,10)}` },
  ];
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
// Collision-safe unique id: timestamp + monotonic counter (bare Date.now() collides
// when two ids are minted in the same millisecond; a counter guarantees uniqueness).
let _uidCounter = 0;
export function uid(prefix='id'){ return `${prefix}_${Date.now()}_${(_uidCounter++).toString(36)}${Math.floor(Math.random()*1296).toString(36)}`; }
export function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
export function chance(pct){ return Math.random()*100<pct; }
export function roll4d6(){ const d=[1,2,3,4].map(()=>Math.ceil(Math.random()*6)); d.sort((a,b)=>a-b); return d[1]+d[2]+d[3]; }
// Baby stats: 1-4 range. Stats grow through choices, training, events and work.
export function rollBabyStat(){ return Math.ceil(Math.random()*4); }
export function generateStats(){ return Object.fromEntries(STATS.map(s=>[s,rollBabyStat()])); }
export function applyRaceBonuses(stats,race){ const r={...stats}; if(race?.bonuses) Object.entries(race.bonuses).forEach(([k,v])=>{r[k]=Math.max(1,(r[k]||0)+v);}); return r; }
export function resolveClass(aff){
  if(!aff||!Object.keys(aff).length) return null;
  const sorted = Object.entries(aff).sort((a,b)=>b[1]-a[1]);
  // Require at least 5 affinity points in the top class to resolve
  if(sorted[0][1] < 5) return null;
  return sorted[0][0];
}

// ── NEW CHARACTER ─────────────────────────────────────────────────────────────
export function newCharacter(overrides={}){
  return {
    name:'', race:null, stats:null, classId:null,
    affinities:{}, age:0,
    gold:0, health:100,
    energy:30, energyUsed:{},     // track per-category use
    sickness:null,
    alive:true, deathCause:null,
    location:'village',
    homeLocation:'village',   // where the family home is — anchor for move-out/return logic
    log:[],
    quests:[], activeQuest:null,
    inventory:[], equipment:{},
    skills:{ combat:0, magic:0, stealth:0, persuasion:0, survival:0, faith:0 },
    relationships:[],
    criminalRecord:0,
    crimesDoneThisYear:0,
    usedChoiceEvents:[],
    properties:[],    // { id, type, name, ownedSince, rentedOut, occupantName }
    household:[],     // ids of relationships living with you
    spouse:null,      // relationship id of spouse
    children:[],      // relationship ids of children
    blessings:[], reputation:0, legacyScore:0,
    generation:1, legacy:null,
    yearActions:[],              // log of actions taken this year
    // Fields added post-v4 (use ||0 / ||[] fallbacks but defaulted here for clarity)
    longevityBonus:0,
    activeWard:0,
    recentWorldEvents:[],
    tutorialDone:false,
    worldName:'Aldenmere',
    questConsequences:[],
    usedChoiceEventsAll:{},
    seasonInteractions:{},  // tracks interactions per relationship this season (diminishing returns)
    seasonActions:{},     // tracks actions taken this season
    questDaysUsed:0,
    hasMovedOut:false,
    statTemps:[],         // temporary stat boosts [{stat,v,expiresAge}]
    combineIncomes:false, // combine income with spouse
    pendingMatchmaker:false,    // set when player leaves family home
    currentSeason:0,      // 0=Spring 1=Summer 2=Autumn 3=Winter (within current year)
    currentSeasonStep:0,  // 0=Spring 1=Summer 2=Autumn 3=Winter — advances each press, year fires at step 0 rollover
    startSeasonIdx:null,  // set on first age-up to randomise starting season
    gender:null,           // set at character creation
    sexuality:null,        // set at age 16
    sexualitySet:false,
    guildXP:0,             // adventurers guild progression
    guildRank:'G',
    partyId:null,          // current party membership
    rentedProperty:null,   // { type, annualRent, yearsRented }
    mortgage:null,         // { propertyId, totalDebt, annualPayment }
    marketNPCs:{},         // generated per location
    educationHistory:[],     // kept for save compatibility
    adoptedThisYear:false,
    worshippedDeity:null,
    devotion:{},             // {deityId: xp}
    paladinDeity:null,       // set when paladin evolution fires
    seasonCompletedQuests:[], // clears each season
    seasonFailedQuests:[],    // clears each season
    jobXP:{},                // {jobId: shiftCount}
    lastQuestYear:0,         // for guild rank decay
    spouseDeathYear:null,
    willInstructions:null,   // {goldTo, propertyTo, itemsTo}
    guildJoined:false,
    mealPreference:'bread',
    fedThisSeason:false,
    faction:null,
    completedResearch:[],
    researchProgress:{},     // {topicId: seasonsCompleted}
    activeResearch:null,     // topicId currently being researched
    identifiedItems:[],
    povertyYears:0,
    orphanageRelationship:0,
    seasonNpcInteractions:{},
    businesses:[],           // owned shops — [{id,trade,name,loc,produceId,rawStock,staff:[],boughtAge}]
    masteredTrades:[],       // trade ids the player has reached Master in (shop-offer hook)
    shopOffers:[],           // trade ids with a pending/declined "buy a shop" offer (fire once)
    hirePool:[],             // current season's hire candidates (business tab)
    hirePoolKey:null,        // season key the hire pool was rolled for
    ...overrides,
  };
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────
export async function saveChar(char){ try{ await window.storage.set('fw_char',JSON.stringify(char)); }catch(_){} }
export async function loadChar(){ try{ const r=await window.storage.get('fw_char'); return JSON.parse(r.value); }catch(_){ return null; } }

// ── AI CALL ───────────────────────────────────────────────────────────────────
export async function callAI(prompt, maxTokens=300){
  try {
    const res = await fetch('/api/claude',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ max_tokens:maxTokens, messages:[{role:'user',content:prompt}] }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } catch(_){ return ''; }
}

// ── TAB UNLOCK AGES ───────────────────────────────────────────────────────────
export function getUnlockedTabs(char){
  const age = char.age || 0;
  const tabs = ['life'];
  tabs.push('health');         // health tab available from birth
  if(age >= 3)  tabs.push('people');
  if(age >= 8)  tabs.push('work');
  if(age >= 8)  tabs.push('guild');
  if(age >= 8)  tabs.push('skills');
  if(age >= 8)  tabs.push('market');
  if(age >= 13) tabs.push('crime');
  if(age >= 13) tabs.push('religion');
  if(age >= 16) tabs.push('world');
  if(char.classId && CLASSES[char.classId]?.magic) tabs.push('magic');
  if(age >= 16) tabs.push('property');
  if((char.businesses?.length||0) > 0 || (char.masteredTrades?.length||0) > 0) tabs.push('business');
  return tabs;
}

// ── SPOUSE JOB INCOME ─────────────────────────────────────────────────────────
export const SPOUSE_JOB_INCOME = {
  merchant:20, farmer:12, healer:15, carpenter:10, guard:8, bard:10,
  scribe:8, herbalist:10, blacksmith:14, innkeeper:18, cook:8,
  fighter:6, mage:12, cleric:10, rogue:5, ranger:8, druid:8,
  paladin:10, barbarian:6, warlock:10, default:6,
};
export const DEITY_TEMPLE_COSTS = {
  solara:  { gold:15, days:7  },  // healing temple — accessible
  morthas: { gold:20, days:7  },  // death shrine — quiet, dark
  ferrus:  { gold:25, days:7  },  // forge temple — demands offering
  sylvara: { gold:8,  days:5  },  // forest shrine — just time
  orindel: { gold:10, days:7  },  // roadside shrine — travellers welcome
  vexara:  { gold:30, days:7  },  // hidden temple — costly to find
};

// ── DUAL CLASS SYSTEM ─────────────────────────────────────────────────────────
export const DUAL_CLASS_RULES = [
  { primary:'fighter',   statReq:{WIS:10}, secondary:'tactician',  label:'Tactician',   questBonus:{scouting:10,escort:10} },
  { primary:'barbarian', statReq:{WIS:10}, secondary:'tactician',  label:'Tactician',   questBonus:{scouting:10} },
  { primary:'chef',      statReq:{STR:10}, secondary:'brawler',    label:'Brawler',     questBonus:{combat:8} },
  { primary:'farmer',    statReq:{CON:12}, secondary:'survivor',   label:'Survivor',    questBonus:{fetch:15,scouting:10} },
  { primary:'carpenter', statReq:{INT:10}, secondary:'engineer',   label:'Engineer',    questBonus:{dungeon:15,fetch:10} },
  { primary:'merchant',  statReq:{CHA:12}, secondary:'diplomat',   label:'Diplomat',    questBonus:{negotiation:15} },
  { primary:'mage',      statReq:{CON:10}, secondary:'battlemage', label:'Battle-Mage', questBonus:{combat:10,dungeon:10} },
  { primary:'cleric',    statReq:{STR:10}, secondary:'templar',    label:'Templar',     questBonus:{combat:8,undead:10} },
  { primary:'rogue',     statReq:{CHA:10}, secondary:'spy',        label:'Spy',         questBonus:{assassination:15,negotiation:10} },
];
export function getDualClass(char){
  if(!char.classId || !char.stats) return null;
  const rule = DUAL_CLASS_RULES.find(r=>r.primary===char.classId &&
    Object.entries(r.statReq).every(([s,v])=>(char.stats[s]||0)>=v));
  return rule||null;
}

export function getSpouseIncome(spouse){
  const job = spouse?.job||spouse?.classId||'default';
  return SPOUSE_JOB_INCOME[job]||SPOUSE_JOB_INCOME.default;
}

// ── BLESSING EFFECTS ──────────────────────────────────────────────────────────
// Applied annually in handleAgeUp
// Blessing effects per deity — indexed by deity id, per devotion level
export const BLESSING_EFFECTS = {
  solara:  [
    { healthBonus:3, sicknessMod:-2 },                          // level 1
    { healthBonus:5, sicknessMod:-4 },                          // level 2
    { healthBonus:8, sicknessMod:-6, questBonus:5 },            // level 3
  ],
  morthas: [
    { legacyBonus:1, crimeMod:-5 },
    { legacyBonus:2, crimeMod:-10 },
    { legacyBonus:4, crimeMod:-15, questBonus:5 },
  ],
  ferrus:  [
    { combatBonus:5 },
    { combatBonus:10, statBonus:{STR:1} },
    { combatBonus:15, statBonus:{STR:1}, questBonus:10 },
  ],
  sylvara: [
    { herbBonus:2, travelMod:-2 },
    { herbBonus:4, travelMod:-4 },
    { herbBonus:6, travelMod:-6, sicknessMod:-2, questBonus:5 },
  ],
  orindel: [
    { goldWindfall:3, travelMod:-2 },
    { goldWindfall:6, travelMod:-3 },
    { goldWindfall:10, travelMod:-5, questBonus:5 },
  ],
  vexara:  [
    { socialBonus:5 },
    { socialBonus:10, statBonus:{CHA:1} },
    { socialBonus:15, statBonus:{CHA:1}, questBonus:5 },
  ],
};
// Quest injury calculation helper
export function calcQuestInjury(quest, char, success){
  const danger = QUEST_TYPE_DANGER[quest.questType]||{injuryBase:5,deathBase:0};
  const rankDiff = RANKS_ORDER.indexOf(quest.rank) - RANKS_ORDER.indexOf(char.guildRank||'G');
  const rankMod = rankDiff===1?15:rankDiff>=2?30:0;
  const party = char.partyMembers||[];
  const healerClasses = ['cleric','paladin','druid'];
  const healerMod = Math.min(40, party.filter(p=>healerClasses.includes(p.classId)).length*15);
  // Competence: combat skill and out-ranking the quest make a seasoned adventurer
  // far less likely to die. This lets a long career be survivable while reckless
  // over-reach stays lethal. Death base is scaled down — a flat per-quest rate
  // compounds brutally over a 100+ quest career, so the per-quest floor must be low.
  const combat = char.skills?.combat || 0;
  const overRank = Math.max(0, -rankDiff);              // quests below your rank are safer
  const competence = combat * 1.2 + overRank * 3;       // each combat level ~1.2%, each rank above ~3%
  const injuryChance = Math.max(0, danger.injuryBase + rankMod - healerMod - combat*2 + (success?0:10));
  const deathChance  = Math.max(0,
    danger.deathBase * 0.35                              // base lethality cut to ~1/3
    + (rankDiff>=1?4:0)
    - healerMod*0.4
    - competence
    + (success?0:4));
  return { injuryChance, deathChance };
}

export function getDeityBlessing(char, deityId){
  const devotionXP = (char.devotion||{})[deityId]||0;
  const level = devotionXP >= 200 ? 2 : devotionXP >= 75 ? 1 : devotionXP >= 20 ? 0 : -1;
  if(level < 0) return null;
  return { ...(BLESSING_EFFECTS[deityId]?.[level]||{}), level:level+1, deityId };
}
export function getActiveBlessingEffects(char){
  if(!char.worshippedDeity) return {};
  return getDeityBlessing(char, char.worshippedDeity)||{};
}

// ── WORLD EVENTS ─────────────────────────────────────────────────────────────
export const WORLD_EVENTS = [
  { id:'we_harvest',     name:'Good Harvest',       emoji:'🌾', weight:8, minAge:5, locations:['village','town','forest'],
    desc:'The fields yielded more than expected this year.',
    effects:{ farmPenalty:false }, playerEffect:(char)=>{
      const hasFarmerParent = (char.relationships||[]).some(r=>r.type==='parent'&&r.job==='farmer');
      return hasFarmerParent ? { gold:rand(8,20), text:'Your parents had a good harvest. They slipped you some extra gold.' } : null;
    }, choice:null },
  { id:'we_drought',     name:'Drought',             emoji:'☀️', weight:5, minAge:5, locations:['village','town','forest'],
    desc:'The wells run low. Crops struggle.',
    effects:{ farmPenalty:true }, playerEffect:(char)=>{
      return { goldMod:-5, text:'The drought has made everything more expensive.' };
    }, choice:null },
  { id:'we_market',      name:'Grand Market',        emoji:'🏪', weight:6, minAge:13, locations:['town','city'],
    desc:'Traders from across the realm gather in '+WORLD.town+'.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Visit the Grand Market?', yes:{ gold:rand(5,15), text:'You found some bargains at the Grand Market.' }, no:null }},
  { id:'we_festival',    name:'Harvest Festival',    emoji:'🎪', weight:6, minAge:8, locations:['village','town'],
    desc:'The whole of '+WORLD.village+' celebrates.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Join the festival?', yes:{ socialBonus:10, text:'The festival brought people together. Relationships warmed.' }, no:null }},
  { id:'we_plague',      name:'Sickness Spreads',    emoji:'🤒', weight:4, minAge:5,
    desc:'A fever moves through the settlements.',
    effects:{ sicknessBoost:10 }, playerEffect:(char)=>null, choice:null },
  { id:'we_war',         name:'Border Conflict',     emoji:'⚔️', weight:3, minAge:16,
    desc:'Skirmishes on the eastern border.',
    effects:{ violenceBoost:8 }, playerEffect:(char)=>null,
    choice:{ text:'Volunteer for the defence?', yes:{ affinity:{fighter:3,barbarian:2}, gold:rand(10,25), text:'You answered the call. It was ugly but you were paid.' }, no:null }},
  { id:'we_noble',       name:'Noble Visits',        emoji:'👑', weight:5, minAge:16, locations:['town','city'],
    desc:'A noble from Ironspire tours the region.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Seek an audience?', yes:{ chaCheck:true, successGold:30, text:'The noble was impressed. A small purse followed.' }, no:null }},
  { id:'we_fire',        name:'Fire in '+WORLD.town, emoji:'🔥', weight:3, minAge:10, locations:['town','city'],
    desc:'Part of Crestfall burned. Rebuilding begins.',
    effects:{ carpenterBonus:true }, playerEffect:(char)=>{
      const isCarpenter = char.classId==='carpenter';
      return isCarpenter ? { gold:rand(15,30), text:'Your carpentry skills are in high demand after the fire.' } : null;
    }, choice:null },
  { id:'we_discovery',   name:'Ancient Ruin Found',  emoji:'🏛', weight:4, minAge:14, locations:['ruins','mountains','forest'],
    desc:'Explorers uncovered something in the Old Realm.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Investigate the discovery?', yes:{ affinity:{mage:2,rogue:2}, gold:rand(0,20), text:'You found something curious in the ruins.' }, no:null }},
  { id:'we_coldwinter',  name:'Bitter Winter',       emoji:'❄️', weight:5, minAge:5,
    desc:'The hardest winter in living memory.',
    effects:{ sicknessBoost:8, farmPenalty:true }, playerEffect:(char)=>{
      return { healthMod:-5, text:'The cold took its toll on you this year.' };
    }, choice:null },
  { id:'we_prosperity',  name:'Prosperous Season',   emoji:'💰', weight:6, minAge:8,
    desc:'Trade flows freely across Aldenmere.',
    effects:{}, playerEffect:(char)=>{
      const isMerchant = char.classId==='merchant';
      return isMerchant ? { gold:rand(10,20), text:'The prosperous season was good for business.' } : { gold:rand(2,6), text:'The prosperous season lifted all boats.' };
    }, choice:null },
  { id:'we_bandits',     name:'Bandit Surge',        emoji:'🗡', weight:4, minAge:12, locations:['village','town','forest','mountains'],
    desc:'The roads between settlements grow dangerous.',
    effects:{ violenceBoost:5 }, playerEffect:(char)=>null,
    choice:{ text:'Help clear the roads?', yes:{ affinity:{fighter:2,ranger:2}, gold:rand(5,15), text:'You helped make the roads safer.' }, no:null }},
  { id:'we_temple',      name:'Temple Celebration',  emoji:'⛪', weight:4, minAge:8, locations:['village','town','city'],
    desc:'The temples hold a grand ceremony.',
    effects:{}, playerEffect:(char)=>{
      const devoted = (char.devotion&&Object.values(char.devotion).some(v=>v>=20));
      return devoted ? { devotionBonus:5, text:'The ceremony deepened your faith.' } : null;
    }, choice:null },
  { id:'we_scholar',     name:'Scholar Visits',      emoji:'📚', weight:4, minAge:13, locations:['town','city'],
    desc:'A renowned scholar takes residence in Crestfall.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Study under the scholar?', yes:{ statBonus:{INT:1}, text:'A season of learning. Your mind is sharper.' }, no:null }},
  { id:'we_tournament',  name:'Grand Tournament',    emoji:'🏆', weight:3, minAge:16, locations:['town','city'],
    desc:'A fighting tournament draws competitors from across the realm.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Enter the tournament?', yes:{ combatClass:true, gold:rand(0,50), text:'You competed. The crowd was loud.' }, no:null }},
  { id:'we_mine_strike', name:'Rich Vein Found',     emoji:'⛏', weight:4, minAge:14, locations:['mountains'],
    desc:'A rich ore vein discovered in the Ashen Peaks.',
    effects:{}, playerEffect:(char)=>{
      return ['miner','carpenter'].includes(char.classId||'') ? { gold:rand(15,30), text:'You knew where to look.' } : { gold:rand(3,8), text:'The discovery boosted the local economy.' };
    }, choice:null },
  { id:'we_beast',       name:'Creature Sighted',    emoji:'🐺', weight:4, minAge:12, locations:['forest','mountains','ruins'],
    desc:'Something large and dangerous has been spotted in the wilds.',
    effects:{ violenceBoost:5 }, playerEffect:(char)=>null,
    choice:{ text:'Hunt it down?', yes:{ affinity:{ranger:2,fighter:2}, gold:rand(10,25), text:'The creature is dealt with. The wilds are safer.' }, no:null }},
  { id:'we_court_scandal',name:'Court Scandal',      emoji:'👑', weight:3, minAge:18, locations:['city'],
    desc:'A scandal at the Ironspire court. Alliances are shifting.',
    effects:{}, playerEffect:(char)=>null,
    choice:{ text:'Get involved?', yes:{ affinity:{rogue:2,bard:2}, gold:rand(20,50), text:'You navigated the politics. It was worth it.' }, no:null }},
];

// ── MAGIC EXPANSION ──────────────────────────────────────────────────────────
export const RITUALS = [
  { id:'rit_ward',      name:'Ward of Protection', cost:{gold:20,days:14}, class_req:['mage','cleric','warlock'],
    effect:'sicknessMod:-8 for one year, injury chance -10%',
    apply:(char)=>({...char, activeWard:true, wardExpiry:(char.age||0)+1}) },
  { id:'rit_prosperity',name:'Prosperity Ritual',  cost:{gold:30,days:21}, class_req:['mage','druid'],
    effect:'+20g next age-up',
    apply:(char)=>({...char, prosperityRitual:true}) },
  { id:'rit_binding',   name:'Ritual of Binding',  cost:{gold:25,days:14}, class_req:['mage','cleric','druid'],
    effect:'Target relationship cannot decay below 40 for one year',
    apply:(char)=>({...char, bindingActive:true}) },
  { id:'rit_curse',     name:'Curse',              cost:{gold:15,days:7},  class_req:['warlock','mage'],
    effect:'Target NPC relationship -30, chance of blowback',
    apply:(char)=>char },
];

export const MAGIC_RESEARCH_TOPICS = [
  { id:'mr_elemental',  name:'Elemental Attunement',  seasons:4,  goldPerSeason:5,  statReq:{INT:6},  unlock:'All magical quest success +5% permanently',         effect:{questTypeBonus:{magical:5,undead:5}},  desc:'Study of raw elemental forces. Beginner-level research.' },
  { id:'mr_mindseye',   name:"Mind's Eye",            seasons:6,  goldPerSeason:8,  statReq:{WIS:7},  unlock:'WIS +1 permanently on completion',                  effect:{permStat:{WIS:1}},                    desc:'Expanding perception beyond ordinary senses. Intermediate study.' },
  { id:'mr_arcane_con', name:'Arcane Constitution',   seasons:8,  goldPerSeason:10, statReq:{CON:6,INT:7}, unlock:'Sickness chance -5% permanently',            effect:{permSickMod:-5},                      desc:'Binding arcane energy to the body itself. Advanced work.' },
  { id:'mr_time',       name:'Temporal Studies',      seasons:20, goldPerSeason:15, statReq:{INT:9,WIS:8}, unlock:'Slow ageing — lose one fewer season per year', effect:{ageSlowMod:true},                     desc:'The most dangerous research known. Years of commitment required.' },
  { id:'mr_warding',    name:'Advanced Warding',      seasons:5,  goldPerSeason:6,  statReq:{WIS:6},  unlock:'Ward absorbs +10 extra damage',                     effect:{wardBonus:10},                        desc:'Deepening the protective arts. Practical and reliable.' },
  { id:'mr_soul',       name:'Soul Resonance',        seasons:12, goldPerSeason:12, statReq:{WIS:8,INT:8}, unlock:'Relationships cannot fall below 20 score',    effect:{relFloor:20},                         desc:'A binding of spirit to spirit. Intermediate-advanced.' },
];

// ── CURSED ITEMS ─────────────────────────────────────────────────────────────
export const CURSED_ITEM_IDS = ['cursed_ring','cursed_amulet','cursed_blade','cursed_cloak'];
export const CURSED_ITEMS = {
  cursed_ring:   { name:'Strange Ring',    emoji:'💍', price:15, bonus:{stat:'CHA',v:2}, curse:'health -3 per season', curseStat:'health', curseV:-3, revealAfter:2 },
  cursed_amulet: { name:'Dark Amulet',     emoji:'📿', price:20, bonus:{stat:'WIS',v:2}, curse:'sickness chance +10%', curseStat:'sicknessBoost', curseV:10, revealAfter:3 },
  cursed_blade:  { name:'Twitching Blade', emoji:'🗡', price:25, bonus:{stat:'STR',v:3}, curse:'criminalRecord +1 per season', curseStat:'criminalRecord', curseV:1, revealAfter:2 },
  cursed_cloak:  { name:'Whispering Cloak',emoji:'🧥', price:18, bonus:{stat:'DEX',v:2}, curse:'relationship decay doubled', curseStat:'relDecay', curseV:2, revealAfter:3 },
};

// ── REPUTATION EXPANSION ─────────────────────────────────────────────────────
export function getFullReputation(char){
  const criminal = (char.criminalRecord||0)>5?'Criminal':(char.criminalRecord||0)>2?'Wanted':'Clean';
  const avgScore = (() => {
    const rels = (char.relationships||[]).filter(r=>r.alive!==false&&r.score!==undefined);
    return rels.length ? Math.round(rels.reduce((s,r)=>s+r.score,0)/rels.length) : 50;
  })();
  const betrayals = char.betrayalCount||0;
  const social = betrayals>=2?'Betrayer':avgScore>=75?'Beloved':avgScore>=50?'Respected':avgScore>=30?'Neutral':'Cold';
  const guildRank = char.guildRank||'G';
  const guild = guildRank==='S'?'Legendary':['A','B'].includes(guildRank)?'Renowned':['C','D'].includes(guildRank)?'Skilled':guildRank==='G'?'Unknown':'Novice';
  const maxDev = Math.max(0,...Object.values(char.devotion||{}));
  const faith = maxDev>=200?'Devoted':maxDev>=75?'Faithful':maxDev>=20?'Believer':'Agnostic';
  return { criminal, social, guild, faith };
}

// ── WARD HELPER — apply damage through active ward ────────────────────────
export function applyDamage(char, amount){
  const ward = char.activeWard||0;
  if(ward > 0){
    const absorbed = Math.min(ward, amount);
    return { ...char, activeWard:ward-absorbed, health:Math.max(1,(char.health||100)-(amount-absorbed)) };
  }
  return { ...char, health:Math.max(1,(char.health||100)-amount) };
}

// ── MEND HELPER — check if property upkeep is waived this year ────────────
export function getMaintenance(property, currentAge){
  if(property.mendedAge === currentAge-1) return 0; // mend waives one year
  return PROPERTY_MAINTENANCE[property.type]||0;
}

// ── WORLD EVENTS ─────────────────────────────────────────────────────────────
// Random events that affect everyone — fire on age-up with low probability

export function pickWorldEvent(age, recentWorldEvents=[], location='village'){
  if(!chance(20)) return null;
  const onCooldown = new Set(recentWorldEvents.map(e=>e.id));
  const pool = WORLD_EVENTS.filter(e =>
    (!e.minAge || age >= e.minAge) &&
    (age >= 5) && // no world events for infants
    !onCooldown.has(e.id) &&
    (!e.locations || e.locations.includes(location))
  );
  if(!pool.length) return null;
  const total = pool.reduce((s,e)=>s+(e.weight||5),0);
  let r = Math.random()*total;
  for(const e of pool){ r -= (e.weight||5); if(r<=0) return e; }
  return pool[pool.length-1];
}

// ── SKILL GATES ───────────────────────────────────────────────────────────────
// What each skill level unlocks beyond quest bonuses
export const SKILL_GATES = {
  combat: [
    { level:3, unlock:'Access to Iron-tier quests without penalty' },
    { level:5, unlock:'Duel action available' },
    { level:8, unlock:'You can train others — +2g/session' },
  ],
  stealth: [
    { level:3, unlock:'Crime catch chance -15%' },
    { level:5, unlock:'Infiltration quests available' },
    { level:7, unlock:'Pickpocket passive income option' },
  ],
  persuasion: [
    { level:3, unlock:'Better negotiation results on deals' },
    { level:5, unlock:'Diplomatic quest paths open' },
    { level:8, unlock:'Can talk out of criminal charges once per year' },
  ],
  survival: [
    { level:3, unlock:'Forest/Mountain travel costs -3⚡' },
    { level:5, unlock:'Herb gathering income doubles' },
    { level:7, unlock:'Immune to harsh weather penalties' },
  ],
  faith: [
    { level:3, unlock:'Blessing chance +20%' },
    { level:5, unlock:'Heal 10hp free once per year' },
    { level:8, unlock:'Sickness chance halved' },
  ],
  magic: [
    { level:3, unlock:'Basic spells available' },
    { level:5, unlock:'Advanced spells available' },
    { level:8, unlock:'Ritual magic — reshape one stat per decade' },
  ],
};

// ── DYNASTY TREE ──────────────────────────────────────────────────────────────
export async function saveDynastyTree(entry){
  try{
    const r = await window.storage.get('fw_dynasty');
    const tree = r ? JSON.parse(r.value) : [];
    tree.push(entry);
    await window.storage.set('fw_dynasty', JSON.stringify(tree));
  } catch(_){}
}
export async function loadDynastyTree(){
  try{
    const r = await window.storage.get('fw_dynasty');
    return r ? JSON.parse(r.value) : [];
  } catch(_){ return []; }
}

// ── MULTI-SLOT SAVES ──────────────────────────────────────────────────────────
export async function saveCharSlot(char, slot=0){
  try{ await window.storage.set(`fw_char_${slot}`, JSON.stringify(char)); }catch(_){}
}
export async function loadCharSlot(slot=0){
  try{ const r=await window.storage.get(`fw_char_${slot}`); return JSON.parse(r.value); }catch(_){ return null; }
}
export async function listSaveSlots(){
  try{
    // Fetch all slots in parallel with Promise.all
    const results = await Promise.all([0,1,2].map(i=>
      window.storage.get(`fw_char_${i}`).catch(()=>null)
    ));
    return results.map((r,i)=>{
      if(!r) return null;
      try{
        const c=JSON.parse(r.value);
        return { slot:i, name:c.name, age:c.age, race:c.race?.name, classId:c.classId, alive:c.alive!==false };
      } catch(_){ return null; }
    });
  } catch(_){ return [null,null,null]; }
}
export async function deleteCharSlot(slot){
  try{ await window.storage.delete(`fw_char_${slot}`); }catch(_){}
}

// ── META-PROGRESSION (across all runs) ────────────────────────────────────────
export async function loadMeta(){
  try{ const r=await window.storage.get('fw_meta'); return r?JSON.parse(r.value):{totalLives:0,bestScore:0,unlockedRaces:[],achievements:[]}; }catch(_){ return {totalLives:0,bestScore:0,unlockedRaces:[],achievements:[]}; }
}
export async function saveMeta(meta){
  try{ await window.storage.set('fw_meta',JSON.stringify(meta)); }catch(_){}
}
// Achievements
export const ACHIEVEMENTS = [
  { id:'first_class',    title:'A Path Revealed',    emoji:'✦',  desc:'Achieve your first class.',                   check:(c)=>!!c.classId },
  { id:'first_property', title:'A Place to Call Home',emoji:'🏠', desc:'Own your first property.',                   check:(c)=>(c.properties||[]).length>0 },
  { id:'first_child',    title:'A New Generation',   emoji:'👶', desc:'Have a child.',                               check:(c)=>(c.relationships||[]).some(r=>r.type==='child') },
  { id:'married',        title:'Bound',               emoji:'💍', desc:'Marry someone.',                             check:(c)=>(c.relationships||[]).some(r=>r.type==='spouse') },
  { id:'old_age',        title:'A Long Life',         emoji:'🕯', desc:'Reach age 70.',                             check:(c)=>c.age>=70 },
  { id:'notorious',      title:'Notorious',           emoji:'⚠️', desc:'Earn a criminal record of 5+.',             check:(c)=>(c.criminalRecord||0)>=5 },
  { id:'wealthy',        title:'Wealthy',             emoji:'💰', desc:'Accumulate 500 gold.',                      check:(c)=>c.gold>=500 },
  { id:'legend',         title:'Legend',              emoji:'🌟', desc:'Achieve a legacy score of 200+.',            check:(c)=>(c.legacyScore||0)>=200 },
  { id:'manor',          title:'Lord of the Manor',  emoji:'🏰', desc:'Own a Manor House.',                        check:(c)=>(c.properties||[]).some(p=>p.type==='manor') },
  { id:'dynasty3',       title:'Three Generations',  emoji:'⭐', desc:'Play three consecutive dynasty lives.',      check:(_,meta)=>(meta?.totalLives||0)>=3 },
  { id:'quester',        title:'Veteran Adventurer', emoji:'🗺', desc:'Complete 10 quests in one life.',            check:(c)=>(c.quests||[]).length>=10 },
  { id:'skills_master',  title:'Master of Their Craft',emoji:'🎓',desc:'Reach skill level 8 in any skill.',        check:(c)=>Object.values(c.skills||{}).some(v=>v>=8) },
];

// ── QUEST CONSEQUENCES ────────────────────────────────────────────────────────
// Stored in char.questConsequences[] — fire as events in future years
export const QUEST_CONSEQUENCE_TEMPLATES = [
  { id:'qc_merchant_work', delay:1, text:'The merchant you helped last year sent more work your way.', effect:{ gold:()=>rand(10,25) }, type:'good' },
  { id:'qc_enemy_trouble', delay:2, text:'Someone you wronged on a job has tracked you down. It cost you.', effect:{ gold:()=>-rand(8,20), health:-10 }, type:'bad' },
  { id:'qc_reputation_up', delay:1, text:'Word of your work has spread. People ask for you by name.', effect:{ stat:'CHA', v:1 }, type:'good' },
  { id:'qc_debt_called',   delay:2, text:'A favour you called in came good. Old coin, but it spends.', effect:{ gold:()=>rand(15,30) }, type:'good' },
  { id:'qc_grudge',        delay:3, text:'An old enemy has not forgotten. They made their displeasure felt.', effect:{ health:-15 }, type:'bad' },
];

// ── CLASS-SPECIFIC EVENTS ─────────────────────────────────────────────────────
// Fire on age-up when character has a class — one per decade, one-time each
// Proficiency career event — fires when a job reaches level 3 (30 shifts)
export const PROFICIENCY_CAREER_MAP = {
  farm:         { classId:'farmer',    text:'Years of tending the land have shaped you into something more than a labourer. You know this land.' },
  smithy:       { classId:'fighter',   text:'The forge has made you strong. You think differently now — everything is a problem of force and pressure.' },
  herb:         { classId:'druid',     text:'The forest knows you now. You have stopped collecting plants and started listening to them.' },
  for_herb:     { classId:'druid',     text:'You have spent enough seasons among wild things that the boundary between you and them is thinner than it was.' },
  tend_animals: { classId:'druid',     text:'You have tended enough lives that you understand them — the rhythm, the trust, what they need before they ask.' },
  for_tend:     { classId:'druid',     text:'Wild things come to you now. That does not happen by accident.' },
  guard:        { classId:'fighter',   text:'You have kept watch for enough nights that violence no longer frightens you. It is simply work.' },
  city_guard:   { classId:'knight',    text:'Years of loyal service to the city have marked you as something more than a guard. The distinction is beginning to matter.' },
  vkitchen:     { classId:'chef',      text:'You have fed enough people to understand what food means. The kitchen is yours now.' },
  vcarpent:     { classId:'carpenter', text:'Your hands know wood the way others know language. Something has shifted.' },
  shop_asst:    { classId:'merchant',  text:'You understand markets now — not the theory but the smell of them, the timing.' },
  city_trader:  { classId:'merchant',  text:'The city market has made you sharp. You see angles others miss.' },
  courier:      { classId:'ranger',    text:'You have run enough roads in enough weather that the land between places has become familiar.' },
  scribe:       { classId:'bard',      text:'Words on a page led you somewhere unexpected. You have started writing things no one asked for.' },
  healer:       { classId:'cleric',    text:'You have tended enough wounds to know there is something beyond medicine at work here.' },
};

export const CLASS_EVENTS = {
  fighter: [
    { id:'ce_fighter1', minAge:20, maxAge:35, title:'Tested in Battle', text:'A real fight. Not a brawl — something with stakes. You learn what you are made of.', choices:[
      { text:'Meet it head on.', outcome:'You came through. Not clean, but upright.', stat:'STR' },
      { text:'Fight smart, not hard.', outcome:'Tactical. Efficient. Nobody said it had to look heroic.', stat:'DEX' },
    ]},
    { id:'ce_fighter2', minAge:40, title:'The Weight of It', text:'After enough violence you start to understand what it costs. Not just physically.', choices:[
      { text:'Carry it. It made you who you are.', outcome:'Heavier, but yours.', stat:'CON' },
      { text:'Find something worth protecting.', outcome:'Purpose changes the weight.', stat:'WIS' },
    ]},
  ],
  mage: [
    { id:'ce_mage1', minAge:18, maxAge:35, title:'The Boundary', text:'You push your magic further than is safe. Something pushes back.', choices:[
      { text:'Hold your ground. Understand it.', outcome:'You came back with knowledge that cost something.', stat:'INT' },
      { text:'Pull back. Live to study another day.', outcome:'Wisdom over ambition. For now.', stat:'WIS' },
    ]},
    { id:'ce_mage2', minAge:40, title:'The Question', text:'After years of study you arrive at a question you cannot answer. The world is stranger than you thought.', choices:[
      { text:'Accept the mystery.', outcome:'Some questions are the answer.', stat:'WIS' },
      { text:'Dig deeper.', outcome:'Further in. What you find changes you.', stat:'INT' },
    ]},
  ],
  cleric: [
    { id:'ce_cleric1', minAge:18, title:'The Test of Faith', text:'Something happens that your faith has no answer for. You sit with it for a long time.', choices:[
      { text:'Faith is choosing to act anyway.', outcome:'You acted. That was the answer.', stat:'WIS' },
      { text:'Pray until something shifts.', outcome:'It shifted. You are not sure what moved.', stat:'WIS' },
    ]},
  ],
  rogue: [
    { id:'ce_rogue1', minAge:20, maxAge:40, title:'The Job That Went Wrong', text:'Something you planned carefully came apart. Someone saw you who should not have.', choices:[
      { text:'Bluff your way out.', outcome:'You walked out the front door. Nobody stopped you.', stat:'CHA' },
      { text:'Run and not look back.', outcome:'Clean escape. You left things behind.', stat:'DEX' },
    ]},
  ],
  bard: [
    { id:'ce_bard1', minAge:18, title:'The Audience', text:'You perform for people who need it. Really need it. The weight of that is different.', choices:[
      { text:'Give everything.', outcome:'They remembered it. So did you.', stat:'CHA' },
      { text:'Give what you can.', outcome:'Enough. Sometimes enough is the right amount.', stat:'WIS' },
    ]},
  ],
  druid: [
    { id:'ce_druid1', minAge:20, title:'The Turning', text:'The forest shows you something you were not ready for. The cycle does not care about readiness.', choices:[
      { text:'Accept your place in it.', outcome:'Smaller than you thought. That is not a bad thing.', stat:'WIS' },
      { text:'Learn its language.', outcome:'You are starting to understand what the trees know.', stat:'WIS' },
    ]},
  ],
  paladin: [
    { id:'ce_paladin1', minAge:20, title:'The Impossible Choice', text:'You cannot save everyone. The moment makes that clear with no room for argument.', choices:[
      { text:'Save who you can.', outcome:'You did not fail. You did what was possible.', stat:'CON' },
      { text:'Carry everyone you could not.', outcome:'Heavy. But you carry it standing up.', stat:'WIS' },
    ]},
  ],
  merchant: [
    { id:'ce_merchant1', minAge:20, title:'The Deal', text:'The biggest deal you have seen so far. If it works, everything changes.', choices:[
      { text:'Take it.', outcome:'The risk is taken. You will find out what you are made of.', stat:'CHA' },
      { text:'Walk away and build to it.', outcome:'Patience is its own investment.', stat:'WIS' },
    ]},
  ],
  farmer: [
    { id:'ce_farmer1', minAge:20, title:'The Bad Year', text:'The harvest failed. Not partly — completely. You look at the empty field for a long time.', choices:[
      { text:'Start again from nothing.', outcome:'You did. That is the whole of it.', stat:'CON' },
      { text:'Find another way through.', outcome:'Resourceful. The land teaches that or it breaks you.', stat:'WIS' },
    ]},
  ],
  carpenter: [
    { id:'ce_carpenter1', minAge:20, title:'The Commission', text:'Someone asks you to build the most important thing they will ever own. They trust you completely.', choices:[
      { text:'Build it to last a lifetime.', outcome:'It will outlast you both.', stat:'STR' },
      { text:'Build it to be beautiful.', outcome:'Useful and beautiful. You did not have to choose.', stat:'WIS' },
    ]},
  ],
  ranger: [
    { id:'ce_ranger1', minAge:18, maxAge:35, title:'Alone in the Wild', text:'Three days out. No one knows where you are. The wilderness is testing something in you.', choices:[
      { text:'Go deeper.', outcome:'You came back knowing things about yourself that no one else needed to know.', stat:'WIS' },
      { text:'Trust what you have learned.', outcome:'The forest gave you what you needed. You gave it your attention.', stat:'DEX' },
    ]},
  ],
  barbarian: [
    { id:'ce_barb1', minAge:18, maxAge:40, title:'The Red Moment', text:'The rage took you further than you meant to go. You stood over the result and breathed hard.', choices:[
      { text:'Own it. That is who you are.', outcome:'Raw and real. You stopped pretending otherwise.', stat:'STR' },
      { text:'Learn to aim it better.', outcome:'The rage is a tool. You are starting to understand the handle.', stat:'CON' },
    ]},
  ],
  warlock: [
    { id:'ce_warlock1', minAge:18, maxAge:35, title:'The Price', text:'Whatever you made a bargain with, it has come to collect. Not all of it. But some.', choices:[
      { text:'Pay it without flinching.', outcome:'You paid. It was worth it. You think.', stat:'CON' },
      { text:'Negotiate.', outcome:'It accepted your counteroffer. You are not sure that was the better outcome.', stat:'CHA' },
    ]},
  ],
  warlock: [
    { id:'ce_wlk1', minAge:14, maxAge:22, title:'The Bargain', text:'Something spoke to you. Not a god. Something older. Or stranger. You listened.', choices:[
      { text:'Accept what is offered.',     outcome:'Power arrives. So does a debt you cannot fully see.', affinity:{warlock:3,mage:1}, stat:'INT', effect:{stat:'INT',v:1} },
      { text:'Ask what the cost is first.', outcome:'It told you. You agreed anyway.',                     affinity:{warlock:2,rogue:1}, stat:'WIS' },
    ]},
    { id:'ce_wlk2', minAge:22, maxAge:45, title:'The Patron Calls', text:'Whatever you bargained with wants something. It is not unreasonable. Just unsettling.', choices:[
      { text:'Fulfil the obligation.',  outcome:'The debt shrinks. The power holds.',               affinity:{warlock:3}, stat:'INT', effect:{stat:'INT',v:1} },
      { text:'Delay. See what happens.', outcome:'Warlocks who delay pay more later. You know this.', affinity:{warlock:1,rogue:2}, stat:'CHA' },
    ]},
  ],
  chef: [
    { id:'ce_chef1', minAge:20, title:'The Table', text:'You cook for someone who has not eaten properly in a very long time. They cannot pay you.', choices:[
      { text:'Feed them anyway.', outcome:'You understand something about your craft you did not before.', stat:'WIS' },
      { text:'Teach them to cook for themselves.', outcome:'A longer gift.', stat:'WIS' },
    ]},
  ],
};

// ── MARKET ITEMS ─────────────────────────────────────────────────────────────
// Items available from market stalls — double-tap to buy
export const MARKET_ITEMS = {
  blacksmith: [
    { id:'dagger',       name:'Hunting Dagger',     emoji:'🗡', cost:12,  rarity:'common',    statBonus:{DEX:1},  desc:'Light. Fast. Useful.' },
    { id:'shield',       name:'Wooden Shield',      emoji:'🛡', cost:15,  rarity:'common',    statBonus:{CON:1},  desc:'Better than nothing. Mostly.' },
    { id:'sword',        name:'Iron Sword',         emoji:'⚔️', cost:25,  rarity:'common',    statBonus:{STR:1},  desc:'Well-balanced. Holds an edge.' },
    { id:'amulet',       name:'Iron Amulet',        emoji:'🔮', cost:35,  rarity:'common',    statBonus:{CON:1},  desc:'Worn by fighters for luck.' },
    { id:'chainmail',    name:'Chainmail',          emoji:'🔗', cost:45,  rarity:'uncommon',  statBonus:{CON:2},  desc:'Heavy but honest protection.' },
    { id:'steel_sword',  name:'Steel Longsword',    emoji:'⚔️', cost:90,  rarity:'uncommon',  statBonus:{STR:2},  desc:'Forged steel. A soldier\u2019s blade.' },
    { id:'plate',        name:'Plate Armour',       emoji:'🛡', cost:180, rarity:'rare',      statBonus:{CON:3,STR:1}, desc:'Full plate. Few can afford it, fewer can move in it.' },
    { id:'runeblade',    name:'Runed Greatsword',   emoji:'⚔️', cost:340, rarity:'rare',      statBonus:{STR:3,DEX:1}, desc:'Cold-forged, etched with old marks. It hums.' },
    { id:'warhammer_l',  name:'Sovereign War Hammer',emoji:'🔨',cost:650, rarity:'legendary', statBonus:{STR:4,CON:2}, desc:'Consecrated iron, hand-forged. A weapon of legend.' },
  ],
  herbalist: [
    { id:'healing_herb', name:'Healing Herbs',      emoji:'🌿', cost:8,   rarity:'common',    consumable:true, healAmount:15, desc:'Clears a minor illness. Pack some.' },
    { id:'tonic',        name:'Strength Tonic',     emoji:'🍶', cost:12,  rarity:'common',    consumable:true, statTemp:{STR:2}, desc:'Temporary boost. Fades in a season.' },
    { id:'salve',        name:'Healing Salve',      emoji:'🏺', cost:15,  rarity:'uncommon',  consumable:true, healAmount:20, desc:'Works on wounds and curses both.' },
    { id:'antidote',     name:'Antidote',           emoji:'💊', cost:20,  rarity:'uncommon',  consumable:true, curePoison:true, desc:'Against most things. Not all.' },
    { id:'greater_salve',name:'Greater Salve',      emoji:'🏺', cost:55,  rarity:'rare',      consumable:true, healAmount:45, desc:'Closes deep wounds. Costly, but it works.' },
    { id:'vital_elixir', name:'Vital Elixir',       emoji:'⚗️', cost:120, rarity:'legendary', consumable:true, healAmount:100, statTemp:{CON:2}, desc:'Restores body and spirit both. A rare brew.' },
  ],
  tents: [
    { id:'tent_scrap',  name:'Scrap Tent',     emoji:'⛺', cost:3,   isTent:true, tentQuality:1, desc:'Barely holds together. Better than the cold. Barely.' },
    { id:'tent_basic',  name:'Basic Tent',     emoji:'⛺', cost:12,  isTent:true, tentQuality:2, desc:'Keeps off the rain. Most of it.' },
    { id:'tent_good',   name:'Sturdy Tent',    emoji:'🏕', cost:30,  isTent:true, tentQuality:3, desc:'Proper canvas. A real camp.' },
    { id:'tent_large',  name:'Large Tent',     emoji:'🏕', cost:60,  isTent:true, tentQuality:4, capacity:2, desc:'Room for two. Spouse will appreciate it.' },
  ],
  merchant: [
    { id:'satchel',       name:'Leather Satchel',    emoji:'👜', cost:15,  isBag:true,  bagSize:3,  desc:'Adds 3 item slots.' },
    { id:'pack',          name:'Travelling Pack',    emoji:'🎒', cost:35,  isBag:true,  bagSize:8,  desc:'Adds 8 item slots. Built for the road.' },
    { id:'large_pack',    name:'Large Pack',         emoji:'🎒', cost:70,  isBag:true,  bagSize:15, desc:'Adds 15 item slots. A serious load.' },
    { id:'chest',         name:'Strongbox',          emoji:'📦', cost:60,  isBag:true,  bagSize:15, desc:'Heavy but holds everything. Not for travel.' },
    { id:'expedition_pack',name:'Expedition Pack',   emoji:'🏔', cost:160, isBag:true,  bagSize:30, desc:'For the serious adventurer. Adds 30 item slots.' },
    { id:'horse',         name:'Horse',              emoji:'🐴', cost:80,  statBonus:{DEX:1}, travelBonus:true, desc:'Faster travel. Higher ground.' },
    { id:'tools',         name:'Craftsman Tools',    emoji:'🔧', cost:18,  statBonus:{STR:1}, desc:'Good tools make better work.' },
    { id:'lantern',       name:'Good Lantern',       emoji:'🏮', cost:10,  desc:'Useful in ruins and at night.' },
    { id:'rope',          name:'Rope (50ft)',         emoji:'🪢', cost:5,   desc:'You will need it eventually.' },
    { id:'map',           name:'Regional Map',       emoji:'🗺', cost:22,  statBonus:{WIS:1}, desc:'Knowing where you are helps.' },
    { id:'lockpicks',     name:'Lockpicks',          emoji:'🔑', cost:25,  statBonus:{DEX:1}, desc:'For the rogue in you.' },
    { id:'ring_simple',   name:'Simple Ring',        emoji:'💍', cost:12,  isRing:true, ringQuality:'simple', desc:'Plain metal. Honest. Good enough for a proposal.' },
  ],
  tailor: [
    { id:'cloak',        name:'Traveller Cloak',    emoji:'🧥', cost:15,  rarity:'common',   statBonus:{CON:1}, desc:'Keeps off the rain. Most of it.' },
    { id:'fine_clothes', name:'Fine Clothes',       emoji:'👔', cost:30,  rarity:'common',   statBonus:{CHA:1}, desc:'First impressions.' },
    { id:'dress',        name:'Fine Dress',         emoji:'👗', cost:40,  rarity:'uncommon', statBonus:{CHA:2}, desc:'You look like someone worth knowing.' },
    { id:'court_regalia',name:'Court Regalia',      emoji:'🤵', cost:130, rarity:'rare',     statBonus:{CHA:3}, desc:'Tailored for halls you have not yet entered.' },
  ],
  jeweller: [
    { id:'ring_silver',   name:'Silver Ring',        emoji:'💍', cost:20,  rarity:'common',    isRing:true, ringQuality:'silver',   desc:'Simple. Right for a proposal.' },
    { id:'earrings',     name:'Jewelled Earrings',  emoji:'💎', cost:45,  rarity:'common',    statBonus:{CHA:1}, desc:'Small. Effective.' },
    { id:'necklace',     name:'Gold Necklace',      emoji:'📿', cost:55,  rarity:'uncommon',  statBonus:{CHA:1}, desc:'Worn at the throat. Cannot be missed.' },
    { id:'ring_gold',     name:'Gold Ring',          emoji:'💍', cost:60,  rarity:'uncommon',  isRing:true, ringQuality:'gold',     desc:'Proper. She will notice.' },
    { id:'signet',       name:'Signet Ring',        emoji:'💍', cost:70,  rarity:'uncommon',  statBonus:{CHA:2}, desc:'A ring that says something about you.' },
    { id:'ring_jewelled', name:'Jewelled Ring',      emoji:'💎', cost:150, rarity:'rare',      isRing:true, ringQuality:'jewelled', statBonus:{CHA:1}, desc:'The stone catches light. So will her eye.' },
    { id:'royal_circlet', name:'Royal Circlet',      emoji:'👑', cost:400, rarity:'legendary', statBonus:{CHA:3,WIS:1}, desc:'Gold and starstone. Worn by those who rule, or mean to.' },
  ],
};


// ── BUSINESS OWNERSHIP SYSTEM ─────────────────────────────────────────────────
// Built on top of the trade-proficiency ladder (WorkTab). Reaching Master in a
// trade unlocks the chance to buy a shop in that trade. Shops produce items each
// season from raw materials, worked by the owner and hired staff.

// Rarity → price/raw multipliers. Produced items sell at FULL cost × mult.
export const RARITY_PRICE_MULT = { common:1.6, uncommon:2.2, rare:3.0, legendary:4.5 };
export const RARITY_RAW_NEED    = { common:1,   uncommon:2,   rare:3,   legendary:5   };
// Skill level a worker needs to be ALLOWED to produce a given rarity.
export const RARITY_SKILL_REQ   = { common:1,   uncommon:3,   rare:4,   legendary:5   };
export const RAW_UNIT_COST = 6;            // gold per unit of raw material
export const SALE_LUCK_BAND = 0.20;        // ±20% swing on a successful sale

// Trade → shop definition. baseCost × LOCATIONS[loc].propertyMult = purchase price.
// produceList items reuse MARKET_ITEMS shapes; rarity drives price + raw need + skill gate.
export const TRADE_SHOPS = {
  smithy: { name:'Smithy', emoji:'🔨', baseCost:375, rawMaterial:'Iron & Coal', vendor:'blacksmith',
    produceList:[
      { id:'p_dagger',   name:'Hunting Dagger', emoji:'🗡', cost:12,  rarity:'common'    },
      { id:'p_shield',   name:'Wooden Shield',  emoji:'🛡', cost:15,  rarity:'common'    },
      { id:'p_sword',    name:'Iron Sword',     emoji:'⚔️', cost:25,  rarity:'uncommon'  },
      { id:'p_chainmail',name:'Chainmail',      emoji:'🔗', cost:45,  rarity:'rare'      },
      { id:'p_warhammer',name:'War Hammer',     emoji:'🔨', cost:90,  rarity:'legendary' },
    ] },
  herb: { name:'Herbalist', emoji:'🌿', baseCost:270, rawMaterial:'Fresh Herbs', vendor:'herbalist',
    produceList:[
      { id:'p_healherb', name:'Healing Herbs',  emoji:'🌿', cost:8,   rarity:'common'    },
      { id:'p_tonic',    name:'Strength Tonic', emoji:'🍶', cost:12,  rarity:'common'    },
      { id:'p_salve',    name:'Healing Salve',  emoji:'🏺', cost:15,  rarity:'uncommon'  },
      { id:'p_antidote', name:'Antidote',       emoji:'💊', cost:20,  rarity:'rare'      },
      { id:'p_elixir',   name:'Vital Elixir',   emoji:'⚗️', cost:55,  rarity:'legendary' },
    ] },
  tailoring: { name:'Tailor', emoji:'🧵', baseCost:330, rawMaterial:'Cloth & Thread', vendor:'tailor',
    produceList:[
      { id:'p_cloak',    name:'Traveller Cloak',emoji:'🧥', cost:15,  rarity:'common'    },
      { id:'p_clothes',  name:'Fine Clothes',   emoji:'👔', cost:30,  rarity:'uncommon'  },
      { id:'p_dress',    name:'Fine Dress',     emoji:'👗', cost:40,  rarity:'rare'      },
      { id:'p_regalia',  name:'Court Regalia',  emoji:'🤵', cost:85,  rarity:'legendary' },
    ] },
  jewelcraft: { name:'Jeweller', emoji:'💎', baseCost:575, rawMaterial:'Precious Metal & Gems', vendor:'jeweller',
    produceList:[
      { id:'p_rings',    name:'Silver Ring',    emoji:'💍', cost:20,  rarity:'common'    },
      { id:'p_necklace', name:'Gold Necklace',  emoji:'📿', cost:55,  rarity:'uncommon'  },
      { id:'p_signet',   name:'Signet Ring',    emoji:'💍', cost:70,  rarity:'rare'      },
      { id:'p_jewelled', name:'Jewelled Ring',  emoji:'💎', cost:150, rarity:'legendary' },
    ] },
  shop_asst: { name:'Trade Store', emoji:'🏪', baseCost:450, rawMaterial:'Goods Stock', vendor:'merchant',
    produceList:[
      { id:'p_rope',     name:'Rope & Cord',    emoji:'🪢', cost:5,   rarity:'common'    },
      { id:'p_satchel',  name:'Leather Satchel',emoji:'👜', cost:15,  rarity:'common'    },
      { id:'p_pack',     name:'Travelling Pack',emoji:'🎒', cost:35,  rarity:'uncommon'  },
      { id:'p_largepack',name:'Large Pack',     emoji:'🎒', cost:70,  rarity:'rare'      },
      { id:'p_expedition',name:'Expedition Pack',emoji:'🏔', cost:160, rarity:'legendary' },
    ] },
  scribe: { name:'Scriptorium', emoji:'📜', baseCost:300, rawMaterial:'Parchment & Ink', vendor:null,
    produceList:[
      { id:'p_map',      name:'Regional Map',   emoji:'🗺', cost:22,  rarity:'common'    },
      { id:'p_ledger',   name:'Fine Ledger',    emoji:'📒', cost:35,  rarity:'uncommon'  },
      { id:'p_tome',     name:'Bound Tome',     emoji:'📖', cost:60,  rarity:'rare'      },
      { id:'p_grimoire', name:'Illuminated Grimoire', emoji:'📕', cost:120, rarity:'legendary' },
    ] },
};
// Aliases: several trade job ids map to the same shop type.
export const TRADE_SHOP_ALIAS = {
  city_trader:'shop_asst', city_scribe:'scribe',
  healer:'herb', city_healer:'herb', for_herb:'herb',
};
export function getShopDef(trade){ return TRADE_SHOPS[TRADE_SHOP_ALIAS[trade]||trade]||null; }

// ── PHASE 2 ECONOMY: rarity + condition pricing, vendor-matching, affinity ─────
// Item condition tiers. New items are pristine; use degrades them step by step.
export const CONDITION_TIERS = ['broken','damaged','worn','good','pristine'];
export const CONDITION_PRICE_MULT = { pristine:1.0, good:0.8, worn:0.6, damaged:0.4, broken:0.15 };
export const CONDITION_BONUS_MULT = { pristine:1.0, good:1.0, worn:0.66, damaged:0.33, broken:0.0 };
// Rarity multiplier on resale value (rarer = worth more).
export const SELL_RARITY_MULT = { common:1.0, uncommon:1.4, rare:2.2, legendary:3.5 };

// Which specialist vendor pays a premium for which kind of item. Selling the right
// goods to the right vendor pays more; the general store always buys at flat rate.
// Returns { vendor, mult } — mult applied to the specialist; general store = 1.0.
export const VENDOR_MATCH = {
  herbalist:  { match:['herb','salve','tonic','antidote','elixir','flower','mushroom','poultice','root','bloom'], mult:1.6 },
  blacksmith: { match:['sword','blade','shield','mail','armour','armor','dagger','hammer','iron','steel','fang','sinew','ore','plate'], mult:1.5 },
  jeweller:   { match:['ring','necklace','earring','signet','gem','jewel','circlet','silver','gold','amulet','bracelet'], mult:1.6 },
  tailor:     { match:['cloak','clothes','dress','regalia','pelt','hide','fur','cloth'], mult:1.4 },
  scribe:     { match:['map','tome','ledger','book','scroll','grimoire','relic'], mult:1.4 },
};
// Best vendor match for an item, by id/name keywords. Returns {vendorId, mult} or null.
export function getVendorMatch(item){
  const hay = `${item.id||''} ${(item.name||'').toLowerCase()}`;
  for(const [vendorId, def] of Object.entries(VENDOR_MATCH)){
    if(def.match.some(k => hay.includes(k))) return { vendorId, mult:def.mult };
  }
  return null;
}
// Affinity-based haggle/sell bonus from vendor perception (0–100, default 30).
// At 30 (neutral) → no bonus; higher liking → better prices, capped.
export function getAffinityPriceBonus(perception){
  return Math.max(0, Math.min(0.30, (((perception ?? 30) - 30) / 100) * 0.6)); // up to +30% near max liking
}
// Affinity gained from SELLING goods, scaled by rarity (common small → legendary large).
export function getSellAffinityGain(item){
  const r = item.rarity || 'common';
  return { common:1, uncommon:2, rare:4, legendary:8 }[r] || 1;
}
// Condition step helpers for degradation.
export function degradeCondition(cond){
  const i = CONDITION_TIERS.indexOf(cond ?? 'pristine');
  return CONDITION_TIERS[Math.max(0, i-1)];
}
export function repairCondition(cond){
  const i = CONDITION_TIERS.indexOf(cond ?? 'pristine');
  return CONDITION_TIERS[Math.min(CONDITION_TIERS.length-1, i+1)];
}
// Cost to repair an item one step, scaling with rarity and how worn it is.
export function getRepairCost(item){
  const r = item.rarity || 'common';
  const rarityBase = { common:6, uncommon:14, rare:30, legendary:70 }[r] || 6;
  const i = CONDITION_TIERS.indexOf(item.condition ?? 'pristine');
  const steps = (CONDITION_TIERS.length-1) - i;  // how far from pristine
  return Math.max(2, rarityBase * Math.max(1, steps));
}

// Staff position ladder. Each rank adds output and raises wage.
export const STAFF_POSITIONS = ['Apprentice','Journeyman','Senior','Manager'];
export const WAGE_BY_SKILL   = { 1:8, 2:13, 3:18, 4:24, 5:32 };
export const FAIL_BY_SKILL   = { 1:0.40, 2:0.28, 3:0.18, 4:0.10, 5:0.05 };
export const PROMOTE_SEASONS = 4;          // seasons worked before promotion eligibility

// Purchase price of a shop in a given trade + location.
export function getShopPrice(trade, loc){
  const def = getShopDef(trade); if(!def) return 0;
  const mult = LOCATIONS[loc||'village']?.propertyMult || 1.0;
  return Math.round(def.baseCost * mult);
}
// Full sale price of a produced item.
export function getProducePrice(item){
  const mult = RARITY_PRICE_MULT[item.rarity||'common'] || 1.0;
  return Math.max(1, Math.round((item.cost||5) * mult));
}
// Raw units an item needs.
export function getProduceRawNeed(item){ return RARITY_RAW_NEED[item.rarity||'common'] || 1; }
// Wage for a staffer, scaled by skill and position seniority (+25% per rank above Apprentice).
export function getStaffWage(staff){
  const base = WAGE_BY_SKILL[staff.skill] || 8;
  const posIdx = STAFF_POSITIONS.indexOf(staff.position||'Apprentice');
  return Math.round(base * (1 + 0.25*Math.max(0,posIdx)));
}
// Production attempts a worker gets per season.
// Owner: 2. Staff: skill 1-2 →1, 3-4 →2, 5 →3; +1 at Senior, +1 at Manager; cap 4.
export function getStaffAttempts(staff){
  let a = staff.skill>=5 ? 3 : staff.skill>=3 ? 2 : 1;
  const posIdx = STAFF_POSITIONS.indexOf(staff.position||'Apprentice');
  if(posIdx>=2) a += 1;  // Senior
  if(posIdx>=3) a += 1;  // Manager
  return Math.min(4, a);
}
// Highest rarity a worker of a given skill may produce.
export function canProduceRarity(skill, rarity){
  return skill >= (RARITY_SKILL_REQ[rarity]||1);
}

// Generate a fresh pool of hire candidates each season.
export function generateHireCandidates(season, loc, count=3){
  const FIRST = ['Aldric','Maren','Edric','Sybil','Oswin','Freya','Torben','Isolde','Nessa','Wren',
    'Gavril','Lira','Thane','Petra','Coran','Tam','Celia','Bram','Senga','Doran','Mhairi','Eithne'];
  const out = [];
  const used = new Set();
  for(let i=0;i<count;i++){
    let name; let guard=0;
    do { name = FIRST[Math.floor(Math.random()*FIRST.length)]; guard++; } while(used.has(name)&&guard<20);
    used.add(name);
    // Skill distribution: mostly 1-3, occasionally higher.
    const roll = Math.random();
    const skill = roll<0.40?1 : roll<0.70?2 : roll<0.88?3 : roll<0.97?4 : 5;
    out.push({
      id:`hire_${Date.now()}_${i}_${Math.floor(Math.random()*9999)}`,
      name, skill,
      position:'Apprentice',
      seasonsWorked:0,
      wage:WAGE_BY_SKILL[skill]||8,
    });
  }
  return out;
}

// Process all of a character's businesses for ONE season.
// Returns { goldDelta, logs:[{text,type}], businesses:[...updated] }.
// Handles: production (owner + staff, gated by skill→rarity), raw consumption,
// failures, sales with luck, wage payment, unpaid-staff-quit, promotions, and
// reduced output when the owner is travelling away from the shop's location.
export function processBusinessSeason(char){
  const businesses = char.businesses || [];
  if(!businesses.length) return { goldDelta:0, logs:[], businesses };
  let goldDelta = 0;
  const logs = [];
  // Track running gold so wages can be checked against affordability mid-loop.
  let runningGold = char.gold || 0;
  const ownerProfLevel = (lvlXP)=> lvlXP>=60?4:lvlXP>=30?3:lvlXP>=15?2:lvlXP>=5?1:0;

  const updated = businesses.map(biz => {
    const def = getShopDef(biz.trade);
    if(!def) return biz;
    const b = { ...biz, staff:(biz.staff||[]).map(s=>({...s})) };
    const away = (char.location||'village') !== (b.loc||'village');
    const produceItem = def.produceList.find(p=>p.id===b.produceId) || def.produceList[0];
    const rawNeed = getProduceRawNeed(produceItem);
    const salePrice = getProducePrice(produceItem);

    // ── Pay wages first; unpaid staff quit at season end ──────────────────────
    let keptStaff = [];
    let quitNames = [];
    for(const s of b.staff){
      const wage = getStaffWage(s);
      if(runningGold >= wage){
        runningGold -= wage; goldDelta -= wage;
        keptStaff.push(s);
      } else {
        quitNames.push(s.name);   // couldn't pay → they leave
      }
    }
    if(quitNames.length){
      logs.push({ text:`${def.name} (${b.name}): couldn't make wages — ${quitNames.join(', ')} left.`, type:'bad' });
    }
    b.staff = keptStaff;

    // ── Build the list of workers who'll attempt production this season ───────
    // Owner works the shop only when present (not travelling). Owner is a Master
    // of the trade → can produce the shop's full range.
    const workers = [];
    if(!away){
      workers.push({ owner:true, skill:5, attempts:2, name:char.name });
    }
    for(const s of b.staff){
      workers.push({ owner:false, skill:s.skill, attempts:getStaffAttempts(s), name:s.name, ref:s });
    }

    // ── Run production attempts ───────────────────────────────────────────────
    let produced = 0, failed = 0, skippedTier = 0, skippedRaw = 0;
    let revenue = 0;
    for(const w of workers){
      let attempts = w.attempts;
      // Travelling: staff run the shop at reduced output (halve attempts, min 1 each).
      if(away && !w.owner) attempts = Math.max(1, Math.floor(attempts/2));
      for(let i=0;i<attempts;i++){
        // Skill gate: can this worker make the chosen rarity at all?
        if(!w.owner && !canProduceRarity(w.skill, produceItem.rarity)){ skippedTier++; continue; }
        // Raw stock gate.
        if((b.rawStock||0) < rawNeed){ skippedRaw++; continue; }
        b.rawStock -= rawNeed;       // consume raw regardless of success/failure
        // Failure roll by skill.
        const failChance = FAIL_BY_SKILL[w.skill] || 0.4;
        if(Math.random() < failChance){ failed++; continue; }
        // Success → sale with ±luck band.
        const luck = 1 + (Math.random()*2-1)*SALE_LUCK_BAND;
        revenue += Math.round(salePrice * luck);
        produced++;
      }
    }
    if(revenue>0){ goldDelta += revenue; runningGold += revenue; }

    // ── Promotions: staff who've worked long enough may move up a rank ────────
    b.staff = b.staff.map(s=>{
      const ns = { ...s, seasonsWorked:(s.seasonsWorked||0)+1 };
      const posIdx = STAFF_POSITIONS.indexOf(ns.position||'Apprentice');
      if(posIdx < STAFF_POSITIONS.length-1 && ns.seasonsWorked >= PROMOTE_SEASONS*(posIdx+1)){
        // Eligibility check: higher-skill staff promote more reliably.
        if(Math.random() < 0.4 + 0.1*ns.skill){
          ns.position = STAFF_POSITIONS[posIdx+1];
          logs.push({ text:`${def.name} (${b.name}): ${ns.name} promoted to ${ns.position}.`, type:'good' });
        }
      }
      return ns;
    });

    // ── Season summary log ────────────────────────────────────────────────────
    if(produced>0){
      logs.push({ text:`${def.emoji} ${b.name}: sold ${produced}× ${produceItem.name} (+${revenue}g).${away?' (run by staff while you were away)':''}`, type:'good' });
    } else if(workers.length){
      let why = '';
      if(skippedRaw>0 && (b.rawStock||0) < rawNeed) why = ' Out of raw materials.';
      else if(skippedTier>0) why = ' Staff not skilled enough for that item.';
      else if(failed>0) why = ' Everything came out flawed.';
      else if(away && !b.staff.length) why = ' Nobody there to run it.';
      logs.push({ text:`${def.emoji} ${b.name}: no sales this season.${why}`, type:'neutral' });
    }
    return b;
  });

  return { goldDelta, logs, businesses:updated };
}

// ── WORLD NPC POOL ────────────────────────────────────────────────────────────
// NPCs are generated per location+generation, can procreate, have race+class
const NPC_FIRST_NAMES = ['Aldric','Maren','Edric','Sybil','Oswin','Freya','Torben','Isolde',
  'Brix','Calder','Nessa','Wren','Gavril','Lira','Thane','Petra','Coran','Tam','Celia',
  'Ysolde','Rael','Sora','Orik','Lithe','Finn','Bryn','Elara','Dorn','Sigrid','Veth',
  'Cass','Harlan','Mira','Tobias','Lyra','Gorin','Selah','Draven','Rook','Esme'];
const NPC_LAST_NAMES  = ['Smith','Thatcher','Ironwood','Fairweather','Stoneback','Goldleaf',
  'Quickfoot','Hillborn','Ashford','Redmane','Coldwater','Brightwell'];

// NPC class pool — weighted by race tendencies
const RACE_CLASS_WEIGHTS = {
  human:     ['fighter','merchant','farmer','carpenter','chef','rogue','bard','cleric'],
  elf:       ['ranger','mage','druid','bard','rogue','cleric'],
  dwarf:     ['fighter','carpenter','miner','merchant','paladin','barbarian'],
  orc:       ['fighter','barbarian','ranger','guard','farmer'],
  halfling:  ['rogue','bard','merchant','chef','farmer'],
  tiefling:  ['warlock','rogue','bard','mage','merchant'],
  dragonborn:['fighter','paladin','bard','barbarian','mage'],
  gnome:     ['mage','merchant','carpenter','rogue','bard'],
};

function seedRng(seed){ let x=Math.sin(seed+1)*10000; return x-Math.floor(x); }

export function generateWorldNPCs(location, generation){
  const base = (location.charCodeAt(0)||99) * 31 + (generation||1)*17;
  const pick = (arr,n) => arr[Math.floor(seedRng(base+n)*arr.length)];
  const raceKeys = Object.keys(RACE_CLASS_WEIGHTS);
  const npcs = [];
  const count = 8;
  const locData = LOCATIONS[location]||LOCATIONS.village;
  const wealthPool = locData.npcWealth || ['poor','modest','comfortable'];
  const jobPool    = locData.npcJobs   || ['farmer','merchant','blacksmith','healer','guard','bard'];
  for(let i=0;i<count;i++){
    const race = pick(raceKeys, i*7);
    const classPool = RACE_CLASS_WEIGHTS[race]||['fighter'];
    const cls = pick(classPool, i*3+1);
    const gender = seedRng(base+i*11) > 0.5 ? 'male' : 'female';
    const age = 18 + Math.floor(seedRng(base+i*5)*40);
    // Sexuality (for relationship compatibility). Weighted mostly hetero, some variety.
    const sexRoll = seedRng(base+i*13);
    const sexuality = sexRoll < 0.74 ? 'heterosexual' : sexRoll < 0.90 ? 'bisexual' : sexRoll < 0.97 ? 'homosexual' : 'asexual';
    // Rough stats so the player can judge a prospective friend/partner.
    const st = (n)=> 4 + Math.floor(seedRng(base+i*17+n)*13); // 4–16
    const stats = { STR:st(1), CON:st(2), DEX:st(3), INT:st(4), WIS:st(5), CHA:st(6) };
    npcs.push({
      id:`npc_${location}_${generation}_${i}`,
      name:`${pick(NPC_FIRST_NAMES,i*2)} ${pick(NPC_LAST_NAMES,i*2+1)}`,
      race, classId:cls, gender, age, sexuality, stats,
      wealth: pick(wealthPool, i),
      job: pick(jobPool, i*4),
      children:[],
    });
  }
  return npcs;
}

export function npcProcreate(npcA, npcB, generation){
  // 50/50 race from either parent
  const childRace = Math.random() > 0.5 ? npcA.race : npcB.race;
  const classPool = RACE_CLASS_WEIGHTS[childRace]||['fighter'];
  const childClass = classPool[Math.floor(Math.random()*classPool.length)];
  const childGender = Math.random() > 0.5 ? 'male' : 'female';
  return {
    id:`npc_child_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    name:`${NPC_FIRST_NAMES[Math.floor(Math.random()*NPC_FIRST_NAMES.length)]} ${npcA.name.split(' ')[1]||''}`,
    race:childRace, classId:childClass, gender:childGender, age:0,
    wealth:npcA.wealth, job:childClass, children:[],
    parents:[npcA.id, npcB.id],
    generation,
  };
}

// ── ACTION FAILURE CHANCES ────────────────────────────────────────────────────
// All actions can fail. Success depends on relevant stats.
export function getActionSuccessChance(char, actionType){
  const stats = char.stats||{};
  const skill = char.skills||{};
  const base = {
    work:     60 + (stats.CON||1)*3,
    train:    70 + (stats.CON||1)*2,
    socialise:50 + (stats.CHA||1)*5,
    goingOut: 55 + (stats.CHA||1)*4,
    worship:  65 + (stats.WIS||1)*3,
    study:    55 + (stats.INT||1)*4,
    crime:    40 + (skill.stealth||0)*8 - (char.criminalRecord||0)*5,
    quest:    50 + (stats.STR||1)*2 + (skill.combat||0)*5,
    travel:   75 + (stats.CON||1)*2,
    haggle:   45 + (stats.CHA||1)*5,
  };
  return Math.min(95, Math.max(15, base[actionType]||60));
}

// ── JOB SEASONAL AVAILABILITY ────────────────────────────────────────────────
export const JOB_SEASONS = {
  // All seasons
  farm:      ['Spring','Summer','Autumn'],
  herb:      ['Spring','Summer','Autumn'],
  vfarmer:   ['Spring','Summer','Autumn'],
  // Year round indoor
  smithy:    ['Spring','Summer','Autumn','Winter'],
  vkitchen:  ['Spring','Summer','Autumn','Winter'],
  vcarpent:  ['Spring','Summer','Autumn','Winter'],
  guard:     ['Spring','Summer','Autumn','Winter'],
  merchant:  ['Spring','Summer','Autumn','Winter'],
  bouncer:   ['Spring','Summer','Autumn','Winter'],
  courier:   ['Spring','Summer','Autumn','Winter'],
  scribe:    ['Spring','Summer','Autumn','Winter'],
  healer:    ['Spring','Summer','Autumn','Winter'],
  tcook:     ['Spring','Summer','Autumn','Winter'],
  tbuilder:  ['Spring','Summer','Autumn','Winter'],
  ttrader:   ['Spring','Summer','Autumn','Winter'],
  tinnkeep:  ['Spring','Summer','Autumn','Winter'],
  hunt:      ['Spring','Summer','Autumn'],
  // City
  mine:      ['Spring','Summer','Autumn','Winter'],
  sage:      ['Spring','Summer','Autumn','Winter'],
  adviser:   ['Spring','Summer','Autumn','Winter'],
  healer2:   ['Spring','Summer','Autumn','Winter'],
  emasterch: ['Spring','Summer','Autumn','Winter'],
};
export function isJobAvailable(jobId, season){
  const seasons = JOB_SEASONS[jobId];
  if(!seasons) return true; // default available all year
  return seasons.includes(season);
}

// ── LOCATION EVENT FILTERS ────────────────────────────────────────────────────
// Which event IDs are inappropriate for which locations
export const LOCATION_BLOCKED_EVENTS = {
  forest:    ['lce_market_deal','lce_dare_teen','lce_fight_at_school'],
  mountains: ['lce_market_deal','lce_fight_at_school'],
  ruins:     ['lce_good_meal','lce_first_coin'],
  village:   [],
  town:      [],
  city:      ['lce_lost_animal','lce_stray_animal','lce_good_season'],
};

// ── SEASON ILLNESS MODIFIER ───────────────────────────────────────────────────
export function getSeasonSicknessModifier(age){
  const season = getSeason(age);
  if(season === 'Winter') return 6;  // +6% in winter
  if(season === 'Spring') return 2;  // +2% spring (damp)
  return 0;
}
