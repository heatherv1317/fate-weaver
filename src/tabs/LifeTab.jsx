import { useState, useMemo } from 'react';
import { Card, FeedItem, Btn, Tag, SectionHeader } from '../components/UI.jsx';
import { T, rand, pick, chance, WORLD, LOCATION_BLOCKED_EVENTS, MEAL_TIERS, getMealEffect, getMaintenance, SPOUSE_JOB_INCOME, getActiveBlessingEffects, PROPERTY_TYPES, getFullReputation, getReputation, CRIME_CLEARANCE_COST, RANKS_ORDER, MAGIC_RESEARCH_TOPICS } from '../gameData.js';

// ── PASSIVE RANDOM EVENTS (fire on age-up, no choice) ────────────────────────
const AGE_EVENTS = [
  // ── INFANCY & TODDLER (0–4) ───────────────────────────────────────────────
  { w:8,  type:'good',    text:'You said your first word. Everyone made a fuss.',                   effect:{}, maxAge:1 },
  { w:8,  type:'good',    text:'You took your first steps. You fell immediately. Then tried again.', effect:{ stat:'CON', v:1 }, maxAge:2 },
  { w:6,  type:'neutral', text:'You learned what "no" means. You do not always agree with it.',     effect:{}, maxAge:3 },
  { w:5,  type:'good',    text:'You made a friend at the well. You played for an hour and never learned their name.', effect:{}, maxAge:4 },
  { w:5,  type:'bad',     text:'You got sick. It passed. You were very upset about it at the time.', effect:{ health:-8 }, maxAge:3 },
  { w:4,  type:'neutral', text:'You discovered that you can reach the bottom shelf now.',            effect:{ stat:'DEX', v:1 }, maxAge:4 },
  { w:4,  type:'good',    text:'A parent taught you something small and useful. You still use it.', effect:{ stat:'WIS', v:1 }, maxAge:4 },
  // ── EARLY CHILDHOOD (3–8) ────────────────────────────────────────────────
  { w:7,  type:'good',    text:'You figured out how to get something you wanted without asking. It felt like a discovery.', effect:{}, maxAge:5 },
  { w:7,  type:'neutral', text:'You got into trouble for something that seemed perfectly reasonable at the time.',           effect:{}, maxAge:6 },
  { w:6,  type:'good',    text:'You made someone laugh on purpose for the first time. You did it again immediately.',        effect:{ stat:'CHA', v:1 }, maxAge:7 },
  { w:5,  type:'neutral', text:'You had a falling out with a friend. You made up the next day. Neither of you mentioned it.',effect:{}, maxAge:8 },
  { w:5,  type:'good',    text:'You found a hiding place no one else knew about. You went there often.',                     effect:{ stat:'WIS', v:1 }, maxAge:8 },
  { w:4,  type:'bad',     text:'You broke a rule and got caught. The consequences were fair. You were still upset about it.',effect:{}, maxAge:8 },
  { w:4,  type:'good',    text:'A grown-up treated you like you were smarter than your age. You have not forgotten it.',     effect:{ stat:'INT', v:1 }, minAge:4, maxAge:9 },
  // Fortune
  { w:6,  type:'good',    text:'A small windfall — someone paid an old debt.',                    effect:{ gold:()=>rand(3,10) }, minAge:8 },
  { w:4,  type:'good',    text:'A traveller paid well for directions. Small coins add up.',        effect:{ gold:()=>rand(2,6)  }, minAge:8 },
  { w:3,  type:'good',    text:'You find something valuable in an unlikely place.',                effect:{ gold:()=>rand(8,20) }, minAge:8 },
  { w:5,  type:'good',    text:'A good season. The whole town feels it.',                          effect:{ gold:()=>rand(5,15) }, minAge:8 },
  // Misfortune
  { w:5,  type:'bad',     text:'A pickpocket got you in the crowd.',                              effect:{ gold:()=>-rand(3,10) }, minAge:8 },
  { w:3,  type:'bad',     text:"A bad deal. Someone you trusted didn't deserve it.",              effect:{ gold:()=>-rand(5,15) }, minAge:12 },
  { w:2,  type:'bad',     text:'Fire swept through the market. Your stores took a hit.',           effect:{ gold:()=>-rand(10,20), health:-8 }, minAge:10 },
  // Stat
  { w:4,  type:'neutral', text:'Months of quiet discipline. Something shifted.',                   effect:{ stat:'STR', v:1 }, minAge:8 },
  { w:4,  type:'neutral', text:'A borrowed book kept you up many nights.',                         effect:{ stat:'INT', v:1 }, minAge:6 },
  { w:3,  type:'neutral', text:'You found a practice. Quiet. Regular. It centres you.',            effect:{ stat:'WIS', v:1 }, minAge:8 },
  { w:3,  type:'neutral', text:'A year of good company. You learn the art of being around people.',effect:{ stat:'CHA', v:1 }, minAge:6 },
  // Danger
  { w:4,  type:'bad',     text:'A brawl at the tavern spilled your way.',                          effect:{ health:()=>-rand(5,15) }, minAge:14 },
  { w:3,  type:'bad',     text:'Something large and territorial crossed your path in the dark.',   effect:{ health:()=>-rand(8,18) }, minAge:10 },
  // Old age
  { w:6,  type:'bad',     text:'The body keeps its own ledger. The interest was steep this year.', effect:{ stat:'CON', v:-1 }, minAge:55 },
  { w:6,  type:'good',    text:'Years clarify things. You see further now, if not as fast.',       effect:{ stat:'WIS', v:1  }, minAge:50 },
  // Family / late life
  { w:5,  type:'neutral', text:'You made a real friend this year. The kind you remember.',         effect:{}, minAge:6 },
  { w:5,  type:'neutral', text:'An old friend visits. You spend three days talking about nothing and everything.', effect:{}, minAge:45 },
  { w:4,  type:'good',    text:'A younger person asks your advice. You realise you actually have some.', effect:{ stat:'WIS', v:1 }, minAge:40 },
  { w:4,  type:'bad',     text:'A joint that never healed right reminds you it never healed right.', effect:{ stat:'DEX', v:-1 }, minAge:50 },
  { w:3,  type:'good',    text:'You are slower now. But you know things the fast ones do not.',    effect:{ stat:'WIS', v:1 }, minAge:60 },
  { w:3,  type:'neutral', text:'You sorted through old things. Found something you thought was gone.', effect:{}, minAge:55 },
  { w:4,  type:'neutral', text:"A year of ordinary days. Sometimes that's what you needed.",      effect:{}, minAge:5 },
  { w:3,  type:'neutral', text:'You heard news from afar that made you think about your future.',  effect:{}, minAge:10 },
];

