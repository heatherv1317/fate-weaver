import { useState, useRef } from 'react';
import { Card, Btn, Tag, SectionHeader, Modal } from '../components/UI.jsx';
import { T, ENERGY, SEASON_LIMITS, getEnergyMax, getActionSuccessChance, RACES, rand, chance, randomSpouseDetail, canHaveBioBaby, CRIME_CLEARANCE_COST } from '../gameData.js';

// ── RELATIONSHIP HELPERS ──────────────────────────────────────────────────────
export function getRelTier(score){
  if(score >= 80) return { label:'Close',     colour:T.green  };
  if(score >= 50) return { label:'Friendly',  colour:T.teal   };
  if(score >= 25) return { label:'Distant',   colour:T.muted  };
  return              { label:'Estranged', colour:T.red    };
}

const FAMILY_NAMES = ['Aldric','Maren','Edric','Sybil','Oswin','Freya','Torben','Isolde','Brynn','Calder','Nessa','Wren','Gavril','Lira','Thane','Roric','Elara','Sven','Petra','Coran','Brix','Ysolde','Tam','Celia','Bard'];
export function rname(){ return FAMILY_NAMES[Math.floor(Math.random()*FAMILY_NAMES.length)]; }

// Generate a family at character creation
export function generateFamily(char){
  const rels = [];
  const roll = Math.random();
  if(roll > 0.05){
    rels.push({ id:'parent1', name:rname(), type:'parent', subtype:'mother', score:80, alive:true, age:rand(25,40) });
    if(roll > 0.25){
      rels.push({ id:'parent2', name:rname(), type:'parent', subtype:'father', score:80, alive:true, age:rand(27,45) });
    }
  }
  const sibCount = Math.floor(Math.random()*4);
  for(let i=0;i<sibCount;i++){
    // Siblings are between 1 and 16 years old at the character's birth —
    // relative to the parents, not the character's current age
    const sibAge = rand(1, 16);
    rels.push({ id:`sib${i}`, name:rname(), type:'sibling', score:60, alive:true, age:sibAge });
  }
  return rels;
}

// Called on age up — ages everyone, applies mortality to all relationship types
export function tickRelationships(char){
  const charAge = char.age||0;
  const events = [];

  // 1. Age everyone up and apply friendship decay
  let rels = (char.relationships||[]).map(r=>{
    if(!r.alive) return r;
    const decayRate = r.type==='friend'?3:r.type==='sibling'?1:r.type==='partner'?2:r.type==='interest'?4:0;
    const tended = (char.yearActions||[]).some(a=>a.includes(r.name));
    const decay = tended ? 0 : decayRate;
    return { ...r, score:Math.max(0,r.score-decay), age:(r.age||0)+1 };
  });

  // 1b. Random conflict events — relationships can develop friction
  const conflictEvents = [];
  rels = rels.map(r=>{
    if(!r.alive||r.type!=='friend') return r;
    if(chance(8) && r.score >= 50){
      conflictEvents.push({ text:`A misunderstanding with ${r.name} has left things awkward between you.`, type:'neutral' });
      return { ...r, score:Math.max(0,r.score-15) };
    }
    return r;
  });
  for(const ev of conflictEvents) events.push(ev);

  // 2. Friends and siblings
  rels = rels.map(r=>{
    if(!r.alive || r.type==='parent' || r.type==='spouse' || r.type==='child') return r;
    if(!chance(5)) return r;
    const roll = Math.random();
    if(roll < 0.3 && r.type==='friend'){
      events.push({ text:`${r.name} moved away. You may never see them again.`, type:'bad' });
      return { ...r, alive:false, reason:'moved away' };
    } else if(roll < 0.5 && r.score < 30 && r.type==='friend'){
      events.push({ text:`${r.name} betrayed your trust. That friendship is over.`, type:'bad' });
      return { ...r, alive:false, reason:'betrayal', score:0 };
    } else if(roll < 0.6 && charAge > 40){
      events.push({ text:`${r.name} passed away. You grieve quietly.`, type:'bad' });
      return { ...r, alive:false, reason:'died' };
    }
    return r;
  });

  // 3. Parents — age-based death chance
  rels = rels.map(r=>{
    if(r.type!=='parent'||!r.alive) return r;
    const parentAge = r.age||50;
    if(parentAge > 65 && chance((parentAge-65)*2)){
      events.push({ text:`${r.name} passed away peacefully. You feel the absence deeply.`, type:'bad' });
      return { ...r, alive:false, reason:'died' };
    }
    return r;
  });

  // 4. Spouse — ages and can die
  rels = rels.map(r=>{
    if(r.type!=='spouse'||!r.alive) return r;
    const spouseAge = r.age||40;
    if(spouseAge > 65 && chance((spouseAge-65)*2)){
      events.push({ text:`${r.name}, your ${r.subtype||'spouse'}, passed away. A quiet that will not fill.`, type:'bad' });
      return { ...r, alive:false, reason:'died' };
    }
    if(chance(0.5)){
      events.push({ text:`${r.name} was taken suddenly. You were not ready.`, type:'bad' });
      return { ...r, alive:false, reason:'accident' };
    }
    return r;
  });

  // 4b. Children leaving home at 18 and beyond
  rels = rels.map(r=>{
    if(r.type!=='child'||!r.alive) return r;
    const childAge = r.age||0;
    if(childAge === 18){
      events.push({ text:`${r.name} is 18. They are thinking about leaving home.`, type:'neutral' });
    } else if(childAge > 18 && childAge < 25){
      // Each year after 18: relationship degrades if still home, chance to leave
      if(chance(30)){
        events.push({ text:`${r.name} has moved out to make their own way.`, type:'neutral' });
        return { ...r, type:'family', inHousehold:false };
      }
      // Staying degrades relationship slowly
      return { ...r, score:Math.max(0,(r.score||50)-2) };
    }
    return r;
  });

  // 5. Children — infant mortality and late-life death
  rels = rels.map(r=>{
    if(r.type!=='child'||!r.alive) return r;
    const childAge = r.age||0;
    if(childAge < 5 && chance(2)){
      events.push({ text:`${r.name} did not survive their early years. A grief that never fully leaves.`, type:'bad' });
      return { ...r, alive:false, reason:'died in infancy' };
    }
    if(childAge > 65 && chance((childAge-65)*1.5)){
      events.push({ text:`${r.name} has passed away. They outlived many things, but not everything.`, type:'bad' });
      return { ...r, alive:false, reason:'died of age' };
    }
    return r;
  });

  // Positive milestones — close relationships can help in meaningful ways
  rels = rels.map(r=>{
    if(!r.alive || r.score < 80) return r;
    // Close friend occasionally helps with something
    if(r.type==='friend' && chance(10)){
      events.push({ text:`${r.name} came through for you in a way you did not expect.`, type:'good', bonus:{gold:rand(5,15)} });
    }
    // Living parent occasionally leaves a small gift
    if(r.type==='parent' && chance(5) && charAge > 20){
      events.push({ text:`${r.name} gave you something they had been keeping for years.`, type:'good', bonus:{gold:rand(10,30)} });
    }
    return r;
  });

  // Apply milestone bonuses to char gold (will be handled by GameScreen reading relEvents)
  return { relationships:rels, relEvents:events };
}

