# Tulsi & Grace — Formation Study Hub

A standalone PhD-caliber study hub: syllabus & calendar, interactive checkpoints,
thesis workspace, case log, framework builder, AI "challenge me" (via Groq),
study notes, library, citation bank, and question tracking.

## Local development
```
npm install
npm run dev
```

## Deploying to Netlify
1. Push this folder to a new GitHub repository.
2. In Netlify: "Add new site" → "Import an existing project" → connect the repo.
   Build command: `npm run build`. Publish directory: `dist`. (Already set in netlify.toml.)
3. In Netlify: Site settings → Environment variables → add `GROQ_API_KEY` with your Groq key.
4. Deploy. The "Challenge me" tab calls a Netlify serverless function
   (`netlify/functions/challenge.js`) that holds your key server-side — it's
   never exposed to the browser.

## Data & backups
All data (syllabus, notes, cases, citations, etc.) is stored in this browser's
localStorage — there is no server database. Use the **Export all data** button
on the Dashboard regularly, especially before clearing browser data or moving
to a new device. **Import backup** restores from that exported file.
