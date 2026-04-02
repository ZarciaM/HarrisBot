# Harris Bot 🤖

**Créé par Zarcia MAEVASON** — Étudiant L3 HEI Madagascar 🇲🇬

Chatbot IA personnel propulsé par Llama 3.3 70B via OpenRouter, déployé sur Vercel avec MongoDB pour l'historique des conversations.

---

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **MongoDB + Mongoose** — stockage des conversations
- **OpenRouter** — accès gratuit à Llama 3.3 70B
- **Vercel** — déploiement

## Setup local

```bash
# 1. Installe les dépendances
npm install

# 2. Crée ton fichier .env.local
cp .env.example .env.local
# → Remplis OPENROUTER_API_KEY et MONGODB_URI

# 3. Lance le serveur
npm run dev
# → http://localhost:3000
```

## Déploiement sur Vercel

```bash
# 1. Push sur GitHub
git init && git add . && git commit -m "init harris bot"
git remote add origin https://github.com/TON_USER/harris-bot.git
git push -u origin main

# 2. Connecte le repo sur vercel.com
# 3. Ajoute les variables d'environnement dans Vercel :
#    - OPENROUTER_API_KEY
#    - MONGODB_URI
#    - NEXT_PUBLIC_APP_URL
```

## Architecture

```
harris-bot/
├── app/
│   ├── api/chat/route.ts   ← API serveur (clé cachée ici 🔒)
│   ├── page.tsx            ← Interface chat
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── mongodb.ts          ← Connexion MongoDB
├── models/
│   └── Conversation.ts     ← Schéma Mongoose
├── .env.example
└── package.json
```

La clé OpenRouter est **uniquement côté serveur** — les utilisateurs ne la voient jamais.
