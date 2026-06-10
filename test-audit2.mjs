// Deep-edge audit (second pass). Run: node test-audit2.mjs
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
const ROOT='/home/claude/fate-weaver-v16';
const entry=`
export { uid, newCharacter, computeInheritance, processBusinessSeason, getShopDef,
  getProducePrice, TRADE_SHOPS, calcLegacyScore } from '${ROOT}/src/gameData.js';
`;
writeFileSync('/tmp/audit2-entry.jsx', entry);
const out = await esbuild.build({ entryPoints:['/tmp/audit2-entry.jsx'], bundle:true, write:false,
  format:'esm', platform:'node', jsx:'automatic', loader:{'.js':'jsx','.jsx':'jsx'},
  external:['react','react-dom','react/jsx-runtime'], logLevel:'silent' });
writeFileSync(ROOT+'/audit2-bundle.mjs', out.outputFiles[0].text);
const M = await import(pathToFileURL(ROOT+'/audit2-bundle.mjs').href);

let pass=0, fail=0;
function ok(n,c){ if(c){pass++;console.log('  ✓ '+n);} else {fail++;console.log('  ✗ FAIL: '+n);} }

console.log('\n=== G. uid() is collision-safe under same-tick creation ===');
{
  const ids = new Set();
  for(let i=0;i<10000;i++) ids.add(M.uid('item'));   // tight loop = same ms
  ok('10000 ids in a tight loop are all unique', ids.size===10000);
  ok('uid carries prefix', M.uid('stolen').startsWith('stolen_'));
}

console.log('\n=== H. processBusinessSeason survives corrupt / unknown trade ===');
{
  const biz={id:'b1',trade:'NONEXISTENT_TRADE',name:'Ghost',loc:'village',produceId:'x',rawStock:5,staff:[]};
  let threw=false; let r;
  try{ r=M.processBusinessSeason({name:'H',gold:100,location:'village',businesses:[biz]}); }catch(e){ threw=true; }
  ok('does not throw on unknown trade', !threw);
  ok('unknown-trade shop passed through untouched', r && r.businesses.length===1);
  ok('no gold change for unknown trade', r && r.goldDelta===0);
}
{
  // Mixed: one valid shop + one corrupt — valid one still processes.
  const good={id:'b1',trade:'smithy',name:'Forge',loc:'village',produceId:'p_dagger',rawStock:50,staff:[]};
  const bad ={id:'b2',trade:'???',name:'X',loc:'village',produceId:'y',rawStock:5,staff:[]};
  let threw=false; let r;
  try{ r=M.processBusinessSeason({name:'H',gold:500,location:'village',businesses:[good,bad]}); }catch(e){ threw=true; }
  ok('mixed valid+corrupt does not throw', !threw);
  ok('both shops still present after processing', r && r.businesses.length===2);
}

console.log('\n=== I. processBusinessSeason survives stale produceId ===');
{
  const biz={id:'b1',trade:'smithy',name:'Forge',loc:'village',produceId:'DELETED_ITEM',rawStock:50,staff:[]};
  let threw=false; let r;
  try{ r=M.processBusinessSeason({name:'H',gold:500,location:'village',businesses:[biz]}); }catch(e){ threw=true; }
  ok('stale produceId falls back, no throw', !threw);
  ok('shop still functions (rawStock may be consumed by owner)', r && r.businesses.length===1);
}

console.log('\n=== J. Inheritance edge cases ===');
{
  // Will names a non-existent heir → asking for a different heir yields nothing wrong.
  const parent = M.newCharacter({ gold:300, businesses:[{id:'b1',trade:'smithy',name:'F'}],
    properties:[{id:'p1'}], relationships:[{id:'kid1',type:'child',alive:true}],
    willInstructions:{ gold:'ghost_id', property:'ghost_id', items:'ghost_id' } });
  let threw=false; let inh;
  try{ inh=M.computeInheritance(parent,'kid1'); }catch(e){ threw=true; }
  ok('will naming nonexistent heir does not throw', !threw);
  ok('kid1 inherits nothing when will points elsewhere', inh && inh.businesses.length===0 && inh.propertyIds.length===0);
}
{
  // No will at all + spouse alive → default path shouldn't crash.
  const parent = M.newCharacter({ gold:300, businesses:[{id:'b1',trade:'smithy',name:'F'}],
    relationships:[{id:'sp',type:'spouse',alive:true}], spouse:'sp' });
  let threw=false; let inh;
  try{ inh=M.computeInheritance(parent,'sp'); }catch(e){ threw=true; }
  ok('no-will inheritance does not throw', !threw);
  ok('returns a well-formed object', inh && Array.isArray(inh.businesses) && Array.isArray(inh.propertyIds));
}
{
  // Empty estate (nothing to leave) → no crash, empty arrays.
  const parent = M.newCharacter({ gold:0, relationships:[{id:'kid1',type:'child',alive:true}], willInstructions:{} });
  let threw=false; let inh;
  try{ inh=M.computeInheritance(parent,'kid1'); }catch(e){ threw=true; }
  ok('empty estate does not throw', !threw);
  ok('empty estate yields empty businesses', inh && inh.businesses.length===0);
}

console.log('\n=== K. Owner death orphaning staff is not a crash (data check) ===');
{
  // A business with staff whose owner has died but shop not inherited: the staff array
  // is just data; nothing auto-processes a dead owner's shop. Confirm a dead char with
  // businesses still computes a legacy score and doesn't break.
  const dead = M.newCharacter({ alive:false, age:70,
    businesses:[{id:'b1',trade:'smithy',name:'F',staff:[{id:'s1',name:'A',skill:3}]}] });
  ok('legacy score computes for dead owner with staffed shop', typeof M.calcLegacyScore(dead)==='number');
}

console.log(`\n=========================\nAUDIT-2: ${pass} passed, ${fail} failed\n=========================`);
process.exit(fail>0?1:0);
