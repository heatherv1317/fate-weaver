import { useState, useEffect } from 'react';
import { Card, Btn, T } from './components/UI.jsx';
import { saveChar } from './gameData.js';

// ── OPENING EVENTS ────────────────────────────────────────────────────────────
// Grouped by life stage. pickOpeningSequence selects a short sequence of
// age-appropriate memories shown as the character's earliest recollections.
// Choices apply affinity nudges. Age here is the age of the MEMORY, not the
// character's current age (all chars start at 0 and relive these).

const OPENING_EVENTS = [

  // ── INFANCY (0–1) — preverbal, instinctual ───────────────────────────────
  {
    id:'hungry_infant', type:'crisis', stage:'infant',
    title:'Hunger',
    text:'You are small. Smaller than you will ever be again. Something is wrong and you do not have words for it yet. You only know it needs fixing.',
    choices:[
      { text:'Cry. Loudly and persistently until something changes.',
        outcome:'It worked. It always works. You learned that making noise is how things get done.',
        stat:'CHA', affinity:{ bard:1, barbarian:1 } },
      { text:'Try to reach the thing you need yourself.',
        outcome:'Your arms are useless. But you tried. Something in you has always tried first.',
        stat:'STR', affinity:{ fighter:1, ranger:1 } },
      { text:'Wait. Watch the light on the ceiling. Something will come.',
        outcome:'Someone came. They always came. You learned early that patience is its own kind of power.',
        stat:'WIS', affinity:{ cleric:1, druid:1 } },
    ]
  },
  {
    id:'falling_asleep', type:'quiet', stage:'infant',
    title:'The Dark',
    text:'The room goes quiet and dim. Everyone else seems to find this easy. You are not sure about it yet.',
    choices:[
      { text:'Fight it. There might be something happening while you are not watching.',
        outcome:'You stayed awake as long as you could. You were always like that.',
        stat:'CON', affinity:{ fighter:1, rogue:1 } },
      { text:'Make noise until someone comes to sit with you.',
        outcome:'They came. You settled. You learned early that you do not have to do hard things alone.',
        stat:'CHA', affinity:{ bard:1, paladin:1 } },
      { text:'Surrender to it. It is warm and soft and safe enough.',
        outcome:'You slept. Long and deep. Some things do not need to be fought.',
        stat:'WIS', affinity:{ druid:1, cleric:1 } },
    ]
  },
  {
    id:'crib_problem', type:'crisis', stage:'infant',
    title:'Confined',
    text:'The bars of the crib are in the way. Something interesting is on the other side of them.',
    choices:[
      { text:'Bang on the bars until someone removes you from the situation.',
        outcome:'It worked. Loud persistence is a legitimate strategy and you learned it young.',
        stat:'STR', affinity:{ barbarian:1, fighter:1 } },
      { text:'Study the bars carefully. There has to be a way.',
        outcome:'You spent a long time on this problem. Eventually you found it.',
        stat:'INT', affinity:{ mage:1, rogue:1 } },
      { text:'Reach through the bars toward the interesting thing.',
        outcome:'You could almost touch it. Almost was not nothing.',
        stat:'DEX', affinity:{ ranger:1, rogue:1 } },
    ]
  },

  // ── TODDLER (1–3) — mobile, wilful, discovering ──────────────────────────
  {
    id:'first_fall', type:'crisis', stage:'toddler',
    title:'The Floor',
    text:'You fell. Not for the first time. The floor came up very fast and now you are on it.',
    choices:[
      { text:'Cry. This is objectively terrible and people should know.',
        outcome:'Someone came and it was better. You learned that expressing distress gets results.',
        stat:'CHA', affinity:{ bard:1, cleric:1 } },
      { text:'Get straight back up and try again without stopping.',
        outcome:'Nothing was broken. You got up. That became a habit.',
        stat:'CON', affinity:{ fighter:2, paladin:1 } },
      { text:'Look around to see if anyone saw before deciding how to react.',
        outcome:'No one was watching. So you just got up and got on with it.',
        stat:'WIS', affinity:{ rogue:2 } },
    ]
  },
  {
    id:'forbidden_thing', type:'crisis', stage:'toddler',
    title:'The Thing You Were Told Not to Touch',
    text:'It is right there. They said not to. But they are not here right now and it is very interesting.',
    choices:[
      { text:'Touch it. Obviously.',
        outcome:'It was interesting and also you knocked it over. Worth it.',
        stat:'INT', affinity:{ mage:1, rogue:2 } },
      { text:'Sit and look at it for a very long time without touching.',
        outcome:'You wanted to touch it. You did not. Something about that stayed with you.',
        stat:'WIS', affinity:{ paladin:1, cleric:1 } },
      { text:'Bring someone else to come and look at it with you.',
        outcome:'You found a way to be near the interesting thing without being in trouble. Resourceful.',
        stat:'CHA', affinity:{ bard:2, merchant:1 } },
    ]
  },
  {
    id:'sharing', type:'quiet', stage:'toddler',
    title:'Mine',
    text:'Another child wants the thing you have. They are looking at it. You are not sure how you feel about this.',
    choices:[
      { text:'No. This is yours and that is the end of it.',
        outcome:'You held it. They cried. You felt something complicated about that.',
        stat:'STR', affinity:{ barbarian:1, fighter:1 } },
      { text:'Give it to them. You can always get another one.',
        outcome:'They looked surprised. Then pleased. That felt unexpectedly good.',
        stat:'CHA', affinity:{ paladin:1, bard:1 } },
      { text:'Hand it over and immediately want it back.',
        outcome:'They had it for a moment. You took it back. Both of you seemed fine with this.',
        stat:'WIS', affinity:{ merchant:1, rogue:1 } },
    ]
  },
  {
    id:'new_food', type:'quiet', stage:'toddler',
    title:'Unknown Food',
    text:'They have put something in front of you that you have never seen before. Everyone is watching to see what you do.',
    choices:[
      { text:'Eat it immediately without hesitation.',
        outcome:'It was fine. You have always been willing to try things.',
        stat:'CON', affinity:{ barbarian:1, farmer:1 } },
      { text:'Smell it first, touch it, consider, then decide.',
        outcome:'You decided yes. Good call. You learned to assess before committing.',
        stat:'WIS', affinity:{ druid:1, chef:1 } },
      { text:'Look at the person who gave it to you until they eat some first.',
        outcome:'A reasonable precaution. They ate it. You ate it. Trust, but verify.',
        stat:'INT', affinity:{ rogue:1, merchant:1 } },
    ]
  },

  // ── EARLY CHILDHOOD (3–6) — social, curious, forming ────────────────────
  {
    id:'lost_in_market', type:'crisis', stage:'early_child',
    title:'Lost',
    text:'The market is enormous when you are small. One moment your parent was beside you. Now there are only legs and noise and the smell of fish.',
    choices:[
      { text:'Stay still and call out. Someone will hear.',
        outcome:'A baker found you crying by the bread stall. Your parent was not far. You felt foolish and relieved in equal measure.',
        stat:'WIS', affinity:{ cleric:1, paladin:1 } },
      { text:'Climb something high to get your bearings.',
        outcome:'A barrel. Then a cart. You spotted the red hat your parent always wore from ten feet up. Problem solved.',
        stat:'DEX', affinity:{ ranger:1, rogue:1 }, brave:true },
      { text:'Follow a dog. Dogs always go somewhere useful.',
        outcome:"The dog went to a butcher's rubbish pile. But the butcher knew your family and walked you home.",
        stat:'CHA', affinity:{ bard:1, druid:1 } },
    ]
  },
  {
    id:'broken_thing', type:'crisis', stage:'early_child',
    title:'Something Broke',
    text:'You knocked something over. Something that mattered. It is on the floor in pieces and your parent is about to come through that door.',
    choices:[
      { text:'Tell the truth immediately before they see it.',
        outcome:'They were upset. But less upset than they would have been. You learned that early confession has its own reward.',
        stat:'CHA', affinity:{ paladin:1, cleric:1 } },
      { text:'Try to fix it before they notice.',
        outcome:'You could not fix it. But the attempt was noticed anyway. They were oddly less angry than expected.',
        stat:'INT', affinity:{ mage:1, carpenter:1 }, brave:true },
      { text:'Hide behind your own confusion and wait.',
        outcome:'You said nothing. They found it. You said nothing still. It passed eventually. These things do.',
        stat:'WIS', affinity:{ rogue:1, druid:1 } },
    ]
  },
  {
    id:'stray_animal', type:'quiet', stage:'early_child',
    title:'The Animal',
    text:'A stray dog has been sleeping outside your door for three mornings. It watches you with cautious eyes. It has not eaten in a while.',
    choices:[
      { text:'Bring it scraps every day until it trusts you.',
        outcome:'By the second week it followed you everywhere. You named it something embarrassing that you still remember.',
        stat:'WIS', affinity:{ druid:2, ranger:1 } },
      { text:'Ask your parent if you can keep it.',
        outcome:'They said no. The dog stayed anyway. No one mentioned it again.',
        stat:'CHA', affinity:{ bard:1, paladin:1 } },
      { text:'Leave it alone — wild things should stay wild.',
        outcome:'It moved on after a week. You watched it go from the window.',
        stat:'WIS', affinity:{ ranger:1, druid:1 } },
    ]
  },
  {
    id:'bully_small', type:'crisis', stage:'early_child',
    title:'The Bigger Child',
    text:'An older child has decided they do not like you. They have been taking your things and making sure you know they can.',
    choices:[
      { text:'Tell a grown-up.',
        outcome:'The grown-up sorted it out. Not glamorous, but it worked. You learned when to ask for help.',
        stat:'CHA', affinity:{ paladin:1, cleric:1 } },
      { text:'Stand in front of your things and refuse to move.',
        outcome:'They pushed you over. You got up. They eventually got bored.',
        stat:'CON', affinity:{ fighter:2, paladin:1 }, brave:true },
      { text:'Find something they want and offer a trade.',
        outcome:'You worked out a deal. You were five. It impressed even you.',
        stat:'INT', affinity:{ merchant:1, rogue:1 } },
    ]
  },
  {
    id:'rainy_day', type:'quiet', stage:'early_child',
    title:'A Rainy Afternoon',
    text:'Too wet to go outside. The house is quiet. No one is asking anything of you.',
    choices:[
      { text:'Find a book or make up a story.',
        outcome:'You told the story to no one in particular. It went somewhere unexpected. You remembered it for years.',
        stat:'INT', affinity:{ mage:1, bard:1 } },
      { text:'Disassemble something to see how it works.',
        outcome:'You could not put it back together. But you understood it. Mostly.',
        stat:'INT', affinity:{ mage:1, carpenter:1 } },
      { text:'Sit by the window and watch the rain.',
        outcome:'Nothing happened. That was fine. Not every hour needs to mean something.',
        stat:'WIS', affinity:{ druid:1, farmer:1 } },
    ]
  },

  // ── LATER CHILDHOOD (6–12) — independent, moral, social ─────────────────
  {
    id:'dare', type:'crisis', stage:'child',
    title:'The Dare',
    text:'The older kids say the abandoned mill is haunted. They dare you to go inside alone. Everyone is watching.',
    choices:[
      { text:'Go in. You are not scared.',
        outcome:'It was dark and it smelled of rot and something moved in the corner. You walked out slowly and did not run. That was the important part.',
        stat:'CON', affinity:{ fighter:2, barbarian:1 }, brave:true },
      { text:'Go to the door, look in, and come back. Close enough.',
        outcome:'You saw nothing. You reported nothing. Everyone accepted it. Technically you did what was asked.',
        stat:'DEX', affinity:{ rogue:2 } },
      { text:'Say it is a stupid dare and walk away.',
        outcome:'They called after you. You kept walking. Being called a coward by idiots is not the same as being one.',
        stat:'WIS', affinity:{ paladin:1, cleric:1 } },
    ]
  },
  {
    id:'fight_at_school', type:'crisis', stage:'child',
    title:'The Fight',
    text:'A bigger child pushes you into the mud in front of everyone. They are laughing. You are covered in it.',
    choices:[
      { text:'Get up and push back. Whatever happens next.',
        outcome:'It hurt. You got a bloody nose. But they never did it again.',
        stat:'STR', affinity:{ fighter:2, barbarian:1 }, brave:true },
      { text:'Get up and say something that makes everyone laugh at them instead.',
        outcome:'You found the right words from somewhere. The laughter shifted. They hated you for it but left you alone.',
        stat:'CHA', affinity:{ bard:2, rogue:1 } },
      { text:'Get up. Say nothing. Walk away.',
        outcome:'You remembered their face. That was enough for now.',
        stat:'WIS', affinity:{ rogue:1, ranger:1 } },
    ]
  },
  {
    id:'stolen_food', type:'crisis', stage:'child',
    title:'The Hungry Child',
    text:"You caught another child stealing from your family's kitchen. They are younger than you. They do not run. They just look at you.",
    choices:[
      { text:'Let them take it and say nothing.',
        outcome:'You said nothing. They came back the next day. You left something out for them deliberately.',
        stat:'WIS', affinity:{ cleric:2, druid:1 } },
      { text:'Tell your parent — it is not your food to give.',
        outcome:'Your parent was kinder about it than you expected. They gave the child a proper meal. You felt complicated about that.',
        stat:'CHA', affinity:{ paladin:1, farmer:1 } },
      { text:'Ask them why they are hungry.',
        outcome:'They told you. It was a simple and terrible reason. You gave them the food yourself and kept the conversation secret.',
        stat:'CHA', affinity:{ bard:1, cleric:2 } },
    ]
  },
  {
    id:'river_accident', type:'crisis', stage:'child',
    title:'The River',
    text:'You and a friend were crossing the stepping stones when they slipped. The current is faster than it looks. You are the only one there.',
    choices:[
      { text:'Jump in after them immediately.',
        outcome:'The water was cold and strong. You got them to the bank. You were both shaking on the grass for a long time after.',
        stat:'STR', affinity:{ fighter:1, paladin:2 }, brave:true },
      { text:'Reach out with a branch from the bank.',
        outcome:'It just barely reached. They grabbed it. Smart. Everyone got out dry.',
        stat:'INT', affinity:{ ranger:2, mage:1 } },
      { text:'Shout for help as loud as you can.',
        outcome:'An adult came running. They got your friend out. You still wonder if you should have moved faster.',
        stat:'CHA', affinity:{ cleric:1, bard:1 } },
    ]
  },
  {
    id:'sick_parent', type:'crisis', stage:'child',
    title:'Your Parent is Ill',
    text:'Three days now. They say it is nothing. But they are not getting up and you have been managing the house alone. The food will run out in two days.',
    choices:[
      { text:'Go to a neighbour and ask for help, even though it is embarrassing.',
        outcome:'Old Maren came over with soup and stayed two days. Your parent recovered. Asking for help was the right call.',
        stat:'CHA', affinity:{ cleric:1, bard:1 } },
      { text:'Go into the forest and gather what herbs you can find.',
        outcome:'You were not certain what you were looking for. But something you brought back seemed to help. Or maybe they recovered anyway.',
        stat:'WIS', affinity:{ druid:2, ranger:1 }, brave:true },
      { text:'Ration what you have and wait it out.',
        outcome:'It was a long three more days. They recovered. You never told them how close the stores had got.',
        stat:'CON', affinity:{ fighter:1, farmer:1 } },
    ]
  },
  {
    id:'night_sounds', type:'crisis', stage:'child',
    title:'Something Outside',
    text:'You woke to sounds in the yard. Your parent is away overnight for the first time. Whatever is out there is big enough to make the chickens panic.',
    choices:[
      { text:'Take the fire poker and go look.',
        outcome:'A fox had got into the coop. You drove it off. Three chickens were already gone. You did not sleep again that night.',
        stat:'STR', affinity:{ fighter:1, ranger:1 }, brave:true },
      { text:'Bar the door and wait for morning.',
        outcome:'More noise. Then silence. In the morning half the chickens were gone. You never told your parent you heard it happen.',
        stat:'WIS', affinity:{ rogue:1, farmer:1 } },
      { text:'Shout from the window to scare it off.',
        outcome:'The noise stopped. Either it worked or it was already finished. You chose to believe it worked.',
        stat:'CHA', affinity:{ bard:1, ranger:1 } },
    ]
  },
  {
    id:'discovered_secret', type:'crisis', stage:'child',
    title:'What You Found',
    text:'You were not meant to find it. But you did — letters hidden under the floorboard, or a locked box your parent left open by mistake, or a name spoken at night that means something terrible.',
    choices:[
      { text:'Confront your parent directly. You need to know.',
        outcome:'They told you some of it. Not all. Enough that the world felt different after. You were not sorry you asked.',
        stat:'CHA', affinity:{ paladin:1, fighter:1 }, brave:true },
      { text:'Say nothing but watch more carefully from now on.',
        outcome:'You learned to notice things. Small things. You were quieter after that, and smarter.',
        stat:'WIS', affinity:{ rogue:2, ranger:1 } },
      { text:'Put it back and try to forget.',
        outcome:'You could not forget. But you decided it was not yours to carry yet. Patience is its own kind of strength.',
        stat:'WIS', affinity:{ cleric:1, druid:1 } },
    ]
  },
  {
    id:'accused', type:'crisis', stage:'child',
    title:'Accused',
    text:"Something was stolen from the merchant's stall. Three people say they saw you near it. You did not take it. But no one is listening.",
    choices:[
      { text:'Stand your ground and keep saying it clearly until someone believes you.',
        outcome:'Eventually one adult asked the right question and the real thief was found. It took too long. But you did not break.',
        stat:'CON', affinity:{ paladin:2, fighter:1 }, brave:true },
      { text:'Figure out who actually did it and make them confess.',
        outcome:'You found the evidence yourself. Presented it. People were surprised you had looked. You were not.',
        stat:'INT', affinity:{ rogue:2, mage:1 } },
      { text:'Accept the accusation quietly to end it faster.',
        outcome:'It ended. Your parent paid what was demanded. You said nothing. You never forgot the faces of the people who believed the lie.',
        stat:'WIS', affinity:{ cleric:1, merchant:1 } },
    ]
  },
  {
    id:'market_day', type:'quiet', stage:'child',
    title:'Market Day',
    text:'A warm afternoon. The market is full of noise and colour. You have a little time to yourself.',
    choices:[
      { text:'Watch the performers — musicians, jugglers, a fire-eater.',
        outcome:'You stayed until they chased you away. Something about the crowd and the performance settled into you like a seed.',
        stat:'CHA', affinity:{ bard:2, merchant:1 } },
      { text:'Follow the alchemist around and ask questions until you get thrown out.',
        outcome:'You left with three facts, a headache, and a deep curiosity you could not quite name.',
        stat:'INT', affinity:{ mage:2 } },
      { text:'Slip to the edge of the crowd and watch the horizon.',
        outcome:'You liked the space more than the noise. That told you something.',
        stat:'WIS', affinity:{ ranger:1, druid:1 } },
    ]
  },
  {
    id:'old_soldier', type:'quiet', stage:'child',
    title:'The Veteran',
    text:'An old soldier sits outside the inn every evening sharpening a blade he never uses. One evening he speaks to you first.',
    choices:[
      { text:'Ask him what it was actually like.',
        outcome:'He told you one story. Just one. It stayed with you longer than any nightmare.',
        stat:'WIS', affinity:{ fighter:1, paladin:1 } },
      { text:'Ask him to teach you something.',
        outcome:'He showed you how to fall without breaking. Said it was the most useful thing he knew.',
        stat:'DEX', affinity:{ fighter:2, rogue:1 } },
      { text:'Mostly just sit with him.',
        outcome:'You did not say much. Neither did he. It was one of the better evenings of that year.',
        stat:'CON', affinity:{ paladin:1, carpenter:1 } },
    ]
  },
];

