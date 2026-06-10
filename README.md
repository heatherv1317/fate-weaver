# Fate Weaver v5

A dark high fantasy life simulation game. Live a character from birth to death across multiple dynasties.

**Stack:** React + Vite · Vercel (free) · Google Gemini Flash API

## Setup

1. Clone the repo
2. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)
3. In Vercel, add environment variable: `GROQ_API_KEY=your_key_here` (recommended) or `GEMINI_API_KEY=your_key_here`
4. Deploy — Vercel handles the rest

## Local dev

```bash
npm install
# Create .env with GEMINI_API_KEY=your_key_here
npm run dev
```

## Features

- Full lifecycle from birth to death with dynasty inheritance
- 14 classes including combat, magic, and civilian paths
- Property ownership and passive rental income
- Marriage, children, household capacity
- Seasonal events, reputation, and legacy scoring
- Age-appropriate crises from infancy through old age
