# Hirea v3.0 — Complete 15-Module Ecosystem, Live Webinars & Startup Fest Mode

## What's New & Fixed in Version 3 (`hirea-project-v3.zip`)
1. **Zero Install/Dependency Errors:** Configured with stable React 18.3 + Vite 5.4 + `.npmrc` (`legacy-peer-deps=true`) and ESM `fileURLToPath` in `vite.config.ts` so `npm install` and `npm run dev` work on the first try without a single warning.
2. **1-Click Windows Launcher (`START_HIREA.bat`):** On Windows, simply double-click `START_HIREA.bat`—it will automatically install dependencies if needed and open `http://localhost:5173`.
3. **⚡ `Ctrl+K` 15-Module Command Palette:** Press `Ctrl+K` (or click `⚡ 15 Modules` in the top bar) to search and jump directly to any of the 15 Hirea modules.
4. **🎙️ Live Webinars & Masterclass Studio:** Click `🎙️ Webinars` in the top bar to RSVP to live sessions, claim **+50 Score Points**, and unlock verified badges.
5. **🚀 Startup Fest Pitch & Demo Mode:** Click `🚀 Fest Pitch` in the top bar for a 4-stage interactive judge walkthrough (Live Coding -> Virtual Pods -> Investor Hub -> Bites Stream).
6. **📄 1-Click PDF Resume Export:** Added an **Export PDF** button inside the Resume & ATS Studio (`view-resume`).
7. **Complete GitHub Ready Setup:** Includes `.gitignore`, `.env.example`, `drizzle/schema.ts`, and all 4 SQL migrations (`0000`–`0003`).


## Setup
```bash
npm install
cp .env.example .env   # optional: Supabase keys
npm run dev
```
If VS Code shows `Cannot find module 'react'` etc., it just means `npm install` hasn't been run in this folder yet.
