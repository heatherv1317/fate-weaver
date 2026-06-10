// Regression test for the "ages 1-5 events pop up en masse" bug.
// The affinity-event selector must yield at most ONE eligible event for any given
// (age, usedIds) state — the UI shows that one, the player answers it (adding it to
// usedIds), and only then does the next become eligible. This proves no cascade.
// Run: node test-childhood-events.mjs

// AFFINITY_EVENTS lives inside GameScreen.jsx (not exported). We replicate the exact
// selector predicate here and assert its behaviour over the childhood age range.
// (The real guard against cascading also requires showTutorial=false and no modal
//  already open — those are React-state guards verified by the headless mount.)

// Mirror of the childhood/early event ages defined in GameScreen.jsx AFFINITY_EVENTS.
const EVENTS = [
  { id:'mem_age1', age:1, maxAgeSpan:0 }, { id:'mem_age2', age:2, maxAgeSpan:0 },
  { id:'mem_age3', age:3, maxAgeSpan:0 }, { id:'mem_age4', age:4, maxAgeSpan:0 },
  { id:'mem_age5', age:5, maxAgeSpan:0 }, { id:'firstLeaning', age:7 },
  { id:'strangersGift', age:9 }, { id:'firstLoss', age:11 },
  { id:'crossroads', age:15, maxAgeSpan:4 }, { id:'firstTest', age:20, maxAgeSpan:8 },
];

function pendingFor(age, usedIds){
  const used = new Set(usedIds);
  return EVENTS.find(e => {
    if(used.has(e.id)) return false;
    const span = e.maxAgeSpan ?? 4;
    return age >= e.age && age <= e.age + span;
  }) || null;
}

let pass=0, fail=0;
function ok(name, cond){ if(cond){pass++; console.log('  ✓ '+name);} else {fail++; console.log('  ✗ FAIL: '+name);} }

console.log('\n=== Childhood events surface ONE at a time, not en masse ===');

// Simulate the real loop: at each age, show the pending event, then mark it used
// (as answering does) before moving on. Count how many events fire per age.
{
  const used = [];
  const firedByAge = {};
  for(let age=0; age<=12; age++){
    // The UI shows whatever is pending now; answering marks it used. The effect then
    // re-runs (deps include affinityModal clearing) and may show one MORE only if a
    // second is independently eligible at this same age — which must never happen.
    let firedThisAge = 0;
    let guard = 0;
    while(true){
      const p = pendingFor(age, used);
      if(!p) break;
      // Only events whose own age === current age should fire "fresh" at this age;
      // a carried-over event from a prior age would mean the player skipped it.
      firedThisAge++;
      used.push(p.id);
      if(++guard>20) break;
    }
    firedByAge[age] = firedThisAge;
  }
  // The critical assertion: walking age 1..5 one at a time, each age yields exactly
  // one NEW event (its own), never a pile. Because answering age-1's event at age 1
  // doesn't make age-2..5 eligible (their `age` gate is in the future).
  ok('age 0 fires 0 events', firedByAge[0]===0);
  ok('age 1 fires exactly 1 (mem_age1)', firedByAge[1]===1);
  ok('age 2 fires exactly 1 (mem_age2)', firedByAge[2]===1);
  ok('age 3 fires exactly 1', firedByAge[3]===1);
  ok('age 4 fires exactly 1', firedByAge[4]===1);
  ok('age 5 fires exactly 1', firedByAge[5]===1);
  ok('age 6 fires 0 (gap year)', firedByAge[6]===0);
  ok('age 7 fires exactly 1 (firstLeaning)', firedByAge[7]===1);
}

console.log('\n=== Exact-age childhood events: no pile-up, no carry-over ===');
{
  // With maxAgeSpan:0, each childhood memory is eligible ONLY on its own age.
  // Arriving at age 5 with nothing used → only mem_age5 is eligible, never a pile.
  const eligibleAt5 = EVENTS.filter(e=>{
    const span=e.maxAgeSpan??4; return 5>=e.age && 5<=e.age+span;
  });
  ok('only ONE event eligible at age 5 (mem_age5)', eligibleAt5.length===1 && eligibleAt5[0].id==='mem_age5');
  // A childhood memory you skip past is gone — it does not resurface a year later.
  ok('mem_age1 not eligible at age 2 (no carry-over)', pendingFor(2, [])?.id !== 'mem_age1');
  ok('mem_age2 IS the one at age 2', pendingFor(2, [])?.id === 'mem_age2');
  ok('mem_age3 not eligible at age 4', pendingFor(4, [])?.id !== 'mem_age3');
  // Each age 1..5 yields exactly its own single event.
  for(let a=1;a<=5;a++){
    ok(`age ${a} → exactly mem_age${a}`, pendingFor(a, [])?.id === `mem_age${a}`);
  }
}

console.log('\n=== Missed childhood memories expire immediately (span 0) ===');
{
  ok('mem_age1 gone by age 2', pendingFor(2, [])?.id !== 'mem_age1');
  ok('mem_age1 live only at age 1', pendingFor(1, [])?.id === 'mem_age1');
  // Later (non-childhood) events keep their forgiving windows.
  ok('crossroads (span 4) still live across its window', pendingFor(17, [])?.id === 'crossroads');
}

console.log(`\n=========================\nCHILDHOOD EVENTS: ${pass} passed, ${fail} failed\n=========================`);
process.exit(fail>0?1:0);