const FRIEND_SCENARIOS = [
  // Child-appropriate (ages 6+)
  { id:'c1', minAge:6, maxAge:12, text:'Another kid is building something in the dirt and keeps looking over at you.',
    choices:[
      { text:'Go and help them build it.', successChance:85, statBoost:'CHA' },
      { text:'Watch from a distance.', successChance:30 },
    ]
  },
  { id:'c2', minAge:6, maxAge:12, text:'Someone dropped their sweet bun in the mud and looks about to cry.',
    choices:[
      { text:'Share half of yours.', successChance:90, statBoost:'CHA' },
      { text:'Pretend you did not see.', successChance:0, skip:true },
    ]
  },
  { id:'c3', minAge:6, maxAge:15, text:'A group is choosing teams for a game and there is one spot left.',
    choices:[
      { text:'Wave them over to your side.', successChance:80, statBoost:'CHA' },
      { text:'Let someone else pick.', successChance:35 },
    ]
  },
  { id:'s1', minAge:8, maxAge:99, text:'A kid at the market keeps glancing at your knife. You could talk to them.',
    choices:[
      { text:'Show them the knife and tell them where you got it.', successChance:80, statBoost:'CHA' },
      { text:'Ignore them — strangers are trouble.', successChance:0, skip:true },
    ]
  },
  { id:'s2', minAge:8, maxAge:99, text:'Someone your age is being picked on near the well. You could step in.',
    choices:[
      { text:'Step between them and the bully.',       successChance:70, statBoost:'STR' },
      { text:'Call out from a distance — less risky.', successChance:55, statBoost:'CHA' },
      { text:'Walk past. Not your business.',          successChance:0,  skip:true },
    ]
  },
  { id:'s3', minAge:6, maxAge:99, text:'A new family moved in down the road. Their child looks lost at the festival.',
    choices:[
      { text:'Drag them into the dancing before they can say no.', successChance:75, statBoost:'CHA' },
      { text:'Offer to show them around quietly.',                  successChance:85 },
      { text:'Leave them to figure it out.',                        successChance:0, skip:true },
    ]
  },
  { id:'s4', minAge:16, maxAge:99, text:'Someone helped you carry something heavy without being asked.',
    choices:[
      { text:'Thank them properly and buy them a drink.',   successChance:85, statBoost:'CHA' },
      { text:'Nod and go your separate ways.',              successChance:40 },
    ]
  },
  { id:'s5', minAge:20, maxAge:99, text:'A face you half-recognise from years ago. You both stop.',
    choices:[
      { text:'Remember them out loud — ask how they have been.', successChance:80 },
      { text:'Pretend you do not recognise them.',               successChance:0, skip:true },
    ]
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

// Age-appropriate interaction labels
function getInteractionLabels(age){
  if(age < 8)  return [{id:'play',label:'Play together'},{id:'share',label:'Share something'},{id:'help',label:'Help them'}];
  if(age < 13) return [{id:'play',label:'Hang out'},{id:'share',label:'Tell a secret'},{id:'help',label:'Stand up for them'}];
  if(age < 18) return [{id:'chat',label:'Spend time'},{id:'share',label:'Confide in them'},{id:'help',label:'Do something together'}];
  return [{id:'chat',label:'Chat'},{id:'help',label:'Help them'},{id:'kind',label:'Do something kind'}];
}
function relHealthColour(score){ return score>=75?T.green:score>=40?'#c8a84b':score>=20?T.orange:T.red; }
function relHealthLabel(score, interacted){
  if(!interacted && score < 60) return 'Drifting';
  return score>=75?'Close':score>=50?'Friendly':score>=30?'Acquaintance':score>=15?'Strained':'Critical';
}
const INTERACTION_POOLS = {
  play:[
    {text:'You had a great time. They laughed a lot.',score:+8,gold:0},
    {text:'Simple, uncomplicated fun.',score:+5,gold:0},
    {text:'An awkward moment, but you recovered.',score:-3,gold:0},
    {text:'They seemed distracted. Something is on their mind.',score:+1,gold:0},
    {text:'You made them laugh at exactly the right moment.',score:+10,gold:0},
  ],
  share:[
    {text:'They listened. Really listened.',score:+12,gold:0},
    {text:'You shared something personal. They shared something back.',score:+10,gold:0},
    {text:'You said the wrong thing. They went quiet.',score:-8,gold:0},
    {text:'A moment of real honesty between you.',score:+8,gold:0},
    {text:'You told them something you should have kept. They were hurt.',score:-15,gold:0,betrayal:true},
  ],
  help:[
    {text:"You came through for them. They won't forget it.",score:+12,gold:0},
    {text:'Your help arrived just in time.',score:+8,gold:5},
    {text:'You tried to help but made things worse.',score:-5,gold:0},
    {text:'They were so grateful they gave you something.',score:+10,gold:10},
    {text:'You helped. They noticed.',score:+6,gold:0},
  ],
  chat:[
    {text:'A good conversation. The kind that lingers.',score:+7,gold:0},
    {text:'You caught up. Things feel easier between you.',score:+5,gold:0},
    {text:'You cancelled last minute. They were disappointed.',score:-6,gold:0},
    {text:'You said something thoughtless.',score:-4,gold:0},
    {text:'They paid back an old debt without being asked.',score:+8,gold:12},
    {text:'A comfortable silence that felt like understanding.',score:+6,gold:0},
  ],
  kind:[
    {text:'A small gesture that meant more than expected.',score:+8,gold:0},
    {text:'You gave them something they needed.',score:+10,gold:-5},
    {text:"They weren't in the mood. It landed badly.",score:-3,gold:0},
    {text:'Your kindness was returned.',score:+9,gold:8},
  ],
};

export default function RelationshipsTab({ char, onAction }){
  const [result, setResult]               = useState(null);
  const resultTimerRef = useRef(null);
  const [weddingChoices, setWeddingChoices] = useState(null);
  const [adoptModal, setAdoptModal]     = useState(false);
  const [weddingPlan, setWeddingPlan]   = useState({menu:'modest',venue:'hall',guestSize:'small',honeymoon:null});
  const [adoptChoices, setAdoptChoices] = useState([]);
  const [tapState, setTapState]             = useState({});
  const [pendingFriend, setPendingFriend]  = useState(null);
  const [friendModal, setFriendModal]  = useState(null);
  const [proposeTarget, setProposeTarget] = useState(null);

  function setResultAuto(r){ setResult(r); if(r){ clearTimeout(resultTimerRef.current); resultTimerRef.current = setTimeout(()=>setResult(null),4000); } }

  const socialiseLeft = Math.max(0,(SEASON_LIMITS.socialise||3)-(char.seasonActions?.socialise||0));
  const rels = char.relationships||[];
  const living = rels.filter(r=>r.alive!==false);

  const parents   = living.filter(r=>r.type==='parent');
  const siblings  = living.filter(r=>r.type==='sibling');
  const spouse    = living.find(r=>r.type==='spouse');
  const partner   = living.find(r=>r.type==='partner');
  const children  = living.filter(r=>r.type==='child');
  const friends   = living.filter(r=>r.type==='friend'||r.type==='romance'||r.type==='mentor'||r.type==='partner');
  const dead      = rels.filter(r=>r.alive===false);

  // Household capacity from properties
  const properties = char.properties||[];
  const home = properties.find(p=>p.isHome);
  const houseCap = home
    ? ({ cottage:2, house:4, farm:5, tavern:6, manor:12 }[home.type]||2)
    : 2;
  const household = char.household||[];



  function interact(rel, type){
    // No hard cap — but track interactions per NPC per season
    // First 3 with any given NPC count fully, beyond that score gain drops to 0
    const npcInteractions = (char.seasonNpcInteractions||{})[rel.id]||0;
    const scoreDiminshed = npcInteractions >= 3;

    const pool = INTERACTION_POOLS[type]||INTERACTION_POOLS.chat;
    const cha = char.stats?.CHA||5;
    const raw = Math.floor(Math.random()*pool.length);
    const idx = Math.min(pool.length-1, Math.max(0, cha>=8?Math.min(raw,pool.length-2):raw));
    const outcome = pool[idx];
    const scoreChange = scoreDiminshed ? 0 : (outcome.score||0);
    const goldChange  = outcome.gold||0;
    const updatedRels = (char.relationships||[]).map(r=>
      r.id===rel.id ? {...r,score:Math.min(100,Math.max(0,(r.score||50)+scoreChange)),lastInteracted:(char.age||0)} : r
    );
    const updated = {
      ...char,
      gold: Math.max(0,(char.gold||0)+goldChange),
      relationships: updatedRels,
      betrayalCount: outcome.betrayal?(char.betrayalCount||0)+1:Math.max(0,(char.betrayalCount||0)),
      seasonNpcInteractions:{...(char.seasonNpcInteractions||{}),[rel.id]:npcInteractions+1},
      yearActions:[...(char.yearActions||[]),`Spent time with ${rel.name}`],
      log:[...(char.log||[]),{age:char.age,text:`${rel.name}: ${outcome.text}${scoreDiminshed?' (no further gain this season)':''}`,type:scoreChange<0?'bad':'good'}],
    };
    const dimNote = scoreDiminshed ? ' You have spent enough time with them this season.' : '';
    setResultAuto({text:`${outcome.text}${goldChange>0?` (+${goldChange}g)`:''}${dimNote}`,bad:scoreChange<-5});
    onAction(updated);
  }

  function pendingFriendIntroduce(){
    if(!pendingFriend) return;
    const chaBonus = ((char.stats?.CHA||1)-5)*3;
    const success = chance(Math.min(85,50+chaBonus));
    if(success){
      const newFriend = {id:`f_${Date.now()}`,name:pendingFriend.name,age:pendingFriend.age,
        gender:pendingFriend.gender,race:pendingFriend.race,type:'friend',score:40,alive:true,traits:pendingFriend.traits};
      const updated = {...char,
        relationships:[...(char.relationships||[]),newFriend],
        seasonActions:{...(char.seasonActions||{}),socialise:((char.seasonActions?.socialise||0)+1)},
        yearActions:[...(char.yearActions||[]),`Met ${pendingFriend.name}`],
        log:[...(char.log||[]),{age:char.age,text:`Met ${pendingFriend.name}. Something clicked.`,type:'good'}],
      };
      setResultAuto({text:`You introduced yourself to ${pendingFriend.name}. A friendship begins.`,bad:false});
      onAction(updated);
    } else {
      setResultAuto({text:'The introduction was awkward. Maybe another time.',bad:false});
    }
    setPendingFriend(null);
  }

  function propose(rel){
    if(char.age < 18){ setResultAuto({text:'You must be at least 18 to marry.',bad:true}); return; }
    if(!char.hasRing){ setResultAuto({text:'You need a ring first. Visit the Jeweller in the market.',bad:true}); return; }
    if(spouse){ setResultAuto({text:'You are already married.',bad:true}); return; }
    if(char.spouseDeathYear && char.age <= char.spouseDeathYear){ setResultAuto({text:'You are still grieving. Give yourself time.',bad:true}); return; }
    if(rel.score < 80){ setResultAuto({text:`${rel.name} does not know you well enough yet. Relationship must be Close (80+).`,bad:true}); return; }
    if((char.seasonActions?.socialise||0) >= (SEASON_LIMITS.socialise||3)){ setResultAuto({text:'You have been social enough this season.',bad:true}); return; }

    // Ring quality bonus
    const ringItem = (char.inventory||[]).find(i=>i.isRing);
    const ringBonus = ringItem?.ringQuality==='jewelled'?25:ringItem?.ringQuality==='gold'?15:ringItem?.ringQuality==='silver'?5:0;
    const chaBonus = ((char.stats?.CHA||1)-1)*3;
    const success = chance(Math.min(95, 60+chaBonus+ringBonus));

    if(success){
      // Trigger wedding planning instead of instant marriage
      setWeddingChoices({ rel, ringQuality: ringItem?.ringQuality||'silver' });
      setProposeTarget(null);
    } else {
      const updated = {
        ...char,
        seasonActions:{ ...(char.seasonActions||{}), socialise:((char.seasonActions?.socialise||0)+1) },
        log:[...(char.log||[]),{ age:char.age, text:`${rel.name} was not ready. Not yet.`, type:'neutral' }],
      };
      setResultAuto({ text:`${rel.name} said not yet. It hurt more than expected.`, bad:false });
      onAction(updated);
    }
    setProposeTarget(null);
  }

  function tryForBaby(){
    if(!canHaveBioBaby(char)){ setResultAuto({text:'This is not possible for your partnership.',bad:true}); return; }
    if(!spouse){ setResultAuto({text:'You need a spouse first.',bad:true}); return; }
    if(char.age < 16 || char.age > 50){ setResultAuto({text:'This is not the right time in your life for this.',bad:true}); return; }
    if((household||[]).length >= houseCap){ setResultAuto({text:`Your home is full (capacity ${houseCap}). You would need larger property.`,bad:true}); return; }
    if((char.seasonActions?.socialise||0) >= (SEASON_LIMITS.socialise||3)){ setResultAuto({text:'You have been social enough this season.',bad:true}); return; }

    const conBonus = ((char.stats?.CON||10)-10)*2;
    const success = chance(Math.min(85, 50+conBonus));

    if(success){
      const childTraits = ['curious','stubborn','gentle','wild','quiet','bold'];
      const childTrait = childTraits[Math.floor(Math.random()*childTraits.length)];
      const child = {
        id:`child_${Date.now()}`,
        name:rname(),
        type:'child',
        subtype: chance(50)?'daughter':'son',
        score:90,
        alive:true,
        age:0,
        bornAge:char.age,
        trait:childTrait,
      };
      const updated = {
        ...char,
        relationships:[...rels, child],
        household:[...household, child.id],
        seasonActions:{ ...(char.seasonActions||{}), socialise:((char.seasonActions?.socialise||0)+1) },
        yearActions:[...(char.yearActions||[]), `${child.name} was born`],
        log:[...(char.log||[]),{ age:char.age, text:`${child.name} was born — your ${child.subtype}.`, type:'good' }],
      };
      setResultAuto({ text:`${child.name} was born. Your ${child.subtype}.`, bad:false });
      onAction(updated);
    } else {
      const updated = {
        ...char,
        seasonActions:{ ...(char.seasonActions||{}), socialise:((char.seasonActions?.socialise||0)+1) },
        log:[...(char.log||[]),{ age:char.age, text:'No child came this year.', type:'neutral' }],
      };
      setResultAuto({ text:"Not this year. These things take time.", bad:false });
      onAction(updated);
    }
  }

  function childHelps(child){
    if(char.age < 16){ return; }
    const income = rand(2,8);
    const updated = {
      ...char, gold:(char.gold||0)+income,
      yearActions:[...(char.yearActions||[]), `${child.name} helped out — +${income}g`],
      log:[...(char.log||[]),{ age:char.age, text:`${child.name} helped around the place. Small hands, willing heart. +${income}g.`, type:'good' }],
    };
    setResultAuto({ text:`${child.name} pitched in. +${income}g.`, bad:false });
    onAction(updated);
  }

  function divorce(rel){
    if(!rel) return;
    const updatedRels = rels.map(r=>r.id===rel.id ? { ...r, type:'estranged_spouse', score:Math.max(0,r.score-30) } : r);
    const updated = {
      ...char, spouse:null, relationships:updatedRels,
      log:[...(char.log||[]),{ age:char.age, text:`You and ${rel.name} separated. Some things cannot be repaired.`, type:'bad' }],
      yearActions:[...(char.yearActions||[]), `Divorced ${rel.name}`],
    };
    setResultAuto({ text:`You and ${rel.name} are no longer married.`, bad:true });
    onAction(updated);
  }

  function generateAdoptChoices(isSolo=false){
    if(char.age < 20){ setResultAuto({text:'You must be at least 20 to adopt.',bad:true}); return; }
    if(char.adoptedThisYear){ setResultAuto({text:'You have already adopted a child this year.',bad:true}); return; }
    if((household||[]).length >= houseCap){ setResultAuto({text:`Your home is full (capacity ${houseCap}).`,bad:true}); return; }
    const hasHome = (char.properties||[]).length>0 || char.rentedProperty || (char.inventory||[]).some(i=>i.isTent);
    if(!hasHome){ setResultAuto({text:'You need stable shelter before you can adopt.',bad:true}); return; }
    if((char.gold||0) < 20){ setResultAuto({text:'Adoption costs 20g. You cannot afford it.',bad:true}); return; }

    const allRaces = ['human','elf','dwarf','orc','halfling','tiefling','dragonborn','gnome'];
    const playerRace = char.race?.id||'human';
    const traits = ['curious','stubborn','gentle','wild','quiet','bold'];
    const stages = [
      { label:'infant',  age:0,  ageRange:'newborn' },
      { label:'child',   age:Math.floor(Math.random()*5)+2,  ageRange:'2–6' },
      { label:'youth',   age:Math.floor(Math.random()*5)+7,  ageRange:'7–11' },
    ];
    const childNames = ['Aldric','Seren','Wren','Calder','Petra','Tam','Brix','Nessa','Lira','Oswin','Freya','Rael','Cora','Dace','Elys','Finn'];

    // Generate 3 distinct children
    const choices = stages.map((stage, i) => {
      const raceId = Math.random()>0.5 ? playerRace : allRaces[Math.floor(Math.random()*allRaces.length)];
      const raceObj = RACES.find(r=>r.id===raceId)||RACES[0];
      const trait = traits[Math.floor(Math.random()*traits.length)];
      const name = childNames[(i*5+Math.floor(Math.random()*5))%childNames.length];
      const subtype = Math.random()>0.5?'girl':'boy';
      // Baby stats scale with age — older children have more developed stats
      const baseStat = stage.label==='infant' ? ()=>Math.ceil(Math.random()*2) :
                       stage.label==='child'  ? ()=>Math.ceil(Math.random()*3)+1 :
                                                ()=>Math.ceil(Math.random()*4)+2;
      const stats = { STR:baseStat(),DEX:baseStat(),INT:baseStat(),WIS:baseStat(),CHA:baseStat(),CON:baseStat() };
      return { name, raceObj, raceId, trait, subtype, stage, stats, isSolo };
    });

    setAdoptChoices(choices);
    setAdoptModal(true);
  }

  function confirmAdopt(choice){
    const cha = char.stats?.CHA||1;
    const baseChance = choice.isSolo ? 50 : 65;
    const trustBonus = (char.orphanageRelationship||0) * 3; // up to +30% from trust
    const success = chance(Math.min(90, baseChance + cha*4 + trustBonus));
    if(!success){
      setAdoptModal(false);
      setResultAuto({text:'The orphanage turned you away this time. Your circumstances did not fully meet their requirements.',bad:true});
      return;
    }
    const child = {
      id:`child_${Date.now()}`,
      name:choice.name,
      type:'child',
      subtype:choice.subtype==='girl'?'daughter':'son',
      score:80, alive:true,
      age:choice.stage.age,
      bornAge:char.age - choice.stage.age,
      trait:choice.trait,
      race:choice.raceObj,
      stats:choice.stats,
      adopted:true,
    };
    const updated = {
      ...char,
      gold:(char.gold||0)-20,
      adoptedThisYear:true,
      relationships:[...rels, child],
      household:[...household, child.id],
      log:[...(char.log||[]),{
        age:char.age,
        text:`You adopted ${child.name} from the orphanage — a ${choice.raceObj.name} ${choice.subtype}, ${choice.stage.label}. ${choice.trait.charAt(0).toUpperCase()+choice.trait.slice(1)}.`,
        type:'good',
      }],
    };
    setAdoptModal(false);
    setResultAuto({text:`${child.name} is coming home with you.`,bad:false});
    onAction(updated);
  }

  function adoptChild(isSolo=false){
    if(char.age < 20){ setResultAuto({text:'You must be at least 20 to adopt.',bad:true}); return; }
    if((household||[]).length >= houseCap){ setResultAuto({text:`Your home is full (capacity ${houseCap}). You need larger property.`,bad:true}); return; }
    const hasHome = (char.properties||[]).length>0 || char.rentedProperty || (char.inventory||[]).some(i=>i.isTent);
    if(!hasHome){ setResultAuto({text:'You need stable shelter before you can adopt. A tent qualifies.',bad:true}); return; }
    if((char.gold||0) < 20){ setResultAuto({text:'Adoption costs 20g. You cannot afford it right now.',bad:true}); return; }

    // Success check — CHA-based, solo is slightly harder
    const cha = char.stats?.CHA||1;
    const baseChance = isSolo ? 50 : 65;
    const chaBonus = cha * 4;
    const success = chance(Math.min(90, baseChance + chaBonus));

    if(!success){
      setResultAuto({text:'The orphanage turned you away this time. Your circumstances did not meet their requirements.',bad:true});
      return;
    }

    // Child's race: 50% player's race, 50% random from world
    const playerRace = char.race?.id||'human';
    const allRaces = ['human','elf','dwarf','orc','halfling','tiefling','dragonborn','gnome'];
    const childRaceId = Math.random() > 0.5 ? playerRace : allRaces[Math.floor(Math.random()*allRaces.length)];
    const childRaceObj = RACES.find(r=>r.id===childRaceId)||RACES[0];
    const traits = ['curious','stubborn','gentle','wild','quiet','bold'];
    const childTrait = traits[Math.floor(Math.random()*traits.length)];
    const childNames = ['Aldric','Seren','Wren','Calder','Petra','Tam','Brix','Nessa','Lira','Oswin','Freya','Rael'];
    const childName = childNames[Math.floor(Math.random()*childNames.length)];
    const subtype = Math.random()>0.5 ? 'daughter' : 'son';

    const child = {
      id:`child_${Date.now()}`,
      name:childName,
      type:'child',
      subtype,
      score:80,
      alive:true,
      age:0,
      bornAge:char.age,
      trait:childTrait,
      race:childRaceObj,
      adopted:true,
    };

    const updated = {
      ...char,
      gold:(char.gold||0)-20,
      adoptedThisYear:true,
      relationships:[...rels, child],
      household:[...household, child.id],
      log:[...(char.log||[]),{
        age:char.age,
        text:`You adopted ${childName} from the orphanage. A ${childRaceObj.name} ${subtype}. ${childTrait.charAt(0).toUpperCase()+childTrait.slice(1)}.`,
        type:'good'
      }],
    };
    setResultAuto({text:`${childName} is now your ${subtype}. Welcome home.`,bad:false});
    onAction(updated);
  }

  function completeWedding(choices){
    const rel = weddingChoices?.rel;
    if(!rel) return;
    const { menu, venue, honeymoon, guestSize } = choices;
    const menuCost   = {simple:5, modest:20, grand:60}[menu]||5;
    const venueCost  = {hall:10, tavern:20, outdoor:5, manor:80}[venue]||10;
    const honeyCost  = honeymoon ? {local:15,town:30,city:60}[honeymoon]||0 : 0;
    const guestCost  = {small:0, medium:10, large:25}[guestSize]||0;
    const totalCost  = menuCost + venueCost + honeyCost + guestCost;
    if((char.gold||0) < totalCost){ setResultAuto({text:`You cannot afford this wedding (${totalCost}g). You have ${char.gold||0}g.`,bad:true}); return; }
    const spouseScore = 60 + (honeymoon?15:0) + (menu==='grand'?10:menu==='modest'?5:0);
    const updatedRels = rels.map(r=>r.id===rel.id ? { ...r, type:'spouse', subtype:'spouse', score:Math.min(100,spouseScore), detail:r.detail||randomSpouseDetail() } : r);
    const weddingDesc = `You married ${rel.name} at a ${menu} ${venue} wedding.${honeymoon?` Honeymoon in ${honeymoon}.`:''}`;
    const updated = {
      ...char, spouse:rel.id, gold:(char.gold||0)-totalCost,
      relationships:updatedRels, hasMovedOut:true,
      log:[...(char.log||[]),{age:char.age,text:weddingDesc,type:'good'}],
      yearActions:[...(char.yearActions||[]),`Married ${rel.name}`],
    };
    setWeddingChoices(null);
    setResultAuto({text:`You are married. ${totalCost}g spent.`,bad:false});
    onAction(updated);
  }

  function tryMakeFriend(){
    if((char.seasonActions?.socialise||0) >= (SEASON_LIMITS.socialise||3)){ setResultAuto({text:'You have been social enough this season.',bad:true}); return; }
    const age = char.age||0;
    const eligible = FRIEND_SCENARIOS.filter(s=>age>=(s.minAge??0) && age<=(s.maxAge??99));
    const pool = eligible.length ? eligible : FRIEND_SCENARIOS.filter(s=>(s.minAge??0)<=age);
    const scenario = (pool.length?pool:FRIEND_SCENARIOS)[Math.floor(Math.random()*(pool.length?pool.length:FRIEND_SCENARIOS.length))];
    setFriendModal(scenario);
  }

  function resolveFriendScenario(scenario, choice){
    setFriendModal(null);
    if(choice.skip){ setResultAuto({text:'You let the moment pass.',bad:false}); return; }
    const chaBonus = ((char.stats?.CHA||10)-10)*2;
    const finalChance = Math.min(95, (choice.successChance||60)+chaBonus);
    const success = chance(finalChance);
    const energyCost = ENERGY.socialise;
    if(success){
      const newFriend = {
        id:`friend_${Date.now()}`,
        name:rname(), type:'friend',
        score:50, alive:true, age:char.age+rand(-3,3),
      };
      const updated = {
        ...char,
        relationships:[...rels, newFriend],
        energyUsed:{ ...char.energyUsed, socialise:(char.energyUsed?.socialise||0)+energyCost },
        yearActions:[...(char.yearActions||[]), `Made a new friend — ${newFriend.name}`],
        log:[...(char.log||[]),{ age:char.age, text:`Made a friend: ${newFriend.name}.`, type:'good' }],
      };
      setResultAuto({ text:`It worked. ${newFriend.name} — a real connection.`, bad:false });
      onAction(updated);
    } else {
      const updated = {
        ...char,
        energyUsed:{ ...char.energyUsed, socialise:(char.energyUsed?.socialise||0)+energyCost },
        yearActions:[...(char.yearActions||[]), 'Tried to make a friend — did not work out'],
        log:[...(char.log||[]),{ age:char.age, text:'Tried to make a friend. It did not click.', type:'neutral' }],
      };
      setResultAuto({ text:"It did not quite work out.", bad:false });
      onAction(updated);
    }
  }

  function RelCard({ rel }){
    const tier = getRelTier(rel.score);
    const isSpouse = rel.type==='spouse';
    const isChild  = rel.type==='child';
    const emoji = isSpouse?'💍':isChild?(rel.subtype==='daughter'?'👧':'👦'):rel.type==='parent'?'👤':rel.type==='sibling'?'🧑':'🤝';
    const interacted = (char.yearActions||[]).some(a=>a.includes(rel.name));
    const healthCol = relHealthColour(rel.score||50);
    const healthLbl = relHealthLabel(rel.score||50, interacted);
    return (
      <Card accent={healthCol} style={{marginBottom:'8px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
          <div>
            <span style={{fontSize:'14px',fontWeight:700,color:T.text}}>{emoji} {rel.name}</span>
            {rel.subtype && <span style={{fontSize:'11px',color:T.muted,marginLeft:'6px'}}>{rel.subtype}</span>}
            {rel.age !== undefined && <span style={{fontSize:'11px',color:T.muted,marginLeft:'6px'}}>age {rel.age}</span>}
            {rel.trait && rel.type==='child' && <span style={{fontSize:'9px',color:T.purple,marginLeft:'4px',fontStyle:'italic'}}>{rel.trait}</span>}
            {rel.trade && rel.type==='child' && <span style={{fontSize:'9px',color:T.gold,marginLeft:'4px',background:T.gold+'22',padding:'1px 5px',borderRadius:'3px',textTransform:'capitalize'}}>{rel.trade} apprentice</span>}
            {rel.adopted && rel.race && <span style={{fontSize:'9px',color:T.teal,marginLeft:'4px'}}>{rel.race.name}</span>}
          </div>
          <span style={{fontSize:'9px',color:healthCol,fontWeight:700,background:healthCol+'22',padding:'2px 6px',borderRadius:'4px'}}>{healthLbl}</span>
        </div>
        <div style={{height:'4px',background:'#1a1208',borderRadius:'2px',overflow:'hidden',marginBottom:'8px'}}>
          <div style={{height:'100%',width:`${rel.score||50}%`,background:healthCol,borderRadius:'2px',transition:'width 0.4s'}}/>
        </div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {getInteractionLabels(char.age||0).map(({id,label})=>(
            <Btn key={id} onClick={()=>interact(rel,id)}
              disabled={socialiseLeft<=0} colour={healthCol} small full={false}>
              {label}
            </Btn>
          ))}
          {(rel.type==='friend'||rel.type==='partner') && !spouse && char.age>=18 && (rel.type==='partner'||tier.label==='Close') && (
            <Btn onClick={()=>setProposeTarget(rel)} colour={T.gold} small full={false}>
              💍 Propose
            </Btn>
          )}
          {(isSpouse||rel.type==='friend') && (
            <Btn onClick={()=>setGiftModal(rel)} colour={tier.colour} small full={false}>
              🎁 Give a Gift
            </Btn>
          )}
          {(rel.type==='sibling'||isChild) && (
            <Btn onClick={()=>interact(rel,'chat')}
              colour={tier.colour} small full={false}>
              🎮 Play (free)
            </Btn>
          )}
          {isChild && (rel.age||0) >= 8 && (
            <Btn onClick={()=>childHelps(rel)} colour={T.green} small full={false}>
              🌱 Let them help (+gold)
            </Btn>
          )}
          {isSpouse && (
            <Btn onClick={()=>divorce(rel)} colour={T.red} small full={false} outline>
              💔 Divorce
            </Btn>
          )}
        </div>
        {rel.score < 30 && rel.alive!==false && (
          <p style={{fontSize:'10px',color:T.red,marginTop:'6px',fontStyle:'italic'}}>
            {isSpouse ? 'Your marriage is in serious difficulty.' : rel.type==='friend' ? 'This friendship is fading.' : 'This relationship is strained.'}
          </p>
        )}
        {rel.score >= 30 && rel.score < 50 && rel.alive!==false && (
          <p style={{fontSize:'10px',color:T.orange,marginTop:'6px',fontStyle:'italic'}}>
            {isSpouse ? 'There is distance between you lately.' : 'This relationship needs attention.'}
          </p>
        )}
      </Card>
    );
  }

  const [subTab, setSubTab] = useState('family');
  const [giftModal, setGiftModal] = useState(null); // rel being gifted

  // ── Going Out state (Social sub-tab) ──────────────────────────────────────
  const [metNPC, setMetNPC]   = useState(null);
  const [goOutResult, setGoOutResult] = useState(null);
  const attractedTo = char.sexuality==='asexual' ? [] :
    char.sexuality==='gay' ? [char.gender?.id||'male'] :
    char.sexuality==='straight' ? (char.gender?.id==='male'?['female']:['male']) :
    ['male','female','nonbinary'];
  const VENUES = [
    { id:'dance',    name:'Village Dance', emoji:'💃', desc:'Music, movement, warm firelight.',  chaBonus:5  },
    { id:'pub',      name:'The Tavern',    emoji:'🍺', desc:'Loud, crowded, good for stories.',  chaBonus:0  },
    { id:'festival', name:'Festival',      emoji:'🎪', desc:'Everyone is here. Best odds.',      chaBonus:10 },
  ];
  const NPC_NAMES_GO = ['Aldric','Seren','Wren','Calder','Petra','Tamsin','Oswin','Lira','Brix','Nessa','Freya','Gavril'];
  const NPC_JOBS_GO  = ['merchant','farmer','healer','carpenter','guard','bard','scribe','herbalist'];
  const WEALTH_GO    = ['Modest','Comfortable','Wealthy','Poor'];
  const GEND_GO      = ['male','female','nonbinary'];

  function goOut(venue){
    if((char.seasonActions?.goingOut||0) >= (SEASON_LIMITS.goingOut||2)){ setGoOutResult({text:'You have been out enough this season.',bad:true}); return; }
    const cha = char.stats?.CHA||1;
    const met = chance(Math.min(90, 30 + cha*3 + venue.chaBonus));
    if(!met){
      onAction({...char, seasonActions:{...(char.seasonActions||{}), goingOut:((char.seasonActions?.goingOut||0)+1)}});
      setGoOutResult({text:`A pleasant evening at ${venue.name}. Nobody new tonight.`, bad:false});
      setMetNPC(null); return;
    }
    const seed = Date.now();
    const npcGender = GEND_GO[seed%3];
    const npc = {
      id:`npc_${seed}`, name:NPC_NAMES_GO[seed%NPC_NAMES_GO.length],
      gender:npcGender, age:Math.max(16,(char.age||16)+Math.floor(Math.random()*10)-4),
      job:NPC_JOBS_GO[(seed+1)%NPC_JOBS_GO.length], wealth:WEALTH_GO[(seed+2)%WEALTH_GO.length], score:30,
    };
    const isRomantic = attractedTo.includes(npcGender) && chance(40);
    setMetNPC({ npc, isRomantic });
    onAction({...char, seasonActions:{...(char.seasonActions||{}), goingOut:((char.seasonActions?.goingOut||0)+1)}, pendingNPC:npc});
  }
  function addAsFriendGO(npc){
    onAction({...char, relationships:[...(char.relationships||[]),{...npc,type:'friend',alive:true}], pendingNPC:null,
      log:[...(char.log||[]),{age:char.age,text:`You met ${npc.name} at a gathering. There is something there.`,type:'good'}]});
    setGoOutResult({text:`${npc.name} is now a friend.`,bad:false}); setMetNPC(null);
  }
  function addAsInterestGO(npc){
    onAction({...char, relationships:[...(char.relationships||[]),{...npc,type:'interest',alive:true,score:30}], pendingNPC:null,
      log:[...(char.log||[]),{age:char.age,text:`You met ${npc.name}. Something about them stayed with you.`,type:'good'}]});
    setGoOutResult({text:`${npc.name} caught your interest.`,bad:false}); setMetNPC(null);
  }

  // Sub-tab pill nav style
  function pillStyle(id){ return {
    padding:'5px 12px', borderRadius:'16px', fontSize:'11px', fontWeight:700,
    background: subTab===id ? T.gold+'33' : 'transparent',
    border: `1px solid ${subTab===id ? T.gold : T.border}`,
    color: subTab===id ? T.gold : T.muted,
    cursor:'pointer', WebkitTapHighlightColor:'transparent',
  }; }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* Sub-tab nav */}
      <div style={{display:'flex',gap:'6px',padding:'8px 12px 4px',borderBottom:`1px solid ${T.border}`,flexShrink:0,flexWrap:'wrap'}}>
        <button style={pillStyle('family')}  onClick={()=>setSubTab('family')}>👨‍👩‍👦 Family</button>
        <button style={pillStyle('friends')} onClick={()=>setSubTab('friends')}>🤝 Friends</button>
        <button style={pillStyle('romance')} onClick={()=>setSubTab('romance')}>💍 Romance</button>
        <button style={pillStyle('social')}  onClick={()=>setSubTab('social')}>🎪 Social</button>
      </div>

      {/* Result banner */}
      <div style={{padding:'0 12px',flexShrink:0}}>
        {result && (
          <Card accent={result.bad?T.red:T.green} style={{marginTop:'8px'}}>
            <p style={{fontSize:'13px',color:result.bad?T.red:T.green}}>{result.text}</p>
            <Btn onClick={()=>setResult(null)} colour={T.muted} small full={false} style={{marginTop:'6px'}}>Dismiss</Btn>
          </Card>
        )}
      </div>

      {/* ── FAMILY sub-tab ──────────────────────────────────────────────── */}
      {subTab==='family' && (
        <div style={{padding:'10px 12px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>

          {/* Household */}
          {(spouse||children.length>0) && (
            <>
              <SectionHeader>Household — {(char.household||[]).length}/{houseCap} capacity{!home?' (no property)':''}</SectionHeader>
              {spouse && (
                <>
                  <RelCard rel={spouse}/>
                  {!char.combineIncomes && (
                    <Btn onClick={()=>onAction({...char,combineIncomes:true,log:[...(char.log||[]),{age:char.age,text:`You and ${spouse.name} combined your household incomes.`,type:'good'}]})}
                      colour={T.teal} outline style={{marginBottom:'8px',marginTop:'4px'}}>
                      💰 Combine household incomes
                    </Btn>
                  )}
                  {char.combineIncomes && <p style={{fontSize:'10px',color:T.teal,marginBottom:'8px'}}>💰 Incomes combined — {spouse.name} contributes annually.</p>}
                </>
              )}
              {children.map(r=><RelCard key={r.id} rel={r}/>)}
            </>
          )}

          {/* Children — bio or adoption */}
          {char.age >= 16 && char.age <= 55 && (char.household||[]).length < houseCap && (
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
              {canHaveBioBaby(char) && spouse && (
                <Btn onClick={tryForBaby} colour={T.green}>👶 Try for a child</Btn>
              )}
              {(!canHaveBioBaby(char)||!spouse) && char.age >= 20 && (
                <Btn onClick={()=>generateAdoptChoices(!spouse&&!partner)} colour={T.teal}>
                  🏠 Visit the Orphanage — Adopt a child (20g)
                </Btn>
              )}
              {canHaveBioBaby(char) && spouse && char.age >= 20 && (
                <Btn onClick={()=>generateAdoptChoices(false)} colour={T.teal} outline>🏠 Adopt instead (20g)</Btn>
              )}
            </div>
          )}

          {/* Orphanage visit — build relationship with children before adopting */}
          {char.age >= 18 && (
            <Card accent={T.teal} style={{marginBottom:'10px'}}>
              <p style={{fontSize:'12px',color:T.teal,fontWeight:700,marginBottom:'4px'}}>🏠 The Orphanage</p>
              <p style={{fontSize:'10px',color:T.muted,marginBottom:'8px',lineHeight:'1.5'}}>
                Visit and spend time with the children. They are more willing to be adopted by someone they know and trust.
                Each visit builds a relationship score. Higher score = better adoption chance.
              </p>
              {(char.orphanageRelationship||0)>0&&<p style={{fontSize:'10px',color:T.teal,marginBottom:'6px'}}>Trust built: {char.orphanageRelationship||0}/10</p>}
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                <Btn onClick={()=>{
                  const cha=char.stats?.CHA||1;
                  const gain=1+Math.floor(cha/5);
                  const newRel=Math.min(10,(char.orphanageRelationship||0)+gain);
                  onAction({...char, orphanageRelationship:newRel,
                    log:[...(char.log||[]),{age:char.age,text:`Visited the orphanage. Spent time with the children. (Trust ${newRel}/10)`,type:'good'}]});
                  setResultAuto({text:`You spent time with the children. They warmed to you. Trust now ${newRel}/10.`,bad:false});
                }} colour={T.teal} small>Visit & Talk (free)</Btn>
              </div>
            </Card>
          )}

          {/* Adoption requirements notice */}
          {char.age >= 18 && !spouse && !partner && (
            <Card accent={T.muted} style={{marginBottom:'10px'}}>
              <p style={{fontSize:'11px',color:T.muted,fontWeight:700,marginBottom:'4px'}}>Adoption requirements</p>
              <p style={{fontSize:'10px',color:T.muted,lineHeight:'1.6'}}>
                Age 20+ · Stable housing (rented or owned) with space · 20g fee · The orphanage considers your reputation and CHA.
                Visiting the orphanage first builds trust with the children — they are far more willing to be placed with someone they know.
                A solo parent has a slightly lower base chance.
              </p>
            </Card>
          )}

          {/* Parents */}
          {parents.length>0 && (
            <>
              <SectionHeader>Parents</SectionHeader>
              {parents.map(r=><RelCard key={r.id} rel={r}/>)}
            </>
          )}

          {/* Siblings */}
          {siblings.length>0 && (
            <>
              <SectionHeader>Siblings</SectionHeader>
              {siblings.map(r=><RelCard key={r.id} rel={r}/>)}
            </>
          )}

          {/* Gone */}
          {dead.length>0 && (
            <>
              <SectionHeader>Gone</SectionHeader>
              {dead.map((r,i)=>(
                <div key={`k-${i}`} style={{fontSize:'12px',color:T.muted,padding:'4px 0',display:'flex',gap:'8px'}}>
                  <span>🕯</span><span>{r.name} — {r.reason||'gone'}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── FRIENDS sub-tab ─────────────────────────────────────────────── */}
      {subTab==='friends' && (
        <div style={{padding:'10px 12px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
          <SectionHeader>Friends</SectionHeader>
          {friends.length===0 && (
            <Card style={{padding:'14px'}}>
              <p style={{fontSize:'12px',color:T.muted}}>You have no friends yet. The world is full of strangers.</p>
            </Card>
          )}
          {friends.map(r=><RelCard key={r.id} rel={r}/>)}

          {char.age>=6 && (
            <Btn onClick={tryMakeFriend} disabled={socialiseLeft<=0} colour={T.gold} style={{marginTop:'4px'}}>
              🤝 Try to make a friend ({socialiseLeft} left this season)
            </Btn>
          )}

          {/* Friend scenario modal */}
          {friendModal && (
            <Modal title="An Opportunity">
              <p style={{fontSize:'14px',color:T.text,lineHeight:'1.6',marginBottom:'16px',fontStyle:'italic'}}>{friendModal.text}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {friendModal.choices.map((c,i)=>(
                  <button key={`k-${i}`} onClick={()=>resolveFriendScenario(friendModal,c)} style={{
                    padding:'12px',background:T.panelAlt,border:`1px solid ${T.border}`,
                    borderRadius:'8px',color:T.text,fontSize:'13px',textAlign:'left',cursor:'pointer',lineHeight:'1.5',
                  }}>{c.text}</button>
                ))}
              </div>
            </Modal>
          )}

          {pendingFriend && (
            <Modal onClose={()=>setPendingFriend(null)} title={char.age<8?'A Potential Playmate':char.age<13?'Someone New':'Someone Catches Your Eye'}>
              <div style={{padding:'4px 0 12px'}}>
                <div style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'12px'}}>
                  <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'8px',padding:'8px 12px',minWidth:'80px',textAlign:'center'}}>
                    <div style={{fontSize:'11px',fontWeight:700,color:T.gold}}>{pendingFriend.name}</div>
                    <div style={{fontSize:'9px',color:T.muted}}>Age {pendingFriend.age}</div>
                    <div style={{fontSize:'9px',color:T.muted}}>{pendingFriend.gender?.name||'Unknown'}</div>
                    <div style={{fontSize:'9px',fontWeight:700,color:'#7ecf7e',marginTop:'2px'}}>{(pendingFriend.race?.name||'Human').toUpperCase()}</div>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'11px',color:T.muted,lineHeight:'1.5',fontStyle:'italic',marginBottom:'6px'}}>
                      {char.age<8?`A ${pendingFriend.age}-year-old who seems friendly.`:
                       `${pendingFriend.name} is ${pendingFriend.age}. ${pendingFriend.traits[0][0].toUpperCase()+pendingFriend.traits[0].slice(1)}, and ${pendingFriend.traits[1]}.`}
                    </p>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                      {pendingFriend.traits.map((t,i)=>(
                        <span key={`k-${i}`} style={{fontSize:'8px',background:T.panel,border:`1px solid ${T.border}`,borderRadius:'3px',padding:'1px 5px',color:T.muted}}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <Btn onClick={pendingFriendIntroduce} colour={T.gold}>
                    {char.age<8?'Go play with them':char.age<13?'Introduce yourself':'Say hello'}
                  </Btn>
                  <Btn onClick={()=>setPendingFriend(null)} colour={T.muted} outline>Not interested</Btn>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* ── ROMANCE sub-tab ─────────────────────────────────────────────── */}
      {subTab==='romance' && (
        <div style={{padding:'10px 12px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>

          {/* Current partner/spouse */}
          {spouse && (
            <>
              <SectionHeader>Married</SectionHeader>
              <RelCard rel={spouse}/>
            </>
          )}
          {partner && !spouse && (
            <>
              <SectionHeader>Partner</SectionHeader>
              <RelCard rel={partner}/>
            </>
          )}

          {/* Interests */}
          {living.filter(r=>r.type==='interest').length > 0 && (
            <>
              <SectionHeader>Interests</SectionHeader>
              {living.filter(r=>r.type==='interest').map(rel=>(
                <Card key={rel.id} accent={T.gold} style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                    <div>
                      <span style={{fontWeight:700,color:T.text}}>{rel.name}</span>
                      <span style={{fontSize:'10px',color:T.muted,marginLeft:'8px'}}>Romantic interest · {rel.score}/100</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    <Btn onClick={()=>{
                      const interCount = (char.seasonInteractions||{})[rel.id]||0;
                      const gain = Math.max(1,10-interCount*3);
                      const success = chance(getActionSuccessChance(char,'socialise'));
                      if(!success){ setResultAuto({text:`${rel.name} was not in the mood today.`,bad:false}); return; }
                      onAction({...char,
                        relationships:(char.relationships||[]).map(r=>r.id===rel.id?{...r,score:Math.min(100,r.score+gain)}:r),
                        seasonInteractions:{...(char.seasonInteractions||{}),[rel.id]:(interCount+1)},
                      });
                      setResultAuto({text:`Spent time with ${rel.name}. +${gain}.`,bad:false});
                    }} colour={T.teal} small>Spend time</Btn>
                    {rel.score >= 60 && !partner && !spouse && (
                      <Btn onClick={()=>{
                        onAction({...char,
                          relationships:(char.relationships||[]).map(r=>r.id===rel.id?{...r,type:'partner'}:r),
                          log:[...(char.log||[]),{age:char.age,text:`You and ${rel.name} made it official.`,type:'good'}],
                        });
                        setResultAuto({text:`${rel.name} is now your partner.`,bad:false});
                      }} colour={T.gold} small>Make it official</Btn>
                    )}
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* Propose */}
          {!spouse && (partner || friends.some(r=>r.type==='friend'&&(r.score||0)>=80)) && char.age>=18 && (
            <>
              <SectionHeader>Propose</SectionHeader>
              {[...(partner?[partner]:[]),...friends.filter(r=>r.type==='friend'&&(r.score||0)>=80)].map(rel=>(
                <Card key={rel.id} style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:700,color:T.text}}>{rel.name}</span>
                    <Btn onClick={()=>setProposeTarget(rel)} colour={T.gold} small>💍 Propose</Btn>
                  </div>
                </Card>
              ))}
              {!char.hasRing && (
                <p style={{fontSize:'10px',color:T.muted,fontStyle:'italic',marginTop:'4px'}}>You need a ring. Visit the Jeweller in the market.</p>
              )}
            </>
          )}

          {/* Matchmaker */}
          {!spouse && char.age >= 20 && (
            <Card accent={T.gold} style={{marginBottom:'10px',marginTop:'8px'}}>
              <p style={{fontSize:'12px',color:T.gold,fontWeight:700,marginBottom:'3px'}}>Your parents are asking questions.</p>
              <p style={{fontSize:'11px',color:T.muted,marginBottom:'8px',fontStyle:'italic'}}>Age {char.age} and still unmarried. They know someone.</p>
              <Btn onClick={()=>{
                onAction({...char, pendingMatchmaker:true,
                  log:[...(char.log||[]),{age:char.age,text:'The matchmaker has been given your particulars. You will hear something next year.',type:'neutral'}]});
                setResultAuto({text:'The matchmaker will find someone. A match will be introduced next age-up.',bad:false});
              }} colour={T.gold} outline>Visit the Matchmaker</Btn>
            </Card>
          )}

          {/* Propose confirmation modal */}
          {proposeTarget && (
            <Modal title="A Proposal" onClose={()=>setProposeTarget(null)}>
              <p style={{fontSize:'14px',color:T.text,lineHeight:'1.6',marginBottom:'16px',fontStyle:'italic'}}>
                You have decided to ask {proposeTarget.name}. There is no elegant way to do this.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <Btn onClick={()=>propose(proposeTarget)} colour={T.gold}>Ask them to marry you</Btn>
                <Btn onClick={()=>setProposeTarget(null)} colour={T.muted} outline>Not yet</Btn>
              </div>
            </Modal>
          )}

          {/* Wedding planning modal */}
          {weddingChoices && (
            <Modal title="Plan the Wedding" onClose={()=>setWeddingChoices(null)}>
              <p style={{fontSize:'12px',color:T.muted,marginBottom:'12px',fontStyle:'italic'}}>
                {weddingChoices.rel?.name} said yes. Now plan the ceremony.
              </p>
              {(()=>{
                const menuCost  = {simple:5,modest:20,grand:60}[weddingPlan.menu]||5;
                const venueCost = {hall:10,tavern:20,outdoor:5,manor:80}[weddingPlan.venue]||10;
                const honeyCost = weddingPlan.honeymoon?{local:15,town:30,city:60}[weddingPlan.honeymoon]||0:0;
                const guestCost = {small:0,medium:10,large:25}[weddingPlan.guestSize]||0;
                const total = menuCost+venueCost+honeyCost+guestCost;
                const canAfford = (char.gold||0) >= total;
                return (
                  <div>
                    {[
                      {label:'Menu',key:'menu',options:[{v:'simple',l:'Simple↵5g'},{v:'modest',l:'Modest↵20g'},{v:'grand',l:'Grand↵60g'}]},
                      {label:'Venue',key:'venue',options:[{v:'outdoor',l:'Outdoor↵5g'},{v:'hall',l:'Village Hall↵10g'},{v:'tavern',l:'Tavern↵20g'},{v:'manor',l:'Manor↵80g'}]},
                      {label:'Guests',key:'guestSize',options:[{v:'small',l:'Intimate↵free'},{v:'medium',l:'Medium↵10g'},{v:'large',l:'Large↵25g'}]},
                      {label:'Honeymoon',key:'honeymoon',options:[{v:null,l:'None↵free'},{v:'local',l:'Local↵15g'},{v:'town',l:'Town↵30g'},{v:'city',l:'City↵60g'}]},
                    ].map(row=>(
                      <div key={row.key} style={{marginBottom:'12px'}}>
                        <p style={{fontSize:'11px',color:T.muted,marginBottom:'6px',fontWeight:700}}>{row.label}</p>
                        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                          {row.options.map(opt=>(
                            <button key={opt.v||'none'} onClick={()=>setWeddingPlan(p=>({...p,[row.key]:opt.v}))}
                              style={{padding:'6px 10px',background:weddingPlan[row.key]===opt.v?T.gold+'22':T.panel,
                                border:`1px solid ${weddingPlan[row.key]===opt.v?T.gold:T.border}`,
                                borderRadius:'8px',color:weddingPlan[row.key]===opt.v?T.gold:T.muted,
                                fontSize:'10px',cursor:'pointer',textAlign:'left',WebkitTapHighlightColor:'transparent'}}>
                              {opt.l.split('↵').map((line,i)=><div key={`k-${i}`}>{line}</div>)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{background:T.panel,borderRadius:'8px',padding:'10px',marginBottom:'12px'}}>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span style={{fontSize:'12px',color:T.muted}}>Total cost</span>
                        <span style={{fontSize:'14px',fontWeight:900,color:canAfford?T.gold:T.red}}>{total}g</span>
                      </div>
                      {!canAfford&&<p style={{fontSize:'10px',color:T.red,marginTop:'4px'}}>You need {total-(char.gold||0)}g more.</p>}
                    </div>
                    <Btn onClick={()=>completeWedding(weddingPlan)} colour={T.gold} disabled={!canAfford}>Confirm Wedding ({total}g)</Btn>
                  </div>
                );
              })()}
            </Modal>
          )}

          {/* Adoption modal */}
          {adoptModal && (
            <Modal title="The Orphanage" onClose={()=>setAdoptModal(false)}>
              <p style={{fontSize:'12px',color:T.muted,marginBottom:'12px',fontStyle:'italic',lineHeight:'1.5'}}>
                Three children are brought forward. Each one looks at you differently. The fee is 20g.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {adoptChoices.map((c,i)=>(
                  <div key={`k-${i}`} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'10px',padding:'10px 12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                      <span style={{fontWeight:700,color:T.text,fontSize:'13px'}}>{c.raceObj.emoji} {c.name}</span>
                      <span style={{fontSize:'10px',color:T.muted}}>{c.raceObj.name} · {c.stage.label}</span>
                    </div>
                    <div style={{fontSize:'10px',color:T.muted,marginBottom:'6px'}}>Age {c.stage.age} · {c.subtype} · <span style={{color:T.purple,fontStyle:'italic'}}>{c.trait}</span></div>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'8px'}}>
                      {Object.entries(c.stats).map(([s,v])=>(
                        <span key={s} style={{fontSize:'9px',background:T.panelAlt,borderRadius:'4px',padding:'1px 5px',color:T.muted}}>{s} {v}</span>
                      ))}
                    </div>
                    <Btn onClick={()=>confirmAdopt(c)} colour={T.teal} small>Choose {c.name}</Btn>
                  </div>
                ))}
              </div>
              <Btn onClick={()=>setAdoptModal(false)} colour={T.muted} outline style={{marginTop:'10px',width:'100%'}}>Not today</Btn>
            </Modal>
          )}
        </div>
      )}

      {/* ── SOCIAL sub-tab (Going Out) ────────────────────────────────── */}
      {subTab==='social' && (
        <div style={{padding:'10px 12px',overflowY:'auto',WebkitOverflowScrolling:'touch',flex:1}}>
          <SectionHeader>Going Out</SectionHeader>

          {(char.age||0) < 16 ? (
            <Card accent={T.muted} style={{marginTop:'8px'}}>
              <p style={{fontSize:'13px',color:T.muted,textAlign:'center',padding:'8px 0'}}>🔒 Available from age 16</p>
              <p style={{fontSize:'11px',color:T.muted,textAlign:'center'}}>You are too young to go out on your own.</p>
            </Card>
          ) : (
            <>
              <p style={{fontSize:'12px',color:T.muted,marginBottom:'12px',fontStyle:'italic'}}>Meet people. Make friends. See what happens.</p>

              {goOutResult && (
                <Card accent={goOutResult.bad?T.red:T.green} style={{marginBottom:'10px'}}>
                  <p style={{fontSize:'12px',color:goOutResult.bad?T.red:T.green}}>{goOutResult.text}</p>
                  <Btn onClick={()=>setGoOutResult(null)} colour={T.muted} small full={false} style={{marginTop:'6px'}}>Dismiss</Btn>
                </Card>
              )}

              {metNPC && (
                <Card accent={T.gold} style={{marginBottom:'12px'}}>
                  <p style={{fontSize:'12px',color:T.gold,fontWeight:700,marginBottom:'8px'}}>You met someone</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'12px',fontSize:'12px'}}>
                    <span style={{color:T.muted}}>Name</span><span style={{color:T.text,fontWeight:700}}>{metNPC.npc.name}</span>
                    <span style={{color:T.muted}}>Age</span><span style={{color:T.text}}>{metNPC.npc.age}</span>
                    <span style={{color:T.muted}}>Gender</span><span style={{color:T.text,textTransform:'capitalize'}}>{metNPC.npc.gender}</span>
                    <span style={{color:T.muted}}>Work</span><span style={{color:T.text,textTransform:'capitalize'}}>{metNPC.npc.job}</span>
                    <span style={{color:T.muted}}>Wealth</span><span style={{color:T.text}}>{metNPC.npc.wealth}</span>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <Btn onClick={()=>addAsFriendGO(metNPC.npc)} colour={T.teal} small>Add as Friend</Btn>
                    {metNPC.isRomantic && <Btn onClick={()=>addAsInterestGO(metNPC.npc)} colour={T.gold} small>Show Interest</Btn>}
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
      )}
      {/* Gift modal */}
      {giftModal && (()=>{
        const GIFT_TIERS = [
          { id:'handmade', label:'Handmade',   emoji:'🎨', cost:0,  score:+6,  desc:'Something made with your own hands. Free, but thoughtful.' },
          { id:'basic',    label:'Basic',      emoji:'🎁', cost:5,  score:+10, desc:'A simple gift. They will appreciate the thought.' },
          { id:'affordable',label:'Affordable',emoji:'🛍', cost:15, score:+16, desc:'A proper present. Worth the coin.' },
          { id:'luxury',   label:'Luxury',     emoji:'💎', cost:40, score:+25, desc:'Something they would never buy themselves.' },
        ];
        return (
          <Modal title={`Gift for ${giftModal.name}`} onClose={()=>setGiftModal(null)}>
            <p style={{fontSize:'11px',color:T.muted,marginBottom:'12px',fontStyle:'italic'}}>Choose what to give. You have {char.gold||0}g.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {GIFT_TIERS.map(tier=>{
                const canAfford = (char.gold||0) >= tier.cost;
                return (
                  <button key={tier.id} onClick={()=>{
                    if(!canAfford) return;
                    const updatedRels = (char.relationships||[]).map(r=>
                      r.id===giftModal.id ? {...r, score:Math.min(100,(r.score||50)+tier.score)} : r
                    );
                    onAction({
                      ...char,
                      gold: (char.gold||0)-tier.cost,
                      relationships: updatedRels,
                      yearActions:[...(char.yearActions||[]),`Gave ${giftModal.name} a gift`],
                      log:[...(char.log||[]),{age:char.age,text:`Gave ${giftModal.name} a ${tier.label.toLowerCase()} gift.${tier.cost>0?` Cost ${tier.cost}g.`:''} Relationship +${tier.score}.`,type:'good'}],
                    });
                    setResultAuto({text:`${giftModal.name} appreciated the ${tier.label.toLowerCase()} gift. +${tier.score} relationship.`,bad:false});
                    setGiftModal(null);
                  }} disabled={!canAfford} style={{
                    padding:'10px 12px',background:canAfford?T.panelAlt:'#1a1208',
                    border:`1px solid ${canAfford?T.border:T.border+'44'}`,
                    borderRadius:'8px',textAlign:'left',cursor:canAfford?'pointer':'not-allowed',
                    opacity:canAfford?1:0.4,WebkitTapHighlightColor:'transparent',
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                      <span style={{fontSize:'13px',color:T.text,fontWeight:700}}>{tier.emoji} {tier.label}</span>
                      <span style={{fontSize:'12px',color:tier.cost===0?T.green:T.gold,fontWeight:700}}>{tier.cost===0?'Free':`${tier.cost}g`}</span>
                    </div>
                    <div style={{fontSize:'10px',color:T.muted,marginBottom:'2px'}}>{tier.desc}</div>
                    <div style={{fontSize:'10px',color:T.green}}>Relationship +{tier.score}</div>
                  </button>
                );
              })}
            </div>
            <button onClick={()=>setGiftModal(null)} style={{marginTop:'10px',width:'100%',padding:'8px',background:'transparent',border:`1px solid ${T.border}`,borderRadius:'6px',color:T.muted,fontSize:'11px',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>Cancel</button>
          </Modal>
        );
      })()}
    </div>
  );
}