// ── INTERACTIVE CHOICE EVENTS (shown on Life tab, player picks a response) ───
// These are available as actions on the Life tab — a small pool refreshes each year.
// Each has 2-3 options with different outcomes. Age-gated.
export const LIFE_CHOICE_EVENTS = [

  // ── INFANCY & TODDLER (0–3) ─────────────────────────────────────────────────
  { id:'lce_first_word', oneTime:true, minAge:0, maxAge:2, energyCost:0,
    title:'A Word',
    text:'There is a thing you have been trying to say. You almost have it.',
    choices:[
      { label:'Scream it as loud as possible.',     outcome:'It came out more like a shout than a word. But everyone understood.',   effect:{stat:'CHA',v:1}, affinity:{barbarian:1,bard:1} },
      { label:'Say it quietly and precisely.',      outcome:'They leaned in to hear it. Then smiled. You knew it worked.',           effect:{stat:'WIS',v:1}, affinity:{cleric:1,mage:1} },
      { label:'Point and make the sound near it.',  outcome:'You invented your own system. It was efficient.',                       effect:{stat:'INT',v:1}, affinity:{mage:1,merchant:1} },
    ]
  },
  { id:'lce_walking', oneTime:true, minAge:0, maxAge:2, energyCost:0,
    title:'Upright',
    text:'You have decided it is time to try walking. The floor is very far away.',
    choices:[
      { label:'Just go for it.',              outcome:'You fell six times. Then you walked. Bold approach.',             effect:{stat:'CON',v:1}, affinity:{barbarian:1,fighter:1} },
      { label:'Hold on to things first.',     outcome:'Wall to table to chair to open air. Methodical. It worked.',     effect:{stat:'DEX',v:1}, affinity:{rogue:1,ranger:1} },
      { label:'Wait until you are ready.',    outcome:'You watched others do it for weeks before attempting. First try was good.', effect:{stat:'WIS',v:1}, affinity:{paladin:1,cleric:1} },
    ]
  },
  { id:'lce_toddler_trouble', minAge:1, maxAge:4, energyCost:0,
    title:'Something You Should Not Have Done',
    text:'You have done a thing. You cannot entirely explain why. The evidence is visible.',
    choices:[
      { label:'Look innocent. Maintain innocence.',  outcome:'Nobody believed you. But you held the line. Admirable really.',    effect:{stat:'CHA',v:1}, affinity:{rogue:2,merchant:1} },
      { label:'Point at the dog.',                   outcome:'There was no dog. This did not help.',                             effect:{stat:'CHA',v:1}, affinity:{bard:1,rogue:1} },
      { label:'Sit down and start crying first.',    outcome:'Pre-emptive remorse. They could not really stay angry.',           effect:{stat:'CHA',v:1}, affinity:{bard:2,cleric:1} },
    ]
  },
  { id:'lce_big_emotion', oneTime:true, minAge:1, maxAge:5, energyCost:0,
    title:'A Very Big Feeling',
    text:'Something happened that you have never felt before. It is enormous. You are not sure what to do with it.',
    choices:[
      { label:'Let it all out, immediately.',   outcome:'Very loud. Eventually better. Nobody judged you for it.',               effect:{stat:'CON',v:1}, affinity:{barbarian:1,bard:1} },
      { label:'Go very quiet and still.',       outcome:'You sat with it until it got smaller. A useful skill.',                 effect:{stat:'WIS',v:1}, affinity:{druid:1,cleric:1} },
      { label:'Find someone and make them fix it.', outcome:'They tried. It helped a bit. You learned that sharing helps.',     effect:{stat:'CHA',v:1}, affinity:{paladin:1,bard:1} },
    ]
  },

  // ── CHILDHOOD (3–12) ─────────────────────────────────────────────────────
  { id:'lce_bully',    minAge:3,  maxAge:10, energyCost:0,
    title:'The Bully',
    text:'An older child has been making your life difficult. They corner you again today.',
    choices:[
      { label:'Stand your ground.',   outcome:'It hurts. But they leave you alone after.',          effect:{ stat:'CON', v:1 }, affinity:{ fighter:1 } },
      { label:'Outsmart them.',        outcome:'You find the right words. They look foolish. They hate you for it but move on.', effect:{ stat:'CHA', v:1 }, affinity:{ bard:1, rogue:1 } },
      { label:'Walk away quietly.',    outcome:'Not worth it. You remember their face instead.',    effect:{ stat:'WIS', v:1 }, affinity:{ rogue:1 } },
    ]
  },
  { id:'lce_lost_animal', minAge:4, maxAge:12, energyCost:0,
    title:'Stray',
    text:'A small injured animal has found its way to your door.',
    choices:[
      { label:'Take it in and nurse it.', outcome:'It recovers. It follows you for years.',         effect:{ stat:'WIS', v:1 }, affinity:{ druid:2 } },
      { label:'Find it a better home.',   outcome:'Old Berit takes it. The animal does well.',      effect:{ stat:'CHA', v:1 }, affinity:{ paladin:1 } },
      { label:'Leave it be.',             outcome:"It moves on. Sometimes that's the right call.",  effect:{}, affinity:{ ranger:1 } },
    ]
  },
  { id:'lce_secret',   minAge:6,  maxAge:14, energyCost:0,
    title:'A Secret',
    text:'You have learned something you were not supposed to know.',
    choices:[
      { label:'Keep it.',          outcome:'You tuck it away. Information is its own kind of power.', effect:{ stat:'WIS', v:1 }, affinity:{ rogue:2 } },
      { label:'Tell someone.',     outcome:'It causes a small storm. At least it is not your storm.', effect:{ stat:'CHA', v:1 }, affinity:{ bard:1 } },
      { label:'Use it carefully.', outcome:'You trade the knowledge for something useful.',           effect:{ gold:()=>rand(3,8) }, affinity:{ rogue:1, warlock:1 } },
    ]
  },

  // ── ADOLESCENCE (10–18) ───────────────────────────────────────────────────
  { id:'lce_dare_teen',  minAge:10, maxAge:18, energyCost:0,
    title:'The Dare',
    text:'A group of peers dares you to do something reckless. Everyone is watching.',
    choices:[
      { label:'Do it.',             outcome:'You do it. Some respect you. Some think you are an idiot. Both are right.', effect:{ stat:'CON', v:1 }, affinity:{ barbarian:1, fighter:1 } },
      { label:'Refuse openly.',     outcome:'You say no and explain why. A few nod. The rest jeer.',  effect:{ stat:'WIS', v:1 }, affinity:{ paladin:1 } },
      { label:'Redirect the crowd.','outcome':"You turn the dare into something else. They don't even notice.", effect:{ stat:'CHA', v:1 }, affinity:{ bard:2 } },
    ]
  },
  { id:'lce_first_coin', oneTime:true, minAge:11, maxAge:18, energyCost:0,
    title:'The First Coin',
    text:'You have an opportunity to earn some money. It is not glamorous work.',
    choices:[
      { label:'Do the work.',     outcome:'Honest pay. You learn something about yourself in the doing.', effect:{ gold:()=>rand(3,8) }, affinity:{ fighter:1, paladin:1 } },
      { label:'Negotiate harder.','outcome':"They're surprised. So are you. You get a little more.",     effect:{ gold:()=>rand(5,12) }, affinity:{ bard:1, rogue:1 } },
      { label:'Find a shortcut.',  outcome:'Faster, but messier. The coin spends the same.',             effect:{ gold:()=>rand(2,6) }, affinity:{ rogue:2 } },
    ]
  },
  { id:'lce_mentor', oneTime:true,    minAge:12, maxAge:20, energyCost:0,
    title:'Someone Worth Watching',
    text:'A person you respect is willing to spend some time with you.',
    choices:[
      { label:'Ask them to teach you to fight.',  outcome:'A few brutal lessons. More useful than comfortable.', effect:{ stat:'STR', v:1 }, affinity:{ fighter:2 } },
      { label:'Ask them about their history.',    outcome:'You listen for hours. Half of it changes how you see things.', effect:{ stat:'WIS', v:1 }, affinity:{ cleric:1, bard:1 } },
      { label:'Offer to help them in return.',   outcome:'A fair trade. You learn by doing.',               effect:{ stat:'DEX', v:1 }, affinity:{ ranger:1, rogue:1 } },
    ]
  },

  // ── YOUNG ADULT (18–35) ───────────────────────────────────────────────────
  { id:'lce_opportunity', minAge:18, maxAge:40, energyCost:0,
    title:'An Opportunity',
    text:'Something has come up that could change your situation — if you are willing to act.',
    choices:[
      { label:'Take the risk.',     outcome:'It does not go perfectly. But you are further along than you were.', effect:{ gold:()=>rand(10,30) }, affinity:{ fighter:1, rogue:1 } },
      { label:'Plan first.',        outcome:'You spend a month preparing. The window almost closes. Then opens.', effect:{ gold:()=>rand(8,20), stat:'INT', v:1 }, affinity:{ mage:1 } },
      { label:'Walk away.',         outcome:'Someone else takes it. You watch from a distance for a while.',      effect:{ stat:'WIS', v:1 }, affinity:{ druid:1 } },
    ]
  },
  { id:'lce_disagreement', minAge:16, maxAge:45, energyCost:0,
    title:'A Disagreement',
    text:'You are in a serious conflict with someone. It will not resolve itself.',
    choices:[
      { label:'Confront them directly.',  outcome:'Ugly. Then cleaner. You both know where you stand.',   effect:{ stat:'STR', v:1 }, affinity:{ fighter:1, paladin:1 } },
      { label:'Find common ground.',      outcome:"Slower than you'd like. More lasting than you expected.", effect:{ stat:'CHA', v:1 }, affinity:{ bard:1, cleric:1 } },
      { label:'Outmanoeuvre them.',       outcome:'They never see it coming. You win without a fight.',    effect:{ gold:()=>rand(5,15) }, affinity:{ rogue:2 } },
    ]
  },
  { id:'lce_strange_dream', minAge:13, maxAge:35, energyCost:0,
    title:'Something at the Edge of Sleep',
    text:'You have been having the same dream for three weeks. It is trying to tell you something.',
    choices:[
      { label:'Follow the dream inward.',   outcome:'You wake changed. Something has settled into place.',  effect:{ stat:'WIS', v:1 }, affinity:{ cleric:2, druid:1 } },
      { label:'Write it down, study it.',   outcome:'Patterns emerge. They are not reassuring, but they are useful.', effect:{ stat:'INT', v:1 }, affinity:{ mage:2 } },
      { label:'Ignore it and push through.','outcome':"It stops eventually. You're none the wiser.",        effect:{ stat:'CON', v:1 }, affinity:{ barbarian:1 } },
    ]
  },

  // ── CIVILIAN PATHS ───────────────────────────────────────────────────────
  { id:'lce_market_deal', minAge:14, maxAge:60, energyCost:0,
    title:'A Deal on the Table',
    text:'Someone has come to you with a business proposition. It could be very profitable. Or very stupid.',
    choices:[
      { label:'Negotiate hard and take it.',    outcome:'You drive a better deal than they expected. The gold is real.',    effect:{ gold:()=>rand(12,30) }, affinity:{ merchant:2 } },
      { label:'Take it as offered.',            outcome:'Fair deal. Both parties leave satisfied. That is how it should work.', effect:{ gold:()=>rand(6,15) }, affinity:{ merchant:1, bard:1 } },
      { label:'Walk away — something feels off.','outcome':"They came back a week later with better terms. You were right to wait.", effect:{ stat:'WIS', v:1 }, affinity:{ merchant:1 } },
    ]
  },
  { id:'lce_build_something', minAge:12, maxAge:70, energyCost:0,
    title:'Something Needs Building',
    text:"There's a project — a fence, a room, a small structure. You could take it on.",
    choices:[
      { label:'Do it yourself, properly.',      outcome:'It takes longer than expected. It is better than expected.',        effect:{ stat:'STR', v:1 }, affinity:{ carpenter:2 } },
      { label:'Organise others to help.',       outcome:'You direct more than you hammer. It works. Faster, too.',           effect:{ gold:()=>rand(5,12) }, affinity:{ merchant:1, carpenter:1 } },
      { label:'Pass it to someone else.',       outcome:"They do it fine. You spent the time better elsewhere.",              effect:{ stat:'WIS', v:1 } },
    ]
  },
  { id:'lce_good_meal', minAge:8, maxAge:99, energyCost:0,
    title:'A Meal Worth Making',
    text:"You have the ingredients and the time. Something in you wants to make it properly.",
    choices:[
      { label:'Cook something ambitious.',      outcome:'It comes out better than you hoped. People remember a meal like that.', effect:{ stat:'WIS', v:1 }, affinity:{ chef:2 } },
      { label:'Cook something reliable.',       outcome:'Good, honest food. Nobody complained. That counts.',                   effect:{ gold:()=>rand(2,6) }, affinity:{ chef:1, farmer:1 } },
      { label:'Keep it simple.',               outcome:"Simple was right. Not every meal needs to be a statement.",             effect:{} },
    ]
  },
  { id:'lce_good_season', minAge:16, maxAge:70, energyCost:0,
    title:'A Good Season',
    text:"The land gave more than expected this year. There's surplus to deal with.",
    choices:[
      { label:'Sell it at market.',             outcome:'Good timing. The price was high.',                                    effect:{ gold:()=>rand(10,25) }, affinity:{ farmer:1, merchant:1 } },
      { label:'Store it against a bad year.',   outcome:'Wise. The next two winters were hard. You were fine.',               effect:{ stat:'WIS', v:1 }, affinity:{ farmer:2 } },
      { label:'Give some to neighbours.',       outcome:'They did not forget it. A year later someone helped you back.',       effect:{ stat:'CHA', v:1 }, affinity:{ farmer:1, paladin:1 } },
    ]
  },

  // ── MIDLIFE (35–60) ───────────────────────────────────────────────────────
  { id:'lce_old_wound',  minAge:30, maxAge:60, energyCost:0,
    title:'An Old Wound',
    text:'Something from your past has surfaced. A face, a debt, a mistake.',
    choices:[
      { label:'Face it.',       outcome:'It is worse than you remembered and better than you feared.',    effect:{ stat:'WIS', v:1 }, affinity:{ paladin:1, cleric:1 } },
      { label:'Use it.',        outcome:'The past is leverage if you hold it right.',                      effect:{ gold:()=>rand(15,40) }, affinity:{ rogue:2 } },
      { label:'Bury it deeper.','outcome':"It stays buried. For now.",                                     effect:{ stat:'CON', v:1 }, affinity:{ barbarian:1 } },
    ]
  },
  { id:'lce_protege',    minAge:30, maxAge:65, energyCost:0,
    title:'Someone Younger',
    text:'A young person is following your example, whether you invited it or not.',
    choices:[
      { label:'Take them under your wing.',  outcome:'Teaching sharpens what you know.',                  effect:{ stat:'WIS', v:1 }, affinity:{ paladin:2, cleric:1 } },
      { label:'Set them a hard task first.', outcome:'They either rise to it or they do not. Either way, you learn something.', effect:{ stat:'INT', v:1 }, affinity:{ fighter:1, mage:1 } },
      { label:'Redirect them elsewhere.',    outcome:"Not your responsibility. You've got enough.",        effect:{}, affinity:{ rogue:1 } },
    ]
  },
  { id:'lce_gamble',     minAge:18, maxAge:70, energyCost:0,
    title:'A Wager',
    text:'Someone has made you an offer that is mostly risk and partly temptation.',
    choices:[
      { label:'Take the wager.',
        outcome:'The dice are cast.',   // outcome text shown; gold resolved at apply time
        effect:{ gold:'gamble' } },     // special marker — resolved in applyChoiceEvent
      { label:'Counter-offer.',    outcome:'You reframe it. They accept your terms, not theirs.',          effect:{ gold:()=>rand(8,20) }, affinity:{ bard:1, rogue:1 } },
      { label:'Walk away.',        outcome:'The wager resolves without you. You watch from a distance.',   effect:{ stat:'WIS', v:1 } },
    ]
  },

  // ── LATER YEARS (50+) ────────────────────────────────────────────────────
  { id:'lce_legacy', oneTime:true,     minAge:50, maxAge:99, energyCost:0,
    title:'What You Leave',
    text:'You have been thinking about what remains after. Not death — after. What you build.',
    choices:[
      { label:'Leave something written.',  outcome:'Pages. Not a book, exactly. But true.',              effect:{ stat:'INT', v:1 }, affinity:{ mage:1, bard:1 } },
      { label:'Leave someone ready.',      outcome:'You spend a season preparing another person. It works better than you expected.', effect:{ stat:'WIS', v:2 }, affinity:{ cleric:2, paladin:1 } },
      { label:'Leave something built.',    outcome:'Practical. Lasting. People will use it without knowing your name.', effect:{ gold:()=>-rand(10,30), stat:'CON', v:1 }, affinity:{ fighter:1 } },
    ]
  },
  { id:'lce_last_risk', oneTime:true,  minAge:55, maxAge:99, energyCost:0,
    title:'One More Thing',
    text:'There is a thing you have been putting off. You are running out of years to keep doing that.',
    choices:[
      { label:'Do it now.',         outcome:'It is harder than you expected and more worth it.',           effect:{ stat:'CON', v:1, gold:()=>rand(20,50) }, affinity:{ fighter:2 } },
      { label:'Prepare properly.',  outcome:'You spend a month getting ready. The window holds.',          effect:{ stat:'WIS', v:1 }, affinity:{ mage:1, cleric:1 } },
      { label:'Let it go.',         outcome:"Some things are not for you. You make peace with it.",        effect:{ stat:'WIS', v:2 }, affinity:{ druid:2 } },
    ]
  },
];

