import { useState, useEffect, useRef } from 'react';
import { CharHeader, BottomNav, Modal, Card, Btn, Tag, Spinner } from './components/UI.jsx';
import { T } from './gameData.js';
import LifeTab, { pickAgeEvent, applyAgeEvent, pickChoiceEvents, applyChoiceEvent } from './tabs/LifeTab.jsx';
import WorkTab from './tabs/WorkTab.jsx';
import HealthTab, { rollSickness } from './tabs/HealthTab.jsx';
import BusinessTab from './tabs/BusinessTab.jsx';
import PeopleTab, { tickRelationships } from './tabs/RelationshipsTab.jsx';
import { SkillsTab, InventoryTab, CrimeTab, ReligionTab, WorldTab, MagicTab, PropertyTab, GuildTab } from './tabs/OtherTabs.jsx';
import { saveChar, resolveClass, CLASSES, ENERGY, PROPERTY_TYPES, getMaintenance, getSeason, getCurrentSeason, SEASONS, SEASON_EFFECTS, getReputation, getFullReputation, calcLegacyScore, getLegacyRating, pickWorldEvent, applyStatAgeing, applyDamage, WORLD, CLASS_EVENTS, PROFICIENCY_CAREER_MAP, WORLD_EVENTS, ACHIEVEMENT_QUESTS, checkAchievements, getDualClass, QUEST_CONSEQUENCE_TEMPLATES, CURSED_ITEMS, MEAL_TIERS, getMealEffect, getSeasonSicknessModifier, getEnergyMax, SEXUALITIES, GENDERS, SEASON_LIMITS, ACTION_DAYS, getActionSuccessChance, getSeasonDaysLeft, SPOUSE_JOB_INCOME, getSpouseIncome, getActiveBlessingEffects, RANK_XP_THRESHOLDS, RANKS_ORDER, getRaceEmoji, callAI, chance, rand, getUnlockedTabs, MAGIC_RESEARCH_TOPICS, processBusinessSeason, getShopPrice, getShopDef, LOCATIONS, uid } from './gameData.js';
import Tutorial from './Tutorial.jsx';


// ── TRAVELLER ITEMS ──────────────────────────────────────────────────────────
const TRAVELLER_ITEMS = [
  { id:'iron_dagger',    name:'Iron Dagger',          emoji:'🗡️', desc:'Small enough to hide. Sharp enough to matter.',                         hint:"A fighter\'s instinct. Or a rogue\'s.",              bonus:{ stat:'STR', v:1 }, affinity:{ fighter:2, rogue:2 } },
  { id:'worn_spellbook', name:'Worn Spellbook',        emoji:'📖', desc:'Half the pages are burned. The other half make no sense yet.',          hint:'Someone learned from this. Someone dangerous.',        bonus:{ stat:'INT', v:1 }, affinity:{ mage:3, cleric:1 } },
  { id:'carved_totem',   name:'Carved Totem',          emoji:'🌿', desc:'Wood and bone. It smells like deep forest and old rain.',               hint:'The wild knows it. Animals calm when you hold it.',    bonus:{ stat:'WIS', v:1 }, affinity:{ druid:3, ranger:1 } },
  { id:'silver_coin',    name:'Strange Silver Coin',   emoji:'🪙', desc:'No kingdom minted this. The face on it blinks if you look too long.',   hint:"Luck. Or something wearing luck\'s clothes.",         bonus:{ stat:'CHA', v:1 }, affinity:{ rogue:2, bard:2 } },
  { id:'bone_flute',     name:'Bone Flute',            emoji:'🎶', desc:'One note makes people lean in. Another makes them forget.',             hint:"A bard\'s tool. Or a warlock\'s.",                   bonus:{ stat:'CHA', v:1 }, affinity:{ bard:3, warlock:1 } },
  { id:'holy_medallion', name:'Holy Medallion',        emoji:'☀️', desc:'Warm to the touch even in winter. The symbol is one you almost recognise.', hint:'Faith given weight.',                           bonus:{ stat:'WIS', v:1 }, affinity:{ cleric:3, paladin:2 } },
  { id:'scale_armour',   name:'Scale of Black Armour', emoji:'🛡️', desc:'One piece of something much larger. Still harder than iron.',           hint:'Whoever wore this survived things that should have killed them.', bonus:{ stat:'CON', v:1 }, affinity:{ fighter:2, paladin:1 } },
];
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }
function pickTravellerItems(){ return shuffle(TRAVELLER_ITEMS).slice(0,5); }

// Affinity events that fire at specific ages to shape your class
const AFFINITY_EVENTS = [

  // ── EARLY MEMORIES (fire on age-up, ages 1–5) ────────────────────────────
  // These replace the opening sequence — one memory surfaces per year as the
  // player ages through their first five years.

  { id:'mem_age1', age:1, maxAgeSpan:0,
    title:'Your First Year',
    text:'You are small. Smaller than you will ever be again. Something is wrong and you do not have words for it yet.',
    choices:[
      { text:'Cry. Loudly and persistently until something changes.',
        outcome:'It worked. It always works. You learned that making noise is how things get done.',
        affinity:{bard:1,barbarian:1}, stat:'CHA' },
      { text:'Try to reach the thing you need yourself.',
        outcome:'Your arms are useless. But you tried. Something in you has always tried first.',
        affinity:{fighter:1,ranger:1}, stat:'STR' },
      { text:'Wait. Watch the light on the ceiling. Something will come.',
        outcome:'Someone came. They always came. You learned early that patience is its own kind of power.',
        affinity:{cleric:1,druid:1}, stat:'WIS' },
    ]
  },

  { id:'mem_age2', age:2, maxAgeSpan:0,
    title:'The Floor',
    text:'You fell. Not for the first time. The floor came up very fast and now you are on it.',
    choices:[
      { text:'Cry. This is objectively terrible and people should know.',
        outcome:'Someone came and it was better. You learned that expressing distress gets results.',
        affinity:{bard:1,cleric:1}, stat:'CHA' },
      { text:'Get straight back up and try again without stopping.',
        outcome:'Nothing was broken. You got up. That became a habit.',
        affinity:{fighter:2,paladin:1}, stat:'CON' },
      { text:'Look around to see if anyone saw before deciding how to react.',
        outcome:'No one was watching. So you just got up and got on with it.',
        affinity:{rogue:2}, stat:'WIS' },
    ]
  },

  { id:'mem_age3', age:3, maxAgeSpan:0,
    title:'The Thing You Were Told Not to Touch',
    text:'It is right there. They said not to. But they are not here right now and it is very interesting.',
    choices:[
      { text:'Touch it. Obviously.',
        outcome:'It was interesting and also you knocked it over. Worth it.',
        affinity:{mage:1,rogue:2}, stat:'INT' },
      { text:'Sit and look at it for a very long time without touching.',
        outcome:'You wanted to touch it. You did not. Something about that stayed with you.',
        affinity:{paladin:1,cleric:1}, stat:'WIS' },
      { text:'Find someone else and bring them to see it too.',
        outcome:'You found a way to be near the interesting thing without being in trouble. Resourceful.',
        affinity:{bard:2,merchant:1}, stat:'CHA' },
    ]
  },

  { id:'mem_age4', age:4, maxAgeSpan:0,
    title:'The Animal',
    text:'A stray dog has been sleeping outside your door for three mornings. It watches you with cautious eyes.',
    choices:[
      { text:'Bring it scraps every day until it trusts you.',
        outcome:'By the second week it followed you everywhere. You named it something embarrassing that you still remember.',
        affinity:{druid:2,ranger:1}, stat:'WIS' },
      { text:'Ask your parent if you can keep it.',
        outcome:'They said no. The dog stayed anyway. No one mentioned it again.',
        affinity:{bard:1,paladin:1}, stat:'CHA' },
      { text:'Leave it alone — wild things should stay wild.',
        outcome:'It moved on after a week. You watched it go from the window.',
        affinity:{ranger:1,druid:1}, stat:'WIS' },
    ]
  },

  { id:'mem_age5', age:5, maxAgeSpan:0,
    title:'The Bigger Child',
    text:'An older child has decided they do not like you. They have been taking your things and making sure you know they can.',
    choices:[
      { text:'Tell a grown-up.',
        outcome:'The grown-up sorted it out. Not glamorous, but it worked. You learned when to ask for help.',
        affinity:{paladin:1,cleric:1}, stat:'CHA' },
      { text:'Stand in front of your things and refuse to move.',
        outcome:'They pushed you over. You got up. They eventually got bored.',
        affinity:{fighter:2,paladin:1}, stat:'CON' },
      { text:'Find something they want and offer a trade.',
        outcome:'You worked out a deal. You were five. It impressed even you.',
        affinity:{merchant:1,rogue:1}, stat:'INT' },
    ]
  },

  { id:'firstLeaning', age:7,
    title:'The First Leaning',
    text:'You are old enough to have a direction now. Something pulls at you more than the rest.',
    choices:[
      { text:'You follow a parent to work — carrying, lifting, learning what the body endures.', affinity:{fighter:2,paladin:1},  stat:'STR' },
      { text:"You slip into the elder's study and touch books you cannot yet read.",              affinity:{mage:2,cleric:1},      stat:'INT' },
      { text:'You collect friends the way others collect stones. Faces before words.',            affinity:{bard:2,rogue:1},       stat:'CHA' },
      { text:'You slip to the forest edge each evening. Something calls you there.',              affinity:{ranger:2,druid:1},     stat:'DEX' },
      { text:'You help in the kitchen every evening. The smells and order of it settle you.',     affinity:{chef:3,farmer:1},      stat:'WIS' },
      { text:'You follow the carpenter around, handing nails, watching joints fit together.',     affinity:{carpenter:3,farmer:1}, stat:'STR' },
      { text:'You sit with the traders at market and learn how money moves.',                     affinity:{merchant:3,bard:1},    stat:'CHA' },
      { text:'You spend every spare hour in the fields. There is something in the cycle.',         affinity:{farmer:3,druid:1},     stat:'CON' },
    ]
  },
  { id:'strangersGift', age:9, type:'traveller',
    title:"The Stranger's Gift",
    text:"A traveller looks at you too long — then opens their pack without being asked. \"Pick one,\" they say. \"I have been carrying these long enough.\"",
  },
  { id:'firstLoss', age:11,
    title:'The First Loss',
    text:'Something is taken from you. It cannot be returned. You decide what to do with that.',
    choices:[
      { text:'You rage. You break things. Later you learn to turn fury into something harder.',   affinity:{fighter:2,barbarian:2}, stat:'STR' },
      { text:'You plan. You learn that grief, handled right, becomes useful.',                    affinity:{rogue:2,mage:1},        stat:'INT' },
      { text:'You pray. Not because you believe — but because you need to say the words.',       affinity:{cleric:3,paladin:1},    stat:'WIS' },
      { text:'You vanish into the wild for three days. You come back different.',                 affinity:{druid:3,ranger:1},      stat:'DEX' },
    ]
  },

  // ── COMING OF AGE (15) ────────────────────────────────────────────────────
  { id:'crossroads', age:15, maxAgeSpan:4,
    title:'The Crossroads',
    text:'You are old enough to see what people do with their lives. Not old enough to know if it matters. A choice is in front of you.',
    choices:[
      { text:'You find a mentor — someone who does the thing you want to do, and you watch until they let you help.',  affinity:{fighter:2,ranger:1},   stat:'STR', gold:0,  effect:{stat:'STR',v:1} },
      { text:'You spend a year reading everything you can find. You emerge stranger and more useful.',                  affinity:{mage:3,cleric:1},      stat:'INT', gold:0,  effect:{stat:'INT',v:1} },
      { text:'You talk your way into rooms you have no business being in. It works more than it should.',              affinity:{bard:2,rogue:2},       stat:'CHA', gold:8,  effect:{stat:'CHA',v:1} },
      { text:'You disappear into the wilderness for months. You come back knowing things no book contains.',            affinity:{druid:2,ranger:2},     stat:'WIS', gold:0,  effect:{stat:'WIS',v:1} },
      { text:'You apprentice to a merchant. By the end of the year you understand how gold really moves.',             affinity:{merchant:3,bard:1},    stat:'CHA', gold:15, effect:{stat:'CHA',v:1} },
      { text:'You work a full season on a farm. It is harder and more satisfying than you expected.',                  affinity:{farmer:3,druid:1},     stat:'CON', gold:5,  effect:{stat:'CON',v:1} },
      { text:'You spend months learning to cook properly. People start seeking you out for it.',                       affinity:{chef:3,cleric:1},      stat:'WIS', gold:10, effect:{stat:'WIS',v:1} },
      { text:'You learn carpentry from the ground up. You make something that lasts.',                                 affinity:{carpenter:3,fighter:1},stat:'STR', gold:8,  effect:{stat:'STR',v:1} },
    ]
  },

  // ── FIRST TEST (20) ───────────────────────────────────────────────────────
  { id:'firstTest', age:20, maxAgeSpan:8,
    title:'Tested',
    text:'Something real is asked of you for the first time. Not a lesson. Not a rehearsal. The kind of moment you will tell people about — or not.',
    choices:[
      { text:'You step forward when everyone else steps back. It costs you something. It was worth it.',   affinity:{fighter:3,paladin:2}, stat:'CON', gold:0,  effect:{stat:'CON',v:1} },
      { text:'You solve it when no one else can see the solution. They remember your name after.',          affinity:{mage:2,rogue:2},      stat:'INT', gold:15, effect:{stat:'INT',v:1} },
      { text:'You talk the situation down. No blood. Everyone is surprised, including you.',                affinity:{bard:2,cleric:2},     stat:'CHA', gold:0,  effect:{stat:'CHA',v:1} },
      { text:'You endure. You take the hit and you are still standing when it is over.',                    affinity:{barbarian:2,fighter:2},stat:'STR', gold:0,  effect:{stat:'STR',v:1} },
    ]
  },

  // ── REPUTATION (30) ──────────────────────────────────────────────────────
  { id:'reputation', age:30, maxAgeSpan:10,
    title:'What People Say',
    text:'By thirty, people have decided what you are. Some of it is true. You have a chance to shape the rest.',
    choices:[
      { text:'You lean into the reputation for danger. Let them fear you a little. It keeps things simple.',  affinity:{fighter:2,rogue:2},   stat:'STR', gold:20, effect:{stat:'STR',v:1} },
      { text:'You build a reputation for wisdom. People start coming to you before they make mistakes.',       affinity:{cleric:2,druid:2},    stat:'WIS', gold:10, effect:{stat:'WIS',v:1} },
      { text:'You become known for getting things done quietly. The work speaks. You do not have to.',         affinity:{rogue:3,ranger:1},    stat:'DEX', gold:25, effect:{stat:'DEX',v:1} },
      { text:'You become someone people trust. That is rarer and more valuable than being feared.',            affinity:{paladin:2,bard:2},    stat:'CHA', gold:15, effect:{stat:'CHA',v:1} },
    ]
  },

  // ── THE LONG MIDDLE (45) ─────────────────────────────────────────────────
  { id:'longMiddle', age:45, maxAgeSpan:12,
    title:'The Long Middle',
    text:'The dramatic years are behind you. Ahead is something harder — the ordinary stretch. You decide what to do with it.',
    choices:[
      { text:'You take on a student. Teaching is its own kind of mastery.',                                   affinity:{paladin:2,cleric:2},  stat:'WIS', gold:0,  effect:{stat:'WIS',v:2} },
      { text:'You go back to the thing you set aside years ago. You are better at it now.',                    affinity:{mage:2,bard:2},       stat:'INT', gold:0,  effect:{stat:'INT',v:2} },
      { text:'You take a contract no one else will touch. The money is good. The risk is real.',               affinity:{fighter:2,rogue:2},   stat:'CON', gold:60, effect:{stat:'CON',v:1} },
      { text:'You build something. Not a thing — a network. People. Favours. Slowly.',                         affinity:{bard:2,rogue:2},      stat:'CHA', gold:30, effect:{stat:'CHA',v:2} },
    ]
  },

  // ── RECKONING (60) ───────────────────────────────────────────────────────
  { id:'reckoning', age:60, maxAgeSpan:15,
    title:'The Reckoning',
    text:'At sixty you start settling accounts — not money, but the other kind. What you did. What you did not do. What there is still time for.',
    choices:[
      { text:'You make amends for something long overdue. You pay what you can. The gesture matters more than the amount.', affinity:{paladin:3,cleric:2}, stat:'WIS', gold:-20, effect:{stat:'WIS',v:2} },
      { text:'You do the dangerous thing you have been putting off since you were thirty.',                    affinity:{fighter:2,barbarian:1},stat:'STR', gold:40,  effect:{stat:'CON',v:1} },
      { text:'You write it down. Not a memoir — a record. For whoever comes next.',                            affinity:{mage:2,cleric:2},     stat:'INT', gold:0,   effect:{stat:'INT',v:2} },
      { text:'You let go of something you have been carrying. The weight goes with it.',                       affinity:{druid:3,ranger:1},    stat:'WIS', gold:0,   effect:{stat:'WIS',v:2} },
    ]
  },
];

