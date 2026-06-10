// Logic tests for the business-ownership system. Run with: node test-business.mjs
// Imports the real gameData.js so the tested code is exactly what ships.
import {
  TRADE_SHOPS, RARITY_PRICE_MULT, RARITY_RAW_NEED, RARITY_SKILL_REQ,
  getShopDef, getShopPrice, getProducePrice, getProduceRawNeed,
  getStaffWage, getStaffAttempts, canProduceRarity, generateHireCandidates,
  processBusinessSeason, getUnlockedTabs, computeInheritance, newCharacter,
  LOCATIONS,
} from './src/gameData.js';

let pass=0, fail=0;
function ok(name, cond){ if(cond){pass++; console.log('  ✓ '+name);} else {fail++; console.log('  ✗ FAIL: '+name);} }
function approx(a,b,t=0.0001){ return Math.abs(a-b)<=t; }

console.log('\n=== 1. Shop price scales by trade + area ===');
ok('smithy village = 375', getShopPrice('smithy','village')===375);
ok('jeweller city = 575*2.5 = 1438', getShopPrice('jewelcraft','city')===Math.round(575*2.5));
ok('herb forest = 270*0.6 = 162', getShopPrice('herb','forest')===Math.round(270*0.6));
ok('alias city_trader → shop_asst def', getShopDef('city_trader')===TRADE_SHOPS.shop_asst);
ok('alias healer → herb def', getShopDef('healer')===TRADE_SHOPS.herb);

console.log('\n=== 2. Produced-item price by rarity (full cost × mult) ===');
const common={cost:20,rarity:'common'}, unc={cost:20,rarity:'uncommon'}, rare={cost:20,rarity:'rare'}, leg={cost:20,rarity:'legendary'};
ok('common ×1.6', getProducePrice(common)===32);
ok('uncommon ×2.2', getProducePrice(unc)===44);
ok('rare ×3.0', getProducePrice(rare)===60);
ok('legendary ×4.5', getProducePrice(leg)===90);
ok('raw need common=1', getProduceRawNeed(common)===1);
ok('raw need legendary=5', getProduceRawNeed(leg)===5);

console.log('\n=== 3. Skill gates production rarity ===');
ok('skill1 cannot make uncommon', canProduceRarity(1,'uncommon')===false);
ok('skill2 cannot make uncommon', canProduceRarity(2,'uncommon')===false);
ok('skill3 can make uncommon', canProduceRarity(3,'uncommon')===true);
ok('skill3 cannot make rare', canProduceRarity(3,'rare')===false);
ok('skill4 can make rare', canProduceRarity(4,'rare')===true);
ok('skill4 cannot make legendary', canProduceRarity(4,'legendary')===false);
ok('skill5 can make legendary', canProduceRarity(5,'legendary')===true);
ok('any skill makes common', canProduceRarity(1,'common')===true);

console.log('\n=== 4. Wages scale with skill + position ===');
ok('skill1 apprentice wage 8', getStaffWage({skill:1,position:'Apprentice'})===8);
ok('skill5 apprentice wage 32', getStaffWage({skill:5,position:'Apprentice'})===32);
ok('skill3 senior +50% (18*1.5=27)', getStaffWage({skill:3,position:'Senior'})===27);
ok('skill5 manager +75% (32*1.75=56)', getStaffWage({skill:5,position:'Manager'})===56);

console.log('\n=== 5. Production attempts by skill + position (cap 4) ===');
ok('skill1 apprentice = 1', getStaffAttempts({skill:1,position:'Apprentice'})===1);
ok('skill3 apprentice = 2', getStaffAttempts({skill:3,position:'Apprentice'})===2);
ok('skill5 apprentice = 3', getStaffAttempts({skill:5,position:'Apprentice'})===3);
ok('skill3 senior = 3 (+1)', getStaffAttempts({skill:3,position:'Senior'})===3);
ok('skill5 manager capped at 4', getStaffAttempts({skill:5,position:'Manager'})===4);
ok('skill1 manager = 1+1+1=3', getStaffAttempts({skill:1,position:'Manager'})===3);

