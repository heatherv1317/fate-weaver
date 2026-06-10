// Headless mount: transpile the app with babel, mount GameScreen + BusinessTab
// in jsdom, and report whether UI rendered and whether any runtime errors fired.
import { JSDOM } from 'jsdom';
import babel from '@babel/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Module from 'module';
const require = Module.createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', { url:'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
try { Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true}); } catch(e){}
globalThis.localStorage = dom.window.localStorage;
globalThis.requestAnimationFrame = (cb)=>setTimeout(cb,0);
globalThis.cancelAnimationFrame = ()=>{};
globalThis.fetch = async ()=>({ ok:true, json:async()=>({content:[{type:'text',text:'ok'}]}) });

const errors = [];
const origError = console.error;
console.error = (...a)=>{ errors.push(a.join(' ')); };

// Minimal JSX/ESM → CJS transpile + require shim that resolves .js/.jsx siblings.
const cache = {};
function load(file){
  const abs = path.resolve(file);
  if(cache[abs]) return cache[abs].exports;
  let src = fs.readFileSync(abs,'utf8');
  const out = babel.transformSync(src, {
    filename: abs,
    presets:[['@babel/preset-env',{modules:'commonjs',targets:{node:'current'}}], ['@babel/preset-react',{runtime:'automatic'}]],
  }).code;
  const m = { exports:{} };
  cache[abs] = m;
  const dir = path.dirname(abs);
  const req = (spec)=>{
    if(spec==='react') return require('react');
    if(spec==='react-dom') return require('react-dom');
    if(spec==='react-dom/client') return require('react-dom/client');
    if(spec==='react/jsx-runtime') return require('react/jsx-runtime');
    if(spec.startsWith('.')){
      let p = path.resolve(dir, spec);
      if(fs.existsSync(p) && fs.statSync(p).isFile()) return load(p);
      for(const ext of ['.jsx','.js','.mjs']){ if(fs.existsSync(p+ext)) return load(p+ext); }
      for(const ext of ['/index.jsx','/index.js']){ if(fs.existsSync(p+ext)) return load(p+ext); }
    }
    return require(spec);
  };
  const fn = new Function('require','module','exports','__dirname','__filename', out);
  fn(req, m, m.exports, dir, abs);
  return m.exports;
}

const React = require('react');
let html = '', mountErr = null;
try {
  const { renderToString } = require('react-dom/server');
  const GS = load(path.join(__dirname,'src/GameScreen.jsx'));
  const BusinessTab = load(path.join(__dirname,'src/tabs/BusinessTab.jsx'));
  const gameData = load(path.join(__dirname,'src/gameData.js'));

  const GameScreen = GS.default || GS;
  const BT = BusinessTab.default || BusinessTab;

  // Build a character that owns a shop with staff so the business UI fully renders.
  const char = gameData.newCharacter({
    name:'Tester', age:30, gold:2000, location:'village',
    masteredTrades:['smithy'],
    businesses:[{
      id:'biz1', trade:'smithy', name:"Tester's Smithy", loc:'village',
      produceId:'p_chainmail', rawStock:30,
      staff:[
        {id:'s1',name:'Greenhand',skill:1,position:'Apprentice',seasonsWorked:0},
        {id:'s2',name:'Adept',skill:4,position:'Senior',seasonsWorked:8},
      ],
      boughtAge:28,
    }],
  });
  char.stats = char.stats || {STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10};

  // Render BusinessTab directly (isolates the new UI).
  html += renderToString(React.createElement(BT, { char, onAction:()=>{} }));

  // Render full GameScreen to catch integration-level crashes.
  html += renderToString(React.createElement(GameScreen, {
    char, onUpdate:()=>{}, onDeath:()=>{}, meta:{achievements:[]},
    setChar:()=>{}, activeSlot:0,
  }));
} catch(e){ mountErr = e; }

console.error = origError;

console.log('=== HEADLESS MOUNT ===');
console.log('Rendered UI:', html && html.length>200 ? 'YES ('+html.length+' chars)' : 'NO');
if(mountErr){ console.log('MOUNT ERROR:', mountErr.message); console.log(mountErr.stack?.split('\n').slice(0,5).join('\n')); }
const realErrors = errors.filter(e=>!/useLayoutEffect|Warning:/.test(e));
console.log('Runtime errors:', realErrors.length);
realErrors.slice(0,8).forEach(e=>console.log('  -',e.slice(0,160)));
process.exit(mountErr || realErrors.length ? 1 : 0);
