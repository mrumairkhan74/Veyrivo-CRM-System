# Veyrivo Lead Generation CRM

Veyrivo is a modern **AI-powered Lead Generation & Customer Relationship Management (CRM) platform** designed to help businesses discover prospects, manage leads, automate outreach, track sales activities, and convert prospects into customers.

The system provides a centralized workspace for managing the complete lead lifecycle — from prospect discovery to conversion.

---

## 🚀 Features

### 🎯 Lead Management

* Create, update, and delete leads
* Lead status management
* Lead source tracking
* Lead qualification
* Lead scoring
* Assign leads to team members
* Search and filter leads
* Track lead activity history

### 👥 Prospect Management

* Store prospect/company information
* Contact details
* Company details
* Industry and business type
* Website and social profiles
* Prospect notes
* Prospect activity tracking

### 📊 CRM Dashboard

* Total leads
* Qualified leads
* New leads
* Converted leads
* Lost leads
* Lead conversion rate
* Sales pipeline overview
* Recent activities
* Performance analytics

### 📈 Sales Pipeline

Track leads through different stages:

```text
New
  ↓
Contacted
  ↓
Qualified
  ↓
Proposal
  ↓
Negotiation
  ↓
Converted
```

### 🤖 AI-Powered Lead Generation

Veyrivo is designed to support AI-assisted lead generation capabilities such as:

* Prospect discovery
* Lead qualification
* Lead scoring
* Business information enrichment
* Personalized outreach generation
* Follow-up suggestions
* Lead prioritization

### 📧 Outreach & Communication

* Email outreach
* Follow-up management
* Communication history
* Email templates
* Personalized messages
* Outreach tracking

### 📋 Tasks & Activities

* Create tasks
* Assign tasks
* Set deadlines
* Track task status
* Follow-up reminders
* Activity timeline

### 🔐 Authentication & Authorization

* User registration
* User login
* Secure authentication
* Role-based access control
* Protected routes
* Session management

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* React Router
* Tailwind CSS
* Lucide React
* Axios

## Backend

* Node.js
* Express.js
* JavaScript
* REST API
* JWT Authentication

## Database

* MongoDB
* Mongoose

## Development & Deployment

* Git
* GitHub
* Vercel — Frontend
* Render / Railway / VPS — Backend
* MongoDB Atlas

---

# 📁 Project Structure

```text
veyrivo-crm/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/veyrivo-crm.git
```

Navigate into the project:

```bash
cd veyrivo-crm
```

---

## 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173
```

For the frontend, create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files to GitHub.

---

# ▶️ Running the Application

## Start Frontend

```bash
cd client
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173
```

## Start Backend

```bash
cd server
npm run dev
```

Backend will normally run at:

```text
http://localhost:5000
```

---

# 🔌 API Structure

The backend follows a RESTful API architecture.

```text
/api
│
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET  /me
│
├── /leads
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
│
├── /prospects
│
├── /companies
│
├── /tasks
│
├── /activities
│
├── /emails
│
└── /analytics
```

---

# 🗃️ Core Data Models

The CRM is built around several core entities.

### User

```text
User
├── name
├── email
├── password
├── role
├── avatar
├── isActive
└── timestamps
```

### Lead

```text
Lead
├── name
├── email
├── phone
├── company
├── website
├── source
├── status
├── score
├── assignedTo
└── timestamps
```

### Company

```text
Company
├── name
├── website
├── industry
├── location
├── employees
├── contactEmail
└── timestamps
```

### Activity

```text
Activity
├── lead
├── user
├── type
├── description
└── timestamp
```

### Task

```text
Task
├── title
├── description
├── assignedTo
├── lead
├── priority
├── status
├── dueDate
└── timestamps
```

---

# 🔄 Lead Lifecycle

Veyrivo follows a structured lead lifecycle:

```text
                    ┌──────────────┐
                    │   Prospect   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │     New      │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Contacted  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │  Qualified   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Proposal   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │ Negotiation  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │  Converted   │
                    └──────────────┘
```

Leads that do not progress can be marked as:

```text
Lost
```

---

# 🔒 Security

Veyrivo follows standard security practices including:

* Password hashing
* JWT-based authentication
* Protected API routes
* Role-based authorization
* Environment variable protection
* Request validation
* Secure HTTP headers
* CORS configuration
* Input sanitization

---

# 📊 Dashboard Metrics

The dashboard is designed to provide an overview of sales performance.

Example metrics:

```text
Total Leads
     ↓
Qualified Leads
     ↓
Contacted Leads
     ↓
Converted Leads
     ↓
Conversion Rate
```

Additional analytics can include:

* Leads by source
* Leads by status
* Conversion trends
* Team performance
* Outreach performance
* Monthly lead generation

---

# 🧠 Future AI Capabilities

The architecture is designed to support additional AI functionality.

Potential capabilities include:

* AI lead scoring
* AI-generated prospect summaries
* AI email generation
* AI follow-up recommendations
* Automated lead qualification
* Company research
* Personalized cold emails
* Lead intent analysis
* Smart sales recommendations

---

# 🧪 Testing

Frontend:

```bash
npm run test
```

Backend:

```bash
npm test
```

API testing can be performed using tools such as Postman or Insomnia.

---

# 🌍 Deployment

### Frontend

Build the frontend:

```bash
npm run build
```

The production build will be generated in:

```text
client/dist
```

### Backend

Start the production server:

```bash
npm start
```

Make sure production environment variables are configured on the hosting platform.

---

# 🗺️ Development Roadmap

## Phase 1 — Foundation

* [x] Project setup
* [x] Frontend setup
* [x] Backend setup
* [ ] MongoDB configuration
* [ ] Authentication

## Phase 2 — CRM Core

* [ ] Lead management
* [ ] Prospect management
* [ ] Company management
* [ ] Lead pipeline
* [ ] Tasks
* [ ] Activities

## Phase 3 — Analytics

* [ ] Dashboard
* [ ] Lead analytics
* [ ] Conversion analytics
* [ ] Team performance
* [ ] Sales pipeline analytics

## Phase 4 — Outreach

* [ ] Email integration
* [ ] Email templates
* [ ] Outreach campaigns
* [ ] Follow-up automation
* [ ] Communication history

## Phase 5 — AI

* [ ] AI lead scoring
* [ ] AI prospect research
* [ ] AI email generation
* [ ] AI lead qualification
* [ ] AI follow-up recommendations

## Phase 6 — Production

* [ ] Security audit
* [ ] Performance optimization
* [ ] Automated testing
* [ ] CI/CD
* [ ] Production deployment
* [ ] Monitoring & logging

---

# 🤝 Contribution

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

# 📜 License

This project is currently proprietary software developed for **Veyrivo Technologies**.

Unauthorized copying, distribution, modification, or commercial use is not permitted without permission from the project owner.

This Project is Created during internship program by **Veyrivo Technologies** created By **Umair Khan**
---

# 👨‍💻 Development

**Veyrivo CRM**

AI-powered lead generation and customer relationship management platform.

Built with the MERN stack:

**MongoDB · Express.js · React · Node.js**

---

> **Veyrivo — Find Better Leads. Build Better Relationships. Close More Deals.**