console.log('\n=== 6. Hire candidate pool ===');
const pool = generateHireCandidates('Spring','village',3);
ok('pool has 3 candidates', pool.length===3);
ok('all have skill 1-5', pool.every(c=>c.skill>=1&&c.skill<=5));
ok('all start Apprentice', pool.every(c=>c.position==='Apprentice'));
ok('all have unique ids', new Set(pool.map(c=>c.id)).size===3);
ok('all start 0 seasons worked', pool.every(c=>c.seasonsWorked===0));

console.log('\n=== 7. processBusinessSeason — raw stock blocks production ===');
{
  const biz = { id:'b1', trade:'smithy', name:'Test Forge', loc:'village', produceId:'p_dagger', rawStock:0, staff:[] };
  const char = { name:'Hero', gold:1000, location:'village', businesses:[biz] };
  const r = processBusinessSeason(char);
  ok('0 raw stock → no gold gain', r.goldDelta===0);
  ok('updated rawStock still 0', r.businesses[0].rawStock===0);
  ok('a log was produced', r.logs.length>=1);
}

console.log('\n=== 8. processBusinessSeason — solo owner produces (full range) ===');
{
  // Owner alone, plenty of raw, producing a legendary item — owner is Master so can.
  const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_warhammer', rawStock:100, staff:[] };
  const char = { name:'Hero', gold:1000, location:'village', businesses:[biz] };
  let anyRevenue=false;
  for(let i=0;i<40;i++){ const r=processBusinessSeason({...char, businesses:[{...biz}]}); if(r.goldDelta>0) anyRevenue=true; }
  ok('solo owner can produce legendary over trials', anyRevenue);
}

console.log('\n=== 9. processBusinessSeason — under-skilled staff skip high tier ===');
{
  // Owner away (so only staff work), skill-1 staff, producing rare → must skip, no revenue.
  const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_chainmail', rawStock:100,
    staff:[{id:'s1',name:'Greenhand',skill:1,position:'Apprentice',seasonsWorked:0}] };
  const char = { name:'Hero', gold:1000, location:'city', businesses:[biz] }; // away in city
  let producedAny=false; let totalWageDelta=0;
  for(let i=0;i<30;i++){
    const r=processBusinessSeason({...char, businesses:[{...biz, staff:[{...biz.staff[0]}]}]});
    if(r.goldDelta>0) producedAny=true;
  }
  // Revenue is impossible (skill1 can't make rare). goldDelta should be ≤0 (only wages out).
  ok('skill1 staff never produces rare item (no positive revenue)', producedAny===false);
}

console.log('\n=== 10. Wages deducted; unpaid staff quit ===');
{
  // Two staff, but only enough gold for part of one wage → both quit (can't pay).
  const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:0,
    staff:[{id:'s1',name:'A',skill:1,position:'Apprentice',seasonsWorked:0},
           {id:'s2',name:'B',skill:1,position:'Apprentice',seasonsWorked:0}] };
  const char = { name:'Hero', gold:5, location:'village', businesses:[biz] }; // 5g < 8g wage
  const r = processBusinessSeason(char);
  ok('unpaid staff quit (roster empties)', r.businesses[0].staff.length===0);
  ok('a "couldn\'t make wages" log fired', r.logs.some(l=>/wages/i.test(l.text)));
}
{
  // Enough gold for both wages → both retained, gold deducted by 16.
  const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:0,
    staff:[{id:'s1',name:'A',skill:1,position:'Apprentice',seasonsWorked:0},
           {id:'s2',name:'B',skill:1,position:'Apprentice',seasonsWorked:0}] };
  const char = { name:'Hero', gold:1000, location:'village', businesses:[biz] };
  const r = processBusinessSeason(char);
  ok('both staff kept when affordable', r.businesses[0].staff.length===2);
  ok('wages deducted (goldDelta includes -16 wages, raw=0 so no revenue)', r.goldDelta===-16);
}

