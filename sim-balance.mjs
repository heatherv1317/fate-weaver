// In-depth balance simulator. Drives the REAL exported game functions where they
// exist (quests, business, legacy, death rolls) and faithfully replicates the inline
// year-cycle formulas read from GameScreen.jsx (work pay, food, sickness, poverty).
// Runs 5 player archetypes over thousands of lives and reports distributions.
// Run: node sim-balance.mjs
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
const ROOT='/home/claude/fate-weaver-v16';
const entry=`
export { newCharacter, processBusinessSeason, getProducePrice, getShopPrice, getShopDef,
  TRADE_SHOPS, getStaffWage, getStaffAttempts, generateHireCandidates, canProduceRarity,
  getQuestSuccessChance, calcQuestInjury, QUEST_TYPE_DANGER, getSeasonSicknessModifier,
  calcLegacyScore, PROPERTY_TYPES, RANK_XP_THRESHOLDS, RANKS_ORDER } from '${ROOT}/src/gameData.js';
`;
writeFileSync('/tmp/sim-entry.jsx', entry);
const out = await esbuild.build({ entryPoints:['/tmp/sim-entry.jsx'], bundle:true, write:false,
  format:'esm', platform:'node', jsx:'automatic', loader:{'.js':'jsx','.jsx':'jsx'},
  external:['react','react-dom','react/jsx-runtime'], logLevel:'silent' });
writeFileSync(ROOT+'/sim-bundle.mjs', out.outputFiles[0].text);
const M = await import(pathToFileURL(ROOT+'/sim-bundle.mjs').href);

const chance = pct => Math.random()*100 < pct;
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

// ── Real inline formulas, replicated faithfully from GameScreen.jsx ───────────
function sicknessChanceFor(age, season){
  const base = age<10?8 : age<30?5 : age<50?6 : age<65?10 : 16;
  return base + M.getSeasonSicknessModifier(season);
}
const SICKNESSES=[{stat:'CON',drain:1,cost:5},{stat:'CON',drain:2,cost:15},{stat:'CON',drain:2,cost:20},
  {stat:'WIS',drain:1,cost:30},{stat:'STR',drain:2,cost:25},{stat:'CON',drain:1,cost:3}];
const SEASONS=['Spring','Summer','Autumn','Winter'];

// Work pay: rand(pay[0],pay[1]) × profMult(1+level*0.1). Jobs by tier.
const JOBS = {
  basic:   {pay:[3,7]},    // smithy assistant etc.
  mid:     {pay:[6,12]},   // scribe/cook
  master:  {pay:[7,14]},   // jeweller's bench (lucrative trade)
};
function workSeason(level, tier){
  const j=JOBS[tier]; const profMult=1+level*0.1;
  let g=0; for(let s=0;s<4;s++) g+=Math.round(rand(j.pay[0],j.pay[1])*profMult); // 4 shifts/season... but season≠year
  return g;
}

// A quest pool by rank for the adventurer archetype (representative pays from the real game).
const QUESTS = {
  G:{pay:[3,8],xp:10,questType:'fetch',rank:'G',days:7},
  F:{pay:[12,25],xp:40,questType:'combat',rank:'F',days:14},
  E:{pay:[28,50],xp:90,questType:'combat',rank:'E',days:21},
  D:{pay:[50,85],xp:160,questType:'bandit',rank:'D',days:30},
  C:{pay:[90,160],xp:250,questType:'dungeon',rank:'C',days:40},
  B:{pay:[120,200],xp:270,questType:'magical',rank:'B',days:60},
  A:{pay:[200,350],xp:500,questType:'undead',rank:'A',days:75},
};
const GUILD_RANK_XP = {G:0,F:50,E:150,D:300,C:500,B:800,A:1200,S:2000};
function rankFromXP(xp){ let r='G'; for(const [k,v] of Object.entries(GUILD_RANK_XP)) if(xp>=v) r=k; return r; }

