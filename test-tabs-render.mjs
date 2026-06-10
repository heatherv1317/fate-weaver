// Renders EVERY tab component server-side to catch tabs that compile but crash on
// render (like the Market tab "items is not defined" regression). Run: node test-tabs-render.mjs
import { JSDOM } from 'jsdom';
import babel from '@babel/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Module from 'module';
const require = Module.createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dom = new JSDOM('<!DOCTYPE html><body><div id="root"></div></body>',{url:'http://localhost/'});
globalThis.window=dom.window; globalThis.document=dom.window.document;
try{Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});}catch(e){}
globalThis.localStorage=dom.window.localStorage; globalThis.requestAnimationFrame=cb=>setTimeout(cb,0);
globalThis.fetch=async()=>({ok:true,json:async()=>({content:[{type:'text',text:'ok'}]})});
const cache={};
function load(file){
  const abs=path.resolve(file); if(cache[abs])return cache[abs].exports;
  const out=babel.transformSync(fs.readFileSync(abs,'utf8'),{filename:abs,presets:[['@babel/preset-env',{modules:'commonjs',targets:{node:'current'}}],['@babel/preset-react',{runtime:'automatic'}]]}).code;
  const m={exports:{}}; cache[abs]=m; const dir=path.dirname(abs);
  const req=s=>{ if(s.startsWith('react'))return require(s);
    if(s.startsWith('.')){let p=path.resolve(dir,s); if(fs.existsSync(p)&&fs.statSync(p).isFile())return load(p);
      for(const e of ['.jsx','.js','.mjs'])if(fs.existsSync(p+e))return load(p+e);} return require(s); };
  new Function('require','module','exports','__dirname','__filename',out)(req,m,m.exports,dir,abs);
  return m.exports;
}
const React=require('react'); const {renderToString}=require('react-dom/server');
const gameData=load(path.join(__dirname,'src/gameData.js'));
const OT=load(path.join(__dirname,'src/tabs/OtherTabs.jsx'));
const Work=load(path.join(__dirname,'src/tabs/WorkTab.jsx'));
const Health=load(path.join(__dirname,'src/tabs/HealthTab.jsx'));
const Rel=load(path.join(__dirname,'src/tabs/RelationshipsTab.jsx'));
const Life=load(path.join(__dirname,'src/tabs/LifeTab.jsx'));
const Biz=load(path.join(__dirname,'src/tabs/BusinessTab.jsx'));
const char=gameData.newCharacter({age:30,gold:800,location:'village',
  inventory:[{id:'a',name:'Iron Sword',cost:25,rarity:'common',condition:'worn',statBonus:{STR:1}},
             {id:'b',name:'Healing Herbs',cost:8,rarity:'uncommon',condition:'pristine',consumable:true}],
  businesses:[{id:'biz1',trade:'smithy',name:'Forge',loc:'village',produceId:'p_sword',rawStock:20,staff:[]}],
  masteredTrades:['smithy'],
  relationships:[{id:'r1',name:'Aldric',type:'friend',score:70,alive:true}]});
const tabs=[
  ['InventoryTab(market)',OT.InventoryTab],['SkillsTab',OT.SkillsTab],['CrimeTab',OT.CrimeTab],
  ['ReligionTab',OT.ReligionTab],['WorldTab',OT.WorldTab],['MagicTab',OT.MagicTab],
  ['PropertyTab',OT.PropertyTab],['GuildTab',OT.GuildTab],['GoingOutTab',OT.GoingOutTab],
  ['WorkTab',Work.default],['HealthTab',Health.default],['RelationshipsTab',Rel.default],
  ['LifeTab',Life.default],['BusinessTab',Biz.default],
];
let pass=0,fail=0;
for(const [name,Comp] of tabs){
  if(!Comp){ console.log('  ⚠ '+name+' not found (skipped)'); continue; }
  try{ renderToString(React.createElement(Comp,{char,onAction:()=>{}})); pass++; console.log('  ✓ '+name); }
  catch(e){ fail++; console.log('  ✗ '+name+' CRASHED: '+String(e.message||e).slice(0,160)); }
}
console.log(`\nTAB RENDER: ${pass} passed, ${fail} failed`);
process.exit(fail>0?1:0);
