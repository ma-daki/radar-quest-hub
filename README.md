# Opportunity Radar

> Discover global scholarships, hackathons, internships, fellowships, and bootcamps — all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-opportunity--rader.vercel.app-blue?style=flat-square&logo=vercel)](https://opportunity-rader.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Overview

Students and young people miss out on life-changing opportunities every day — not because they don't exist, but because they're buried across dozens of websites, newsletters, university portals, and social media feeds.

**Opportunity Radar** solves this by aggregating and centralizing opportunities into one searchable, deadline-aware platform so students can discover and act before it's too late.

---

## The Problem

| Challenge | Impact |
|---|---|
| Opportunities scattered across the web | Hard to track and easily overlooked |
| No centralized deadline tracking | Students miss application windows |
| Requires searching many platforms | Time-consuming and inefficient |
| Valuable programs go unnoticed | Lost career and education potential |

---

## Features

### Opportunity Discovery
Browse a curated feed of global opportunities across five categories: **Scholarships**, **Internships**, **Hackathons**, **Fellowships**, and **Bootcamps**.

### Deadline Sorting
Sort opportunities by urgency so you always know what's closing soon and never miss a deadline.

### Email Alerts
Subscribe with your email to get notified when new opportunities matching your interests are added.

### Web Aggregation
The platform pulls opportunities from multiple online sources, continuously expanding the number of available listings.

### Pagination
Comfortably browse large listings across multiple pages without being overwhelmed.

### Dark Mode
Toggle between light and dark themes for a comfortable viewing experience at any time of day.

### Category Filtering
Filter opportunities by type to quickly surface what's most relevant to you.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Language | TypeScript |
| UI Components | Tailwind CSS + shadcn/ui |
| Styling | Tailwind CSS |
| Data Fetching | APIs & Web Scraping |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── opportunity-card.tsx
│   ├── navbar.tsx
│   ├── filters.tsx
│   └── pagination.tsx
├── pages/
│   ├── home.tsx
│   └── explore.tsx
├── hooks/
│   └── use-opportunities.ts
└── lib/
    └── utils.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/opportunity-radar.git
cd opportunity-radar
npm install
```

### Development

```bash
npm run dev
```

Starts the local development server at `http://localhost:5173`.

### Build

```bash
npm run build
```

Generates an optimized production build in the `dist/` folder.

---

## Deployment

Opportunity Radar is deployed on **Vercel**.

🔗 **Live:** [https://opportunity-rader.vercel.app/](https://opportunity-rader.vercel.app/)

To deploy your own instance, connect the repository to [Vercel](https://vercel.com/) and it will auto-deploy on every push to `main`.

---

## Impact

Opportunity Radar is built to democratize access to global opportunities for young people everywhere by:

- Reducing the time it takes to find relevant programs
- Preventing students from missing application deadlines
- Increasing awareness of scholarships and learning programs
- Helping students discover career-building opportunities worldwide

---

## MIT.
