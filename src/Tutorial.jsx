import { useState } from 'react';
import { T, WORLD } from './gameData.js';
import { Btn } from './components/UI.jsx';

const TUTORIAL_STEPS = [
  {
    title:'Welcome to Fate Weaver',
    emoji:'✦',
    text:`You live in ${WORLD.kingdom}. A world where the old gods sleep, magic is fading, and ordinary lives carry weight. A year has four seasons. Each season you can work, train, worship, socialise — a fixed number of times. Age Up to advance a full year.`,
  },
  {
    title:'This is a Dark World',
    emoji:'🌑',
    text:'People die. Relationships break. Bad things happen to good characters. This is not a game you complete — it is a life you live. Some lives are short. Some are ordinary. Occasionally one is extraordinary.',
  },
  {
    title:'Seasons and Actions',
    emoji:'🌿',
    text:'Each season you can act a set number of times — 4 work shifts, 2 training sessions, 4 worship visits, 2 outings. Quests take days. When you Age Up, a full year passes and your action counts reset.',
  },
  {
    title:'The Tabs',
    emoji:'◈',
    text:'Your life is organised into tabs on the left. Work to earn gold. Health to treat illness. Relationships to build a family. Skills to grow. Property to own something real. The Guild for adventure. Going Out to meet people. They unlock as you age.',
  },
  {
    title:'Your Class is Hidden',
    emoji:'🌑',
    text:'You do not choose your class. It emerges from the choices you make — the work you do, the crises you face, the paths you follow. A fighter, a merchant, a farmer, a mage. It will reveal itself in time.',
  },
  {
    title:'Gender and Relationships',
    emoji:'💍',
    text:'You choose your gender at creation. At sixteen you will be asked about your sexuality. From there you can go out, meet people, fall in love, and eventually marry. Same-gender couples can adopt. You will need a ring before you can propose.',
  },
  {
    title:'Property and Money',
    emoji:'🏠',
    text:'Around eighteen you will need to find your own place. Rent a room, take a mortgage, or at minimum buy a tent — sleeping rough will make you sick. Gold comes from work. Property generates income but costs maintenance.',
  },
  {
    title:'Age Up',
    emoji:'⧖',
    text:'When you are ready, press Age Up. Events will happen, relationships will change, the world will move. You cannot undo it. That is the point.',
  },
  {
    title:'You Will Die',
    emoji:'🕯',
    text:'Every character eventually dies — of old age, illness, or misadventure. But your legacy continues. Your child can inherit your story, your gold, and sometimes your property. The dynasty carries on.',
  },
  { title:'Jobs & Proficiency', emoji:'⚒',
    text:'Every job you work builds proficiency. At level 3 a career path may emerge — no apprenticeship needed. Just time and dedication. Better proficiency means better pay.' },
  { title:'Faith & Devotion', emoji:'✦',
    text:'The gods of Aldenmere are real and listening. Pray for free. Visit temples to deepen your faith. At devotion level 3 a blessing becomes active — and something greater may call to you.' },
  { title:'Relationships', emoji:'🤝',
    text:'People drift away if you neglect them. Tend relationships like a garden. Betrayals leave lasting marks. Watch the health indicator on each card — green is close, red is critical.' },
  { title:'Adventurite ✦', emoji:'💎',
    text:'Across all your lives you earn Adventurite gems. Complete daily tasks and achievements. Spend gems on buffs that carry into every future character — up to 3 equipped at once.' },
];
export default function Tutorial({ onDone }){
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div style={{
      position:'fixed',inset:0,background:'#000000cc',zIndex:200,
      display:'flex',alignItems:'flex-end',justifyContent:'center',
    }}>
      <div style={{
        background:T.panel,border:`1px solid ${T.border}`,
        borderRadius:'18px 18px 0 0',width:'100%',maxWidth:'480px',
        padding:'24px 20px 32px',
        maxHeight:'85vh',overflowY:'auto',WebkitOverflowScrolling:'touch',
      }}>
        {/* Progress dots */}
        <div style={{display:'flex',gap:'5px',justifyContent:'center',marginBottom:'20px',flexWrap:'wrap'}}>
          {TUTORIAL_STEPS.map((_,i)=>(
            <div key={i} style={{
              width: i===step?20:6, height:6,
              borderRadius:'3px',
              background:i<=step?T.gold:T.border,
              transition:'all 0.3s',
            }}/>
          ))}
        </div>

        <div style={{textAlign:'center',marginBottom:'20px'}}>
          <div style={{fontSize:'44px',marginBottom:'12px'}}>{current.emoji}</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:T.gold,marginBottom:'12px'}}>{current.title}</h2>
          <p style={{fontSize:'14px',color:T.text,lineHeight:'1.7',fontStyle:'italic'}}>{current.text}</p>
        </div>

        <div style={{display:'flex',gap:'10px'}}>
          {step > 0 && (
            <Btn onClick={()=>setStep(s=>s-1)} colour={T.muted} outline style={{flex:1}}>← Back</Btn>
          )}
          <Btn onClick={isLast ? onDone : ()=>setStep(s=>s+1)} colour={T.gold} style={{flex:2}}>
            {isLast ? 'Begin your life →' : 'Next →'}
          </Btn>
        </div>

        <button onClick={onDone} style={{
          display:'block',width:'100%',marginTop:'12px',
          background:'transparent',border:'none',color:T.muted,
          fontSize:'12px',cursor:'pointer',padding:'4px',
        }}>Skip tutorial</button>
      </div>
    </div>
  );
}