export default function GameScreen({ char: initial, onDeath, onSave }){
  const [char, setChar]         = useState(initial);
  const [tab, setTab]           = useState('life');
  const [ageUpLoading, setAgeUpLoading] = useState(false);
  const [affinityModal, setAffinityModal] = useState(null); // pending affinity event
  const [affinityOutcome, setAffinityOutcome] = useState(null); // shown briefly after choice
  const [travellerItems, setTravellerItems] = useState([]); // items shown for strangersGift
  const [eventModal, setEventModal]       = useState(null); // { event, outcome }
  const [modalQueue, setModalQueue]       = useState([]); // pending eventModals to show in sequence
  // Show a modal now if none is open, otherwise queue it so colliding events aren't lost.
  function pushEventModal(m){
    if(!m) return;
    setEventModal(prev => {
      if(prev){ setModalQueue(q => [...q, m]); return prev; }
      return m;
    });
  }
  // Close the current modal and advance to the next queued one, if any.
  function closeEventModal(){
    setModalQueue(q => {
      if(q.length){ setEventModal(q[0]); return q.slice(1); }
      setEventModal(null); return q;
    });
  }
  const [deathScreen, setDeathScreen]     = useState(null);
  const [showTutorial, setShowTutorial]   = useState(!initial.tutorialDone);
  const [worldEvent, setWorldEvent]       = useState(null);
  const [aiMoment, setAiMoment]           = useState(null);
  const [energyWarning, setEnergyWarning] = useState(false);
  const [saveToast, setSaveToast]         = useState(false);
  const [sexualityModal, setSexualityModal] = useState(false);
  const [endRunModal, setEndRunModal]         = useState(false);
  const timeoutRefs = useRef([]);
  function safeTimeout(fn, ms){ const id=setTimeout(fn,ms); timeoutRefs.current.push(id); return id; }
  const [drawerOpen, setDrawerOpen]       = useState(false); // tab drawer
  const [drawerTab, setDrawerTab]         = useState(null);
  const [worldEventVisible, setWorldEventVisible] = useState(false); // scroll animation

  // Check for pending affinity event on mount and age change
  // Cleanup all timeouts on unmount
  useEffect(()=>{ return ()=>{ timeoutRefs.current.forEach(clearTimeout); }; },[]);

  useEffect(() => {
    if(char.alive === false){ setDeathScreen(char); return; }
    // Don't surface childhood/affinity events while the tutorial overlay is up, or
    // while one is already open or playing out its outcome — strictly one at a time.
    if(showTutorial) return;
    if(affinityModal || affinityOutcome) return;
    const used = new Set(char.usedAffinityIds||[]);
    // Age-appropriate window: an event is eligible from its `age` up to `age + (maxAgeSpan||4)`.
    // A missed childhood memory expires rather than surfacing in adulthood.
    const pending = AFFINITY_EVENTS.find(e => {
      if(used.has(e.id)) return false;
      const span = e.maxAgeSpan ?? 4;
      return char.age >= e.age && char.age <= e.age + span;
    });
    if(pending){
      setAffinityModal(pending);
      if(pending.type === 'traveller') setTravellerItems(pickTravellerItems());
    }
  }, [char.age, char.alive, showTutorial, affinityModal, affinityOutcome]);

  function handleAction(updated){
    // Check for death via health reaching 0 (e.g. fatal quest injury)
    if((updated.health||100) <= 0 && !updated.deathScreenShown){
      updated = {...updated, alive:false, deathScreenShown:true,
        deathCause: updated.deathCause || 'Fell in the line of duty.'};
    }
    setChar(updated);
    saveChar(updated);
    if(onSave) onSave(updated);
    if(!updated.alive || (updated.health||100) <= 0) setDeathScreen(updated);
    // Tabs only close when explicitly tapped — never auto-close after action
  }

  function handleAffinityChoice(event, choice){
    const aff = { ...(char.affinities||{}) };
    Object.entries(choice.affinity||{}).forEach(([k,v])=>{ aff[k]=(aff[k]||0)+v; });
    // Handle special actions from affinity choices
    if(choice.special === 'leaveHome'){
      setChar(c => ({...c, hasMovedOut:true}));
    }
    const usedIds = [...(char.usedAffinityIds||[]), event.id];
    let stats = { ...char.stats };
    // Apply the primary stat nudge (+1) only for early events without an effect field
    if(choice.stat && !choice.effect) stats[choice.stat] = Math.min(20,(stats[choice.stat]||1)+1);
    // Apply the effect field for later events
    if(choice.effect?.stat) stats[choice.effect.stat] = Math.min(20,(stats[choice.effect.stat]||1)+choice.effect.v);
    // Gold: explicit gold field (can be negative for reckoning), or effect.gold
    let gold = char.gold;
    if(typeof choice.gold === 'number') gold = Math.max(0, gold + choice.gold);

    // Resolve class if enough affinity
    const resolved = resolveClass(aff);
    let classId = char.classId;
    let classReveal = null;
    if(!classId && resolved && CLASSES[resolved] && char.age >= 12){
      classId = resolved;
      classReveal = resolved;
    }

    const updated = {
      ...char, affinities:aff, usedAffinityIds:usedIds, stats, gold, classId,
      log:[...(char.log||[]),{ age:char.age, text:(choice.outcome||choice.text).slice(0,120), type:'neutral' }],
    };
    setChar(updated);
    saveChar(updated);
    // If choice has an outcome, show it briefly before closing
    if(choice.outcome){
      setAffinityOutcome(choice.outcome);
      setTimeout(()=>{ setAffinityOutcome(null); setAffinityModal(null); }, 2000);
    } else {
      setAffinityModal(null);
    }

    if(classReveal){
      const cls = CLASSES[classReveal];
      pushEventModal({ type:"classReveal", cls, classId:classReveal });
    }
  }

  function handleTravellerChoice(item){
    if(navigator?.vibrate) navigator.vibrate(50);
    const aff = { ...(char.affinities||{}) };
    Object.entries(item.affinity||{}).forEach(([k,v])=>{ aff[k]=(aff[k]||0)+v; });
    const usedIds = [...(char.usedAffinityIds||[]), 'strangersGift'];
    const stats = { ...char.stats, [item.bonus.stat]: Math.min(20,(char.stats[item.bonus.stat]||1)+item.bonus.v) };

    const resolved = resolveClass(aff);
    let classId = char.classId;
    let classReveal = null;
    if(!classId && resolved && CLASSES[resolved] && char.age >= 12){
      classId = resolved;
      classReveal = resolved;
    }

    const updated = {
      ...char, affinities:aff, usedAffinityIds:usedIds, stats, classId,
      inventory:[...(char.inventory||[]), { id:item.id, name:item.name, emoji:item.emoji }],
      log:[...(char.log||[]),{ age:char.age, text:`The traveller gave you ${item.name}.`, type:'good' }],
    };
    setChar(updated);
    saveChar(updated);
    setAffinityModal(null);
    if(classReveal){
      const cls = CLASSES[classReveal];
      pushEventModal({ type:"classReveal", cls, classId:classReveal });
    }
  }

  // Called on every Age Up button press — advances one season
  // Full year logic only runs on the 4th press (step 3 → 0 rollover)
  async function handleAgeUp(){
    // Don't advance while a blocking modal is open, the tutorial is up, the death
    // screen is showing, or a previous age-up is still resolving (re-entrancy guard).
    if(affinityModal || affinityOutcome || eventModal || showTutorial || deathScreen) return;
    if(ageUpLoading) return;
    if(navigator?.vibrate) navigator.vibrate([40,20,40]);

    const step = char.currentSeasonStep||0;
    const SEASON_NAMES = ['Spring','Summer','Autumn','Winter'];
    const age = char.age||0;

    // ── Ages 0–6: full year advance only, no seasonal steps ───────────────────
    // ── Mid-season advance (steps 0→1, 1→2, 2→3) — only age 7+ ─────────────
    if(age >= 7 && step < 3){
      const nextStep = step + 1;
      const nextSeason = SEASON_NAMES[(((char.startSeasonIdx||0) + nextStep)) % 4];
      let updated = {
        ...char,
        currentSeasonStep: nextStep,
        currentSeason: ((char.startSeasonIdx||0) + nextStep) % 4,
        seasonActions: {},
        energyUsed: {},
        seasonNpcInteractions: {},
        questDaysUsed: 0,
        seasonInteractions: {},
        seasonCompletedQuests: [],
        seasonFailedQuests: [],
        fedThisSeason: false,
        log:[...(char.log||[]),{
          age:char.age,
          text:`${nextSeason} arrives. A new season begins.`,
          type:'neutral',
          seasonChange:true,
        }],
      };
      if(char.startSeasonIdx===null||char.startSeasonIdx===undefined){
        updated.startSeasonIdx = Math.floor(Math.random()*4);
      }
      // ── Business income/production for this season ──────────────────────────
      if((updated.businesses||[]).length){
        const biz = processBusinessSeason(updated);
        updated.gold = Math.max(0, (updated.gold||0) + biz.goldDelta);
        updated.businesses = biz.businesses;
        if(biz.logs.length) updated.log = [...(updated.log||[]), ...biz.logs.map(l=>({age:updated.age,...l}))];
      }
      await saveChar(updated);
      setChar(updated);
      setSaveToast(true); safeTimeout(()=>setSaveToast(false),1500);
      return;
    }

    // ── Full year advance (step 3 → 0 OR age < 5) ────────────────────────────
    setAgeUpLoading(true);
    try{
    setWorldEvent(null); setWorldEventVisible(false);
    // Fallback: set startSeasonIdx if never set
    const charWithSeason = (char.startSeasonIdx===null||char.startSeasonIdx===undefined)
      ? {...char, startSeasonIdx:Math.floor(Math.random()*4)}
      : char;
    const newAge = (charWithSeason.age||0)+1;
    // Full year starts at step 0 (Spring of the new year)
    const season = SEASONS[(charWithSeason.startSeasonIdx||0) % 4];
    const seasonEff = SEASON_EFFECTS[season]||{};

    // ── Natural death (age 65+, CON mitigates) ───────────────────────────────
    if(newAge >= 65){
      const basePct = (newAge-65)*2;
      const conBonus = (char.stats?.CON||10)-10;
      const longevityBonus = char.longevityBonus||0;
      if(chance(Math.max(0,basePct-conBonus-longevityBonus))){
        const deathSeason = SEASONS[(char.startSeasonIdx||0)%4];
        const deathSeasonText = {Spring:'in the spring',Summer:'in the heat of summer',Autumn:'as autumn faded',Winter:'in the cold of winter'}[deathSeason]||'';
        const ageDeathMessages = newAge>=90
          ? [`You had a long life. A very long life. At the end, ${deathSeasonText}, you were at peace with it.`
            ,'They said you were ancient even by the standards of the old world. You smiled at that.'
            ,`You passed in your sleep ${deathSeasonText}. No fuss. As it should be in ${WORLD.kingdom}.`]
          : newAge>=75
          ? [`You had a good run in ${WORLD.kingdom}. Better than most.`
            ,'The seasons took you gently. You were ready.'
            ,'You passed surrounded by what you had built.']
          : ['Age came for you sooner than expected.'
            ,'Your body gave out before your will did.'
            ,'You went quietly, in the end.'];
        const ageMsg = ageDeathMessages[Math.floor(Math.random()*ageDeathMessages.length)];
        const dead = { ...char, age:newAge, alive:false, deathCause:'Old age',
          legacyScore:calcLegacyScore({...char,age:newAge}),
          log:[...(char.log||[]),{age:newAge,text:ageMsg,type:'death'}] };
        await saveChar(dead); setChar(dead); setDeathScreen(dead); setAgeUpLoading(false); return;
      }
    }

    // ── Random violent death (bandits/accident, scales after 18) ─────────────
    if(newAge >= 18 && !char.sickness){
      const worldViolenceBoost = (char.activeWorldEffects?.violenceBoost)||0;
      // Criminal record raises risk but with diminishing returns (soft cap), so a
      // career criminal is dangerous but not near-certain dead each year. Combat
      // skill mitigates. A clean year with no fresh crimes lets the record cool.
      const recRisk = Math.min(10, Math.sqrt(char.criminalRecord||0) * 3);   // caps ~10% from record
      const violenceChance = Math.max(0, 1 + recRisk - (char.skills?.combat||0) + worldViolenceBoost);
      if(chance(violenceChance)){
        const causes = ['Killed by bandits on the road','A tavern brawl that went too far','Caught in the wrong place at the wrong time','An old enemy settled a score'];
        const cause = causes[Math.floor(Math.random()*causes.length)];
        const dead = { ...char, age:newAge, alive:false, deathCause:cause,
          legacyScore:calcLegacyScore({...char,age:newAge}),
          log:[...(char.log||[]),{age:newAge,text:cause+(char.classId?` Your ${CLASSES[char.classId]?.name||'path'} led you here.`:''),type:'death'}] };
        await saveChar(dead); setChar(dead); setDeathScreen(dead); setAgeUpLoading(false); return;
      }
    }

    let updated = { ...charWithSeason, age:newAge, currentSeasonStep:0, currentSeason:(charWithSeason.startSeasonIdx||0)%4, energyUsed:{}, yearActions:[], crimesDoneThisYear:0, usedChoiceEvents:[], activeWorldEffects:{}, seasonInteractions:{}, seasonNpcInteractions:{}, seasonActions:{}, questDaysUsed:0, seasonCompletedQuests:[], seasonFailedQuests:[], fedThisSeason:false, adoptedThisYear:false };
    // A clean year (no fresh crimes) lets a criminal record cool slowly as memories fade.
    if(!(char.crimesDoneThisYear>0) && (updated.criminalRecord||0)>0){
      updated.criminalRecord = Math.max(0, updated.criminalRecord - 1);
    }
    // usedChoiceEventsAll is preserved (cooldown tracking) — only the yearly set clears

    // ── Sickness tick ─────────────────────────────────────────────────────────
    if(char.sickness){
      const s = char.sickness;
      updated.stats = { ...updated.stats, [s.stat]: Math.max(0,(updated.stats[s.stat]||1)-s.drain) };
      if(updated.stats[s.stat] <= 0){
        updated.alive = false; updated.deathCause = `Died of ${s.name}`;
        updated.legacyScore = calcLegacyScore(updated);
        updated.log = [...(updated.log||[]),{age:newAge,text:`The ${s.name} claimed you.`,type:'death'}];
        await saveChar(updated); setChar(updated); setDeathScreen(updated); setAgeUpLoading(false); return;
      }
      updated.log = [...(updated.log||[]),{age:newAge,text:`${s.name} worsened. ${s.stat} -${s.drain}.`,type:'bad'}];
    }

    // ── Under 8: parents manage sickness — child can't visit healer themselves ─
    if(newAge < 8 && updated.sickness){
      const s = updated.sickness;
      const healerCost = s.cost || 5;
      if((updated.gold||0) >= healerCost){
        // Parents pay for a healer
        updated.gold = (updated.gold||0) - healerCost;
        updated.sickness = null;
        updated.log = [...(updated.log||[]),{age:newAge,text:`Your parent called the healer. The ${s.name} passed. Cost ${healerCost}g.`,type:'good'}];
      } else {
        // Can't afford healer — sickness worsens, health drops
        updated.health = Math.max(1,(updated.health||100)-8);
        updated.log = [...(updated.log||[]),{age:newAge,text:`No coin for the healer. The ${s.name} lingered. You lost 8 health.`,type:'bad'}];
      }
    }

    // ── Blessing sickness modifier — must be computed before sicknessChance ────
    const blessings_pre = (char.blessings||[]);
    const blessEff_pre = getActiveBlessingEffects({...char, worshippedDeity:char.worshippedDeity});
    const blessingSicknessMod = blessEff_pre.sicknessMod||0;

    // ── Sickness chance — scales with age ────────────────────────────────────
    const sicknessBoost = (char.activeWorldEffects?.sicknessBoost)||0;
    const seasonSickMod = getSeasonSicknessModifier(season);
    const sicknessChance = (newAge < 10 ? 8 : newAge < 30 ? 5 : newAge < 50 ? 6 : newAge < 65 ? 10 : 16) + sicknessBoost + seasonSickMod + blessingSicknessMod;
    if(!updated.sickness && chance(sicknessChance)){
      updated.sickness = rollSickness();
      updated.log = [...(updated.log||[]),{age:newAge,text:`You fell ill with ${updated.sickness.name}.`,type:'bad'}];
      // Surface it as a card with options (treat / rest / ignore) — only when old
      // enough to act for themselves; under-8 sickness is handled by parents above.
      if(newAge >= 8){
        pushEventModal({ type:'sickness', sickness:updated.sickness, healerCost:updated.sickness.cost||20 });
      }
    }

    // ── Mortgage annual repayments ───────────────────────────────────────────────
    if(updated.mortgage){
      const m = updated.mortgage;
      if(updated.gold >= m.annualPayment){
        updated.gold -= m.annualPayment;
        updated.mortgage = { ...m, totalDebt:Math.max(0,m.totalDebt-m.annualPayment) };
        if(updated.mortgage.totalDebt <= 0){
          updated.mortgage = null;
          updated.log=[...(updated.log||[]),{age:newAge,text:'Mortgage paid off. The property is fully yours.',type:'good'}];
        } else {
          updated.log=[...(updated.log||[]),{age:newAge,text:`Mortgage payment: ${m.annualPayment}g. ${updated.mortgage.totalDebt}g remaining.`,type:'neutral'}];
        }
      } else {
        // Miss payment — second miss = repossession
        const missCount = (m.missedPayments||0)+1;
        if(missCount >= 2){
          updated.properties=(updated.properties||[]).filter(p=>p.id!==m.propertyId);
          updated.mortgage=null;
          updated.log=[...(updated.log||[]),{age:newAge,text:'Your property was repossessed. Two missed mortgage payments.',type:'bad'}];
        } else {
          updated.mortgage={...m,missedPayments:missCount};
          updated.log=[...(updated.log||[]),{age:newAge,text:`Missed mortgage payment. One more miss and the property will be repossessed.`,type:'bad'}];
        }
      }
    }

    // ── Poverty cascade ───────────────────────────────────────────────────────
    const povertyParentAlive = (updated.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false&&!r.disowned);
    const povertyLivingWithParents = !updated.hasMovedOut && povertyParentAlive;
    if(newAge >= 8 && !povertyLivingWithParents){
      const isFlat = (updated.gold||0) <= 0;
      if(isFlat){
        updated.mealPreference = 'scraps';
        updated.log=[...(updated.log||[]),{age:newAge,text:'You have no gold. You are living on scraps.',type:'bad'}];
        updated.health = Math.max(1,(updated.health||100)-5);
        updated.povertyYears = (updated.povertyYears||0)+1;
        if(updated.povertyYears === 1){
          const spouseRel = (updated.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false);
          if(spouseRel) updated.log=[...(updated.log||[]),{age:newAge,text:`${spouseRel.name} is worried about money. If things do not improve, they may leave.`,type:'bad'}];
        }
        if(updated.povertyYears >= 2){
          const spouseRel = (updated.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false);
          if(spouseRel){
            const childIds = (updated.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false).map(r=>r.id);
            updated.relationships = (updated.relationships||[]).map(r=>{
              if(r.id===spouseRel.id) return {...r, type:'estranged_spouse', score:Math.max(0,(r.score||50)-40)};
              if(childIds.includes(r.id)) return {...r, inHousehold:false, withOtherParent:true};
              return r;
            });
            updated.household = (updated.household||[]).filter(id=>!childIds.includes(id)&&id!==spouseRel.id);
            updated.spouse = null;
            updated.log=[...(updated.log||[]),{age:newAge,text:`${spouseRel.name} left. They took the children. Two years of poverty was too much.`,type:'bad'}];
          }
        }
      } else {
        // Back on feet — reset poverty counter
        updated.povertyYears = 0;
      }
    }

    // ── Rental cost (if renting rather than owning) ────────────────────────────
    if(updated.rentedProperty){
      const rp = updated.rentedProperty;
      if(updated.gold >= rp.annualRent){
        updated.gold -= rp.annualRent;
        updated.rentedProperty = { ...rp, yearsRented:(rp.yearsRented||0)+1 };
        // Rent increases after 3 years
        if((updated.rentedProperty.yearsRented)%3===0){
          const increase = Math.ceil(rp.annualRent*0.1);
          updated.rentedProperty.annualRent = rp.annualRent+increase;
          updated.log=[...(updated.log||[]),{age:newAge,text:`Your landlord raised rent by ${increase}g. Now ${updated.rentedProperty.annualRent}g/year.`,type:'bad'}];
        }
      } else {
        // Can't pay rent — check owned properties first
        const ownedProps = (updated.properties||[]).filter(p=>!p.isHome);
        if(ownedProps.length > 0){
          // Flag for player to decide — auto move into first owned property
          const owned = ownedProps[0];
          updated.rentedProperty = null;
          updated.properties = (updated.properties||[]).map(p=>p.id===owned.id?{...p,isHome:true}:p);
          updated.log=[...(updated.log||[]),{age:newAge,text:`You could not pay rent and were evicted. You moved into your ${owned.type}.`,type:'bad'}];
        } else {
          updated.rentedProperty = null;
          // Check for tent
          const hasTent = (updated.inventory||[]).some(i=>i.isTent);
          if(hasTent){
            updated.log=[...(updated.log||[]),{age:newAge,text:'You could not pay rent. You were evicted. You are sleeping in your tent.',type:'bad'}];
          } else {
            updated.log=[...(updated.log||[]),{age:newAge,text:'You could not pay rent. You were evicted and have no shelter. Buy a tent from the market.',type:'bad'}];
          }
        }
      }
    }

    // ── Property maintenance costs ────────────────────────────────────────────
    const properties = updated.properties||[];
    if(properties.length > 0){
      const maintenance = properties.reduce((sum,p)=>sum+getMaintenance(p,newAge),0);
      const rentIncome  = properties.filter(p=>p.rentedOut).reduce((sum,p)=>sum+(PROPERTY_TYPES[p.type]?.income||0),0);
      const net = rentIncome - maintenance;
      updated.gold = Math.max(0,(updated.gold||0)+net);
      if(net > 0) updated.log = [...(updated.log||[]),{age:newAge,text:`Properties: +${rentIncome}g income, −${maintenance}g upkeep (net +${net}g).`,type:'good'}];
      else if(net < 0) updated.log = [...(updated.log||[]),{age:newAge,text:`Property upkeep cost ${maintenance}g this year.`,type:'bad'}];
      // Mark properties as degraded if you can't afford upkeep
      if(updated.gold === 0 && maintenance > 0){
        updated.log = [...(updated.log||[]),{age:newAge,text:'You could not cover all upkeep. Some properties fell into disrepair.',type:'bad'}];
      }
    }

    // ── Leaving home events ──────────────────────────────────────────────────────
    if(newAge === 15 && !(updated.hasMovedOut)){
      // Age 15: offered optional choice to move out
      setAffinityModal({
        id:'leave_home_15',
        title:'A thought occurs to you',
        text:'You are fifteen. The house feels smaller than it used to. Some of your friends have already left. You could go — nothing is stopping you.',
        choices:[
          { text:'Stay a while longer.', outcome:'Not yet. There is still something here.', affinity:{} },
          { text:'Start looking for your own place.', outcome:'You told them you were thinking about it. Nobody argued.', affinity:{}, special:'leaveHome' },
        ]
      });
    }

    // ── Move-out advance notice at age 16 ────────────────────────────────────────
    if(newAge === 16 && !(updated.hasMovedOut) && !updated.moveOutNoticeGiven){
      const parentAlive = (updated.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false);
      if(parentAlive){
        updated.moveOutNoticeGiven = true;
        updated.log=[...(updated.log||[]),{age:newAge,text:'Your parents make it gently clear: by eighteen, they expect you to have a place of your own. Best to start planning — a rented room, a tent, or a home to buy.',type:'neutral'}];
      }
    }
    if(newAge === 8 && !updated.guildKnown){
      updated.guildKnown = true;
      pushEventModal({
        type:'guildCall',
        title:'A Notice on the Board',
        text:`The Adventurers Guild in ${WORLD.town} takes on youngsters for small, safe jobs — chasing off cellar-slimes, rounding up horned hares, gathering herbs, finding lost pets. The pay is coppers, but everyone starts somewhere.`,
        choices:[
          { text:'Sign up for small jobs.', action:'join' },
          { text:'Maybe when I am older.', action:'skip' },
        ],
      });
    }

    // ── Guild comes of age (age 16) — real contracts open ───────────────────────
    if(newAge === 16){
      const txt = updated.guildJoined
        ? 'You are sixteen now. The quartermaster says you are old enough for real contracts — the kind with real danger, and real reward. Your rank can rise past F from here.'
        : `You are sixteen. The Adventurers Guild in ${WORLD.town} will take you on for real contracts now — dangerous work, but the only fast way up.`;
      pushEventModal({
        type:'guildCall',
        title:'Old Enough Now',
        text:txt,
        choices: updated.guildJoined
          ? [ { text:'Understood.', action:'skip' } ]
          : [ { text:'Join the guild.', action:'join' }, { text:'Not yet.', action:'skip' } ],
      });
    }

    // ── Life stage milestone events ───────────────────────────────────────────
    const lifeStageTexts = {
      5:  'Your first real memories begin to form. The world is wider than you knew.',
      8:  'You are old enough to have opinions now. And to be wrong about things.',
      10: 'A decade. You are more capable than people give you credit for.',
      13: 'Something shifts. The world feels more complicated than it used to.',
      21: 'You are fully yourself now. Or the beginning of it.',
      25: 'The recklessness of youth is fading. You are starting to think ahead.',
      30: 'Thirty. You know who you are. Whether you like it is another question.',
      40: 'The body starts to have opinions. You start to have fewer arguments with it.',
      50: 'Half a century. You have outlived some things you thought would outlast you.',
      60: 'The joints know the weather now. There are worse ways to forecast.',
      65: 'You are elder now by any measure. People ask your opinion more.',
      70: 'Seventy. Every year past this is a gift, and you know it.',
      75: 'The world has changed so much since you were born. You have changed more.',
    };
    if(lifeStageTexts[newAge]){
      updated.log=[...(updated.log||[]),{age:newAge,text:lifeStageTexts[newAge],type:'neutral'}];
    }

    if(newAge === 18 && !(updated.hasMovedOut)){
      // Age 18: must leave unless CHA + relationship check passes
      const parentRel = (updated.relationships||[]).find(r=>r.type==='parent'&&r.alive!==false);
      const parentScore = parentRel?.score||50;
      const cha = updated.stats?.CHA||1;
      const stayChance = Math.min(60, (cha*3) + (parentScore*0.3));
      if(!chance(stayChance)){
        updated.hasMovedOut = true;
        updated.log=[...(updated.log||[]),{age:newAge,text:'You are eighteen. The time has come to find your own place in the world.',type:'neutral'}];
      } else {
        updated.log=[...(updated.log||[]),{age:newAge,text:'You are eighteen. Your parents are letting you stay a little longer — but you know it cannot last.',type:'neutral'}];
      }
    }

    if(newAge > 18 && !(updated.hasMovedOut)){
      // Each year after 18: small check to stay
      const parentRel = (updated.relationships||[]).find(r=>r.type==='parent'&&r.alive!==false);
      const parentScore = parentRel?.score||30;
      const cha = updated.stats?.CHA||1;
      const stayChance = Math.min(30, (cha*2) + (parentScore*0.15));
      if(!chance(stayChance)){
        updated.hasMovedOut = true;
        updated.log=[...(updated.log||[]),{age:newAge,text:'You cannot put it off any longer. You have to find your own way.',type:'neutral'}];
      }
    }

    // Marriage forces move out
    if(updated.spouse && !(updated.hasMovedOut)){
      updated.hasMovedOut = true;
    }

    // ── Shelter check — sleeping rough causes illness ───────────────────────────
    if(newAge >= 18){
      const hasProperty = (updated.properties||[]).length > 0;
      const hasRented   = !!updated.rentedProperty;
      const hasTent     = (updated.inventory||[]).some(i=>i.isTent);
      const hasMovedOut = !!(updated.hasMovedOut);
      if(hasMovedOut && !hasProperty && !hasRented && !hasTent){
        // Sleeping rough — sickness risk and health drain
        updated.health = Math.max(1,(updated.health||100)-10);
        if(chance(30)) updated.sickness = { id:'exposure',name:'Winter Exposure',stat:'CON',drain:1,cost:10,severity:1,desc:'Sleeping rough in the cold has weakened you.' };
        updated.log=[...(updated.log||[]),{age:newAge,text:'You have nowhere of your own, so you sleep rough. The exposure wears you down. A rented room, a tent, a home to buy, or moving back in with family would all end it.',type:'bad'}];
      }
      // Tent degrades relationship with spouse over time
      if(hasTent && updated.spouse){
        const spouseRel = (updated.relationships||[]).find(r=>r.id===updated.spouse&&r.alive!==false);
        if(spouseRel && spouseRel.score > 20){
          updated.relationships=(updated.relationships||[]).map(r=>
            r.id===updated.spouse ? {...r,score:r.score-5} : r
          );
          updated.log=[...(updated.log||[]),{age:newAge,text:'Living in a tent is wearing on your marriage.',type:'bad'}];
        }
      }
    }

    // ── Tick relationships ────────────────────────────────────────────────────
    const { relationships:tickedRels, relEvents } = tickRelationships(updated);
    updated.relationships = tickedRels;
    // If spouse died in the tick, clear char.spouse so checks don't fire
    if(updated.spouse){
      const spouseStillAlive = tickedRels.find(r=>r.id===updated.spouse&&r.alive!==false);
      if(!spouseStillAlive){
        updated.spouse = null;
        updated.combineIncomes = false;
        updated.spouseDeathYear = newAge; // track for remarriage cooldown
      }
    }
    for(const ev of relEvents){
      updated.log = [...(updated.log||[]),{age:newAge,text:ev.text,type:ev.type}];
      if(ev.bonus?.gold) updated.gold = (updated.gold||0)+ev.bonus.gold;
    }

    // ── Stat ageing (DEX/STR decline after 60) ─────────────────────────────────
    updated = applyStatAgeing(updated);

    // ── Season flavour ────────────────────────────────────────────────────────
    updated.log = [...(updated.log||[]),{age:newAge,text:`${season}. ${seasonEff.desc}`,type:'neutral'}];

    // ── Farmer class bonus in Autumn ─────────────────────────────────────────
    if(char.classId==='farmer' && season==='Autumn'){
      if(char.activeWorldEffects?.farmPenalty){
        updated.log = [...(updated.log||[]),{age:newAge,text:'The drought hurt the harvest badly this year.',type:'bad'}];
      } else {
        const bonus = rand(5,15);
        updated.gold = (updated.gold||0)+bonus;
        updated.log = [...(updated.log||[]),{age:newAge,text:`Good harvest. +${bonus}g.`,type:'good'}];
      }
    }

    // ── Random life event ─────────────────────────────────────────────────────
    const event = pickAgeEvent(newAge);
    const { char:withEvent, effects } = applyAgeEvent(updated, event);
    updated = withEvent;
    if(event.text) updated.log = [...(updated.log||[]),{age:newAge,text:event.text,type:event.type}];

    // ── Quest consequences from previous years ────────────────────────────────
    const questConsequences = (char.questConsequences||[]);
    const fireNow = questConsequences.filter(qc=>qc.fireAtAge===newAge);
    const keepFuture = questConsequences.filter(qc=>qc.fireAtAge>newAge);
    for(const qc of fireNow){
      const eff = qc.effect||{};
      if(eff.gold){ const g=typeof eff.gold==='function'?eff.gold():eff.gold; updated.gold=Math.max(0,(updated.gold||0)+g); }
      if(eff.health){ updated.health=Math.max(1,Math.min(100,(updated.health||100)+eff.health)); }
      if(eff.stat){ updated.stats={...updated.stats,[eff.stat]:Math.min(20,(updated.stats[eff.stat]||1)+eff.v)}; }
      updated.log=[...(updated.log||[]),{age:newAge,text:qc.text,type:qc.type||'neutral'}];
    }
    updated.questConsequences = keepFuture;

    // ── World event ───────────────────────────────────────────────────────────
    // Track world events with 3yr cooldown
    const recentWEs = (char.recentWorldEvents||[]).filter(e=>newAge-e.age<3);
    const worldEv = pickWorldEvent(newAge, recentWEs, updated.location||'village');
    if(worldEv){
      const weff = worldEv.effect||{};
      if(weff.health) updated.health = Math.max(0,Math.min(100,(updated.health||100)+weff.health));
      if(weff.gold){
        const g = typeof weff.gold==='function'?weff.gold():weff.gold;
        updated.gold = Math.max(0,(updated.gold||0)+g);
      }
      if(weff.stat) updated.stats = { ...updated.stats, [weff.stat]:Math.min(20,(updated.stats[weff.stat]||1)+(weff.v||1)) };
      updated.log = [...(updated.log||[]),{age:newAge,text:`${worldEv.emoji} ${worldEv.title}: ${worldEv.text}`,type:'neutral'}];
      updated.recentWorldEvents = [...recentWEs, {id:worldEv.id, age:newAge}];
      // Apply secondary world event effects
      const weff2 = worldEv.effect||{};
      const activeEffects = {};
      if(weff2.violenceBoost) activeEffects.violenceBoost = weff2.violenceBoost;
      if(weff2.sicknessChanceBoost) activeEffects.sicknessBoost = weff2.sicknessChanceBoost;
      if(worldEv.farmPenalty) activeEffects.farmPenalty = true;
      if(Object.keys(activeEffects).length) updated.activeWorldEffects = activeEffects;
      // Player-context world effects
      const hasFarmerParent=(updated.relationships||[]).some(r=>r.type==='parent'&&r.job==='farmer');
      if(worldEv.id==='we_harvest'&&hasFarmerParent){ updated.gold=Math.max(0,(updated.gold||0)+rand(8,20)); updated.log=[...(updated.log||[]),{age:newAge,text:'Your parents had a good harvest. They slipped you some extra gold.',type:'good'}]; }
      if(worldEv.id==='we_fire'&&updated.classId==='carpenter'){ updated.gold=Math.max(0,(updated.gold||0)+rand(15,30)); updated.log=[...(updated.log||[]),{age:newAge,text:'Your carpentry skills are in high demand after the fire.',type:'good'}]; }
      if(worldEv.id==='we_prosperity'){ const g=updated.classId==='merchant'?rand(10,20):rand(2,6); updated.gold=Math.max(0,(updated.gold||0)+g); }
      if(worldEv.id==='we_coldwinter'){ updated.health=Math.min(100,Math.max(1,(updated.health||100)-5)); }
      if(worldEv.id==='we_temple'&&updated.worshippedDeity&&((updated.devotion||{})[updated.worshippedDeity]||0)>=20){ updated.devotion={...(updated.devotion||{}),[updated.worshippedDeity]:((updated.devotion||{})[updated.worshippedDeity]||0)+5}; }
      setWorldEvent(worldEv);
      safeTimeout(()=>setWorldEventVisible(true), 100);
      safeTimeout(()=>{ setWorldEventVisible(false); safeTimeout(()=>setWorldEvent(null),400); }, 2500);
    }

    // ── New WORLD_EVENTS player-context effects ───────────────────────────────
    if(chance(35) && WORLD_EVENTS.length > 0){
      const evt = WORLD_EVENTS[Math.floor(Math.random()*WORLD_EVENTS.length)];
      const hasFarmerParent=(updated.relationships||[]).some(r=>r.type==='parent'&&r.job==='farmer');
      const isCarpenter=updated.classId==='carpenter', isMerchant=updated.classId==='merchant';
      const isDevoted=updated.worshippedDeity&&((updated.devotion||{})[updated.worshippedDeity]||0)>=20;
      let evtGold=0,evtHealth=0,evtDevout=0,evtText='';
      if(evt.id==='we_harvest'&&hasFarmerParent){evtGold=rand(8,20);evtText='Your parents had a good harvest. They slipped you some extra gold.';}
      if(evt.id==='we_drought'){evtGold=-3;evtText='The drought made everything more expensive.';}
      if(evt.id==='we_fire'&&isCarpenter){evtGold=rand(15,30);evtText='Your carpentry skills are in high demand after the fire.';}
      if(evt.id==='we_prosperity'){evtGold=isMerchant?rand(10,20):rand(2,6);evtText=isMerchant?'The prosperous season was good for business.':'The prosperous season lifted all boats.';}
      if(evt.id==='we_coldwinter'){evtHealth=-5;evtText='The cold took its toll on you this year.';}
      if(evt.id==='we_temple'&&isDevoted){evtDevout=5;evtText='The ceremony deepened your faith.';}
      if(evtGold!==0)updated.gold=Math.max(0,(updated.gold||0)+evtGold);
      if(evtHealth!==0)updated.health=Math.min(100,Math.max(1,(updated.health||100)+evtHealth));
      if(evtDevout>0&&updated.worshippedDeity)updated.devotion={...(updated.devotion||{}),[updated.worshippedDeity]:((updated.devotion||{})[updated.worshippedDeity]||0)+evtDevout};
      if(evtText)updated.log=[...(updated.log||[]),{age:newAge,text:`${evt.emoji} ${evt.name}: ${evtText}`,type:evtGold>0?'good':'neutral'}];
      // World event with player choice — queue for modal
      if(evt.choice&&!evtText){
        setWorldEvent({...evt,year:newAge,isNew:true});
        setWorldEventVisible(true);
      }
    }

    // ── Meal system — apply standing meal preference ─────────────────────────────
    const parentAlive = (updated.relationships||[]).some(r=>r.type==='parent'&&r.alive!==false&&!r.disowned);
    const livingWithParents = !updated.hasMovedOut && parentAlive;
    if(livingWithParents){
      // Parents feed you — free, automatic
      updated.health = Math.min(100,(updated.health||100)+3);
      if(newAge <= 6) updated.log=[...(updated.log||[]),{age:newAge,text:'Your parents kept you fed and warm.',type:'neutral'}];
    } else {
      // Apply standing meal preference
      const prefId = updated.mealPreference||'bread';
      const hasHome = (updated.properties||[]).some(p=>p.isHome&&p.type!=='tent');
      const loc     = updated.location||'village';
      const repData = getReputation(updated);
      // Find the tier
      let tier = MEAL_TIERS.find(t=>t.id===prefId)||MEAL_TIERS.find(t=>t.id==='bread');
      // Check requirements
      const reqMet = (t)=>{
        if(!t.req) return true;
        if(t.req==='home') return hasHome;
        if(t.req==='village') return true;
        if(t.req==='town') return ['town','city'].includes(loc);
        if(t.req==='city') return loc==='city';
        if(t.req==='banquet') return loc==='city' && ['Respected','Renowned','Beloved'].includes(repData?.label);
        return true;
      };
      // Can't afford or req not met — fall back
      if(!reqMet(tier) || (updated.gold||0) < tier.cost){
        // Try to find best affordable tier
        const affordable = MEAL_TIERS.filter(t=>reqMet(t)&&(updated.gold||0)>=t.cost&&t.id!=='none').sort((a,b)=>b.health-a.health);
        const fallback = affordable[0]||MEAL_TIERS.find(t=>t.id==='scraps');
        if(fallback.id !== tier.id){
          updated.log=[...(updated.log||[]),{age:newAge,text:`Couldn't afford ${tier.name}. Made do with ${fallback.name}.`,type:'neutral'}];
        }
        tier = fallback;
      }
      // Apply meal
      const { cost, health } = getMealEffect(updated, tier);
      updated.gold  = Math.max(0,(updated.gold||0)-cost);
      updated.health = Math.min(100,Math.max(1,(updated.health||100)+health));
      updated.fedThisSeason = true;
      // Luxury home-cooked — boost household relationships
      if(tier.id==='home_luxury'){
        updated.relationships = (updated.relationships||[]).map(r=>
          r.inHousehold||(r.type==='spouse'&&r.alive!==false)||(r.type==='child'&&r.alive!==false)
            ? {...r,score:Math.min(100,(r.score||50)+3)} : r
        );
      }
      // Noble banquet — chance to meet high-status NPC
      if(tier.id==='banquet' && chance(40)){
        updated.log=[...(updated.log||[]),{age:newAge,text:'At the banquet you were introduced to someone of consequence.',type:'good'}];
      }
      if(tier.id==='scraps'||tier.health<0){
        updated.log=[...(updated.log||[]),{age:newAge,text:`${tier.emoji} ${tier.name} this season. ${health<0?`Lost ${Math.abs(health)} health from poor nutrition.`:''}`,type:'bad'}];
      }
    }

    // ── AI narrative on key life moments ─────────────────────────────────────
    const spouse = (updated.relationships||[]).find(r=>r.type==='spouse'&&r.alive!==false);
    const newChildren = (updated.relationships||[]).filter(r=>r.type==='child'&&r.bornAge===newAge-1);
    const justMarried = spouse && !char.relationships?.find(r=>r.type==='spouse');
    const newProp = (updated.properties||[]).filter(p=>p.ownedSince===newAge-1);
    if(justMarried||newChildren.length>0||newProp.length>0){
      try{
        const moments = [];
        if(justMarried) moments.push(`just married ${spouse.name}`);
        if(newChildren.length>0) moments.push(`had a child named ${newChildren[0].name}`);
        if(newProp.length>0) moments.push(`just acquired a ${newProp[0].name}`);
        const prompt = `Dark fantasy life sim. Character: ${updated.race?.name||'human'} ${updated.classId||'adventurer'}, age ${newAge}. This year they ${moments.join(' and ')}. Write ONE evocative sentence (max 20 words) about how this felt. No quotes.`;
        const narrative = await callAI(prompt, 60);
        if(narrative) setAiMoment(narrative);
      } catch(_){}
    }

    // ── Child coming-of-age events ────────────────────────────────────────────
    const children = (updated.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false);
    for(const child of children){
      if(child.age === 16){
        updated.log = [...(updated.log||[]),{age:newAge,text:`${child.name} has come of age. They are starting to find their own path.`,type:'good'}];
      }
      if(child.age === 18){
        updated.household = (updated.household||[]).filter(id=>id!==child.id);
        updated.log = [...(updated.log||[]),{age:newAge,text:`${child.name} has left home. You hope you gave them enough.`,type:'neutral'}];
      }
    }

    // ── Blessing effects (annual — uses devotion-level system) ───────────────────────
    const blessEff = getActiveBlessingEffects(updated);
    if(blessEff.goldBonus||blessEff.goldWindfall){
      const goldGain = (blessEff.goldBonus||0)+(blessEff.goldWindfall||0);
      updated.gold=(updated.gold||0)+goldGain;
      updated.log=[...(updated.log||[]),{age:newAge,text:`${WORLD.deityNames?.[updated.worshippedDeity]||'Your deity'}'s blessing brought ${goldGain}g this year.`,type:'good'}];
    }
    if(blessEff.healthBonus) updated.health=Math.min(100,(updated.health||100)+blessEff.healthBonus);
    if(blessEff.statBonus){
      const ns={...updated.stats};
      Object.entries(blessEff.statBonus).forEach(([s,v])=>{ns[s]=Math.min(20,(ns[s]||1)+v);});
      updated.stats=ns;
    }
    const blessingHealthBonus = blessEff.healthBonus||0;

    // ── Spouse income (combined households) ───────────────────────────────────────
    if(updated.spouse){
      const spouseRel = (updated.relationships||[]).find(r=>r.id===updated.spouse&&r.alive!==false);
      if(spouseRel && updated.combineIncomes){
        const spouseIncome = getSpouseIncome(spouseRel);
        updated.gold=(updated.gold||0)+spouseIncome;
        updated.log=[...(updated.log||[]),{age:newAge,text:`${spouseRel.name}'s work brought in ${spouseIncome}g.`,type:'good'}];
      }
    }

    // ── StatTemp expiry (e.g. strength tonic) ─────────────────────────────────────
    if((updated.statTemps||[]).length>0){
      const expired = [];
      const kept = [];
      for(const st of updated.statTemps){
        if(st.expiresAge <= newAge){
          // Reverse the temp stat
          updated.stats={...updated.stats,[st.stat]:Math.max(1,(updated.stats[st.stat]||1)-st.v)};
          expired.push(st);
        } else kept.push(st);
      }
      if(expired.length>0) updated.log=[...(updated.log||[]),{age:newAge,text:'Temporary stat boost has worn off.',type:'neutral'}];
      updated.statTemps=kept;
    }

    // ── Adoption cooldown — clear after 1 year ─────────────────────────────────────
    if(updated.pendingAdoption) updated.pendingAdoption=false;
    if(updated.adoptedThisYear) updated.adoptedThisYear=false;

    // ── Proficiency career reveal ─────────────────────────────────────────────────────
    if(!updated.classId){
      const jobXP = updated.jobXP||{};
      for(const [jobId, xp] of Object.entries(jobXP)){
        if(xp >= 30 && PROFICIENCY_CAREER_MAP[jobId]){
          const career = PROFICIENCY_CAREER_MAP[jobId];
          updated.classId = career.classId;
          updated.log=[...(updated.log||[]),{age:newAge,text:`${career.text}`,type:'good'}];
          setEventModal({ type:'classReveal', cls:CLASSES[career.classId], classId:career.classId, explanation:true });
          break;
        }
      }
    }

    // ── Paladin evolution check ──────────────────────────────────────────────────────
    if(!updated.paladinDeity && updated.worshippedDeity){
      const devXP = (updated.devotion||{})[updated.worshippedDeity]||0;
      if(devXP >= 200){
        const eligibleClasses = ['fighter','barbarian','ranger'];
        const clericEligible = updated.classId==='cleric' && (updated.stats?.STR||1)>=8 && (updated.stats?.CON||1)>=7;
        const warlockEligible = updated.classId==='warlock';
        const combatEligible = eligibleClasses.includes(updated.classId||'');
        if(combatEligible || clericEligible || warlockEligible){
          if(warlockEligible){
            setEventModal({
              type:'paladinConflict',
              deityId: updated.worshippedDeity,
              char: updated,
            });
          } else {
            setEventModal({
              type:'paladinCall',
              deityId: updated.worshippedDeity,
              clericPath: clericEligible,
              char: updated,
            });
          }
        }
      }
    }

    // ── Guild rank decay (G–C only, 3+ years no quests) ──────────────────────────────
    if(updated.guildRank && ['G','F','E','D','C'].includes(updated.guildRank)){
      const yearsSinceQuest = newAge - (updated.lastQuestYear||0);
      if(yearsSinceQuest >= 3 && (updated.guildXP||0) > 0){
        const RANKS_ORD = ['G','F','E','D','C','B','A','S'];
        const curIdx = RANKS_ORD.indexOf(updated.guildRank);
        if(curIdx > 0){
          const newRank = RANKS_ORD[curIdx-1];
          updated.guildRank = newRank;
          updated.log=[...(updated.log||[]),{age:newAge,text:`The guild has noticed your absence. Your rank has slipped to ${newRank}-Rank.`,type:'bad'}];
        }
      }
    }

    // ── Relationship consequences (low scores) ───────────────────────────────────
    const rels_check = updated.relationships||[];
    const rels_after = rels_check.map(r=>{
      if(!r.alive) return r;
      // Parents disown if score < 10
      if(r.type==='parent' && (r.score||50) < 10 && !r.disowned){
        updated.log=[...(updated.log||[]),{age:newAge,text:`${r.name} has disowned you. Some distances cannot be crossed.`,type:'bad'}];
        return {...r, type:'estranged', disowned:true, score:0};
      }
      // Friend betrayal if score < 15
      if(r.type==='friend' && (r.score||50) < 15 && !r.betrayed && chance(40)){
        updated.log=[...(updated.log||[]),{age:newAge,text:`${r.name} turned on you. A confidence shared, now a weapon.`,type:'bad'}];
        updated.gold = Math.max(0,(updated.gold||0)-rand(5,20));
        return {...r, type:'estranged', betrayed:true};
      }
      // Spouse warning if score < 20
      if(r.type==='spouse' && (r.score||50) < 20 && !r.warned){
        updated.log=[...(updated.log||[]),{age:newAge,text:`${r.name} says things cannot continue like this. Something has to change.`,type:'bad'}];
        return {...r, warned:true};
      }
      // Divorce if score < 10
      if(r.type==='spouse' && (r.score||50) < 10){
        updated.log=[...(updated.log||[]),{age:newAge,text:`${r.name} is gone. The house is quieter than you expected.`,type:'bad'}];
        updated.spouse = null; updated.combineIncomes = false;
        return {...r, type:'estranged', alive:false};
      }
      return r;
    });
    updated.relationships = rels_after;
    // Betrayal count decay — 1 per clean year
    if((updated.betrayalCount||0) > 0){
      updated.betrayalCount = Math.max(0,(updated.betrayalCount||0)-1);
    }

    // ── Magic research — auto-advance one season if active and can afford ────────
    if(updated.activeResearch){
      const topic = MAGIC_RESEARCH_TOPICS.find(t=>t.id===updated.activeResearch);
      if(topic){
        if((updated.gold||0) >= topic.goldPerSeason){
          const currentProg = (updated.researchProgress||{})[updated.activeResearch]||0;
          const newProg = currentProg + 1;
          updated.gold = (updated.gold||0) - topic.goldPerSeason;
          updated.researchProgress = {...(updated.researchProgress||{}), [updated.activeResearch]:newProg};
          if(newProg >= topic.seasons){
            const finishedId = updated.activeResearch;
            updated.activeResearch = null;
            updated.completedResearch = [...(updated.completedResearch||[]), finishedId];
            if(topic.effect?.permStat){ const ns={...updated.stats}; Object.entries(topic.effect.permStat).forEach(([s,v])=>{ns[s]=Math.min(20,(ns[s]||1)+v);}); updated.stats=ns; }
            if(topic.effect?.wardBonus) updated.wardBonus=(updated.wardBonus||0)+topic.effect.wardBonus;
            if(topic.effect?.ageSlowMod) updated.ageSlowMod=true;
            if(topic.effect?.relFloor) updated.relFloor=topic.effect.relFloor;
            updated.log=[...(updated.log||[]),{age:newAge,text:`Research complete: ${topic.name}! ${topic.unlock}`,type:'good'}];
          } else {
            updated.log=[...(updated.log||[]),{age:newAge,text:`Research: ${topic.name} — season ${newProg}/${topic.seasons}. Cost ${topic.goldPerSeason}g.`,type:'neutral'}];
          }
        } else {
          // Can't afford — pause automatically
          const pausedName = topic.name;
          updated.activeResearch = null;
          updated.log=[...(updated.log||[]),{age:newAge,text:`Research on ${pausedName} paused — need ${topic.goldPerSeason}g/season to continue.`,type:'bad'}];
        }
      }
    }

    // ── Achievement / landmark checking — award gems for first-time milestones ──
    try {
      const earned = checkAchievements(updated);
      if(earned && earned.length){
        const prevClaimed = JSON.parse(window.localStorage.getItem('fw_achievements')||'[]');
        const newOnes = earned.filter(id=>!prevClaimed.includes(id));
        if(newOnes.length){
          const gemBonus = newOnes.reduce((s,id)=>{
            const ach = ACHIEVEMENT_QUESTS.find(a=>a.id===id);
            return s + (ach?.gems||0);
          },0);
          const allClaimed = [...prevClaimed, ...newOnes];
          window.localStorage.setItem('fw_achievements', JSON.stringify(allClaimed));
          const curGems = parseInt(window.localStorage.getItem('fw_adventurite')||'0');
          window.localStorage.setItem('fw_adventurite', String(curGems + gemBonus));
          newOnes.forEach(id=>{
            const ach = ACHIEVEMENT_QUESTS.find(a=>a.id===id);
            if(ach) updated.log=[...(updated.log||[]),{age:newAge,text:`✦ Milestone: ${ach.name}! +${ach.gems} Adventurite gems.`,type:'good'}];
          });
        }
      }
    } catch(_){}

    // ── Cursed item reveal (after revealAfter seasons) ───────────────────────────────
    const updatedInventory = (updated.inventory||[]).map(item=>{
      if(!item.cursed || item.curseRevealed) return item;
      const seasonsOwned = (item.seasonsOwned||0) + 1;
      if(seasonsOwned >= (item.revealAfter||2)){
        const curseDef = CURSED_ITEMS?.[item.id];
        if(curseDef){
          updated.log=[...(updated.log||[]),{age:newAge,text:`The ${item.name} reveals its true nature: ${curseDef.curse}`,type:'bad'}];
          // Apply curse effect
          if(curseDef.curseStat==='health') updated.health=Math.max(1,(updated.health||100)+curseDef.curseV);
          if(curseDef.curseStat==='criminalRecord') updated.criminalRecord=(updated.criminalRecord||0)+curseDef.curseV;
        }
        return {...item, seasonsOwned, curseRevealed:true};
      }
      return {...item, seasonsOwned};
    });
    updated.inventory = updatedInventory;

    // ── Faction annual fees ───────────────────────────────────────────────────────────
    if(updated.faction){
      const factionFees = { consortium:20, templeOrder:10 };
      const fee = factionFees[updated.faction]||0;
      if(fee > 0){
        if((updated.gold||0) >= fee){
          updated.gold = (updated.gold||0) - fee;
          updated.log=[...(updated.log||[]),{age:newAge,text:`Paid ${fee}g annual fee to your faction.`,type:'neutral'}];
        } else {
          // Can't pay — expelled
          updated.log=[...(updated.log||[]),{age:newAge,text:`You could not pay your faction dues. Your membership has lapsed.`,type:'bad'}];
          updated.faction = null;
        }
      }
    }

    // ── Matchmaker — fire match next year if pending ───────────────────────────────
    if(updated.pendingMatchmaker && !updated.spouse){
      const allRaces=['human','elf','dwarf','orc','halfling','tiefling','dragonborn','gnome'];
      const matchRace = allRaces[Math.floor(Math.random()*allRaces.length)];
      const matchJobs=['merchant','healer','carpenter','farmer','guard','bard','scribe'];
      const matchJob  = matchJobs[Math.floor(Math.random()*matchJobs.length)];
      const matchNames=['Aldric','Seren','Wren','Calder','Petra','Tam','Brix','Nessa','Lira','Oswin'];
      const matchName = matchNames[Math.floor(Math.random()*matchNames.length)];
      const matchGender = updated.gender?.id==='male'?'female':updated.gender?.id==='female'?'male':'nonbinary';
      const matchAge = (updated.age||20)+Math.floor(Math.random()*10)-4;
      const match = {
        id:`match_${Date.now()}`,name:matchName,type:'interest',
        gender:matchGender,race:matchRace,job:matchJob,
        age:Math.max(18,matchAge),score:50,alive:true,
        fromMatchmaker:true,
      };
      updated.relationships=[...(updated.relationships||[]),match];
      updated.pendingMatchmaker=false;
      updated.log=[...(updated.log||[]),{age:newAge,text:`The matchmaker kept their word. ${matchName} has been introduced to you.`,type:'good'}];
    }

    // ── Seasonal transition flavour ──────────────────────────────────────────────
    const seasonNames = ['Spring','Summer','Autumn','Winter'];
    const seasonFlavour = {
      Spring: 'The world is thawing. Something is beginning.',
      Summer: 'Long days. The heat makes everything feel possible.',
      Autumn: 'The light is changing. There is something melancholy in the air.',
      Winter: 'Everything slows. The cold makes the world honest.',
    };
    updated.log=[...(updated.log||[]),{age:newAge,text:`${seasonFlavour[season]}`,type:'neutral'}];

    // ── Dynasty acknowledgement — first year of a legacy run ─────────────────
    if(newAge === 1 && (char.generation||1) > 1 && char.legacy){
      const parentName = char.legacy.name||'your parent';
      const parentClass = char.legacy.classId ? CLASSES[char.legacy.classId]?.name : null;
      const dynastyLine = parentClass
        ? `They say ${parentName} was ${parentClass === 'Fighter' ? 'a' : 'a'} ${parentClass}. The stories follow you already.`
        : `${parentName}'s name is remembered in ${updated.location||'Thornhaven'}. You carry it now.`;
      updated.log = [...(updated.log||[]),{age:newAge,text:dynastyLine,type:'good'}];
    }

    // ── Sexuality asked at age 16 ────────────────────────────────────────────────
    if(newAge === 16 && !updated.sexualitySet){
      setSexualityModal(true);
    }

    // ── Class-specific events (fire once per character per event) ───────────────
    // Class events — only fire if no other modal is pending
    if(updated.classId && CLASS_EVENTS[updated.classId]){
      const usedClassEvents = new Set(updated.usedAffinityIds||[]);
      const classEvent = CLASS_EVENTS[updated.classId].find(e=>
        newAge >= e.minAge && (!e.maxAge||newAge<=e.maxAge) && !usedClassEvents.has(e.id)
      );
      if(classEvent){
        // Queue it — will be shown after child-leaving if that also fires
        setAffinityModal({
          ...classEvent,
          choices: classEvent.choices.map(c=>({...c,affinity:{[updated.classId]:1}}))
        });
      }
    }

    // ── Child leaving home choice ─────────────────────────────────────────────
    const leavingChildren = (updated.relationships||[]).filter(r=>r.type==='child'&&r.alive!==false&&r.age===18);
    if(leavingChildren.length>0){
      const child = leavingChildren[0];
      setAffinityModal({
        id:`child_leaving_${child.id}`,
        title:`${child.name} is leaving`,
        text:`${child.name} is eighteen. They are standing at the door with everything they own. You have one last thing to say.`,
        choices:[
          { text:`"The world is harder than it looks. Trust yourself anyway."`, outcome:`${child.name} nodded. They already knew. You had to say it.`, affinity:{paladin:1}, stat:'WIS' },
          { text:`"Come back when you need to. This is still your home."`, outcome:`They cried a little. So did you. That was fine.`, affinity:{cleric:1}, stat:'CHA' },
          { text:`"I am proud of you. I have always been proud of you."`, outcome:`They carried that with them. You felt lighter for saying it.`, affinity:{bard:1}, stat:'CHA' },
          { text:'Say nothing. Pull them close for a moment.', outcome:`Some things do not need words. They knew.`, affinity:{druid:1}, stat:'WIS' },
        ]
      });
    }

    // ── Affinity hint — show player their path is forming ────────────────────
    if(!updated.classId && updated.affinities){
      const sorted = Object.entries(updated.affinities).sort((a,b)=>b[1]-a[1]);
      if(sorted.length>0 && sorted[0][1]>=3 && sorted[0][1]<5){
        const hint = CLASSES[sorted[0][0]];
        if(hint) updated.log = [...(updated.log||[]),{age:newAge,text:`Something in you leans toward the path of the ${hint.name}. It is not yet certain.`,type:'neutral'}];
      }
    }

    // ── Class resolve ─────────────────────────────────────────────────────────
    if(!updated.classId){
      const resolved = resolveClass(updated.affinities);
      if(resolved && CLASSES[resolved] && newAge >= 12) updated.classId = resolved;
    }

    // ── Show class reveal modal if class was just set ───────────────────────────
    const justRevealed = !char.classId && updated.classId;

    // ── Business income/production for the year-roll season (Spring) ──────────
    if((updated.businesses||[]).length){
      const biz = processBusinessSeason(updated);
      updated.gold = Math.max(0, (updated.gold||0) + biz.goldDelta);
      updated.businesses = biz.businesses;
      if(biz.logs.length) updated.log = [...(updated.log||[]), ...biz.logs.map(l=>({age:newAge,...l}))];
    }

    // ── Shop-buy offer: fire once per newly-mastered trade without a shop ──────
    const ownedTrades = new Set((updated.businesses||[]).map(b=>b.trade));
    const offered = new Set(updated.shopOffers||[]);
    const pendingOffer = (updated.masteredTrades||[]).find(t =>
      !ownedTrades.has(t) && !offered.has(t) && getShopDef(t));
    if(pendingOffer){
      updated.shopOffers = [...(updated.shopOffers||[]), pendingOffer];
      const def = getShopDef(pendingOffer);
      const price = getShopPrice(pendingOffer, updated.location||'village');
      pushEventModal({ type:'shopOffer', trade:pendingOffer, shopName:def.name, shopEmoji:def.emoji, price });
    }

    // ── Cap log at 150 entries to prevent unbounded growth ─────────────────────
    if((updated.log||[]).length > 150){
      updated.log = updated.log.slice(-150);
    }

    // ── Update legacy score each year ─────────────────────────────────────────
    updated.legacyScore = calcLegacyScore(updated);

    // ── HP 0 = death ──────────────────────────────────────────────────────────
    if((updated.health||100) <= 0 && !updated.deathScreenShown){
      updated = {...updated, alive:false, deathScreenShown:true,
        deathCause: updated.deathCause || 'The body gave out. Some things cannot be fought.'};
      await saveChar(updated); setChar(updated); setDeathScreen(updated); setAgeUpLoading(false); return;
    }

    await saveChar(updated);
    setChar(updated);
    // Queue events so a class reveal is never suppressed by a coinciding life event.
    if(event.text) pushEventModal({ type:'lifeEvent', event, effects });
    if(justRevealed) pushEventModal({ type:'classReveal', cls:CLASSES[updated.classId], classId:updated.classId, explanation:true });
    } catch(e){ console.error('Age up failed:',e); }
    finally{ setAgeUpLoading(false); }
    // Brief save confirmation toast
    setSaveToast(true); safeTimeout(()=>setSaveToast(false), 1500);
  }

  // Pronoun helper
  function p(type){ return char.gender?.pronouns?.[type]||{sub:'they',obj:'them',pos:'their'}[type]; }

  if(deathScreen) return <DeathScreen char={deathScreen} onDeath={onDeath}/>;

  function completeTutorial(){
    setShowTutorial(false);
    const updated = { ...char, tutorialDone:true };
    setChar(updated); saveChar(updated);
  }

  const tabs = getUnlockedTabs(char);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100dvh',background:T.bg,overflow:'hidden'}}>
      {/* Tutorial overlay */}
      {showTutorial && <Tutorial onDone={completeTutorial}/>}

      {/* World event — animated parchment scroll */}
      {worldEvent && (
        <div style={{
          position:'absolute',top:0,left:0,right:0,zIndex:150,
          transform:worldEventVisible?'translateY(0)':'translateY(-100%)',
          transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          background:'#1a1000',
          borderBottom:`2px solid ${T.gold}`,
          borderLeft:`3px solid ${T.gold}`,
          padding:'10px 14px',
          boxShadow:'0 4px 20px #00000088',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1,cursor:'pointer'}} onClick={()=>{ setWorldEventVisible(false); setTimeout(()=>setWorldEvent(null),400); setEventModal({type:'worldEventDetail', event:worldEvent}); }}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                <span style={{fontSize:'18px'}}>{worldEvent.emoji}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:'13px',color:T.gold,fontWeight:700,letterSpacing:'0.5px'}}>{worldEvent.title}</span>
              </div>
              <p style={{fontSize:'12px',color:T.text,lineHeight:'1.5',fontStyle:'italic'}}>{worldEvent.text}</p>
              <p style={{fontSize:'9px',color:T.muted,marginTop:'4px'}}>Tap to respond →</p>
            </div>
            <div onClick={()=>{ setWorldEventVisible(false); setTimeout(()=>setWorldEvent(null),400); }}
              style={{fontSize:'10px',color:T.muted,padding:'2px 6px',cursor:'pointer',flexShrink:0}}>✕</div>
          </div>
        </div>
      )}

      {/* AI moment card */}
      {aiMoment && (
        <div style={{
          position:'absolute',bottom:'20px',left:'60px',right:'12px',zIndex:140,
          background:T.panel,border:`1px solid ${T.gold}`,borderRadius:'12px',
          padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',
        }}>
          <p style={{fontSize:'13px',color:T.text,fontStyle:'italic',lineHeight:'1.6',flex:1}}>{aiMoment}</p>
          <button onClick={()=>setAiMoment(null)} style={{background:'transparent',border:'none',color:T.muted,fontSize:'16px',cursor:'pointer',marginLeft:'8px',flexShrink:0}}>✕</button>
        </div>
      )}

      {/* Save toast */}
      {saveToast && (
        <div style={{
          position:'absolute',bottom:'12px',right:'12px',zIndex:160,
          background:T.panel,border:`1px solid ${T.gold}66`,
          borderRadius:'8px',padding:'6px 12px',
          fontSize:'11px',color:T.gold,
          pointerEvents:'none',
        }}>✓ Saved</div>
      )}

      {/* Energy warning */}
      {energyWarning && (
        <div style={{background:T.gold+'22',borderBottom:`1px solid ${T.gold}44`,padding:'5px 12px',textAlign:'center',fontSize:'10px',color:T.gold,flexShrink:0}}>
          ⚡ Low energy — Age Up when ready
        </div>
      )}

      {/* Header */}
      <CharHeader char={char} onAgeUp={handleAgeUp} ageUpLoading={ageUpLoading}
        energyMax={getEnergyMax(char)} onEndRun={()=>setEndRunModal(true)}
        currentSeason={getCurrentSeason(char)}
        seasonStep={char.currentSeasonStep||0}
        daysLeft={getSeasonDaysLeft(char)}
        paladinDeity={char.paladinDeity||null}/>

      {/* Main area: side nav + life tab always visible + drawer overlay */}
      <div style={{flex:1,display:'flex',flexDirection:'row',overflow:'hidden',minHeight:0,position:'relative'}}>

        {/* Side nav — always visible */}
        <BottomNav tabs={tabs} active={drawerOpen?drawerTab:null}
          onChange={(t)=>{
            if(t==='life'){ setDrawerOpen(false); setDrawerTab(null); setTab('life'); }
            else if(drawerOpen && drawerTab===t){ setDrawerOpen(false); setDrawerTab(null); }
            else{ setDrawerTab(t); setDrawerOpen(true); setTab(t); }
          }}
        />

        {/* Life tab — always the base view */}
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',display:'flex',flexDirection:'column',minHeight:0}}>
          <LifeTab char={char} onCharUpdate={handleAction}/>
        </div>

        {/* Drawer overlay — slides in from left over the life tab */}
        <div style={{
          position:'absolute',left:'52px',top:0,bottom:0,
          width:'calc(100% - 52px)',
          background:T.bg,
          transform:drawerOpen?'translateX(0)':'translateX(100%)',
          transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          display:'flex',flexDirection:'column',
          overflowY:'auto',WebkitOverflowScrolling:'touch',
          zIndex:10,
          boxShadow:drawerOpen?'-4px 0 20px #00000066':'none',
          paddingBottom:'env(safe-area-inset-bottom, 0px)',
        }}>
          {/* Drawer header */}
          {drawerOpen && (
            <div style={{
              background:'#0a0800',borderBottom:`1px solid ${T.border}`,
              padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',
              flexShrink:0,
            }}>
              {(()=>{
                const { TAB_META_EXPORT } = {TAB_META_EXPORT:null};
                const labels = {work:'Work',health:'Health',relationships:'People',skills:'Skills',inventory:'Items',crime:'Crime',religion:'Faith',world:'World',magic:'Magic',property:'Property',business:'Business'};
                const emojis = {work:'⚒',health:'❤',people:'👥',skills:'📈',market:'🛒',crime:'🗡',religion:'☀',world:'🗺',magic:'✨',property:'🏠',guild:'⚔',business:'🏪'};
                return (
                  <>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:'14px',color:T.gold,fontWeight:700}}>
                      {emojis[drawerTab]} {labels[drawerTab]||drawerTab}
                    </span>
                    <button onClick={()=>{ setDrawerOpen(false); setDrawerTab(null); }}
                      style={{background:'transparent',border:'none',color:T.muted,fontSize:'20px',cursor:'pointer',padding:'2px 8px'}}>✕</button>
                  </>
                );
              })()}
            </div>
          )}
          {/* Drawer content */}
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {drawerTab==='work'          && <WorkTab char={char} onAction={handleAction}/>}
            {drawerTab==='health'        && <HealthTab char={char} onAction={handleAction}/>}
            {drawerTab==='people'        && <PeopleTab char={char} onAction={handleAction}/>}
            {drawerTab==='skills'        && <SkillsTab char={char} onAction={handleAction}/>}
            {drawerTab==='market'        && <InventoryTab char={char} onAction={handleAction}/>}
            {drawerTab==='crime'         && <CrimeTab char={char} onAction={handleAction}/>}
            {drawerTab==='religion'      && <ReligionTab char={char} onAction={handleAction}/>}
            {drawerTab==='world'         && <WorldTab char={char} onAction={handleAction}/>}
            {drawerTab==='magic'         && <MagicTab char={char} onAction={handleAction}/>}
            {drawerTab==='property'      && <PropertyTab char={char} onAction={handleAction}/>}
          {drawerTab==='guild'          && <GuildTab char={char} onAction={handleAction}/>}
          {drawerTab==='business'       && <BusinessTab char={char} onAction={handleAction}/>}
          </div>
        </div>
      </div>

      {/* End Run modal */}
      {endRunModal && (
        <Modal title="Are you certain?" onClose={()=>setEndRunModal(false)}>
          <p style={{fontSize:'13px',color:T.muted,marginBottom:'16px',lineHeight:'1.6',fontStyle:'italic'}}>
            This life is yours to end. It will be recorded as it was. Your legacy carries forward.
          </p>
          <div style={{display:'flex',gap:'10px'}}>
            <Btn onClick={()=>setEndRunModal(false)} colour={T.muted} outline style={{flex:1}}>No — continue</Btn>
            <Btn onClick={()=>{
              const updated={...char,alive:false,deathCause:'Chose to end their story here.'};
              setChar(updated); saveChar(updated); setDeathScreen(updated); setEndRunModal(false);
            }} colour={T.red} style={{flex:1}}>End this life</Btn>
          </div>
        </Modal>
      )}

      {/* Affinity modal — must be answered before aging up */}
      {affinityModal && (
        <Modal title={affinityModal.title}>
          <p style={{fontSize:'13px',color:T.muted,marginBottom:'14px',fontStyle:'italic'}}>{affinityModal.text}</p>

          {/* Outcome display for early memories */}
          {affinityOutcome ? (
            <div style={{background:T.panelAlt,borderRadius:'10px',padding:'14px',fontStyle:'italic',fontSize:'14px',color:T.text,lineHeight:'1.7',textAlign:'center'}}>
              {affinityOutcome}
            </div>
          ) : affinityModal.type === 'traveller' ? (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {travellerItems.map((item,i)=>(
                <button key={`k-${i}`} onClick={()=>handleTravellerChoice(item)} style={{
                  padding:'14px',background:T.panelAlt,border:`1px solid ${T.border}`,
                  borderRadius:'12px',cursor:'pointer',textAlign:'left',
                  WebkitTapHighlightColor:'transparent',
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                    <span style={{fontSize:'26px',flexShrink:0}}>{item.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:'14px',color:T.gold,marginBottom:'3px'}}>{item.name}</div>
                      <div style={{fontSize:'12px',color:T.text,marginBottom:'3px',fontStyle:'italic'}}>{item.desc}</div>
                      <div style={{fontSize:'11px',color:T.muted}}>{item.hint}</div>
                      <div style={{fontSize:'11px',color:T.gold,marginTop:'5px'}}>{item.bonus.stat} +{item.bonus.v}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Standard affinity choice */
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {affinityModal.choices.map((c,i)=>(
                <button key={`k-${i}`} onClick={()=>handleAffinityChoice(affinityModal,c)} style={{
                  padding:'12px',background:T.panelAlt,border:`1px solid ${T.border}`,borderRadius:'8px',
                  color:T.text,fontSize:'13px',textAlign:'left',cursor:'pointer',lineHeight:'1.5',
                }}>
                  <div>{c.text}</div>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Event modal */}
      {eventModal && (
        <Modal title={eventModal.type==='classReveal'?'Your Path Reveals Itself':'Event'} onClose={()=>closeEventModal()}>
          {(eventModal.type==='paladinCall'||eventModal.type==='paladinConflict') && (
            <>
              <p style={{fontSize:'13px',color:T.muted,marginBottom:'12px',lineHeight:'1.6',fontStyle:'italic'}}>
                {eventModal.type==='paladinConflict'
                  ? `Your devotion to ${eventModal.deityId} has grown beyond the bargain you made. Your patron has noticed. Two powers now pull at you.`
                  : `Your faith has reached a depth that cannot go unanswered. ${eventModal.deityId} has called you. This changes everything.`
                }
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <Btn onClick={()=>{
                  const c = eventModal.char;
                  const upd = {...c, paladinDeity:c.worshippedDeity,
                    log:[...(c.log||[]),{age:c.age,text:`You answered the call of ${c.worshippedDeity}. You are something new now.`,type:'good'}]
                  };
                  setChar(upd); saveChar(upd); closeEventModal();
                }} colour={T.gold}>Answer the calling. Become a paladin of {eventModal.deityId}.</Btn>
                <Btn onClick={()=>closeEventModal()} colour={T.muted} outline>
                  {eventModal.type==='paladinConflict'?'Reject the deity. Your patron holds.':'Not yet. The path can wait.'}
                </Btn>
              </div>
            </>
          )}
          {worldEventVisible && worldEvent?.choice && (
            <Modal onClose={()=>setWorldEventVisible(false)} title={`${worldEvent.emoji} ${worldEvent.name}`}>
              <p style={{fontSize:'13px',color:T.muted,marginBottom:'16px',lineHeight:'1.6',fontStyle:'italic'}}>{worldEvent.desc}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <Btn onClick={()=>{
                  const c = worldEvent.choice.yes;
                  let upd = {...char};
                  if(c.gold) upd.gold=Math.max(0,(upd.gold||0)+c.gold);
                  if(c.affinity) Object.entries(c.affinity).forEach(([k,v])=>{upd.affinities={...(upd.affinities||{}),[k]:((upd.affinities||{})[k]||0)+v};});
                  if(c.statBonus) {const ns={...upd.stats};Object.entries(c.statBonus).forEach(([s,v])=>{ns[s]=Math.min(20,(ns[s]||1)+v);});upd.stats=ns;}
                  upd.log=[...(upd.log||[]),{age:upd.age,text:c.text,type:'good'}];
                  handleAction(upd); setWorldEventVisible(false);
                }} colour={T.gold}>{worldEvent.choice.text}</Btn>
                <Btn onClick={()=>setWorldEventVisible(false)} colour={T.muted} outline>Pass</Btn>
              </div>
            </Modal>
          )}
          {eventModal.type==='guildCall' && (
            <>
              <p style={{fontSize:'13px',color:T.muted,marginBottom:'16px',lineHeight:'1.6',fontStyle:'italic'}}>{eventModal.text}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {(eventModal.choices||[]).map((c,i)=>(
                  <Btn key={`k-${i}`} onClick={()=>{
                    if(c.action==='join'){
                      const updated={...char,guildJoined:true,guildJoinAge:char.guildJoinAge??char.age,log:[...(char.log||[]),{age:char.age,text:'You walked through the guild doors for the first time.',type:'good'}]};
                      handleAction(updated);
                    }
                    closeEventModal();
                  }} colour={i===0?T.gold:T.muted} outline={i>0}>{c.text}</Btn>
                ))}
              </div>
            </>
          )}
          {eventModal.type==='classReveal' && (
            <div style={{textAlign:'center',padding:'10px 0'}}>
              <div style={{fontSize:'40px',marginBottom:'8px'}}>{eventModal.cls.emoji}</div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:eventModal.cls.colour,marginBottom:'8px'}}>{eventModal.cls.name}</p>
              <p style={{fontSize:'13px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>
                {(()=>{
                  const c = eventModal.cls;
                  const civilian = ['merchant','farmer','chef','carpenter'];
                  const magic = ['mage','cleric','druid','warlock','paladin'];
                  const cid = eventModal.classId||'';
                  if(civilian.includes(cid)) return 'The life you have been building has a name now.';
                  if(magic.includes(cid)) return 'Something deeper than choice has been shaping you.';
                  return 'Your choices have revealed who you are becoming.';
                })()}
              </p>
              <div style={{background:T.panel,borderRadius:'8px',padding:'10px',marginBottom:'12px',textAlign:'left'}}>
                <p style={{fontSize:'11px',color:T.muted,lineHeight:'1.6'}}>
                  Your class shapes what you can do. {eventModal.cls?.name} quests will have higher success rates.
                  Matching your class to your work and quests will help you grow faster.
                  Your affinities are not fixed — keep making choices that define you.
                </p>
              </div>
              <Btn onClick={()=>closeEventModal()} colour={eventModal.cls.colour}>Continue</Btn>
            </div>
          )}
          {eventModal.type==='lifeEvent' && (
            <div>
              <p style={{fontSize:'14px',color:T.text,marginBottom:'12px',lineHeight:'1.6'}}>{eventModal.event.text}</p>
              {eventModal.effects?.length > 0 && (
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'14px'}}>
                  {eventModal.effects.map((e,i)=>(
                    <Tag key={`k-${i}`} colour={e.positive?T.green:T.red}>{e.positive?'▲':'▼'} {e.label}</Tag>
                  ))}
                </div>
              )}
              <Btn onClick={()=>closeEventModal()} colour={T.gold}>Continue</Btn>
            </div>
          )}
          {eventModal.type==='shopOffer' && (()=>{
            const canAfford = (char.gold||0) >= eventModal.price;
            return (
              <div>
                <div style={{textAlign:'center',marginBottom:'10px'}}>
                  <div style={{fontSize:'40px',marginBottom:'6px'}}>{eventModal.shopEmoji}</div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:T.gold,marginBottom:'4px'}}>A Shop of Your Own</p>
                </div>
                <p style={{fontSize:'13px',color:T.text,lineHeight:'1.6',marginBottom:'12px'}}>
                  Word of your mastery has spread. A {eventModal.shopName.toLowerCase()} here in {LOCATIONS[char.location||'village']?.name||'the area'} is for sale. With your own shop you could produce wares, hire staff, and build a trade that outlives you.
                </p>
                <div style={{background:T.panel,borderRadius:'8px',padding:'10px',marginBottom:'14px',display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:'12px',color:T.muted}}>Purchase price</span>
                  <span style={{fontSize:'13px',fontWeight:700,color:canAfford?T.gold:T.red}}>{eventModal.price}g</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <Btn disabled={!canAfford} onClick={()=>{
                    if(!canAfford) return;
                    const def = getShopDef(eventModal.trade);
                    const newShop = {
                      id:uid('biz'),
                      trade:eventModal.trade,
                      name:`${char.name}'s ${def.name}`,
                      loc:char.location||'village',
                      produceId:def.produceList[0].id,
                      rawStock:0,
                      staff:[],
                      boughtAge:char.age,
                    };
                    const updated = { ...char,
                      gold:(char.gold||0)-eventModal.price,
                      businesses:[...(char.businesses||[]), newShop],
                      log:[...(char.log||[]),{age:char.age,text:`You bought your own ${def.name.toLowerCase()}. The sign over the door carries your name.`,type:'good'}],
                    };
                    handleAction(updated);
                    closeEventModal();
                  }} colour={T.gold}>{canAfford?`Buy it — ${eventModal.price}g`:`Need ${eventModal.price}g`}</Btn>
                  <Btn onClick={()=>closeEventModal()} colour={T.muted} outline>Not now</Btn>
                </div>
              </div>
            );
          })()}
          {eventModal.type==='sickness' && (()=>{
            const s = eventModal.sickness || {};
            const cost = eventModal.healerCost || s.cost || 20;
            const canAfford = (char.gold||0) >= cost;
            return (
              <div>
                <div style={{textAlign:'center',marginBottom:'10px'}}>
                  <div style={{fontSize:'40px',marginBottom:'6px'}}>🤒</div>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:T.red,marginBottom:'4px'}}>You've Fallen Ill</p>
                  <p style={{fontSize:'13px',color:T.text,fontWeight:700}}>{s.name}</p>
                </div>
                <p style={{fontSize:'13px',color:T.muted,lineHeight:'1.6',marginBottom:'12px'}}>
                  {s.desc} It will drain your {s.stat} each year until treated. What will you do?
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <Btn disabled={!canAfford} onClick={()=>{
                    if(!canAfford) return;
                    const upd = { ...char, gold:(char.gold||0)-cost, sickness:null,
                      log:[...(char.log||[]),{age:char.age,text:`Paid ${cost}g for treatment. The ${s.name.toLowerCase()} lifted.`,type:'good'}] };
                    handleAction(upd); closeEventModal();
                  }} colour={T.green}>{canAfford?`See a healer — ${cost}g`:`Healer costs ${cost}g`}</Btn>
                  <Btn onClick={()=>{
                    // Rest: 25% to shake it off free; otherwise it lingers but the drain is softened.
                    const recovered = Math.random() < 0.25;
                    const upd = recovered
                      ? { ...char, sickness:null, log:[...(char.log||[]),{age:char.age,text:`You rested, and the ${s.name.toLowerCase()} passed on its own.`,type:'good'}] }
                      : { ...char, log:[...(char.log||[]),{age:char.age,text:`You rested. The ${s.name.toLowerCase()} still lingers.`,type:'neutral'}] };
                    handleAction(upd); closeEventModal();
                  }} colour={T.teal} outline>Rest and hope it passes</Btn>
                  <Btn onClick={()=>closeEventModal()} colour={T.muted} outline>Ignore it for now</Btn>
                </div>
              </div>
            );
          })()}
          {eventModal.type==='worldEventDetail' && (()=>{
            const ev = eventModal.event;
            const RESPONSES = [
              { id:'prepare',  label:'Prepare',   desc:'Stock up and brace for impact.',       effect:{gold:-10, health:+5},  text:'You spend what it takes to be ready.' },
              { id:'exploit',  label:'Exploit',   desc:'Find opportunity in the chaos.',        effect:{gold:+20, health:-5}, text:'Not everyone does the right thing. You do the profitable thing.' },
              { id:'ignore',   label:'Ignore it', desc:'Carry on. Hope it passes you by.',      effect:{},                    text:'You keep your head down. It may or may not work.' },
            ];
            return (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{fontSize:'24px'}}>{ev.emoji}</span>
                  <p style={{fontSize:'13px',fontWeight:700,color:T.gold}}>{ev.title}</p>
                </div>
                <p style={{fontSize:'13px',color:T.text,lineHeight:'1.6',marginBottom:'16px',fontStyle:'italic'}}>{ev.text}</p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {RESPONSES.map(r=>(
                    <button key={r.id} onClick={()=>{
                      let upd={...char};
                      if(r.effect.gold) upd.gold=Math.max(0,(upd.gold||0)+r.effect.gold);
                      if(r.effect.health) upd.health=Math.max(1,Math.min(100,(upd.health||100)+r.effect.health));
                      upd.activeWorldEvent=ev.title;
                      upd.log=[...(upd.log||[]),{age:upd.age,text:`${ev.title}: ${r.text}`,type:r.effect.gold>0?'good':r.effect.health<0?'bad':'neutral'}];
                      handleAction(upd);
                      closeEventModal();
                    }} style={{padding:'10px 12px',background:T.panelAlt,border:`1px solid ${T.border}`,borderRadius:'8px',textAlign:'left',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
                      <div style={{fontSize:'12px',fontWeight:700,color:T.text,marginBottom:'2px'}}>{r.label}</div>
                      <div style={{fontSize:'10px',color:T.muted}}>{r.desc}</div>
                      {(r.effect.gold||r.effect.health) ? (
                        <div style={{fontSize:'9px',marginTop:'4px',display:'flex',gap:'8px'}}>
                          {r.effect.gold&&<span style={{color:r.effect.gold>0?T.green:T.red}}>{r.effect.gold>0?'+':''}{r.effect.gold}g</span>}
                          {r.effect.health&&<span style={{color:r.effect.health>0?T.green:T.red}}>{r.effect.health>0?'+':''}{r.effect.health}hp</span>}
                        </div>
                      ) : <div style={{fontSize:'9px',color:T.muted,marginTop:'4px'}}>No immediate cost</div>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

// ── DEATH SCREEN ─────────────────────────────────────────────────────────────
function ageDescriptor(age){
  if(age<2)  return 'newborn';
  if(age<6)  return 'young child';
  if(age<13) return 'child';
  if(age<18) return 'youth';
  if(age<25) return 'young';
  if(age<40) return 'adult';
  if(age<55) return 'in their prime';
  if(age<65) return 'weathered';
  if(age<75) return 'aged';
  return 'elder';
}

function DeathScreen({ char, onDeath }){
  const [epitaph, setEpitaph] = useState('');
  const [loading, setLoading] = useState(true);
  const [choice, setChoice]   = useState(null);

  useEffect(()=>{
    async function gen(){
      const prompt = `Write a short epitaph (2–3 sentences, max 60 words) for a fantasy character.
Name: ${char.name}, ${char.race?.name||'Unknown'}, died age ${char.age}.
Class: ${char.classId||'never revealed'}.
Death: ${char.deathCause||'old age'}.
Quests: ${(char.quests||[]).length}.
Be poetic, honest, occasionally darkly funny. Just the epitaph, no quotes.`;
      try{ const t=await callAI(prompt,100); setEpitaph(t.trim()); }
      catch(_){
        const fallbacks = {
          fighter:   `${char.name} fought until there was nothing left to fight. That was enough.`,
          ranger:    `${char.name} knew every path. In the end, they chose their own.`,
          mage:      `${char.name} chased understanding their whole life. In the final moment, perhaps they found it.`,
          cleric:    `${char.name} served something greater. Whether it was listening, they never doubted.`,
          rogue:     `${char.name} played the long game and outlasted most. Not all.`,
          bard:      `${char.name} made people feel things they couldn't name. That is not nothing.`,
          paladin:   `${char.name} stood between harm and people who needed them to. Every time.`,
          druid:     `${char.name} understood that all things return. They were not afraid.`,
          barbarian: `${char.name} burned bright and brief and very, very loud.`,
          warlock:   `${char.name} made a bargain with something. Whether it was worth it is a matter of debate.`,
          merchant:  `${char.name} knew the value of everything. The people mourning them were proof.`,
          farmer:    `${char.name} fed people who never knew their name. That kind of work outlasts a tombstone.`,
          chef:      `${char.name} understood that feeding someone well is an act of love. They did it for years.`,
          carpenter: `${char.name} built things that will outlast the name carved into them.`,
        };
        const deathFallbacks = {
          'Old age':   `${char.name} had a long life. Long enough to see what mattered. Short enough to still wish for more.`,
          'Killed by bandits on the road': `${char.name} was on the road when it ended. They were always on the road.`,
          'A tavern brawl that went too far': `${char.name} died as they lived — in the thick of it, surrounded by noise.`,
        };
        const fallback =
          deathFallbacks[char.deathCause] ||
          (char.classId && fallbacks[char.classId]) ||
          `${char.name}. Age ${char.age||'?'}. They were here, and then they were not. That is the whole of it.`;
        setEpitaph(fallback);
      }
      setLoading(false);
    }
    gen();
  },[]);

  const deathSeason = getSeason(char.age||0);
  const hasChild = char.age >= 18 || (char.relationships||[]).some(r=>r.type==='child'&&r.alive!==false);
  const cls = char.classId ? CLASSES[char.classId] : null;

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:'#0a0800',padding:'14px 16px',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,color:T.gold,letterSpacing:'3px'}}>FATE WEAVER</span>
      </div>
      <div style={{padding:'24px 16px',flex:1,overflowY:'auto'}}>
        <div style={{textAlign:'center',marginBottom:'20px'}}>
          <div style={{fontSize:'40px',marginBottom:'10px'}}>🕯️</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:T.gold}}>{char.name}</h2>
          <p style={{color:T.muted,fontSize:'13px',marginTop:'4px'}}>
            {char.race?.name} · Age {char.age} · {deathSeason} · {char.deathCause||'Died peacefully'}
          </p>
          {cls && <p style={{color:cls.colour,fontSize:'13px',marginTop:'4px'}}>{cls.emoji} {cls.name}</p>}
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
          <div style={{fontSize:'48px',lineHeight:1}}>{char.race?.emoji||'🧑'}</div>
        </div>
        {loading ? <Spinner label="Writing your epitaph..."/> : (
          <Card accent={T.goldDim} style={{marginBottom:'16px',textAlign:'center'}}>
            <p style={{fontFamily:"'Crimson Text',serif",fontSize:'15px',lineHeight:'1.8',color:T.text,fontStyle:'italic'}}>{epitaph}</p>
          </Card>
        )}

        {(()=>{ const ls=char.legacyScore||0; const lr=getLegacyRating(ls); const rep=getReputation(char); return (
          <Card style={{marginBottom:'16px'}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:'11px',color:T.goldDim,letterSpacing:'1px',marginBottom:'10px'}}>LIFE SUMMARY</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',fontSize:'13px',marginBottom:'10px'}}>
              <span style={{color:T.muted}}>Quests completed</span><span style={{fontWeight:700,color:T.text}}>{(char.quests||[]).length}</span>
              <span style={{color:T.muted}}>Gold at death</span><span style={{fontWeight:700,color:T.gold}}>{char.gold}g</span>
              <span style={{color:T.muted}}>Generation</span><span style={{fontWeight:700,color:T.text}}>{char.generation||1}</span>
              <span style={{color:T.muted}}>Crimes</span><span style={{fontWeight:700,color:char.criminalRecord>0?T.red:T.muted}}>{char.criminalRecord||0}</span>
              <span style={{color:T.muted}}>Properties</span><span style={{fontWeight:700,color:T.text}}>{(char.properties||[]).length}</span>
              <span style={{color:T.muted}}>Children</span><span style={{fontWeight:700,color:T.text}}>{(char.relationships||[]).filter(r=>r.type==='child').length}</span>
              <span style={{color:T.muted}}>Reputation</span><span style={{fontWeight:700,color:rep.colour}}>{rep.label}</span>
            </div>
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:'12px',color:T.muted}}>Legacy Score</span>
              <span style={{fontSize:'18px',fontWeight:900,color:T.gold}}>{lr.emoji} {ls} — {lr.label}</span>
            </div>
          </Card>
        ); })()}

        {!choice && (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {hasChild && <Btn onClick={()=>setChoice('dynasty')} colour={T.gold}>⭐ Continue as your child (Dynasty)</Btn>}
            <Btn onClick={()=>setChoice('fresh')} colour={hasChild?T.muted:T.gold} outline={hasChild}>✦ Start fresh — new character</Btn>
          </div>
        )}
        {choice==='dynasty' && (
          <Card accent={T.gold}>
            <p style={{fontSize:'13px',color:T.text,marginBottom:'8px'}}>Your child inherits your legacy.</p>
            {(()=>{
              const cls = char.classId;
              const bonuses = {
                fighter:'STR +2', ranger:'DEX +2', mage:'INT +2', cleric:'WIS +2',
                rogue:'DEX +2', bard:'CHA +2', paladin:'STR +2', druid:'WIS +2',
                barbarian:'STR +2', warlock:'CHA +2',
                merchant:'Starting gold doubled', farmer:'Inherits a Farm property',
                chef:'WIS +2 · Kitchen skills', carpenter:'STR +2 · Tools included',
              };
              return cls ? <p style={{fontSize:'12px',color:T.gold,marginBottom:'12px'}}>Bonus: {bonuses[cls]||'Stat bonus'}</p> : null;
            })()}
            <Btn onClick={()=>onDeath({dynasty:true,parent:char})} colour={T.gold}>Begin their story →</Btn>
          </Card>
        )}
        {choice==='fresh' && (
          <Card>
            <p style={{fontSize:'13px',color:T.muted,marginBottom:'12px'}}>A new soul enters the world. No memory of what came before.</p>
            <Btn onClick={()=>onDeath({dynasty:false})} colour={T.gold}>Begin →</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}
