import { useState } from 'react';
import { Card, Btn, Tag, SectionHeader } from '../components/UI.jsx';
import {
  T, LOCATIONS, getShopDef, getShopPrice, getProducePrice, getProduceRawNeed,
  getStaffWage, getStaffAttempts, RAW_UNIT_COST, getCurrentSeason,
  generateHireCandidates, canProduceRarity, STAFF_POSITIONS, getUnlockedTabs, uid,
} from '../gameData.js';

const RARITY_COLOUR = { common:T.muted, uncommon:T.green, rare:T.blue, legendary:T.gold };
// 2nd-shop gate (matches locked design): ≥800g held AND ≥1 staff at skill ≥3.
const SECOND_SHOP_CAPITAL = 800;
const SECOND_SHOP_SKILL    = 3;

function rarityLabel(r){ return (r||'common').charAt(0).toUpperCase()+(r||'common').slice(1); }

export default function BusinessTab({ char, onAction }){
  const [result, setResult] = useState(null);
  const [buyMatFor, setBuyMatFor] = useState(null);   // business id awaiting a material qty pick
  const [hiringFor, setHiringFor] = useState(null);   // business id showing the candidate pool

  const businesses = char.businesses || [];
  const loc = char.location || 'village';

  // ── Per-season hire pool, stable within a season, refreshed on season change ──
  const season = getCurrentSeason(char);
  const poolKey = `${char.age}-${char.currentSeasonStep||0}`;
  const pool = (char.hirePoolKey === poolKey && Array.isArray(char.hirePool))
    ? char.hirePool
    : generateHireCandidates(season, loc, 3);

  // Persist a freshly-rolled pool so it doesn't reshuffle on re-render.
  function ensurePool(){
    if(char.hirePoolKey !== poolKey){
      onAction({ ...char, hirePool:pool, hirePoolKey:poolKey });
    }
  }

  function updateBiz(bizId, mut){
    const next = businesses.map(b => b.id===bizId ? mut({...b, staff:(b.staff||[]).map(s=>({...s}))}) : b);
    onAction({ ...char, businesses:next });
  }

  // ── Buy raw materials ────────────────────────────────────────────────────────
  function buyMaterials(biz, units){
    const cost = units * RAW_UNIT_COST;
    if((char.gold||0) < cost){ setResult({text:`Not enough gold — ${units} units cost ${cost}g.`,bad:true}); return; }
    const next = businesses.map(b => b.id===biz.id ? {...b, rawStock:(b.rawStock||0)+units} : b);
    onAction({ ...char, gold:char.gold-cost, businesses:next });
    setResult({text:`Bought ${units} units of raw materials for ${cost}g.`,bad:false});
    setBuyMatFor(null);
  }

  // ── Set produce item ─────────────────────────────────────────────────────────
  function setProduce(biz, itemId){
    updateBiz(biz.id, b => ({...b, produceId:itemId}));
    setResult({text:`${biz.name} will now produce that item each season.`,bad:false});
  }

  // ── Hire / fire staff ────────────────────────────────────────────────────────
  function hire(biz, candidate){
    const next = businesses.map(b => b.id===biz.id
      ? {...b, staff:[...(b.staff||[]), {...candidate, seasonsWorked:0, position:'Apprentice'}]}
      : b);
    // Remove the hired candidate from the season pool.
    const remaining = pool.filter(c => c.id!==candidate.id);
    onAction({ ...char, businesses:next, hirePool:remaining, hirePoolKey:poolKey });
    setResult({text:`${candidate.name} joined ${biz.name}.`,bad:false});
    setHiringFor(null);
  }
  function fire(biz, staffId){
    updateBiz(biz.id, b => ({...b, staff:(b.staff||[]).filter(s=>s.id!==staffId)}));
    setResult({text:`You let them go.`,bad:false});
  }

  // ── Buy another shop (gated) ─────────────────────────────────────────────────
  const masteredAvailable = (char.masteredTrades||[]).filter(t =>
    getShopDef(t) && !businesses.some(b=>b.trade===t));
  const skilledStaffCount = businesses.reduce((n,b)=>
    n + (b.staff||[]).filter(s=>s.skill>=SECOND_SHOP_SKILL).length, 0);
  const meetsSecondGate = businesses.length===0
    || ((char.gold||0) >= SECOND_SHOP_CAPITAL && skilledStaffCount >= 1);

  function buyAnother(trade){
    const def = getShopDef(trade);
    const price = getShopPrice(trade, loc);
    if((char.gold||0) < price){ setResult({text:`Not enough gold — that shop costs ${price}g here.`,bad:true}); return; }
    if(!meetsSecondGate){ setResult({text:`A second shop needs ${SECOND_SHOP_CAPITAL}g capital and a skilled worker (skill ${SECOND_SHOP_SKILL}+).`,bad:true}); return; }
    const newShop = {
      id:uid('biz'),
      trade, name:`${char.name}'s ${def.name}`, loc,
      produceId:def.produceList[0].id, rawStock:0, staff:[], boughtAge:char.age,
    };
    onAction({ ...char, gold:char.gold-price, businesses:[...businesses, newShop],
      log:[...(char.log||[]),{age:char.age,text:`You opened another ${def.name.toLowerCase()}.`,type:'good'}] });
    setResult({text:`You bought a new ${def.name.toLowerCase()} for ${price}g.`,bad:false});
  }

  return (
    <div style={{padding:'12px 14px', overflowY:'auto', WebkitOverflowScrolling:'touch', flex:1}}>
      <SectionHeader>Your Businesses</SectionHeader>
      <p style={{fontSize:'11px',color:T.muted,marginBottom:'12px',lineHeight:1.5}}>
        Each season your shops produce wares from raw materials. You and your staff work the bench —
        skilled hands make finer goods, and unskilled ones can't touch your best work. Sales come in at season's end, minus wages.
      </p>

      {result && (
        <Card accent={result.bad?T.red:T.green} style={{marginBottom:'12px'}}>
          <p style={{fontSize:'12px',color:T.text}}>{result.text}</p>
        </Card>
      )}

      {businesses.length===0 && (
        <Card style={{marginBottom:'12px'}}>
          <p style={{fontSize:'12px',color:T.muted,lineHeight:1.5}}>
            You don't own a shop yet. Reach <strong style={{color:T.gold}}>Master</strong> in a trade through your work, and you'll be offered the chance to buy your own.
          </p>
        </Card>
      )}

      {businesses.map(biz => {
        const def = getShopDef(biz.trade);
        if(!def) return null;
        const produceItem = def.produceList.find(p=>p.id===biz.produceId) || def.produceList[0];
        const rawNeed = getProduceRawNeed(produceItem);
        const salePrice = getProducePrice(produceItem);
        const stock = biz.rawStock||0;
        const stockRuns = rawNeed>0 ? Math.floor(stock/rawNeed) : 0;
        const away = (char.location||'village') !== (biz.loc||'village');
        const wageBill = (biz.staff||[]).reduce((n,s)=>n+getStaffWage(s),0);

        return (
          <Card key={biz.id} accent={T.gold} style={{marginBottom:'14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
              <div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:'15px',color:T.gold}}>{def.emoji} {biz.name}</p>
                <p style={{fontSize:'10px',color:T.muted}}>{def.name} · {LOCATIONS[biz.loc]?.name||biz.loc}</p>
              </div>
              {away && <Tag colour={T.orange}>You're away — staff run it</Tag>}
            </div>

            {/* Produce selector */}
            <p style={{fontSize:'11px',color:T.muted,marginBottom:'4px',marginTop:'6px'}}>Producing:</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px'}}>
              {def.produceList.map(item => {
                const active = item.id===biz.produceId;
                return (
                  <button key={item.id} onClick={()=>setProduce(biz,item.id)} style={{
                    display:'flex',flexDirection:'column',alignItems:'flex-start',
                    padding:'6px 8px',borderRadius:'8px',cursor:'pointer',
                    background: active ? T.gold+'22' : T.panel,
                    border:`1.5px solid ${active ? T.gold : T.border}`,
                    minWidth:'88px', WebkitTapHighlightColor:'transparent',
                  }}>
                    <span style={{fontSize:'12px',color:T.text,fontWeight:700}}>{item.emoji} {item.name}</span>
                    <span style={{fontSize:'9px',color:RARITY_COLOUR[item.rarity]||T.muted}}>{rarityLabel(item.rarity)} · sells {getProducePrice(item)}g</span>
                    <span style={{fontSize:'9px',color:T.muted}}>needs {getProduceRawNeed(item)} raw</span>
                  </button>
                );
              })}
            </div>

            {/* Raw materials */}
            <div style={{background:T.panel,borderRadius:'8px',padding:'8px 10px',marginBottom:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'11px',color:T.muted}}>{def.rawMaterial}</span>
                <span style={{fontSize:'11px',color: stockRuns>0?T.green:T.red, fontWeight:700}}>
                  {stock} units {stockRuns>0?`(≈${stockRuns} items)`:'(empty)'}
                </span>
              </div>
              <div style={{height:'6px',background:T.bg,borderRadius:'3px',overflow:'hidden',marginBottom:'8px'}}>
                <div style={{height:'100%',width:`${Math.min(100,stock*5)}%`,background:stockRuns>0?T.green:T.red}}/>
              </div>
              {buyMatFor===biz.id ? (
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  {[5,10,20].map(u=>(
                    <Btn key={u} small full={false} colour={T.gold} onClick={()=>buyMaterials(biz,u)}>
                      {u} units · {u*RAW_UNIT_COST}g
                    </Btn>
                  ))}
                  <Btn small full={false} outline colour={T.muted} onClick={()=>setBuyMatFor(null)}>Cancel</Btn>
                </div>
              ) : (
                <Btn small full={false} colour={T.gold} onClick={()=>setBuyMatFor(biz.id)}>Buy materials ({RAW_UNIT_COST}g/unit)</Btn>
              )}
            </div>

            {/* Staff roster */}
            <div style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                <span style={{fontSize:'11px',color:T.muted}}>Staff ({(biz.staff||[]).length}) · wages {wageBill}g/season</span>
              </div>
              {(biz.staff||[]).length===0 && (
                <p style={{fontSize:'10px',color:T.muted,fontStyle:'italic',marginBottom:'6px'}}>
                  No staff — you work this shop alone.
                </p>
              )}
              {(biz.staff||[]).map(s => {
                const canMake = canProduceRarity(s.skill, produceItem.rarity);
                return (
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    background:T.panel,borderRadius:'6px',padding:'6px 8px',marginBottom:'4px'}}>
                    <div>
                      <span style={{fontSize:'12px',color:T.text,fontWeight:700}}>{s.name}</span>
                      <span style={{fontSize:'9px',color:T.muted}}> · {s.position} · skill {s.skill}</span>
                      <div style={{fontSize:'9px',color: canMake?T.green:T.red}}>
                        {canMake ? `${getStaffAttempts(s)} items/season · ${getStaffWage(s)}g wage` : `Can't make ${rarityLabel(produceItem.rarity)} · ${getStaffWage(s)}g wage`}
                      </div>
                    </div>
                    <Btn small full={false} outline colour={T.red} onClick={()=>fire(biz,s.id)}>Let go</Btn>
                  </div>
                );
              })}

              {hiringFor===biz.id ? (
                <div style={{background:T.bg,borderRadius:'8px',padding:'8px',marginTop:'6px'}}>
                  <p style={{fontSize:'10px',color:T.muted,marginBottom:'6px'}}>This season's candidates ({season}):</p>
                  {pool.length===0 && <p style={{fontSize:'10px',color:T.muted,fontStyle:'italic'}}>No one else is looking for work this season.</p>}
                  {pool.map(c => (
                    <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                      background:T.panel,borderRadius:'6px',padding:'6px 8px',marginBottom:'4px'}}>
                      <div>
                        <span style={{fontSize:'12px',color:T.text,fontWeight:700}}>{c.name}</span>
                        <div style={{fontSize:'9px',color:T.muted}}>
                          skill {c.skill} · {getStaffWage(c)}g/season · can make up to {
                            c.skill>=5?'legendary':c.skill>=4?'rare':c.skill>=3?'uncommon':'common'}
                        </div>
                      </div>
                      <Btn small full={false} colour={T.gold} onClick={()=>hire(biz,c)}>Hire</Btn>
                    </div>
                  ))}
                  <Btn small full={false} outline colour={T.muted} onClick={()=>setHiringFor(null)}>Close</Btn>
                </div>
              ) : (
                <Btn small full={false} colour={T.blue} onClick={()=>{ ensurePool(); setHiringFor(biz.id); }}>Hire staff</Btn>
              )}
            </div>
          </Card>
        );
      })}

      {/* Buy another shop */}
      {masteredAvailable.length>0 && (
        <>
          <SectionHeader>Open Another Shop</SectionHeader>
          {!meetsSecondGate && businesses.length>0 && (
            <Card accent={T.orange} style={{marginBottom:'10px'}}>
              <p style={{fontSize:'11px',color:T.muted,lineHeight:1.5}}>
                A second shop needs <strong style={{color:T.gold}}>{SECOND_SHOP_CAPITAL}g</strong> in hand and at least one
                <strong style={{color:T.gold}}> skilled worker</strong> (skill {SECOND_SHOP_SKILL}+). You have {char.gold||0}g and {skilledStaffCount} skilled staff.
              </p>
            </Card>
          )}
          {masteredAvailable.map(trade => {
            const def = getShopDef(trade);
            const price = getShopPrice(trade, loc);
            const canBuy = (char.gold||0)>=price && meetsSecondGate;
            return (
              <Card key={trade} style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:'13px',color:T.text,fontWeight:700}}>{def.emoji} {def.name}</p>
                    <p style={{fontSize:'10px',color:T.muted}}>in {LOCATIONS[loc]?.name||loc} · {price}g</p>
                  </div>
                  <Btn small full={false} disabled={!canBuy} colour={T.gold} onClick={()=>buyAnother(trade)}>
                    {canBuy?'Buy':`${price}g`}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
