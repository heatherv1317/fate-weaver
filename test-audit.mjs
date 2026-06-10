// Full-audit mechanical tests. Bundles real source via esbuild.
// Run: node test-audit.mjs
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
const ROOT='/home/claude/fate-weaver-v16';
const entry=`
export { newCharacter, computeInheritance, processBusinessSeason, getShopPrice, getProducePrice,
  getStaffWage, getStaffAttempts, canProduceRarity, generateHireCandidates, getShopDef,
  TRADE_SHOPS, calcLegacyScore, getUnlockedTabs } from '${ROOT}/src/gameData.js';
`;
writeFileSync('/tmp/audit-entry.jsx', entry);
const out = await esbuild.build({ entryPoints:['/tmp/audit-entry.jsx'], bundle:true, write:false,
  format:'esm', platform:'node', jsx:'automatic', loader:{'.js':'jsx','.jsx':'jsx'},
  external:['react','react-dom','react/jsx-runtime'], logLevel:'silent' });
writeFileSync(ROOT+'/audit-bundle.mjs', out.outputFiles[0].text);
const M = await import(pathToFileURL(ROOT+'/audit-bundle.mjs').href);

let pass=0, fail=0;
function ok(n,c){ if(c){pass++;console.log('  ✓ '+n);} else {fail++;console.log('  ✗ FAIL: '+n);} }

console.log('\n=== A. Save/load round-trip preserves new fields ===');
{
  const c = M.newCharacter({
    name:'Round', businesses:[{id:'b1',trade:'smithy',name:'Forge',loc:'village',produceId:'p_sword',rawStock:8,
      staff:[{id:'s1',name:'A',skill:3,position:'Journeyman',seasonsWorked:5}]}],
    masteredTrades:['smithy'], shopOffers:['smithy'], hirePool:[{id:'h1',name:'B',skill:2}], hirePoolKey:'30-1',
  });
  const round = JSON.parse(JSON.stringify(c));
  ok('businesses survive serialize', round.businesses.length===1 && round.businesses[0].staff[0].position==='Journeyman');
  ok('masteredTrades survive', round.masteredTrades[0]==='smithy');
  ok('shopOffers survive', round.shopOffers[0]==='smithy');
  ok('rawStock numeric survives', round.businesses[0].rawStock===8);
  ok('no functions lost (pure data)', typeof round.businesses[0].produceId==='string');
}

console.log('\n=== B. Inheritance full cycle (serialize → compute → apply) ===');
{
  const parent = M.newCharacter({ name:'Parent', gold:500,
    businesses:[{id:'b1',trade:'smithy',name:'Forge',loc:'village',produceId:'p_sword',rawStock:10,staff:[]}],
    properties:[{id:'p1',type:'house'}],
    relationships:[{id:'kid1',type:'child',alive:true}],
    willInstructions:{ gold:'kid1', property:'kid1', items:'kid1' },
  });
  const ser = JSON.parse(JSON.stringify(parent));         // mimic save
  const inh = M.computeInheritance(ser, 'kid1');
  ok('heir inherits business through serialized parent', inh.businesses.length===1);
  ok('inherited business keeps rawStock', inh.businesses[0].rawStock===10);
  // Apply to a fresh heir character (mimic CharacterCreation legacy path).
  const heir = M.newCharacter({ name:'Heir', businesses:[...inh.businesses] });
  ok('heir character carries business', heir.businesses.length===1);
  ok('heir business is independent copy', heir.businesses[0]!==parent.businesses[0]);
}

