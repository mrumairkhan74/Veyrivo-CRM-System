# Veyrivo CRM

> **Veyrivo CRM** is an intelligent lead management and sales CRM designed to help businesses discover, organize, qualify, follow up with, and convert potential clients from one centralized platform.

---

## 🚧 Project Status

**Current Stage:** Frontend MVP Development

**Frontend:** In Progress
**Backend:** Not Started
**Database:** Not Connected
**Authentication:** UI Completed / Backend Pending
**API Integration:** Pending

The project is currently being developed with **dummy frontend data**. Backend integration will replace the dummy data with real database records.

---

# 🎯 MVP Goal

The primary goal of Veyrivo CRM MVP is to provide a simple but production-oriented CRM workflow:

```text
Discover Lead
      ↓
Create Lead
      ↓
Qualify Lead
      ↓
Track Status
      ↓
Follow Up
      ↓
Manage Pipeline
      ↓
Convert Lead
      ↓
Analyze Performance
```

The MVP focuses primarily on **Lead Management**, while building the foundation for companies, contacts, follow-ups, analytics, and AI-assisted qualification.

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Lucide React
* React Icons

### Frontend Principles

* Component-based architecture
* Reusable UI components
* Responsive design
* Mobile-first layouts
* Modular page structure
* Clean separation between layouts, pages, and components

---

## Backend

### Planned Stack

* Node.js
* Express.js
* JavaScript
* MongoDB
* Mongoose

Backend development will start after the main frontend MVP workflow is completed.

---

## Database

### Planned

MongoDB will be used as the primary database.

The current frontend data structure is being designed around the planned CRM entities so that integration can be performed without redesigning the entire UI.

---

# 🎨 Veyrivo Design System

Veyrivo uses a modern SaaS-style interface.

### Primary Visual Direction

* Cyan
* Blue
* Purple
* White
* Slate / neutral colors

### Main Gradient

```text
Cyan → Blue → Purple
```

### Example Tailwind Gradient

```jsx
bg-gradient-to-r from-cyan-500 to-purple-600
```

### Background

```text
#F8FAFC
```

The interface should remain clean, professional, minimal, and suitable for a modern B2B SaaS product.

---

# 📁 Current Frontend Structure

The project currently follows a layout/page/component-based structure.

```text
src/
│
├── assets/
│
├── components/
│   ├── AdminLayout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatusCard.jsx
│   │   │
│   │   └── leads/
│   │       ├── CreateLead.jsx
│   │       ├── LeadTable.jsx
│   │       ├── ViewLead.jsx
│   │       └── DeleteLead.jsx
│   │
│   └── PublicLayout/
│
├── data/
│   └── LeadData.js
│
├── layouts/
│   ├── PublicLayouts.jsx
│   └── AdminLayouts.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Page404.jsx
│   │
│   ├── public/
│   │   └── Home.jsx
│   │
│   └── admin/
│       ├── AdminDashboard.jsx
│       └── Leads.jsx
│
├── App.jsx
└── main.jsx
```

---

# 🌐 Routing

Current route structure:

```text
/
├── Public Layout
│   └── Home
│
├── /login
│   └── Login
│
├── /signup
│   └── Signup
│
├── /admin
│   └── Admin Dashboard
│
├── /admin/leads
│   └── Leads
│
└── *
    └── 404 Page
```

The `/admin` section is intended to become protected once backend authentication is implemented.

---

# 🏠 Landing Page

The public landing page currently contains the foundation for:

## Navbar

Navigation includes:

* Home
* Features
* How It Works
* Solutions
* Login
* Get Started

Mobile responsive navigation has also been implemented.

---

## Features Section

Current planned/product features:

### 1. Lead Management

Organize, track, score, and manage prospects from first contact to conversion.

### 2. AI Lead Qualification

Use AI to summarize requirements, identify urgency, detect requested services, and recommend next actions.

### 3. Smart Follow-Ups

Manage calls, meetings, tasks, reminders, and future follow-ups.

### 4. Sales Pipeline

Visualize opportunities and move leads through the sales process.

### 5. Companies & Contacts

Organize companies, decision-makers, contact information, and relationship history.

### 6. Powerful Analytics

Analyze leads, pipeline, conversion rates, services, and sales activity.

---

# 🔄 How It Works

The landing page explains the CRM workflow in four steps:

```text
01 Discover
      ↓
02 Qualify
      ↓
03 Follow Up
      ↓
04 Convert
```

---

# 💡 Solutions Section

The Solutions section communicates how Veyrivo can help businesses:

* Generate and organize leads
* Qualify prospects
* Manage sales pipelines
* Improve follow-up
* Track customer relationships
* Understand sales performance

---

# 🔐 Authentication

Current frontend pages:

```text
/login
/signup
```

Login UI includes:

* Email
* Password
* Login button
* Google login option

Signup UI includes:

* Name
* Email
* Password
* Confirm password
* Signup button
* Google signup option

### Backend Authentication

Still pending.

Planned authentication:

```text
User
 ↓
Signup/Login
 ↓
Authentication
 ↓
Token/Session
 ↓
Protected Admin Routes
 ↓
CRM Dashboard
```

---

# 📊 Admin Dashboard

The dashboard currently contains:

## Header

Dynamic greeting:

```text
Good Morning
Good Afternoon
Good Evening
```

Time filters:

* 7 Days
* 1 Month
* 3 Months

Main action:

```text
+ Add Lead
```

---

## Dashboard Stats

Current cards:

### Total Leads

Example:

```text
1,024
+12.8%
```

### Active Deals

Example:

```text
86
+8%
```

### Pipeline Value

Example:

```text
$45,000
+15%
```

### Conversion Rate

Example:

```text
24.5%
+4.2%
```

These are currently dummy values.

Later they will be calculated from real database records.

---

# 👥 Lead Management

Lead Management is currently the **main MVP module**.

The Leads page contains:

* Lead list
* Search
* Filters
* Status filtering
* Temperature filtering
* Source filtering
* Pagination
* Create Lead
* View Lead
* Edit Lead
* Delete Lead

---

# 🧾 Lead Database Structure

The planned Lead entity contains:

| Field             | Type         | Purpose              |
| ----------------- | ------------ | -------------------- |
| id                | UUID         | Primary identifier   |
| organization_id   | UUID         | Organization         |
| company_id        | UUID         | Related company      |
| contact_id        | UUID         | Related contact      |
| title             | VARCHAR(200) | Lead title           |
| description       | TEXT         | Lead description     |
| status            | ENUM         | Lead status          |
| temperature       | ENUM         | Lead temperature     |
| score             | SMALLINT     | Score 0–100          |
| source_id         | UUID         | Lead source          |
| service_id        | UUID         | Requested service    |
| industry_id       | UUID         | Industry             |
| estimated_value   | NUMERIC      | Opportunity value    |
| currency          | VARCHAR(3)   | Currency             |
| timeline          | ENUM         | Expected timeline    |
| budget_range      | ENUM         | Budget               |
| owner_id          | UUID         | Assigned owner       |
| ai_summary        | TEXT         | AI-generated summary |
| ai_result         | JSONB        | AI analysis          |
| qualified_at      | TIMESTAMPTZ  | Qualification date   |
| last_contacted_at | TIMESTAMPTZ  | Last contact         |
| next_follow_up_at | TIMESTAMPTZ  | Next follow-up       |
| created_at        | TIMESTAMPTZ  | Created date         |
| updated_at        | TIMESTAMPTZ  | Updated date         |
| deleted_at        | TIMESTAMPTZ  | Soft delete          |

---

# 📌 Lead Status

Supported statuses:

```text
New
Contacted
Qualified
Nurture
Lost
```

Workflow:

```text
New
 ↓
Contacted
 ↓
Qualified
 ↓
Nurture
 ↓
Converted / Lost
```

---

# 🌡️ Lead Temperature

```text
Hot
Warm
Cold
Unknown
```

---

# 🎯 Lead Score

Lead score ranges from:

```text
0 → 100
```

Later the score can be calculated using:

* Budget
* Timeline
* Company information
* Requested service
* Engagement
* Source
* AI analysis

---

# 🔎 Lead Search & Filters

Current filters:

### Status

```text
All
New
Contacted
Qualified
Nurture
Lost
```

### Temperature

```text
All
Hot
Warm
Cold
Unknown
```

### Source

```text
All
LinkedIn
Referral
Website
Cold Email
Google
Facebook
```

Search supports:

```text
Name
Company
Email
```

---

# ➕ Create Lead

The Create Lead modal currently supports:

## Lead Details

* Title
* Description
* Status
* Temperature
* Score
* Estimated Value
* Currency
* Timeline
* Budget Range

## Relationships

* Company
* Contact
* Source
* Service
* Industry
* Owner

## Follow Up

* Next Follow Up

The frontend currently generates a temporary ID and adds the lead to the local state.

Later:

```text
Create Lead
     ↓
POST /api/leads
     ↓
Express
     ↓
MongoDB
     ↓
Return Created Lead
     ↓
Update UI
```

---

# 👀 View Lead

A Lead Details panel/modal is being developed.

It should eventually show:

* Lead title
* Company
* Contact
* Description
* Status
* Temperature
* Score
* Source
* Service
* Industry
* Estimated value
* Timeline
* Budget
* Owner
* Last contacted
* Next follow-up
* AI summary
* Activity history

---

# ✏️ Edit Lead

**Next immediate feature.**

The Edit functionality should reuse the Create Lead form where possible.

Instead of creating:

```text
CreateLead.jsx
EditLead.jsx
```

we should consider a reusable:

```text
LeadForm.jsx
```

with:

```jsx
<LeadForm mode="create" />

<LeadForm
    mode="edit"
    lead={selectedLead}
/>
```

This avoids duplicate form logic.

---

# 🗑️ Delete Lead

Frontend delete functionality has been implemented.

Current behavior:

```text
Delete
 ↓
Remove from local state
 ↓
Table updates immediately
```

Backend implementation will later use soft deletion:

```text
deleted_at = current timestamp
```

instead of permanently removing the database record.

---

# 🏢 Companies

### Status

**Not started**

Planned functionality:

* Company list
* Search
* Filters
* Create company
* View company
* Edit company
* Delete/archive company
* Company contacts
* Company leads
* Company activity

---

# 👤 Contacts

### Status

**Not started**

Planned functionality:

* Contact list
* Search
* Create contact
* Edit contact
* View contact
* Company relationship
* Lead relationship
* Contact activity

---

# 📅 Follow-Ups

### Status

**Not started**

Planned functionality:

* Tasks
* Calls
* Meetings
* Reminders
* Next follow-up
* Follow-up history

Possible workflow:

```text
Lead
 ↓
Schedule Follow-Up
 ↓
Reminder
 ↓
Contact
 ↓
Update Lead
 ↓
Schedule Next Action
```

---

# 📈 Analytics

### Status

**Not started**

Planned analytics:

* Total leads
* Qualified leads
* Lost leads
* Conversion rate
* Pipeline value
* Lead sources
* Lead temperature
* Sales performance
* Service performance
* Activity performance

Charts can later be implemented using a charting library.

---

# 🤖 AI Features

### Status

**Planned**

Potential AI functionality:

### Lead Summary

Generate a concise summary from lead information.

### Lead Qualification

Analyze:

```text
Budget
Timeline
Service
Company
Requirements
```

and produce a qualification score.

### Recommended Action

Example:

```text
Recommended Action:
Schedule a discovery call within 24 hours.
```

### AI Result

The database structure already allows an AI result object.

---

# 🔌 Backend API Plan

Planned API structure:

```text
/api/v1/auth
/api/v1/leads
/api/v1/companies
/api/v1/contacts
/api/v1/sources
/api/v1/services
/api/v1/industries
/api/v1/follow-ups
/api/v1/analytics
```

---

# 🔐 Planned API Authentication

Protected endpoints will require authentication.

Example:

```text
POST /api/v1/leads
GET  /api/v1/leads
GET  /api/v1/leads/:id
PATCH /api/v1/leads/:id
DELETE /api/v1/leads/:id
```

---

# 🧪 Current Development Strategy

We are intentionally using:

```text
Dummy Data
     ↓
Complete UI
     ↓
Complete Frontend CRUD
     ↓
Test UX
     ↓
Build Backend
     ↓
Connect API
     ↓
Replace Dummy Data
```

This prevents frontend and backend development from becoming tangled too early.

---

# 🚀 Immediate Next Steps

## Phase 1 — Finish Leads

### Current

* [x] Lead table
* [x] Dummy lead data
* [x] Search/filter foundation
* [x] Status filter
* [x] Temperature filter
* [x] Source filter
* [x] Pagination
* [x] Create Lead
* [x] Delete Lead
* [x] View Lead foundation

### Next

* [ ] Edit Lead
* [ ] Improve View Lead
* [ ] Empty state
* [ ] Loading state
* [ ] Search implementation
* [ ] Filter improvements
* [ ] Pagination edge cases
* [ ] Lead activity/timeline

---

# Phase 2 — Dashboard

* [x] Header
* [x] Greeting
* [x] Date filters
* [x] Stats cards

Next:

* [ ] Pipeline chart
* [ ] Lead status chart
* [ ] Recent leads
* [ ] Upcoming follow-ups
* [ ] Recent activity
* [ ] Dashboard responsive polish

