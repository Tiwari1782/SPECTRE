<div align="center">

# 🚀 DevMatch

![DevMatch Preview](Screenshots/home.png)

**AI-Powered Hackathon Team Builder with Smart Matching, Real-Time Chat, Skill Verification, AI Co-Pilot & Hackathon Discovery**

[![Live Demo](https://img.shields.io/badge/%20Live%20Demo-Visit%20DevMatch-6366f1?style=for-the-badge&labelColor=0D1B2A)](https://spectre-zeta-one.vercel.app/)

[![GitHub](https://img.shields.io/badge/GitHub-DevMatch-181717?style=for-the-badge&logo=github)](https://github.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React_19-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real_Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-AI_Engine-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

---

## 🎯 Project Overview

**DevMatch** transforms chaotic hackathon team formation into a smart, data-driven experience. Built with the **MERN stack**, it provides:

- **🤖 AI Matching Engine** — GPT-4o powered compatibility scoring with detailed explanations and breakdown
- **👥 Smart Team Builder** — Auto-assembles a balanced team from the user pool based on skills, roles, and goals
- **📊 Skill Verification** — GPT-4o-generated timed quizzes per skill; passing awards a ✅ verified badge + XP
- **💬 Real-Time Chat** — Socket.io messaging with context-aware prefilled icebreakers between matched users
- **🌐 Hackathon Discovery** — Live feed from Devpost + Unstop APIs, merged and deduplicated in real time
- **🤖 AI Idea Co-Pilot** — Shared conversational GPT-4o chat room for the whole team to brainstorm ideas together
- **📅 Availability Heatmap** — Weekly hour-by-hour grid that factors into match scores
- **🏆 Showcase & Leaderboard** — Publish projects, collect upvotes, climb the public team leaderboard
- **🎮 XP & Badges** — Gamified progression system rewarding profile completion, quizzes, and shipping
- **🔗 Invite Links** — No-auth quick-join links with 48-hour expiry and slot limits
- **🎤 Voice Intro** — 30-second recorded pitch stored on S3, playable on match cards
- **🕵️ Blind Matching** — Anonymous mode hides identity until both parties mutually accept

---

## ✨ Features

### 🤖 AI Matching Engine — Deep Dive

The platform's matching pipeline combines algorithmic scoring with GPT-4o natural language explanations:

```
User completes profile + GitHub sync
         ↓
Backend runs matching algorithm across all users
         ↓
Score computed: Skills · Roles · Goals · Availability · Heatmap · Domain · Vibe
         ↓
GPT-4o generates a 2-sentence personalised explanation per match
         ↓
Ranked match list returned with %, breakdown, shared skills, and suggested role
         ↓
Optional: Blind mode hides names — reveal only on mutual acceptance
```

| Factor | Weight | Description |
|--------|--------|-------------|
| 🧩 **Skill Complementarity** | Up to 16 pts | Rewards different but compatible skills; penalises excess overlap |
| ✅ **Verified Skills Bonus** | Up to 20 pts | Each quiz-verified skill on the other user adds bonus score |
| 🎭 **Role Complement** | 20 pts | Bonus when roles differ (e.g. Frontend + Backend) |
| 🎯 **Goals Alignment** | 15 pts | Matched when both want to Win / Learn / Build / Network |
| ⏰ **Availability** | 10 pts | General availability type match |
| 🗓️ **Heatmap Overlap** | Up to 15 pts | Hour-by-hour weekly availability overlap bonus |
| 🌐 **Domain Match** | 25 pts | Project interest alignment (Web, AI, Blockchain, Mobile, Open) |
| ✨ **Vibe Match** | 20 pts | Working style (Fast-ship, Perfectionist, Async, In-person) |

### 🎨 Frontend Features

| Feature | Description |
|---------|-------------|
| 📱 **Fully Responsive** | Mobile-first design with Tailwind CSS |
| 📊 **Skill Radar Chart** | Chart.js radar overlay per user; verified skills rendered in green |
| 🃏 **Match Cards** | Score badge, AI explanation, shared skills, suggested role |
| 🕵️ **Blind Match Cards** | Anonymous cards; identity locked until mutual connect |
| 🗓️ **Availability Heatmap** | 7-day × 16-hour interactive clickable grid |
| 🤖 **Idea Co-Pilot** | Persistent AI chat panel with Socket.io team-wide sync |
| 🏅 **XP & Badge Display** | Level badge (Rookie → Hacker → Pro → Legend) + earned badges |
| 🔗 **Invite Link UI** | One-click copy shareable link with slot counter |
| 🎤 **Voice Intro Player** | In-card audio player for 30-second pitches |

### ⚙️ Backend Features

| Feature | Description |
|---------|-------------|
| 📱 **OTP Authentication** | Twilio Verify SMS-based phone login with JWT sessions |
| 🐙 **GitHub Integration** | Auto-detects top languages from repos, updates skill list |
| 🧮 **Matching Algorithm** | Multi-factor weighted scorer with heatmap and verified-skill bonuses |
| 🤖 **GPT-4o Services** | Match explanation, team builder, idea co-pilot, team health analysis, quiz generation |
| 🔌 **Socket.io** | Live match notifications, typing indicators, real-time chat, co-pilot room sync |
| 🌐 **Hackathon Aggregator** | Parallel fetch from Devpost + Unstop, deduplicated, cached for 15 min |
| 🧪 **Skill Quiz Engine** | GPT-4o generates 5 MCQs per skill; server-side answer validation; XP award on pass |
| 🎤 **Voice Intro** | Multer + AWS S3 upload pipeline for `.webm` audio files |
| 🔗 **Invite System** | Crypto-random tokens, 48h expiry, slot-limited team joins without auth |
| 🏆 **Showcase API** | Upvote-sorted project feed with one-vote-per-user enforcement |
| 🎮 **XP Manager** | Centralised XP event handler with level thresholds and badge logic |
| 🛡️ **Security** | Helmet, CORS, rate limiting, input validation |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-010101?style=flat-square&logo=socket.io&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)

### AI & Services
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=flat-square&logo=twilio&logoColor=white)
![GitHub API](https://img.shields.io/badge/GitHub_API-181717?style=flat-square&logo=github&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-232F3E?style=flat-square&logo=amazonaws&logoColor=white)
![Devpost](https://img.shields.io/badge/Devpost_API-003E54?style=flat-square&logo=devpost&logoColor=white)
![Unstop](https://img.shields.io/badge/Unstop_API-6366F1?style=flat-square)

---

## 🗺️ Application Routes

### 🌐 Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero page with platform overview and pitch |
| `/login` | Login | Phone number entry for OTP |
| `/verify` | OTP Verify | Enter OTP code, receive JWT |
| `/join/:token` | Quick Join | No-auth invite link landing page |
| `/showcase` | Showcase | Public project showcase + leaderboard |

### 🔒 Protected Routes (Authenticated User)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Stats, recent matches, quick actions |
| `/profile` | Profile | Edit profile, skills, GitHub sync, voice intro, heatmap |
| `/matches` | Matches | Ranked match list with AI explanations |
| `/chat/:roomId` | Chat | Real-time 1-on-1 chat with a match |
| `/team-builder` | Team Builder | AI-generated balanced team suggestion |
| `/hackathons` | Hackathons | Live Devpost + Unstop hackathon feed |
| `/quiz/:skill` | Skill Quiz | Timed 5-question verification quiz |

---

## 🔌 API Routes

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/send-otp` | Public | Send OTP via Twilio Verify |
| `POST` | `/verify-otp` | Public | Verify OTP, return JWT + user |
| `GET` | `/join/:token` | Public | Quick join via invite link |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/profile` | Private | Create or update user profile |
| `GET` | `/me` | Private | Get current authenticated user |
| `GET` | `/:id` | Private | Get user by ID |
| `POST` | `/availability` | Private | Save availability heatmap grid |
| `PATCH` | `/blind-mode` | Private | Toggle anonymous/blind matching mode |

### Matching — `/api/match`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/:userId` | Private | Get ranked match list with scores |
| `GET` | `/explain/:userId/:targetId` | Private | GPT-4o match explanation |
| `GET` | `/team/:userId` | Private | AI-generated balanced team |
| `GET` | `/team-health/:teamId` | Private | Team health analysis + radar data |

### GitHub — `/api/github`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/:username` | Private | Fetch GitHub profile + top languages |

### Chat — `/api/chat`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/:roomId` | Private | Get chat message history |
| `GET` | `/prefill/:targetId` | Private | Context-aware icebreaker messages |
| `POST` | `/copilot` | Private | Send message to AI Idea Co-Pilot |

### Hackathons — `/api/hackathons`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Private | Merged Devpost + Unstop feed (cached 15 min) |
| `GET` | `/:id` | Private | Single hackathon details |
| `GET` | `/filter` | Private | Filter by domain, deadline, source, prize |

### Quiz — `/api/quiz`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/:skill` | Private | Generate 5 GPT-4o questions for a skill |
| `POST` | `/:skill/submit` | Private | Submit answers, get score + badge + XP |
| `GET` | `/results/:userId` | Private | All quiz results for a user |

### Showcase — `/api/showcase`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Private | Publish a project to the showcase |
| `GET` | `/` | Private | All projects sorted by upvotes |
| `POST` | `/:id/upvote` | Private | Upvote a project (one per user) |
| `GET` | `/leaderboard` | Private | Top 10 teams leaderboard |

### Voice — `/api/voice`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/upload` | Private | Upload `.webm` voice intro to S3 |
| `GET` | `/:userId` | Private | Get voice intro URL for a user |
| `DELETE` | `/` | Private | Delete current voice intro |

### Invite — `/api/invite`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/create` | Private | Generate shareable invite link (48h expiry) |
| `GET` | `/:token` | Public | Get invite details and team slots |
| `POST` | `/:token/join` | Public | Join team via invite (creates account if new) |

---

## 📁 Project Structure

```
devmatch/
├── .env.example
├── package.json                             # Root (concurrently)
│
├── client/                                  # ⚛️ React Frontend (Vite)
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── PhoneInput.jsx           # Phone number entry
│       │   │   └── OTPVerify.jsx            # OTP code verification
│       │   ├── Profile/
│       │   │   ├── ProfileForm.jsx          # Skills, role, goals form
│       │   │   ├── SkillRadarChart.jsx      # Chart.js radar overlay
│       │   │   └── VoiceIntro.jsx           # 🎤 Record & playback intro
│       │   ├── Match/
│       │   │   ├── MatchCard.jsx            # Score + explanation card
│       │   │   ├── CompatibilityScore.jsx   # Score badge + breakdown
│       │   │   ├── MatchList.jsx            # Ranked match feed
│       │   │   └── BlindMatchCard.jsx       # 🕵️ Anonymous match card
│       │   ├── Team/
│       │   │   ├── TeamHealthDashboard.jsx  # 📊 Radar overlay + gap analysis
│       │   │   └── TeamInviteLink.jsx       # 🔗 Copy invite link UI
│       │   ├── Hackathons/
│       │   │   ├── HackathonCard.jsx        # Event card with badge + deadline
│       │   │   └── HackathonFilter.jsx      # Source / domain / search filters
│       │   ├── Quiz/
│       │   │   └── SkillQuiz.jsx            # 🧪 Timed MCQ quiz component
│       │   ├── Showcase/
│       │   │   ├── ShowcaseCard.jsx         # Project card + upvote button
│       │   │   └── Leaderboard.jsx          # 🏆 Top 10 teams table
│       │   ├── Availability/
│       │   │   └── AvailabilityHeatmap.jsx  # 📅 Clickable 7×16 hour grid
│       │   ├── Chat/
│       │   │   ├── ChatWindow.jsx           # Real-time 1-on-1 chat
│       │   │   ├── MessageBubble.jsx        # Message bubble component
│       │   │   └── IdeaCopilot.jsx          # 🤖 Team AI brainstorm chat
│       │   └── UI/
│       │       ├── Navbar.jsx
│       │       └── Loader.jsx
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Profile.jsx
│       │   ├── Matches.jsx
│       │   ├── Chat.jsx
│       │   ├── Hackathons.jsx               # Live hackathon discovery
│       │   ├── Showcase.jsx                 # Public project showcase
│       │   └── TeamBuilder.jsx              # AI team assembly page
│       ├── hooks/
│       │   ├── useSocket.js
│       │   └── useAuth.js
│       ├── context/
│       │   └── AuthContext.jsx
│       └── services/
│           ├── api.js                       # Axios instance + interceptors
│           └── socket.js                    # Socket.io client
│
└── server/                                  # 🖥️ Express.js Backend
    ├── server.js                            # App entry + Socket.io setup
    ├── config/
    │   └── db.js                            # MongoDB Atlas connection
    ├── controllers/
    │   ├── authController.js                # OTP + JWT + invite join
    │   ├── userController.js                # Profile CRUD + heatmap
    │   ├── matchController.js               # Scoring + team health
    │   ├── githubController.js              # GitHub API + skill sync
    │   ├── chatController.js                # History + copilot endpoint
    │   ├── hackathonController.js           # Devpost + Unstop aggregator
    │   ├── quizController.js                # Generate + submit + verify
    │   ├── showcaseController.js            # Publish + upvote + leaderboard
    │   └── voiceController.js               # Multer + S3 upload
    ├── middleware/
    │   ├── authMiddleware.js                # JWT verification
    │   └── errorHandler.js                  # Global error handler
    ├── models/
    │   ├── User.js                          # Full user schema (XP, heatmap, voice, badges)
    │   ├── Message.js                       # Chat message schema
    │   ├── QuizResult.js                    # Quiz attempt + score record
    │   ├── Showcase.js                      # Project showcase schema
    │   └── TeamInvite.js                    # Invite token + members + expiry
    ├── routes/
    │   ├── authRoutes.js                    # /api/auth/*
    │   ├── userRoutes.js                    # /api/users/*
    │   ├── matchRoutes.js                   # /api/match/*
    │   ├── githubRoutes.js                  # /api/github/*
    │   ├── chatRoutes.js                    # /api/chat/*
    │   ├── hackathonRoutes.js               # /api/hackathons/*
    │   ├── quizRoutes.js                    # /api/quiz/*
    │   ├── showcaseRoutes.js                # /api/showcase/*
    │   └── voiceRoutes.js                   # /api/voice/*
    ├── services/
    │   ├── matchingService.js               # Weighted scoring algorithm
    │   ├── openaiService.js                 # GPT-4o — all AI features
    │   ├── twilioService.js                 # OTP send + verify
    │   ├── devpostService.js                # Devpost public API client
    │   ├── unstopService.js                 # Unstop public API client
    │   └── quizService.js                   # GPT-4o quiz generation
    ├── socket/
    │   └── socketHandler.js                 # All Socket.io event handlers
    └── utils/
        ├── roleAssigner.js                  # Skill → role mapping logic
        └── xpManager.js                     # XP award + level + badge logic
```

---

## 🔑 Environment Variables

### Server `.env` (in `server/` directory)

```env
# ─────────────────────────────────────────────
# 🖥️  SERVER CONFIGURATION
# ─────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─────────────────────────────────────────────
# 🗄️  DATABASE
# ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devmatch

# ─────────────────────────────────────────────
# 🔐  AUTHENTICATION
# ─────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# ─────────────────────────────────────────────
# 📱  TWILIO (OTP Auth)
# ─────────────────────────────────────────────
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─────────────────────────────────────────────
# 🤖  OPENAI (All AI Features)
# ─────────────────────────────────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─────────────────────────────────────────────
# 🐙  GITHUB (Skill Detection)
# ─────────────────────────────────────────────
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─────────────────────────────────────────────
# ☁️  AWS S3 (Voice Intros)
# ─────────────────────────────────────────────
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET=devmatch-voice-intros
```

### Client `.env` (in `client/` directory)

```env
VITE_API_URL=http://localhost:5000
```

### 📋 Environment Variables Summary

| Variable | Required | Service | Description |
|----------|----------|---------|-------------|
| `PORT` | ✅ | Server | Server port (default: 5000) |
| `NODE_ENV` | ✅ | Server | `development` or `production` |
| `MONGODB_URI` | ✅ | MongoDB | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Auth | Secret key for JWT signing |
| `CLIENT_URL` | ✅ | CORS | Frontend URL for CORS whitelist |
| `TWILIO_SID` | ✅ | OTP | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | OTP | Twilio Auth Token |
| `TWILIO_SERVICE_SID` | ✅ | OTP | Twilio Verify Service SID |
| `OPENAI_API_KEY` | ✅ | AI | OpenAI GPT-4o API key |
| `GITHUB_TOKEN` | ✅ | GitHub | GitHub personal access token |
| `AWS_REGION` | 🔊 | S3 | AWS region for voice storage |
| `AWS_ACCESS_KEY_ID` | 🔊 | S3 | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | 🔊 | S3 | AWS secret key |
| `S3_BUCKET` | 🔊 | S3 | S3 bucket name for voice intros |
| `VITE_API_URL` | ✅ | Client | Backend base URL |

> **Legend:** ✅ Required | 🔊 Required for Voice Intro feature

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **OpenAI** API key with GPT-4o access
- **Twilio** Verify Service SID
- **GitHub** personal access token

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/devmatch.git
cd devmatch

# 2. Install server dependencies
cd server
npm install express mongoose cors dotenv jsonwebtoken \
  twilio openai axios socket.io multer \
  @aws-sdk/client-s3 cheerio

# 3. Install client dependencies
cd ../client
npm create vite@latest . -- --template react
npm install axios socket.io-client react-chartjs-2 chart.js \
  react-router-dom tailwindcss @tailwindcss/vite

# 4. Create environment files
# → server/.env  (see template above)
# → client/.env  (VITE_API_URL=http://localhost:5000)

# 5. Run both client & server concurrently from root
npm run dev
```

### Running Individually

```bash
# Backend only (port 5000)
cd server && npm run dev

# Frontend only (port 5173)
cd client && npm run dev
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable: `VITE_API_URL` = your Render backend URL

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `server`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node server.js`
5. Add all server environment variables from the template above

---

## 📊 Database Models

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  TeamInvite │    │  Showcase   │
│─────────────│    │─────────────│    │─────────────│
│ name        │───→│ createdBy   │    │ teamName    │
│ phone       │    │ token       │    │ members     │
│ role        │    │ members[]   │    │ projectName │
│ skills[]    │    │ teamSlots   │    │ techStack[] │
│ verified    │    │ expiresAt   │    │ upvotes     │
│ xp / level  │    └─────────────┘    │ upvotedBy[] │
│ badges[]    │                       └─────────────┘
│ heatmapGrid │
│ blindMode   │    ┌─────────────┐    ┌─────────────┐
│ voiceIntro  │    │  Message    │    │ QuizResult  │
│ githubData  │    │─────────────│    │─────────────│
└─────────────┘    │ roomId      │    │ user        │
                   │ sender      │    │ skill       │
                   │ text        │    │ score       │
                   │ prefilled   │    │ passed      │
                   └─────────────┘    │ timeTaken   │
                                      └─────────────┘
```

---

## 🧪 Edge Cases & Fallbacks

| Scenario | Handling |
|----------|----------|
| No users to match | "Be the first! Invite friends" screen |
| No skill overlap | Scores complementary roles higher; shows "Perfect complement" tag |
| GitHub fetch fails | Graceful fallback to manual skill input with toast notification |
| OTP not received | Resend button with 60-second cooldown |
| OpenAI API timeout | Fallback to template explanation based on role pairing |
| Duplicate phone registration | Finds existing user and returns fresh JWT |
| Socket disconnect | Auto-reconnect + offline badge shown |
| Team < 4 members | Remaining slots shown as "Invite a teammate" placeholders |
| Devpost API down | Serves from cache; shows "Last updated X mins ago" label |
| Unstop API down | Serves Devpost-only results silently |
| Quiz generation fails | Retries once; falls back to static question bank per skill |
| Voice upload fails | Error toast shown; existing intro preserved |
| Invite link expired | Redirects to signup with "Invite expired — join anyway" prompt |
| Blind mode rejection | Both parties notified anonymously; no identity leaked |

---

## 🎮 XP & Gamification

| Action | XP Earned | Badge Awarded |
|--------|-----------|---------------|
| Complete profile | +20 XP | — |
| Connect GitHub | +15 XP | — |
| Pass skill quiz | +50 XP | 🧠 Verified Dev |
| Form a team | +30 XP | 🤝 Team Player |
| Attend a hackathon | +40 XP | — |
| Publish a showcase | +25 XP | 🚀 Shipped It |
| Receive an upvote | +5 XP | — |

| Level | XP Threshold |
|-------|-------------|
| 🟤 Rookie | 0 XP |
| 🔵 Hacker | 100 XP |
| 🟣 Pro | 300 XP |
| 🟡 Legend | 700 XP |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

---

## 📄 License

This project is open source and available under the [NON License](LICENSE).

---

<div align="center">

### ⭐ Star this repository if DevMatch helped you find your dream hackathon team!

*"DevMatch is the all-in-one Hackathon OS — discover real hackathons, build verified teams with AI matching, brainstorm with a co-pilot, and showcase what you ship."*

**Built with ❤️ for hackathon builders everywhere**

*From finding the right hackathon to shipping and showing off — DevMatch does it all. 🚀*

</div>