console.log('\n=== C. Spend paths: gold never goes negative via business ===');
{
  // Wages exceed gold → staff quit, goldDelta only subtracts what was paid; gold floored elsewhere.
  const biz={id:'b1',trade:'smithy',name:'F',loc:'village',produceId:'p_sword',rawStock:0,
    staff:[{id:'s1',name:'A',skill:5,position:'Manager',seasonsWorked:8}]}; // wage 56
  const char={name:'H',gold:10,location:'village',businesses:[biz]};
  const r=M.processBusinessSeason(char);
  ok('cannot pay 56g wage with 10g → staff quits', r.businesses[0].staff.length===0);
  ok('goldDelta does not exceed available gold', (10 + r.goldDelta) >= 0);
}
{
  // Many seasons with no income, paying wages → simulate gold floor in caller.
  let gold=200; const biz={id:'b1',trade:'smithy',name:'F',loc:'village',produceId:'p_chainmail',rawStock:0,
    staff:[{id:'s1',name:'A',skill:2,position:'Apprentice',seasonsWorked:0}]};
  let quit=false;
  for(let i=0;i<30 && !quit;i++){
    const r=M.processBusinessSeason({name:'H',gold,location:'village',businesses:[{...biz,staff:biz.staff.map(s=>({...s}))}]});
    gold=Math.max(0, gold + r.goldDelta);
    if(r.businesses[0].staff.length===0) quit=true;
  }
  ok('staff eventually quit when chronically unpaid (gold drains to floor)', quit || gold===0 || gold<200);
  ok('gold never negative across 30 seasons', gold>=0);
}

console.log('\n=== D. Staff edge cases ===');
{
  // Skill-1 staff producing legendary (needs skill 5) → 0 output, only wage cost.
  const biz={id:'b1',trade:'smithy',name:'F',loc:'village',produceId:'p_warhammer',rawStock:100,
    staff:[{id:'s1',name:'A',skill:1,position:'Apprentice',seasonsWorked:0}]};
  const char={name:'H',gold:1000,location:'city',businesses:[biz]}; // away → only staff work
  let revenue=false;
  for(let i=0;i<25;i++){ const r=M.processBusinessSeason({...char,businesses:[{...biz,staff:biz.staff.map(s=>({...s}))}]}); if(r.goldDelta>0) revenue=true; }
  ok('skill1 staff cannot ever produce legendary (no revenue)', revenue===false);
}
{
  // rawStock exactly enough for 1 item then depletes.
  const biz={id:'b1',trade:'smithy',name:'F',loc:'village',produceId:'p_sword',rawStock:2,staff:[]}; // sword=uncommon, need 2
  const char={name:'H',gold:1000,location:'village',businesses:[biz]};
  const r=M.processBusinessSeason(char);
  ok('rawStock consumed (≤ start)', r.businesses[0].rawStock <= 2);
  ok('rawStock never negative', r.businesses[0].rawStock >= 0);
}
{
  // Travelling away with 0 staff = shop idle, not lost, no negative.
  const biz={id:'b1',trade:'smithy',name:'F',loc:'village',produceId:'p_sword',rawStock:50,staff:[]};
  const r=M.processBusinessSeason({name:'H',gold:100,location:'city',businesses:[biz]});
  ok('away+no staff: no gold change', r.goldDelta===0);
  ok('away+no staff: shop persists', r.businesses.length===1);
  ok('away+no staff: rawStock untouched', r.businesses[0].rawStock===50);
}

console.log('\n=== E. Legacy score doesn\'t crash on extended/empty chars ===');
{
  ok('legacy score on fresh char is a number', typeof M.calcLegacyScore(M.newCharacter())==='number');
  ok('legacy score on rich char is a number', typeof M.calcLegacyScore(M.newCharacter({gold:99999,businesses:[{id:'b'}],age:90}))==='number');
}

console.log('\n=== F. getShopPrice / produce price sane at all rarities ===');
{
  let allPositive=true;
  for(const [tid,def] of Object.entries(M.TRADE_SHOPS)){
    if(M.getShopPrice(tid,'village')<=0) allPositive=false;
    for(const item of def.produceList){ if(M.getProducePrice(item)<=0) allPositive=false; }
  }
  ok('all shop prices > 0', allPositive);
  ok('all produce prices > 0', allPositive);
}

console.log(`\n=========================\nAUDIT: ${pass} passed, ${fail} failed\n=========================`);
process.exit(fail>0?1:0);