---

# Phase 3 — CRM Entities

* [ ] Companies
* [ ] Contacts
* [ ] Sources
* [ ] Services
* [ ] Industries
* [ ] Owners/users

---

# Phase 4 — Follow-Up System

* [ ] Tasks
* [ ] Calls
* [ ] Meetings
* [ ] Reminders
* [ ] Follow-up timeline

---

# Phase 5 — Backend

* [ ] Node.js setup
* [ ] Express setup
* [ ] MongoDB connection
* [ ] Mongoose models
* [ ] Authentication
* [ ] JWT/session strategy
* [ ] API routes
* [ ] Controllers
* [ ] Services
* [ ] Validation
* [ ] Error handling
* [ ] Authorization
* [ ] Soft delete

---

# Phase 6 — Integration

Replace:

```text
dummy leads
```

with:

```text
MongoDB → Express API → React
```

Implement:

* [ ] API service layer
* [ ] API loading states
* [ ] API error handling
* [ ] Authentication state
* [ ] Protected routes
* [ ] CRUD API integration

---

# Phase 7 — AI

* [ ] AI lead summary
* [ ] AI qualification
* [ ] Lead scoring
* [ ] Recommended next action
* [ ] AI result storage

---

# Phase 8 — Production

* [ ] Environment variables
* [ ] Production database
* [ ] API deployment
* [ ] Frontend deployment
* [ ] CORS configuration
* [ ] Security review
* [ ] Error monitoring
* [ ] Performance optimization
* [ ] Production testing

---

# 📍 Current Position

```text
Landing Page             ██████████ 100%
Navigation               ██████████ 100%
Responsive Layout        █████████░ 90%
Authentication UI        ████████░░ 80%
Admin Layout             ██████████ 100%
Dashboard Foundation     ███████░░░ 70%

Lead Management          ████████░░ 80%
Create Lead              █████████░ 90%
Lead Table               █████████░ 90%
Search / Filters         ████████░░ 80%
View Lead                ██████░░░░ 60%
Edit Lead                ░░░░░░░░░░ 0%

Companies                ░░░░░░░░░░ 0%
Contacts                 ░░░░░░░░░░ 0%
Follow-Ups               ░░░░░░░░░░ 0%
Analytics                ░░░░░░░░░░ 0%
Backend                  ░░░░░░░░░░ 0%
Database Integration     ░░░░░░░░░░ 0%
AI Features              ░░░░░░░░░░ 0%
```

---

# 🧭 Current Development Rule

Do not move to backend integration yet.

First complete the core frontend workflow:

```text
Dashboard
    ↓
Leads
    ↓
Create
    ↓
View
    ↓
Edit
    ↓
Delete
    ↓
Search
    ↓
Filter
    ↓
Pagination
```

Then move to:

```text
Companies
Contacts
Follow-Ups
Analytics
```

After the frontend MVP is stable:

```text
Backend
   ↓
MongoDB
   ↓
Authentication
   ↓
API
   ↓
Frontend Integration
```

---

# 🏁 MVP Definition

Veyrivo CRM MVP is considered complete when an authenticated user can:

1. Create an account
2. Login
3. Access the dashboard
4. Create a lead
5. View leads
6. Search leads
7. Filter leads
8. View lead details
9. Edit a lead
10. Delete/archive a lead
11. Manage companies
12. Manage contacts
13. Schedule follow-ups
14. View basic sales analytics

AI functionality can initially remain optional and be introduced after the core CRM workflow is stable.

---

# 📌 Handoff Context

If development is continued in a new conversation, start by reading this README.

### Current immediate task:

**Finish the Leads module, specifically Edit Lead and polish View Lead.**

After that:

```text
Leads
 ↓
Dashboard charts/activity
 ↓
Companies
 ↓
Contacts
 ↓
Follow-Ups
 ↓
Backend architecture
 ↓
MongoDB
 ↓
API integration
```

The frontend currently uses **JavaScript, React, Vite, Tailwind CSS, React Router, Lucide React and React Icons**.

Do **not** switch the frontend to TypeScript unless explicitly requested.

---

# 👨‍💻 Project Philosophy

Veyrivo is being developed as a real SaaS-style CRM rather than a simple portfolio CRUD application.

Priority order:

```text
UX
 ↓
Architecture
 ↓
Data Model
 ↓
Business Logic
 ↓
API
 ↓
Security
 ↓
Performance
 ↓
AI
```

The goal is not to build hundreds of features.

The goal is to build a **small CRM that actually works end-to-end**.