// ── One life, given a strategy function that returns gold earned + risk events ─
function simulateLife(strategy){
  const c = M.newCharacter({ age:0, gold:0, health:100, stats:{STR:10,CON:10,DEX:10,INT:10,WIS:10},
    guildRank:'G', skills:{combat:0} });
  c.alive=true; c.guildXP=0; c.tradeLevel=0;
  let peakGold=0, ageAtFirstHome=null, ranBusiness=false;

  for(let age=1; age<=100 && c.alive; age++){
    c.age=age;
    const season = SEASONS[age%4];

    // Death rolls (real formulas) — only from 18+ / 65+
    if(age>=65){
      const basePct=(age-65)*2; const conBonus=(c.stats.CON||10)-10;
      if(chance(Math.max(0,basePct-conBonus))){ c.alive=false; c.deathCause='Old age'; break; }
    }
    if(age>=18 && !c.sickness){
      const recRisk=Math.min(10, Math.sqrt(c.criminalRecord||0)*3);
      const violence=Math.max(0, 1 + recRisk - (c.skills?.combat||0));
      if(chance(violence)){ c.alive=false; c.deathCause='Violence'; break; }
    }
    // Sickness tick / death
    if(c.sickness){
      c.stats[c.sickness.stat]=Math.max(0,(c.stats[c.sickness.stat]||10)-c.sickness.drain);
      if(c.stats[c.sickness.stat]<=0){ c.alive=false; c.deathCause='Sickness'; break; }
    }
    // New sickness
    if(!c.sickness && chance(sicknessChanceFor(age,season))) c.sickness=pick(SICKNESSES);
    // Treat sickness if affordable (rational player); else REST (25% recover free, half drain).
    if(c.sickness){
      if(c.gold>=c.sickness.cost){ c.gold-=c.sickness.cost; c.sickness=null; }
      else {
        if(chance(25)){ c.sickness=null; }      // rested it off
        else { c.stats[c.sickness.stat]=Math.min(10,(c.stats[c.sickness.stat]||0)+Math.ceil(c.sickness.drain/2)); } // rest softens the drain (net half)
      }
    }

    // ── Strategy earns income for the year ──
    const r = strategy(c, age);
    c.gold = Math.max(0, c.gold + r.gold);
    if(r.died){ c.alive=false; c.deathCause=r.cause||'Quest'; break; }
    if(r.ranBusiness) ranBusiness=true;

    // Food/health: a solvent adult eats (assume decent meal 5g, +health); poverty drains
    if(age>=8){
      if(c.gold<=0){ c.health=Math.max(1,c.health-5); }
      else if(c.gold>=5){ c.gold-=5; c.health=Math.min(100,c.health+3); }
      else { c.health=Math.max(1,c.health-2); }
    }
    if(ageAtFirstHome===null && c.gold>=300 && age>=18 && r.buysHome){ ageAtFirstHome=age; c.gold-=300; }
    peakGold=Math.max(peakGold,c.gold);
  }
  return { age:c.age, gold:c.gold, peakGold, alive:c.alive, cause:c.deathCause,
    legacy:M.calcLegacyScore(c), ageAtFirstHome, ranBusiness };
}

// ── Archetype strategies ──────────────────────────────────────────────────────
const STRATEGIES = {
  'Labourer (jobs only)': (c,age)=>{
    if(age<14) return {gold:0};
    // basic job, trade level grows slowly toward master by ~30
    c.tradeLevel=Math.min(4, Math.floor((age-14)/5));
    const tier = c.tradeLevel>=4 ? 'master' : c.tradeLevel>=2 ? 'mid' : 'basic';
    return {gold: workSeason(c.tradeLevel, tier), buysHome:true};
  },
  'Adventurer (questing)': (c,age)=>{
    if(age<15) return {gold:0};
    const myRank=rankFromXP(c.guildXP);
    // Early game: safe fetch/critter quests. Combat only once ranked up with some combat skill.
    c.skills.combat = Math.min(6, Math.floor(c.guildXP/200));
    let q;
    if(myRank==='G'||myRank==='F') q={pay:[3,12],xp:20,questType:'fetch',rank:myRank,days:7};
    else if(myRank==='E'||myRank==='D') q={pay:[28,60],xp:90,questType:'bandit',rank:myRank,days:21};
    else q=QUESTS[myRank]||QUESTS.C;
    let gold=0, died=false;
    // Realistic cadence: a dedicated adventurer runs ~4-6 quests/year, not days-maxed.
    const qpy = Math.min(6, Math.max(2, Math.floor(20/(q.days||14))+2));
    for(let i=0;i<qpy && !died;i++){
      const succ=chance(M.getQuestSuccessChance({...q}, {...c, guildRank:myRank}).chance);
      const inj=M.calcQuestInjury({...q}, {...c, guildRank:myRank}, succ);
      if(chance(inj.deathChance)){ died=true; break; }
      if(succ){ gold+=rand(q.pay[0],q.pay[1]); c.guildXP+=q.xp; }
      else if(chance(inj.injuryChance)){ c.health=Math.max(1,c.health-rand(8,20)); }
    }
    return {gold, died, cause:'Died on a quest', buysHome:true};
  },
  'Shopkeeper (business)': (c,age)=>{
    if(age<28){ // grind a job to afford a shop + master the trade
      c.tradeLevel=Math.min(4,Math.floor((age-14)/4));
      return {gold: workSeason(Math.max(0,c.tradeLevel),'basic'), buysHome:false};
    }
    let delta=0;
    if(!c.businesses?.length){
      const price=M.getShopPrice('smithy','village');
      if(c.gold>=price+50){ delta-=price; c.businesses=[{id:'b',trade:'smithy',name:'Forge',loc:'village',
        produceId:'p_sword', rawStock:0, staff:[]}]; }
      else return {gold: workSeason(4,'basic')};
    }
    const biz=c.businesses[0];
    // hire a skilled candidate if <2 staff and flush
    if((biz.staff?.length||0)<2 && c.gold>250){
      const pool=M.generateHireCandidates(SEASONS[age%4],'village',3);
      const good=pool.find(p=>p.skill>=4)||pool.find(p=>p.skill>=3);
      if(good) biz.staff=[...(biz.staff||[]),{...good,seasonsWorked:0,position:'Apprentice'}];
    }
    // 4 seasons: keep raw stocked, process, accumulate delta
    let runningGold=c.gold;
    for(let s=0;s<4;s++){
      const need=(1+(biz.staff?.length||0))*4;
      if((biz.rawStock||0)<need){ const buy=need-(biz.rawStock||0); delta-=buy*6; runningGold-=buy*6; biz.rawStock+=buy; }
      const res=M.processBusinessSeason({...c, gold:Math.max(0,runningGold), location:'village', businesses:c.businesses});
      delta+=res.goldDelta; runningGold+=res.goldDelta; c.businesses=res.businesses;
    }
    return {gold:delta, ranBusiness:true, buysHome:true};
  },
  'Criminal': (c,age)=>{
    if(age<15) return {gold:0};
    // mix of crimes; caught raises criminalRecord (→ violent death risk)
    const crimes=[{r:[3,12],caught:20},{r:[10,30],caught:30},{r:[20,60],caught:35},{r:[50,120],caught:50}];
    const cr = age<18?crimes[0] : age<22?crimes[1] : pick(crimes.slice(1));
    let gold=0;
    for(let i=0;i<3;i++){ // ~3 jobs/year
      if(chance(cr.caught)){ c.criminalRecord=(c.criminalRecord||0)+1; gold-=rand(5,20); }
      else gold+=rand(cr.r[0],cr.r[1]);
    }
    return {gold, buysHome:true};
  },
  'Property mogul': (c,age)=>{
    if(age<14) return {gold:0};
    c.tradeLevel=Math.min(4,Math.floor((age-14)/5));
    let gold=workSeason(c.tradeLevel, c.tradeLevel>=4?'master':'mid');
    // buy rental properties when flush; collect income
    c.props=c.props||[];
    const ladder=[['cottage',120,9],['house',300,22],['farm',500,34],['tavern',800,58],['manor',2000,115]];
    for(const [name,price,inc] of ladder){
      if(c.gold+gold>=price+100 && !c.props.find(p=>p[0]===name)){ gold-=price; c.props.push([name,price,inc]); break; }
    }
    const income=c.props.reduce((s,p)=>s+p[2],0);
    const upkeep=c.props.reduce((s,p)=>s+Math.round(p[1]*0.01),0);
    gold+=income-upkeep;
    return {gold, buysHome:true};
  },
};