// Pick choice events: max 2 per year, never repeat within cooldown period
export function pickChoiceEvents(char){
  const age = char.age || 0;
  const location = char.location || 'village';
  const blockedForLocation = new Set(LOCATION_BLOCKED_EVENTS[location] || []);

  // usedChoiceEventsAll: permanent record with the age each event last fired
  const usedRecord = char.usedChoiceEventsAll || {};

  const eligible = LIFE_CHOICE_EVENTS.filter(e => {
    if(age < e.minAge || age > e.maxAge) return false;
    if(blockedForLocation.has(e.id)) return false;
    // Check cooldown: events with oneTime:true never repeat
    // Other events have a 5-year cooldown
    const lastUsed = usedRecord[e.id];
    if(lastUsed !== undefined){
      if(e.oneTime) return false;
      if(age - lastUsed < 5) return false;
    }
    return true;
  });

  if(!eligible.length) return [];
  const shuffled = [...eligible].sort(()=>Math.random()-0.5);
  // Max 1 under age 5, max 2 from age 5 onward
  const count = age < 5 ? 1 : Math.min(2, 1 + Math.floor(Math.random()*2));
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function pickAgeEvent(age){
  const pool = AGE_EVENTS.filter(e => {
    if(e.minAge && age < e.minAge) return false;
    if(e.maxAge && age > e.maxAge) return false;
    return true;
  }).map(e => ({ ...e, w: e.minAge ? 6 : e.w }));
  const total = pool.reduce((s,e)=>s+e.w,0);
  let r = Math.random()*total;
  for(const e of pool){ r -= e.w; if(r<=0) return e; }
  return pick(pool);
}

export function applyAgeEvent(char, event){
  let updated = { ...char, stats:{...char.stats} };
  const effects = [];
  const eff = event.effect||{};
  if(eff.gold){
    const goldVal = typeof eff.gold === 'function' ? eff.gold() : eff.gold;
    updated.gold = Math.max(0,(updated.gold||0)+goldVal);
    effects.push({ label: goldVal>0 ? `+${goldVal}g` : `${goldVal}g`, positive:goldVal>0 });
  }
  if(eff.health){
    const healthVal = typeof eff.health === 'function' ? eff.health() : eff.health;
    updated.health = Math.max(0,Math.min(100,(updated.health||100)+healthVal));
    effects.push({ label: healthVal>0?`Health +${healthVal}`:`Health ${healthVal}`, positive:healthVal>0 });
  }
  if(eff.stat){
    updated.stats[eff.stat] = Math.max(1,(updated.stats[eff.stat]||1)+eff.v);
    effects.push({ label:`${eff.stat} ${eff.v>0?'+':''}${eff.v}`, positive:eff.v>0 });
  }
  return { char:updated, effects };
}

// Apply a choice event outcome to the character
export function applyChoiceEvent(char, event, choice){
  let updated = { ...char, stats:{...char.stats} };
  const eff = choice.effect || {};

  // Gold
  if(eff.gold){
    let goldVal;
    if(eff.gold === 'gamble'){
      const won = chance(55);
      goldVal = won ? rand(20,60) : -rand(10,25);
      // Override outcome text with result
      const resultText = won
        ? `The wager paid off. +${goldVal}g.`
        : `The wager did not pay off. ${goldVal}g gone.`;
      updated.log[updated.log.length-1].text = resultText;
      updated.yearActions[updated.yearActions.length-1] += won ? ' (won)' : ' (lost)';
    } else {
      goldVal = typeof eff.gold === 'function' ? eff.gold() : eff.gold;
    }
    updated.gold = Math.max(0, (updated.gold||0) + goldVal);
  }
  // Health
  if(eff.health){
    const healthVal = typeof eff.health === 'function' ? eff.health() : eff.health;
    updated.health = Math.max(0, Math.min(100, (updated.health||100) + healthVal));
  }
  // Stat
  if(eff.stat){
    updated.stats[eff.stat] = Math.min(20, Math.max(1, (updated.stats[eff.stat]||1) + eff.v));
  }
  // Affinities
  if(choice.affinity){
    const aff = { ...(updated.affinities||{}) };
    Object.entries(choice.affinity).forEach(([k,v])=>{ aff[k]=(aff[k]||0)+v; });
    updated.affinities = aff;
  }
  // Mark as used this year
  // Track with cooldown record
  updated.usedChoiceEventsAll = { ...(updated.usedChoiceEventsAll||{}), [event.id]: updated.age||0 };
  // Keep usedChoiceEvents for same-year dedup (still cleared on age-up)
  updated.usedChoiceEvents = [...(updated.usedChoiceEvents||[]), event.id];
  // Log
  updated.log = [...(updated.log||[]), { age:updated.age, text:choice.outcome, type:'neutral' }];
  updated.yearActions = [...(updated.yearActions||[]), `${event.title}: ${choice.label}`];

  return updated;
}

// Life stage label for the empty state
function lifeStage(age){
  if(age < 1)  return 'Newborn';
  if(age < 3)  return 'Infant';
  if(age < 6)  return 'Early childhood';
  if(age < 8)  return 'Childhood';
  if(age < 13) return 'Growing up';
  if(age < 18) return 'Coming of age';
  if(age < 35) return 'Young adulthood';
  if(age < 55) return 'In your prime';
  return 'Later years';
}

export default function LifeTab({ char, onCharUpdate }){
  const [showAllLog, setShowAllLog] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showReputation, setShowReputation] = useState(false);
  const fullLog = [...(char.log||[])].reverse();
  const recentLog = showAllLog ? fullLog : fullLog.slice(0,5);
  const thisYearActions = char.yearActions||[];
  const choiceEvents = useMemo(()=>pickChoiceEvents(char), [char.age, char.location, JSON.stringify(char.usedChoiceEventsAll||{})]);
  const [dismissed, setDismissed] = useState([]);

  const visibleChoices = choiceEvents.filter(e => !dismissed.includes(e.id));

  function handleChoice(event, choice){
    // Subtle haptic feedback on mobile
    if(navigator?.vibrate) navigator.vibrate(30);
    const updated = applyChoiceEvent(char, event, choice);
    setDismissed(d => [...d, event.id]);
    onCharUpdate(updated);
  }

  return (
    <div style={{padding:'12px 14px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>


      {/* FINANCE PANEL */}
      {(()=>{
        // ── Calculate outgoing ──────────────────────────────────────────────
        const mealPref = char.mealPreference||'bread';
        const mealTier = MEAL_TIERS.find(t=>t.id===mealPref)||MEAL_TIERS.find(t=>t.id==='bread');
        const mealEff  = getMealEffect(char, mealTier);
        // Living with parents = free food
        const financeParentAlive = (char.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false&&!r.disowned);
        const financeLivingWithParents = !char.hasMovedOut && financeParentAlive;
        const mealPerSeason = financeLivingWithParents ? 0 : Math.max(0, mealEff.cost);

        const props = char.properties||[];
        const maintPerYear = props.reduce((s,p)=>s+(getMaintenance(p,char.age)||0),0);
        const maintPerSeason = Math.round(maintPerYear/4);

        const factionFees = {consortium:20, templeOrder:10};
        const factionPerYear = char.faction ? (factionFees[char.faction]||0) : 0;
        const factionPerSeason = Math.round(factionPerYear/4);

        const rentPaidPerSeason = char.rentedProperty ? Math.round((char.rentedProperty.annualRent||0)/4) : 0;
        const mortgagePerSeason = char.mortgage ? Math.round((char.mortgage.annualPayment||0)/4) : 0;
        const researchTopic = char.activeResearch ? MAGIC_RESEARCH_TOPICS.find(t=>t.id===char.activeResearch) : null;
        const researchPerSeason = researchTopic ? (researchTopic.goldPerSeason||0) : 0;

        const totalOut = mealPerSeason + maintPerSeason + factionPerSeason + rentPaidPerSeason + mortgagePerSeason + researchPerSeason;

        // ── Calculate incoming ──────────────────────────────────────────────
        const spouse = (char.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false);
        const spouseIncome = spouse && char.combineIncomes
          ? Math.round((SPOUSE_JOB_INCOME[spouse.job||'']||0)/4)
          : 0;

        const rentPerYear = props.filter(p=>p.rentedOut).reduce((s,p)=>{
          const pt = PROPERTY_TYPES?.[p.type]||{};
          return s + (pt.annualRent||0);
        },0);
        const rentPerSeason = Math.round(rentPerYear/4);

        const blessEff = getActiveBlessingEffects(char);
        const blessingPerSeason = Math.round(((blessEff.goldBonus||0)+(blessEff.goldWindfall||0))/4);

        const totalIn = spouseIncome + rentPerSeason + blessingPerSeason;
        const netPerSeason = totalIn - totalOut;
        const netColour = netPerSeason >= 0 ? T.green : T.red;

        // ── Recent gold transactions from log ────────────────────────────────
        const goldLog = (char.log||[])
          .filter(e=>e.text&&(e.text.includes('g.')||e.text.includes('gold')||e.text.includes('earned')||e.text.includes('paid')||e.text.includes('bought')))
          .slice(-8).reverse();

        return (
          <div style={{marginBottom:'12px'}}>
            <button onClick={()=>setShowFinance(s=>!s)} style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              width:'100%',background:T.panel,border:`1px solid ${T.border}`,
              borderRadius:'8px',padding:'8px 12px',cursor:'pointer',
              WebkitTapHighlightColor:'transparent',marginBottom:'6px',
            }}>
              <span style={{fontSize:'11px',fontWeight:700,color:T.gold,letterSpacing:'0.5px'}}>💰 FINANCES</span>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:netColour,fontWeight:700}}>
                  {netPerSeason>=0?'+':''}{netPerSeason}g/season
                </span>
                <span style={{fontSize:'10px',color:T.muted}}>{showFinance?'▲':'▼'}</span>
              </div>
            </button>

            {showFinance&&(
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'8px',padding:'10px 12px'}}>

                {/* Balance */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'8px',borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:'12px',color:T.muted}}>Current Balance</span>
                  <span style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{char.gold||0}g</span>
                </div>

                {/* Outgoing */}
                <div style={{marginBottom:'10px'}}>
                  <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px',marginBottom:'5px'}}>OUTGOING PER SEASON</div>
                  {mealPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>{mealTier.emoji} {mealTier.name}</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{mealPerSeason}g</span>
                  </div>}
                  {maintPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>🏠 Property maintenance</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{maintPerSeason}g</span>
                  </div>}
                  {factionPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>⚖ Faction dues</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{factionPerSeason}g</span>
                  </div>}
                  {rentPaidPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>🏠 Rent</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{rentPaidPerSeason}g</span>
                  </div>}
                  {mortgagePerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>🏦 Mortgage</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{mortgagePerSeason}g</span>
                  </div>}
                  {researchPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>✨ Research</span>
                    <span style={{fontSize:'10px',color:T.red}}>−{researchPerSeason}g</span>
                  </div>}
                  {totalOut===0&&<div style={{fontSize:'10px',color:T.muted,fontStyle:'italic'}}>Nothing committed.</div>}
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px',paddingTop:'4px',borderTop:`1px solid ${T.border}`}}>
                    <span style={{fontSize:'10px',color:T.muted,fontWeight:700}}>Total out</span>
                    <span style={{fontSize:'10px',color:T.red,fontWeight:700}}>−{totalOut}g/season</span>
                  </div>
                </div>

                {/* Incoming */}
                <div style={{marginBottom:'10px'}}>
                  <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px',marginBottom:'5px'}}>INCOMING PER SEASON</div>
                  {spouseIncome>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>💍 {spouse?.name} income</span>
                    <span style={{fontSize:'10px',color:T.green}}>+{spouseIncome}g</span>
                  </div>}
                  {rentPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>🏠 Property rent</span>
                    <span style={{fontSize:'10px',color:T.green}}>+{rentPerSeason}g</span>
                  </div>}
                  {blessingPerSeason>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'10px',color:T.text}}>✦ Blessing</span>
                    <span style={{fontSize:'10px',color:T.green}}>+{blessingPerSeason}g</span>
                  </div>}
                  {totalIn===0&&<div style={{fontSize:'10px',color:T.muted,fontStyle:'italic'}}>No passive income.</div>}
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px',paddingTop:'4px',borderTop:`1px solid ${T.border}`}}>
                    <span style={{fontSize:'10px',color:T.muted,fontWeight:700}}>Total in</span>
                    <span style={{fontSize:'10px',color:T.green,fontWeight:700}}>+{totalIn}g/season</span>
                  </div>
                </div>

                {/* Net */}
                <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderTop:`1px solid ${T.border}`,marginBottom:'10px'}}>
                  <span style={{fontSize:'11px',fontWeight:700,color:T.text}}>Net per season</span>
                  <span style={{fontSize:'11px',fontWeight:900,color:netColour}}>{netPerSeason>=0?'+':''}{netPerSeason}g</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'10px',color:T.muted}}>Projected annual</span>
                  <span style={{fontSize:'10px',color:netColour,fontWeight:700}}>{netPerSeason>=0?'+':''}{netPerSeason*4}g</span>
                </div>
                {netPerSeason<0&&(
                  <div style={{background:T.red+'15',border:`1px solid ${T.red}44`,borderRadius:'6px',padding:'6px 8px',marginBottom:'8px'}}>
                    <span style={{fontSize:'10px',color:T.red}}>⚠ You are spending more than you earn. Your gold will run out in roughly {Math.abs(Math.floor((char.gold||0)/Math.abs(netPerSeason)))} seasons.</span>
                  </div>
                )}

                {/* Recent transactions */}
                {goldLog.length>0&&(
                  <div>
                    <div style={{fontSize:'9px',color:T.muted,letterSpacing:'0.5px',marginBottom:'5px'}}>RECENT TRANSACTIONS</div>
                    {goldLog.map((e,i)=>(
                      <div key={`gl-${i}`} style={{fontSize:'9px',color:T.muted,padding:'2px 0',borderBottom:`1px solid ${T.border}22`,display:'flex',gap:'6px'}}>
                        <span style={{color:T.goldDim,flexShrink:0}}>Age {e.age}</span>
                        <span style={{flex:1}}>{e.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Reputation panel ──────────────────────────────────────────── */}
      {(()=>{
        const rep = getReputation(char);
        const fullRep = getFullReputation(char);
        const crimes = char.criminalRecord||0;
        const guildRank = char.guildRank||'G';
        const worshipped = char.worshippedDeity||null;
        const devotionLevel = worshipped ? Math.min(3, [20,75,200].filter(t=>(char.devotion?.[worshipped]||0)>=t).length) : 0;
        const repColour = rep?.colour||T.muted;
        return (
          <div style={{marginBottom:'8px'}}>
            <button onClick={()=>setShowReputation(s=>!s)} style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              width:'100%',background:T.panel,border:`1px solid ${T.border}`,
              borderRadius:'8px',padding:'8px 12px',cursor:'pointer',
              WebkitTapHighlightColor:'transparent',marginBottom:'6px',
            }}>
              <span style={{fontSize:'11px',fontWeight:700,color:repColour,letterSpacing:'0.5px'}}>⭐ REPUTATION</span>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:repColour,fontWeight:700}}>{rep?.label||'Unknown'}</span>
                <span style={{fontSize:'10px',color:T.muted}}>{showReputation?'▲':'▼'}</span>
              </div>
            </button>
            {showReputation&&(
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'8px',padding:'10px 12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',paddingBottom:'8px',borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:'12px',color:T.muted}}>Social Standing</span>
                  <span style={{fontSize:'13px',fontWeight:700,color:repColour}}>{rep?.label||'Unknown'}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontSize:'11px',color:T.muted}}>Guild Rank</span>
                  <span style={{fontSize:'11px',color:T.gold,fontWeight:700}}>{guildRank}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontSize:'11px',color:T.muted}}>Faith</span>
                  <span style={{fontSize:'11px',color:T.purple,fontWeight:700}}>{worshipped ? `${worshipped} (level ${devotionLevel})` : 'None'}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{fontSize:'11px',color:T.muted}}>Criminal Record</span>
                  <span style={{fontSize:'11px',color:crimes>0?T.red:T.green,fontWeight:700}}>{crimes>0?`${crimes} offence${crimes>1?'s':''}`:'Clean'}</span>
                </div>
                {crimes > 0 && (
                  <div style={{background:T.red+'15',border:`1px solid ${T.red}44`,borderRadius:'6px',padding:'8px',marginTop:'8px'}}>
                    <p style={{fontSize:'11px',color:T.red,fontWeight:700,marginBottom:'4px'}}>⚠ Wanted</p>
                    <p style={{fontSize:'10px',color:T.muted,lineHeight:'1.5'}}>
                      You have {crimes} offence{crimes>1?'s':''} on your record. To clear it, visit the <span style={{color:T.gold}}>Magistrate in the Crime tab</span> and pay <span style={{color:T.gold}}>{CRIME_CLEARANCE_COST * crimes}g</span> ({CRIME_CLEARANCE_COST}g per offence). Until then, guards will treat you with suspicion and some jobs and factions may be closed to you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
      {thisYearActions.length > 0 && (
        <>
          <SectionHeader>This Year</SectionHeader>
          {thisYearActions.map((a,i)=>(
            <div key={`yr-${i}`} style={{fontSize:'12px',color:T.muted,padding:'3px 0',display:'flex',gap:'8px'}}>
              <span style={{color:T.gold}}>•</span>
              <span>{a}</span>
            </div>
          ))}
          <div style={{height:'10px'}}/>
        </>
      )}

      {thisYearActions.length === 0 && (
        <Card style={{textAlign:'center',padding:'20px'}}>
          <div style={{fontSize:'28px',marginBottom:'8px'}}>⧖</div>
          <p style={{fontSize:'13px',color:T.muted,marginBottom:'4px'}}>{lifeStage(char.age)}</p>
          <p style={{fontSize:'12px',color:T.muted,fontStyle:'italic',marginBottom:'8px'}}>
            {(()=>{
              const age = char.age||0;
              const cls = char.classId;
              const season = (()=>{ const s=['Spring','Summer','Autumn','Winter']; return s[age%4]; })();
              if(age<2) return 'The world is very large and very new.';
              if(age<5) return 'Everything is interesting. Everything is the first time.';
              if(age<8) return 'You are figuring out the rules. Some of them are unfair.';
              // Race flavour for early years
              const raceId = char.race?.id;
              if(age>=6 && age<=11){
                if(raceId==='elf') return 'You are aware that you have more time than others. That does not always make things easier.';
                if(raceId==='dwarf') return 'The other children are louder than you. You are already learning that endurance is its own kind of strength.';
                if(raceId==='halfling') return 'Being small means people underestimate you. You have begun to understand the value of that.';
                if(raceId==='orc') return 'People step aside for you in ${WORLD.village}. You have not yet decided whether you like it.';
                if(raceId==='tiefling') return 'You learned early that you would have to work harder to be trusted. You are working.';
                if(raceId==='dragonborn') return 'There is something old in your blood that the village has no name for. You feel it some mornings.';
                if(raceId==='gnome') return 'Everything is interesting. Everything can be taken apart. Not everything can be put back together.';
                return 'The world is getting bigger. So are you.';
              }
              if(age>=7 && age<=11) return 'You are old enough to notice things. Not yet old enough to know what to do with them.';
              if(age>=12 && !cls) return 'You are finding your way. The path is not clear yet. That is not the same as being lost.';
              if(age>=12 && !cls) return `Something in ${WORLD.village} is teaching you who you are. You are still deciding whether to listen.`;
              if(cls==='farmer') return `${season}. The land has its own rhythm and you are learning to follow it.`;
              if(cls==='merchant') return 'Every day is an opportunity, if you know where to look.';
              if(cls==='mage') return 'Something stirs in the corners of your perception. You are not sure what.';
              if(cls==='cleric') return 'Faith is not certainty. It is choosing to act as if it matters.';
              if(cls==='rogue') return 'The city has its own language. You are becoming fluent.';
              if(cls==='fighter') return 'Strength is not just muscle. You are learning the other kinds.';
              if(cls==='bard') return 'You notice the story in everything. Including this moment.';
              if(cls==='carpenter') return 'Good work speaks for itself. You let it.';
              if(cls==='chef') return 'The kitchen has a rhythm. You are starting to hear it.';
              if(cls==='ranger') return 'The wild has been teaching you things the village cannot.';
              if(cls==='paladin') return 'Conviction is a heavier thing than it looks from the outside.';
              if(cls==='druid') return 'The seasons are not just weather to you. They are a language.';
              if(cls==='barbarian') return 'The world pushes. You push back. That has always been your answer.';
              if(cls==='warlock') return 'You made a choice that most people do not know is available to them. Live with it.';
              if(age>60) return 'The years have their own weight now. You carry them differently.';
              if(age>45) return 'You know things now that you could not have explained at twenty.';
              if(age>30) return `${WORLD.name} has shown you enough by now that little surprises you. Almost nothing.`;
              const s = char.currentSeason !== undefined ? ['Spring','Summer','Autumn','Winter'][(char.currentSeason||0)%4] : 'Spring';
              const seasonNote = {Spring:'Spring. Things are beginning.',Summer:'Summer. Long days.',Autumn:'Autumn. The world is winding down.',Winter:'Winter. Time to endure.'}[s]||'';
              const lifeNote = char.spouse ? `Married to ${(char.relationships||[]).find(r=>r.id===char.spouse)?.name||'your spouse'}.` : char.partner ? 'You have a partner.' : '';
              const homeNote = char.hasMovedOut ? (char.properties?.length>0?'You own property.':char.rentedProperty?'You rent.':'You are managing.') : 'Still at home.';
              return [seasonNote, lifeNote, homeNote].filter(Boolean).join(' ') || 'Use the tabs to act, then Age Up.';
            })()}
          </p>
          {char.age >= 8 && <p style={{fontSize:'11px',color:T.muted,fontStyle:'italic'}}>{(()=>{ const s=['Spring','Summer','Autumn','Winter'][((char.currentSeason||0))%4]; return `${s}. Use the tabs, then Age Up.`; })()}</p>}
        </Card>
      )}

      {/* Interactive choice events */}
      {visibleChoices.map(event=>{
          // Visual priority: crisis=red border, milestone=gold, civilian=teal, quiet=muted
          const isCrisis = event.text && (
            event.title?.toLowerCase().includes('crisis') ||
            ['lce_bully','lce_dare_teen','lce_disagreement','lce_old_wound','lce_last_risk'].includes(event.id)
          );
          const isMilestone = ['lce_first_coin','lce_mentor','lce_legacy','lce_protege'].includes(event.id);
          const isCivilian  = ['lce_market_deal','lce_build_something','lce_good_meal','lce_good_season'].includes(event.id);
          const accent = isCrisis ? T.red : isMilestone ? T.gold : isCivilian ? T.teal : T.border;
          const typeLabel = isCrisis ? '⚠ Crisis' : isMilestone ? '✦ Milestone' : isCivilian ? '◈ Opportunity' : '· Moment';
          const typeLabelColour = isCrisis ? T.red : isMilestone ? T.gold : isCivilian ? T.teal : T.muted;
          return (
            <Card key={event.id} accent={accent} style={{marginBottom:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                <p style={{fontSize:'11px',fontWeight:700,color:typeLabelColour,letterSpacing:'0.5px',textTransform:'uppercase'}}>{typeLabel}</p>
                <p style={{fontSize:'12px',fontWeight:700,color:accent}}>{event.title}</p>
              </div>
              <p style={{fontSize:'13px',color:T.text,lineHeight:'1.6',marginBottom:'12px',fontStyle:'italic'}}>{event.text}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {event.choices.map((choice,i)=>(
                  <button key={`ch-${i}`} onClick={()=>handleChoice(event,choice)} style={{
                    padding:'10px 12px',background:T.panelAlt,
                    border:`1px solid ${isCrisis?T.red+'44':T.border}`,borderRadius:'8px',
                    color:T.text,fontSize:'13px',textAlign:'left',
                    cursor:'pointer',lineHeight:'1.5',
                    WebkitTapHighlightColor:'transparent',
                  }}>
                    {choice.label}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}

      {/* Sickness warning */}
      {char.sickness && (
        <Card accent={T.red} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'13px',color:T.red,fontWeight:700}}>⚠ {char.sickness.name}</p>
          <p style={{fontSize:'12px',color:T.muted,marginTop:'4px'}}>
            Draining your {char.sickness.stat} each year. Visit the Health tab to treat it.
          </p>
        </Card>
      )}

      {/* Class reveal hint */}
      {!char.classId && char.age >= 10 && (
        <Card accent={T.purple} style={{marginBottom:'10px'}}>
          <p style={{fontSize:'12px',color:T.muted}}>✦ Your path has not yet revealed itself. Keep making choices.</p>
        </Card>
      )}

      {/* Seasonal action summary */}
      {char.age >= 8 && (()=>{
        const sa = char.seasonActions||{};
        const season = ['Spring','Summer','Autumn','Winter'][(char.currentSeason||0)%4];
        const daysLeft = Math.max(0,90-(char.questDaysUsed||0));
        const items = [
          {label:'Work',   done:sa.work||0,    max:4},
          {label:'Train',  done:sa.train||0,   max:2},
          {label:'Study',  done:sa.study||0,   max:2},
          {label:'Worship',done:sa.worship||0, max:4},
          {label:'Social', done:sa.socialise||0,max:3},
        ];
        return (
          <Card style={{marginBottom:'10px',padding:'8px 12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'10px',color:T.muted,fontWeight:700,letterSpacing:'0.5px'}}>{season.toUpperCase()}</span>
              <span style={{fontSize:'10px',color:daysLeft<20?T.orange:T.muted}}>📅 {daysLeft} days left</span>
            </div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {items.map(it=>(
                <span key={it.label} style={{
                  fontSize:'9px',padding:'2px 6px',borderRadius:'4px',
                  background:it.done>=it.max?T.red+'22':T.panel,
                  color:it.done>=it.max?T.red:T.muted,
                  border:`1px solid ${it.done>=it.max?T.red:T.border}`,
                }}>{it.label} {it.done}/{it.max}</span>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* Life log */}
      <SectionHeader>Life History</SectionHeader>
      {recentLog.length === 0 && <p style={{fontSize:'12px',color:T.muted}}>Your story is just beginning.</p>}
      {recentLog.map((e,i)=><FeedItem key={`rl-${i}-${e.age||0}`} entry={e}/>)}
      {fullLog.length > 5 && (
        <button onClick={()=>setShowAllLog(s=>!s)} style={{
          width:'100%',padding:'10px',marginTop:'6px',
          background:'transparent',border:`1px dashed ${T.border}`,
          borderRadius:'8px',color:T.muted,fontSize:'12px',cursor:'pointer',
          WebkitTapHighlightColor:'transparent',
        }}>
          {showAllLog ? '↑ Show less' : `↓ Show ${fullLog.length - 5} more memories`}
        </button>
      )}
    </div>
  );
}

