#### Carbon Footprint Tracker and Sustainability Platform

# Overview
A full-stack MERN sustainability platform that helps users estimate their carbon footprint, track progress over time, and explore actionable ways to reduce emissions.

It combines a **carbon calculator, analytics dashboard, AI-powered suggestions, sustainability learning tools, weather & AQI insights, news updates, and a demo carbon credit marketplace** into one unified platform.

---
# Problem Statement
Understanding personal environmental impact is complex and scattered across multiple tools.

This project provides:
- A single platform to **calculate, track, and reduce carbon footprint**
- Awareness through **data, AI, and insights**
- Motivation through **goals, pledges, and analytics**

---

# Features

# Core Features
- Carbon footprint calculator (monthly & yearly)
- Category-based emissions:
  - Transport 
  - Electricity 
  - Water 
  - Food 
  - Shopping 
  - LPG 
- User authentication (Login/Signup)
- Save footprint data
- Analytics dashboard with history
- User profile management
- Sustainability pledges
- Leaderboard system
- Donation page (environmental causes)

---

# Advanced Features
- Advanced calculator inputs:
  - Digital usage 
  - Pets 
  - Work/Study 
  - Home infrastructure 
  - Green actions 
- AI-powered:
  - Emission reduction suggestions
  - Sustainability Q&A assistant
  - AI response summarization
- Interactive charts (Chart.js + Recharts)
- Weather & AQI by location
- Sustainability news hub
- Carbon credit marketplace (demo)
- Profile customization (bio, image, location)
- PDF export for pledges
- Dark mode 
- Fully responsive UI 

---

# Unique Features
- Hybrid architecture (**GraphQL + REST**)
- Real-time + stored analytics combination
- Backend-protected API integrations
- Sustainability-focused AI assistant
- Local + server hybrid data system

---

# Tech Stack

# Frontend
- React 18
- React Router DOM
- Apollo Client
- Tailwind CSS
- Framer Motion
- Chart.js & Recharts
- jsPDF
- jwt-decode

# Backend
- Node.js
- Express.js
- Apollo Server (GraphQL)
- REST APIs

# Database
- MongoDB
- Mongoose

# APIs & Integrations
- Google Gemini API (AI)
- OpenWeather API (Weather & AQI)
- NewsAPI (Sustainability news)

---

# Project Structure


root/
├── client/ # React frontend
├── server/ # Node/Express backend
├── package.json

project/
├── client/
│   ├── public/
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src/
│       ├── components/
│       │   ├── calculator/
│       │   │   ├── AISuggestions.jsx
│       │   │   ├── ChartCard.js
│       │   │   ├── InputField.js
│       │   │   ├── InputSection.jsx
│       │   │   ├── LivePreview.jsx
│       │   │   ├── ResultCard.js
│       │   │   ├── SectionCard.js
│       │   │   ├── SnapshotCard.jsx
│       │   │   ├── SummaryCard.jsx
│       │   │   ├── TransportEntry.jsx
│       │   │   └── tailwind.js
│       │   ├── Footer/
│       │   ├── Navbar/
│       │   ├── Pledges/
│       │   └── ProtectedRoute/
│       ├── data/
│       │   └── indianLocations.js
│       ├── pages/
│       │   ├── Calculator.js
│       │   ├── CarbonTrading.js
│       │   ├── Dashboard.js
│       │   ├── Home.js
│       │   ├── Profile.js
│       │   └── ...
│       ├── utils/
│       │   ├── calculate.js      ⭐
│       │   ├── emissionFactors.js ⭐
│       │   └── ...
│       ├── App.js                ⭐
│       └── index.js
└── server/
    ├── controllers/
    ├── models/
    ├── routes/                   ⭐
    ├── schema/                   ⭐
    ├── utils/
    ├── .env.example
    └── server.js                ⭐

# Important Folders

# client/
- `pages/` → Main UI pages
- `components/` → Reusable UI
- `utils/` → Business logic & API calls
- `data/` → Static data

# server/
- `routes/` → REST APIs
- `controllers/` → Logic handlers
- `schema/` → GraphQL definitions
- `models/` → MongoDB schemas
- `utils/` → Services (AI, weather, news)

---

# How It Works

# Carbon Calculation
- Uses emission factors for:
  - Fuel combustion
  - Electricity usage
  - Food habits
  - Lifestyle activities
- Logic handled in:

client/src/utils/calculate.js


#Data Flow
1. User inputs data (frontend)
2. Calculation happens instantly
3. Data optionally saved via GraphQL
4. Backend stores in MongoDB
5. Dashboard shows analytics

---

# Setup Instructions

# Quick Setup

```bash
git clone <your-repo-url>
cd project-folder
npm run install
 Environment Setup

Create:

server/.env

Add:

MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
OPENWEATHER_API_KEY=your_weather_key
NEWS_API_KEY=your_news_key
 Run Project
npm run develop
 API Overview
GraphQL
/graphql
Handles:
Auth
User data
Footprint saving
Pledges
REST APIs
/api/news → News
/api/weather → Weather
/api/aqi → Air Quality
/api/ai → AI suggestions
/api/profile → User profile
/api/trading → Marketplace
# Security
JWT Authentication
Password hashing (bcrypt)
Environment variables for secrets
Backend API proxy (no frontend exposure)
Protected routes
#Limitations
Emissions are approximate estimates
Some calculations are heuristic-based
Partial reliance on localStorage
Marketplace is demo-only
Mixed architecture (GraphQL + REST)
JWT stored in localStorage (can be improved)
# Future Improvements
More accurate India-specific emission data
Server-side analytics history
Secure auth with HttpOnly cookies
Advanced AI personalization
Real carbon credit integration
CI/CD and testing
Admin dashboard

# Final Note

This project demonstrates:
Full-stack development
Real-world problem solving
API integration
Data analytics + visualization
Security practices

Author
Harsh Prajapati
