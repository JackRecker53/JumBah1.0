# JumBah 2.0 — MVP (Game-First + QR + Translator Lite)

This is a minimal starter you can run **today**:
- React + Vite frontend
- **QR scanner** (html5-qrcode)
- Translator Lite (preset phrases)
- Supabase-ready schema + **Edge Function** for server-side QR verification (optional for guests)

---

## 1) Quick Start (Frontend)

```bash
npm i
cp .env.example .env   # fill in Supabase creds later (optional for pure local)
npm run dev
```

Open: http://localhost:5173

> **Camera note:** QR scanning works on **https** origins or `http://localhost`. On mobile, test via local network (or use `vite --host`).

---

## 2) Supabase Setup (Cloud Save + Server-Side Verify)

1. Create a project at https://supabase.com → get **Project URL** and **Anon key**.
2. In the Supabase **SQL Editor**, run the schema in `supabase/schema.sql`.
3. (Optional) Create a Storage bucket `stickers` and upload your images. Make public.
4. Copy `.env.example` → `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Auth (simple)
- Start with **Email OTP** or any OAuth provider. Guests can still play (progress local), and when logged in you can sync to `user_progress`.

### Edge Function (verify-qr)
- Install Supabase CLI: https://supabase.com/docs/guides/cli
- Login: `supabase login`
- Link project: `supabase link --project-ref your-ref`
- Deploy function:
  ```bash
  supabase functions deploy verify-qr --no-verify-jwt
  supabase secrets set --env-file supabase/.secrets # or set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in dashboard
  ```
- Call from client with payload `{ code: "quest:<slug>:<secret>", user_id: <auth.uid or empty for guest> }`.

**QR Payload format**
```
quest:<slug>:<secret>
```
Example: `quest:kk-001:sunrise2025`

> For production, avoid static secrets. Consider signing the payload (HMAC) or rotating secrets.

---

## 3) Where to add real data

- `src/data/quests.json` — seed quests for each district. When ready, migrate into Supabase `quests` and `rewards` tables.
- `src/pages/Quest.jsx` — the QR and task logic. Replace the TODO with a fetch call to your deployed Edge Function to mark completion.
- `src/pages/Chatbot.jsx` — translator lite. Swap to an AI translate API later.

---

## 4) Suggested Roadmap

- [ ] Replace local JSON with Supabase queries
- [ ] Add Auth (email OTP or OAuth)
- [ ] Call Edge Function on QR success to write `user_progress`
- [ ] Create Stampbook view that reads `user_progress` + rewards
- [ ] Add vendor “sponsored quest” type
- [ ] Add AI chat + translate API

---

## 5) Development Tips

- Keep **guest mode**: store progress in `localStorage`. Sync upon login.
- Use `react-router-dom` for flow.
- Use **https** in production to enable camera access.
- For maps, integrate Leaflet/Mapbox on District page later.

---

**Have fun!** 🐘