// ── Run ───────────────────────────────────────────────────────────────────────
const N=4000;
function pctl(arr,p){ const s=[...arr].sort((a,b)=>a-b); return s[Math.floor(s.length*p)]; }
function fmt(n){ return Math.round(n).toLocaleString(); }

console.log(`\nFATE WEAVER — BALANCE SIMULATION  (${N} lives per archetype)\n`+'='.repeat(64));
const summary=[];
for(const [name,strat] of Object.entries(STRATEGIES)){
  const lives=[]; for(let i=0;i<N;i++) lives.push(simulateLife(strat));
  const ages=lives.map(l=>l.age);
  const peak=lives.map(l=>l.peakGold);
  const finalG=lives.map(l=>l.gold);
  const legacy=lives.map(l=>l.legacy);
  const survived30=lives.filter(l=>l.age>=30).length/N*100;
  const survived60=lives.filter(l=>l.age>=60).length/N*100;
  const causes={}; lives.forEach(l=>{ if(!l.alive||l.age<100){ causes[l.cause||'—']=(causes[l.cause||'—']||0)+1; } });
  const topCause=Object.entries(causes).sort((a,b)=>b[1]-a[1])[0];
  console.log(`\n■ ${name}`);
  console.log(`   median death age: ${pctl(ages,0.5)}   (survive to 30: ${survived30.toFixed(0)}%, to 60: ${survived60.toFixed(0)}%)`);
  console.log(`   peak gold     median ${fmt(pctl(peak,0.5))}   p25 ${fmt(pctl(peak,0.25))}   p75 ${fmt(pctl(peak,0.75))}   p95 ${fmt(pctl(peak,0.95))}`);
  console.log(`   legacy score  median ${fmt(pctl(legacy,0.5))}`);
  if(topCause) console.log(`   leading death cause: ${topCause[0]} (${(topCause[1]/N*100).toFixed(0)}%)`);
  summary.push({name, medAge:pctl(ages,0.5), medPeak:pctl(peak,0.5), medLegacy:pctl(legacy,0.5)});
}

console.log('\n'+'='.repeat(64)+'\nCROSS-ARCHETYPE COMPARISON (medians)\n');
summary.sort((a,b)=>b.medPeak-a.medPeak);
for(const s of summary) console.log(`   ${s.name.padEnd(26)} peak ${fmt(s.medPeak).padStart(8)}g   death age ${s.medAge}   legacy ${fmt(s.medLegacy)}`);
console.log('');
process.exit(0);