// Stage order — memories flow from birth forward
const STAGE_ORDER = ['infant','toddler','early_child','child'];

function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

function pickOpeningSequence(){
  // One memory per year, ages 1–5 only.
  // Age 1 → infant, Age 2 → toddler, Age 3 → toddler/early_child,
  // Age 4 → early_child, Age 5 → early_child
  const byStage = {};
  for(const stage of STAGE_ORDER) byStage[stage] = [];
  for(const e of OPENING_EVENTS) byStage[e.stage]?.push(e);

  const picked = [];
  const one = (pool) => shuffle(pool).slice(0,1);

  picked.push(...one(byStage.infant));                                     // age 1
  picked.push(...one(byStage.toddler));                                    // age 2
  picked.push(...one([...byStage.toddler, ...byStage.early_child]));       // age 3
  picked.push(...one(byStage.early_child));                                // age 4
  picked.push(...one(byStage.early_child.filter(e=>e.type==='crisis')));   // age 5

  // Deduplicate (in case a pool was thin and same event appeared twice)
  const seen = new Set();
  return picked.filter(e=>{ if(seen.has(e.id)) return false; seen.add(e.id); return true; });
}

// Stage display labels
const STAGE_LABEL = {
  infant:      '🍼 Age 1',
  toddler:     '🐣 Age 2–3',
  early_child: '🌱 Age 3–5',
  child:       '🌿 Age 6–12',
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function OpeningSequence({ char, onComplete }){
  const [phase, setPhase]             = useState('intro');
  const [events]                      = useState(()=>pickOpeningSequence());
  const [eventIndex, setEventIndex]   = useState(0);
  const [updatedChar, setUpdatedChar] = useState(char);
  const [fade, setFade]               = useState(true);
  const [chosenOutcome, setChosenOutcome] = useState(null);

  function transition(fn){
    setFade(false);
    setTimeout(()=>{ fn(); setFade(true); }, 250);
  }

  function handleChoice(event, choice){
    setChosenOutcome(choice.outcome);
    let c = { ...updatedChar, affinities:{ ...(updatedChar.affinities||{}) } };
    if(choice.stat) c.stats = { ...c.stats, [choice.stat]: Math.min(20,(c.stats[choice.stat]||1)+1) };
    if(choice.affinity) Object.entries(choice.affinity).forEach(([k,v])=>{ c.affinities[k]=(c.affinities[k]||0)+v; });
    // Log at an age that matches the memory stage rather than always age 0
    const stageAge = { infant:0, toddler:2, early_child:5, child:9 };
    const memAge = stageAge[event.stage] ?? 0;
    c.log = [...(c.log||[]), { age:memAge, text:choice.outcome, type:choice.brave?'good':'neutral' }];
    setUpdatedChar(c);
    setTimeout(()=>{
      transition(()=>{
        setChosenOutcome(null);
        if(eventIndex < events.length-1){
          setEventIndex(i=>i+1);
        } else {
          setPhase('done');
        }
      });
    }, 1800);
  }

  useEffect(()=>{
    if(phase==='done'){
      // The five opening memories ARE the character living through ages 1-5.
      // Advance to age 6 so the game proper begins after childhood, not back at 0.
      const aged = { ...updatedChar, age: Math.max(updatedChar.age||0, 6) };
      saveChar(aged).then(()=>onComplete(aged));
    }
  },[phase]);

  const currentEvent = events[eventIndex];
  const stageLabel = currentEvent ? STAGE_LABEL[currentEvent.stage] : '';

  return (
    <div style={{
      minHeight:'100vh', background:T.bg,
      display:'flex', flexDirection:'column',
      opacity: fade ? 1 : 0, transition:'opacity 0.25s',
    }}>
      <div style={{background:'#0a0800',padding:'14px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,color:T.gold,letterSpacing:'3px'}}>FATE WEAVER</span>
        <span style={{fontSize:'11px',color:T.muted}}>
          {phase==='events' ? `Memory ${eventIndex+1} of ${events.length}` : ''}
        </span>
      </div>

      <div style={{padding:'16px',paddingBottom:'calc(16px + env(safe-area-inset-bottom, 0px))',flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>

        {/* INTRO */}
        {phase==='intro' && (
          <div style={{textAlign:'center',paddingTop:'40px'}}>
            <div style={{fontSize:'40px',marginBottom:'16px'}}>✦</div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'22px',color:T.gold,marginBottom:'12px'}}>{char.name}</h2>
            <p style={{fontSize:'14px',color:T.muted,marginBottom:'6px'}}>{char.race?.name}</p>
            <p style={{fontSize:'13px',color:T.muted,lineHeight:'1.7',maxWidth:'320px',margin:'16px auto',fontStyle:'italic'}}>
              Every life begins the same way — helpless, hungry, uncertain.
            </p>
            <p style={{fontSize:'12px',color:T.muted,lineHeight:'1.6',maxWidth:'300px',margin:'0 auto 24px',fontStyle:'italic'}}>
              Five memories. One for each year before the world got complicated.
            </p>
            <Btn onClick={()=>transition(()=>setPhase(events.length > 0 ? 'events' : 'done'))} colour={T.gold} style={{maxWidth:'240px',margin:'0 auto'}}>
              Begin →
            </Btn>
          </div>
        )}

        {/* EVENTS */}
        {phase==='events' && currentEvent && (
          <div>
            <div style={{marginBottom:'16px'}}>
              {/* Stage label */}
              <div style={{fontSize:'11px',color:T.muted,marginBottom:'8px',letterSpacing:'0.5px'}}>
                {stageLabel}
              </div>
              {/* Type badge */}
              <div style={{display:'inline-block',padding:'3px 10px',
                background:currentEvent.type==='crisis'?T.red+'22':T.gold+'22',
                border:`1px solid ${currentEvent.type==='crisis'?T.red:T.gold}55`,
                borderRadius:'20px',fontSize:'10px',fontWeight:700,
                color:currentEvent.type==='crisis'?T.red:T.gold,
                letterSpacing:'1px',textTransform:'uppercase',marginBottom:'10px'}}>
                {currentEvent.type==='crisis'?'⚠ Crisis':'✦ A Moment'}
              </div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:T.gold,marginBottom:'10px'}}>{currentEvent.title}</h2>
              <p style={{fontSize:'15px',color:T.text,lineHeight:'1.7',fontStyle:'italic',marginBottom:'20px'}}>{currentEvent.text}</p>
            </div>

            {chosenOutcome ? (
              <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'16px',fontSize:'14px',color:T.text,lineHeight:'1.7',fontStyle:'italic'}}>
                {chosenOutcome}
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {currentEvent.choices.map((choice,i)=>(
                  <button key={i} onClick={()=>handleChoice(currentEvent,choice)} style={{
                    padding:'16px',background:T.panel,
                    border:`1px solid ${T.border}`,borderRadius:'12px',
                    color:T.text,fontSize:'14px',textAlign:'left',
                    cursor:'pointer',lineHeight:'1.6',
                    WebkitTapHighlightColor:'transparent',
                  }}>{choice.text}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
