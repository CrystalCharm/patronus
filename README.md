<div align="center">

# ✨ Patronus

**Send a little magic to someone you care about.**

A real-time magical messaging web app where messages are Patronuses,<br>groups are Circles, and every notification feels like an enchantment.

[Live Demo](patronus-one.vercel.app) · [Report Bug](https://github.com/CrystalCharm/patronus/issues)

</div>

---

## 🪄 What is Patronus?

Patronus is a Harry Potter-themed real-time messaging application built for couples, friends, and small groups. Instead of ordinary chats, you communicate through **magical Circles** — private sanctuaries where members cast **Patronuses** (messages) to each other in real time.

> *"I am opening a magical object that lets me communicate with someone I care about."*

### ✨ Key Features

- **🔮 Circles** — Create or join private groups using magical invite codes (`PATR-7X2K`)
- **⚡ Real-Time Messaging** — Messages appear instantly across devices via Supabase Realtime
- **🌙 Message Types** — Standard, Howler (urgent), Whisper (subtle), and Spell (magical) messages
- **🔔 Patronus Alerts** — In-app toast notifications with sensory feedback for incoming messages
- **👥 Live Presence** — See who's currently online in your Circle
- **🎵 Sensory Feedback** — Magical chimes and haptic vibrations for different message types
- **📱 PWA Ready** — Installable on mobile devices as a standalone app
- **🌐 Offline Fallback** — Works in local mode when no backend is configured
- **🪄 Spellbook Settings** — Customize your Wizard Profile, Patronus form, and notification preferences

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Vanilla CSS (magical dark theme) |
| **Backend** | Supabase (PostgreSQL + Realtime WebSockets) |
| **Hosting** | Vercel |
| **PWA** | Custom Service Worker + Web App Manifest |
| **Compiler** | React Compiler + Babel |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/CrystalCharm/patronus.git
cd patronus
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then run the database schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase_schema.sql and paste into:
# Supabase Dashboard → SQL Editor → New Query → Run
```

This creates the `circles`, `circle_members`, and `messages` tables with RLS policies and Realtime publication.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** Without Supabase credentials, Patronus operates in **local parchment mode** using `localStorage` — perfect for exploring the UI.

---

## 📁 Project Structure

```
patronus/
├── public/
│   ├── sw.js                    # Service Worker (PWA)
│   └── manifest.json            # Web App Manifest
├── src/
│   ├── components/
│   │   ├── circles/             # Circle creation, joining, member list
│   │   ├── common/              # Modal, PatronusButton, shared UI
│   │   ├── messaging/           # MessageBubble, MessageComposer
│   │   └── settings/            # SpellbookModal (wizard profile & prefs)
│   ├── data/
│   │   └── mockData.js          # Demo data for offline/local mode
│   ├── pages/
│   │   ├── LandingPage.jsx      # Hero page with Create/Join actions
│   │   └── CircleDashboard.jsx  # Main chat view with real-time sync
│   ├── services/
│   │   ├── supabaseClient.js    # Supabase client + online detection
│   │   ├── messageService.js    # Message CRUD + Realtime subscriptions
│   │   ├── circleService.js     # Circle CRUD + member management
│   │   ├── notificationService.js # Audio chimes + haptics + alerts
│   │   └── pwaService.js        # PWA install prompt handling
│   └── styles/                  # Global and component CSS
├── supabase_schema.sql          # Database schema + RLS + Realtime setup
├── vercel.json                  # SPA routing rewrites
└── .env.example                 # Environment variable template
```

---

## 🧙 Patronus Terminology

| Conventional Term | Patronus Term |
| :--- | :--- |
| Group | **Circle** |
| Message | **Patronus** |
| Send Message | **Cast Patronus** |
| Notification | **Patronus Alert** |
| Profile | **Wizard Profile** |
| Settings | **Spellbook** |
| Group Owner | **Circle Keeper** |
| Invite Code | **Circle Code** |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel automatically builds with `vite build`

> **Important:** Vite bakes environment variables at build time. If you add variables after the initial deployment, trigger a **Redeploy without cache**.

---

## 📱 PWA Installation

Patronus is a Progressive Web App. On supported devices:

1. Open the deployed URL in Chrome or Safari
2. Look for the **"Add to Home Screen"** prompt or the install icon in the address bar
3. Install to get a native app-like experience with offline support

---

## 🔒 Security Notes

- Supabase **Row Level Security (RLS)** is enabled on all tables
- The `anon` key is a **public** key — safe to use client-side
- No sensitive data is stored in the repository (`.env.local` is gitignored)
- Circle Codes provide access control for private groups

---

## 📝 License

This project is private and maintained by [CrystalCharm](https://github.com/CrystalCharm).

---

<div align="center">

*Mischief Managed.* 🗺️

</div>