console.log('\n=== 11. Promotion after enough seasons ===');
{
  // Staff at 4 seasons worked, skill 5 (high promote chance) → likely promote over trials.
  let promoted=false;
  for(let i=0;i<50;i++){
    const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:0,
      staff:[{id:'s1',name:'A',skill:5,position:'Apprentice',seasonsWorked:3}] }; // becomes 4 this season
    const char = { name:'Hero', gold:1000, location:'village', businesses:[biz] };
    const r = processBusinessSeason(char);
    if(r.businesses[0].staff[0].position==='Journeyman') promoted=true;
  }
  ok('skill5 staff promotes to Journeyman at 4 seasons (over trials)', promoted);
  // And should NOT promote before threshold.
  const bizEarly = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:0,
    staff:[{id:'s1',name:'A',skill:5,position:'Apprentice',seasonsWorked:1}] };
  const rEarly = processBusinessSeason({ name:'Hero', gold:1000, location:'village', businesses:[bizEarly] });
  ok('no promotion before threshold (2 seasons worked)', rEarly.businesses[0].staff[0].position==='Apprentice');
}

console.log('\n=== 12. Travel: shop runs on staff at reduced output, never lost ===');
{
  const biz = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:100,
    staff:[{id:'s1',name:'A',skill:5,position:'Apprentice',seasonsWorked:0}] };
  const charAway = { name:'Hero', gold:1000, location:'city', businesses:[biz] };
  const r = processBusinessSeason(charAway);
  ok('shop still exists after travel', r.businesses.length===1);
  ok('staff retained while away (affordable)', r.businesses[0].staff.length===1);
  // No staff + away = nothing produced.
  const bizNoStaff = { id:'b1', trade:'smithy', name:'Forge', loc:'village', produceId:'p_dagger', rawStock:100, staff:[] };
  const r2 = processBusinessSeason({ name:'Hero', gold:1000, location:'city', businesses:[bizNoStaff] });
  ok('away + no staff = no revenue', r2.goldDelta===0);
  ok('away + no staff shop not lost', r2.businesses.length===1);
}

console.log('\n=== 13. getUnlockedTabs adds business when owned or mastered ===');
{
  ok('no business tab by default', !getUnlockedTabs({age:20}).includes('business'));
  ok('business tab when shop owned', getUnlockedTabs({age:20, businesses:[{id:'x'}]}).includes('business'));
  ok('business tab when trade mastered', getUnlockedTabs({age:20, masteredTrades:['smithy']}).includes('business'));
}

console.log('\n=== 14. Inheritance carries businesses (will.property governs) ===');
{
  const parent = {
    gold:100, inventory:[], properties:[],
    businesses:[{id:'biz1', trade:'smithy', name:'Old Forge'}],
    relationships:[{id:'kid1', type:'child', alive:true}],
    spouse:null,
    willInstructions:{ property:'kid1' },
  };
  const inh = computeInheritance(parent, 'kid1');
  ok('heir inherits the willed business', inh.businesses.length===1 && inh.businesses[0].id==='biz1');
  // Willed elsewhere → this heir gets nothing.
  const inh2 = computeInheritance({...parent, willInstructions:{property:'someoneElse'}}, 'kid1');
  ok('business not inherited when willed elsewhere', inh2.businesses.length===0);
}

console.log('\n=== 15. newCharacter has businesses field ===');
{
  const c = newCharacter();
  ok('businesses:[] present', Array.isArray(c.businesses) && c.businesses.length===0);
  ok('masteredTrades:[] present', Array.isArray(c.masteredTrades));
  ok('shopOffers:[] present', Array.isArray(c.shopOffers));
}

console.log(`\n=========================\nBUSINESS TESTS: ${pass} passed, ${fail} failed\n=========================`);
process.exit(fail>0?1:0);
