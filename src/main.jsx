import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

window.storage = {
  get: async (key) => {
    const val = localStorage.getItem(key);
    if (val === null) throw new Error(`Key not found: ${key}`);
    return { key, value: val };
  },
  set: async (key, value) => {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, str);
    return { key, value: str };
  },
  delete: async (key) => { localStorage.removeItem(key); return { key, deleted: true }; },
  list: async (prefix) => {
    const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
    return { keys };
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
