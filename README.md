
<div align="center">

# DevTrack
**Track. Reflect. Evolve.**

Your intelligent coding journal with insights that matter.

<img src="https://github.com/rishirai13/DevTrack/blob/main/DevTrack.png" alt="DevTrack Interface" width="700">

[![Live Demo](https://img.shields.io/badge/Live_Demo-DevTrack-5865F2?style=for-the-badge)](https://dev-track-three.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/rishirai13/DevTrack)

</div>

---

## 🎯 What It Does

DevTrack is more than a logging tool—it's your personal growth engine. Capture daily progress, discover patterns in your learning journey, and stay motivated with streak tracking and visual insights. Built for developers who believe in the power of reflection.

**✨ Highlights:** Seamless GitHub OAuth • Real-time Analytics Dashboard • Smart Tag-based Organization • Shareable Public Profiles • Interactive Data Visualizations

---

## ⚡ Tech Stack

```
Frontend    →  Next.js 15 • TypeScript • TailwindCSS • shadcn/ui
Backend     →  Supabase
Database    →  Supabase
Analytics   →  Chart.js for dynamic visualizations
Deployment  →  Vercel (Edge Functions) 
```

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/rishirai13/DevTrack.git
cd DevTrack
npm install

# Setup environment
cp .env.example .env
# Configure: DATABASE_URL, NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET

# Initialize database
npx prisma migrate dev
npx prisma generate

# Launch dev server
npm run dev
```

Open `http://localhost:3000` and start tracking 🎉

---

## 💎 Core Features

🔐 **Authentication** — Secure GitHub OAuth & email-based login with NextAuth

📊 **Progress Dashboard** — Real-time streak tracking, weekly patterns, and productivity metrics

🏷️ **Smart Tagging** — Organize logs by technology, project, or custom categories

📈 **Visual Analytics** — Beautiful Chart.js graphs showing your coding distribution and trends

🌐 **Public Profiles** — Share your developer journey with optional profile pages

🎨 **Premium UI** — Crafted with shadcn/ui components and TailwindCSS for pixel-perfect design

---

## 🧠 Why DevTrack?

This project demonstrates production-grade architecture:

- **Modern Auth Patterns** — Secure session management with NextAuth and OAuth providers
- **Scalable Database Design** — Prisma ORM with PostgreSQL for type-safe queries
- **Real-time Insights** — Server-side analytics aggregation with client-side visualization
- **Performance First** — Next.js 15 App Router with optimized rendering and caching
- **Clean Code** — TypeScript throughout with strict type checking

Perfect for portfolio showcases, demonstrating full-stack expertise from auth to deployment.

---

## 🛣️ Roadmap

- [ ] AI-powered coding insights and recommendations
- [ ] GitHub commit sync for automatic log generation
- [ ] Team workspaces and collaboration features
- [ ] Mobile app with React Native
- [ ] Export logs as PDF/Markdown

---

<div align="center">

**Built with 💙 by [Rishi Rai](https://github.com/rishirai13)**

⭐ Star this repo if it inspires you • Contributions welcome

[Report Bug](https://github.com/rishirai13/DevTrack/issues) • [Request Feature](https://github.com/rishirai13/DevTrack/issues)

</div>
