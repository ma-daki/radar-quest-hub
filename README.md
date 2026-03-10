Opportunity Radar

A platform that helps students and young people discover global opportunities such as scholarships, hackathons, internships, fellowships, and bootcamps in one place. Opportunity Radar aggregates opportunities from across the web and organizes them so users can easily find and apply before deadlines.

The Problem

Students often struggle to find opportunities because they are scattered across multiple websites, university pages, newsletters, and social media platforms.

This creates several problems:

Opportunities are difficult to track

Deadlines are easily missed

Students must search many platforms to find relevant programs

Many valuable opportunities go unnoticed

Opportunity Radar solves this by centralizing opportunities into one searchable platform where users can quickly discover and track them.

Features
Opportunity Discovery

Browse opportunities such as scholarships, internships, hackathons, fellowships, and bootcamps.

Deadline Sorting

Opportunities can be sorted by deadline urgency, helping users quickly identify programs closing soon.

Email Alerts

Users can subscribe with their email to receive notifications when new opportunities are added.

Web Aggregation

The platform gathers opportunities from multiple online sources, expanding the number of available listings.

Pagination

Browse multiple pages of opportunities when large numbers of listings are available.

Dark Mode

Toggle between light and dark themes for a better viewing experience.

Category Filtering

Filter opportunities based on type (Scholarships, Hackathons, Internships, Fellowships, Bootcamps).

Tech Stack
Layer	Technology
Frontend	React
Build Tool	Vite
Language	TypeScript
UI	Tailwind CSS + shadcn/ui
Hosting	Vercel
Data Fetching	APIs & Web Scraping
Styling	Tailwind CSS
Project Structure
src/

components/
  opportunity-card.tsx
  navbar.tsx
  filters.tsx
  pagination.tsx

pages/
  home.tsx
  explore.tsx

hooks/
  use-opportunities.ts

lib/
  utils.ts
Getting Started
Prerequisites

Node.js 18+

npm

Install
npm install
Development
npm run dev

Runs the development server locally.

Build
npm run build
Deployment

The project is deployed using Vercel.

Live project:
https://opportunity-rader.vercel.app/

Impact

Opportunity Radar makes it easier for young people to access global opportunities by:

Reducing the time needed to find programs

Preventing students from missing deadlines

Increasing awareness of scholarships and learning programs

Helping students discover career-building opportunities worldwide

The goal is to democratize access to opportunities for students everywhere.

License

MIT License
