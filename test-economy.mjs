// Phase 2 economy logic tests. Run: node test-economy.mjs
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
const ROOT='/home/claude/fate-weaver-v16';
const entry=`
export { SELL_RARITY_MULT, CONDITION_PRICE_MULT, CONDITION_BONUS_MULT, CONDITION_TIERS,
  VENDOR_MATCH, getVendorMatch, getAffinityPriceBonus, getSellAffinityGain,
  degradeCondition, repairCondition, getRepairCost, getUnlockedTabs, newCharacter,
  generateWorldNPCs } from '${ROOT}/src/gameData.js';
`;
writeFileSync('/tmp/eco-entry.jsx', entry);
const out = await esbuild.build({ entryPoints:['/tmp/eco-entry.jsx'], bundle:true, write:false,
  format:'esm', platform:'node', jsx:'automatic', loader:{'.js':'jsx','.jsx':'jsx'},
  external:['react','react-dom','react/jsx-runtime'], logLevel:'silent' });
writeFileSync(ROOT+'/eco-bundle.mjs', out.outputFiles[0].text);
const M = await import(pathToFileURL(ROOT+'/eco-bundle.mjs').href);

let pass=0, fail=0;
function ok(n,c){ if(c){pass++;console.log('  ✓ '+n);} else {fail++;console.log('  ✗ FAIL: '+n);} }

console.log('\n=== Rarity + condition pricing ===');
{
  ok('rarity mults ascend', M.SELL_RARITY_MULT.common < M.SELL_RARITY_MULT.uncommon
    && M.SELL_RARITY_MULT.uncommon < M.SELL_RARITY_MULT.rare
    && M.SELL_RARITY_MULT.rare < M.SELL_RARITY_MULT.legendary);
  ok('condition mults descend from pristine', M.CONDITION_PRICE_MULT.pristine > M.CONDITION_PRICE_MULT.good
    && M.CONDITION_PRICE_MULT.good > M.CONDITION_PRICE_MULT.worn
    && M.CONDITION_PRICE_MULT.worn > M.CONDITION_PRICE_MULT.damaged
    && M.CONDITION_PRICE_MULT.damaged > M.CONDITION_PRICE_MULT.broken);
  ok('pristine condition = full value', M.CONDITION_PRICE_MULT.pristine === 1.0);
  ok('broken worth a fraction', M.CONDITION_PRICE_MULT.broken < 0.2);
  ok('broken gives no combat bonus', M.CONDITION_BONUS_MULT.broken === 0);
}

console.log('\n=== Vendor matching ===');
{
  ok('iron sword → blacksmith', M.getVendorMatch({id:'sword',name:'Iron Sword'})?.vendorId === 'blacksmith');
  ok('healing herbs → herbalist', M.getVendorMatch({id:'healing_herb',name:'Healing Herbs'})?.vendorId === 'herbalist');
  ok('gold ring → jeweller', M.getVendorMatch({id:'ring_gold',name:'Gold Ring'})?.vendorId === 'jeweller');
  ok('fine dress → tailor', M.getVendorMatch({id:'dress',name:'Fine Dress'})?.vendorId === 'tailor');
  ok('rare flower → herbalist (gathering payoff)', M.getVendorMatch({id:'rare_flower',name:'Rare Flower'})?.vendorId === 'herbalist');
  ok('random junk → no match (general store flat)', M.getVendorMatch({id:'lost_button',name:'Lost Button'}) === null);
  ok('specialist mult > 1', M.getVendorMatch({id:'sword',name:'sword'}).mult > 1);
}

console.log('\n=== Affinity price bonus ===');
{
  ok('neutral perception (30) = no bonus', M.getAffinityPriceBonus(30) === 0);
  ok('below neutral = no penalty (floored at 0)', M.getAffinityPriceBonus(10) === 0);
  ok('high perception gives a bonus', M.getAffinityPriceBonus(90) > 0);
  ok('bonus is capped at 30%', M.getAffinityPriceBonus(100) <= 0.30);
  ok('higher perception → bigger bonus', M.getAffinityPriceBonus(80) > M.getAffinityPriceBonus(50));
}

console.log('\n=== Selling builds affinity (scaled by rarity) ===');
{
  ok('common sale small gain', M.getSellAffinityGain({rarity:'common'}) === 1);
  ok('uncommon > common', M.getSellAffinityGain({rarity:'uncommon'}) > M.getSellAffinityGain({rarity:'common'}));
  ok('rare > uncommon', M.getSellAffinityGain({rarity:'rare'}) > M.getSellAffinityGain({rarity:'uncommon'}));
  ok('legendary largest gain', M.getSellAffinityGain({rarity:'legendary'}) === 8);
  ok('no rarity defaults to small', M.getSellAffinityGain({}) === 1);
}

console.log('\n=== Condition degrade / repair / repair cost ===');
{
  ok('degrade pristine → good', M.degradeCondition('pristine') === 'good');
  ok('degrade good → worn', M.degradeCondition('good') === 'worn');
  ok('degrade broken stays broken (floor)', M.degradeCondition('broken') === 'broken');
  ok('repair worn → good', M.repairCondition('worn') === 'good');
  ok('repair pristine stays pristine (ceiling)', M.repairCondition('pristine') === 'pristine');
  ok('repair cost > 0 for worn item', M.getRepairCost({rarity:'common',condition:'worn'}) > 0);
  ok('legendary repair costs more than common', M.getRepairCost({rarity:'legendary',condition:'worn'}) > M.getRepairCost({rarity:'common',condition:'worn'}));
  ok('more-worn costs more to repair', M.getRepairCost({rarity:'common',condition:'damaged'}) > M.getRepairCost({rarity:'common',condition:'good'}));
}

console.log('\n=== Phase 1 fixes: health from birth + NPC fields ===');
{
  ok('health tab available at age 0', M.getUnlockedTabs({age:0}).includes('health'));
  ok('health tab still there at age 30', M.getUnlockedTabs({age:30}).includes('health'));
  const npcs = M.generateWorldNPCs('village', 1);
  ok('NPCs generated', npcs.length > 0);
  ok('NPCs now carry stats', npcs.every(n=>n.stats && typeof n.stats.STR==='number'));
  ok('NPCs now carry sexuality', npcs.every(n=>typeof n.sexuality==='string'));
  ok('NPCs carry gender', npcs.every(n=>n.gender==='male'||n.gender==='female'));
}

console.log(`\n=========================\nECONOMY: ${pass} passed, ${fail} failed\n=========================`);
process.exit(fail>0?1:0);
