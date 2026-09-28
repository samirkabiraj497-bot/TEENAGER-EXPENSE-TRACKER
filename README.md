# 💸 TeenSpend — Teenager Expense Tracker

> **Track it. Understand it. Spend smarter.**

TeenSpend is a modern, responsive full-stack web application purpose-built for teenagers and young adults. It helps users understand where their pocket money and allowances go, track every expense with categories and payment methods, set monthly spending limits with visual progress indicators, and receive actionable, data-driven spending suggestions.

---

## 🚀 Key Features

- **Youthful, Modern UI**: Designed with glassmorphism, responsive cards, dark-mode gradients, and sleek typography tailored for teenagers.
- **Zero-Trust JWT Authentication**: Register and log in securely. Passwords hashed with `bcryptjs`. Protected API endpoints strictly verify JWT tokens.
- **Strict Data Isolation**: Users can access and modify only their own expenses, budgets, and analytics. Client-supplied user IDs are never trusted.
- **Expense Tracking with Categorization**: Filter by category, date range, search query, and sort by date or amount.
- **Monthly Budget Engine**: Set monthly limits per category with progress bars and color-coded status badges (`Safe`, `Warning`, `Near limit`, `Exceeded`).
- **Interactive Analytics Graphics**:
  - **Spending Timeline (Line/Area Chart)**: Daily and weekly spending trends powered by Recharts.
  - **Category Breakdown (Donut & Bar Charts)**: Real-time percentages and totals.
  - **Month-to-Month Comparison**: Compare current month with previous month with diffs and percentage trends.
  - **Spending Health Indicators**: Budget usage, savings potential, consistency score, and category concentration.
- **Smart Spending Suggestions**: A dedicated rule-based recommendation engine that analyzes actual spending patterns (high concentration, recurring subscriptions, transport costs, and micro-spending habits).
- **Dual Database Architecture**:
  - Works with **Supabase PostgreSQL** via `@supabase/supabase-js`.
  - Built-in zero-config persistent local store fallback for instant development testing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v6, Axios, Recharts, Lucide React, Modern Vanilla CSS |
| **Backend** | Node.js, Express.js, REST API, MVC Architecture |
| **Database** | Supabase PostgreSQL Database, SQL Schema with Indexes & Foreign Keys |
| **Security** | bcryptjs password hashing, JSON Web Tokens (JWT), CORS, express-validator |

---

## 📂 Project Architecture & Folder Structure

```text
teen-expense-tracker/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # Environment variables config
│   │   │   ├── supabase.js          # Supabase client initializer
│   │   │   └── localStore.js        # Fallback local store helper
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, GetMe
│   │   │   ├── expenseController.js  # Expense CRUD & filtering
│   │   │   ├── budgetController.js   # Budget CRUD & progress tracking
│   │   │   ├── categoryController.js # Categories list & creation
│   │   │   └── analyticsController.js# Summary, charts & suggestions
│   │   │
│   │   ├── models/
│   │   │   ├── userModel.js          # User queries & password hash storage
│   │   │   ├── expenseModel.js       # Expense queries with user ownership
│   │   │   ├── budgetModel.js        # Budget queries with unique period caps
│   │   │   └── categoryModel.js      # Category management
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # Bearer token verification
│   │   │   ├── errorMiddleware.js    # Centralized error & 404 handler
│   │   │   └── validationMiddleware.js# Input validation processor
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── expenseValidator.js
│   │   │   └── budgetValidator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js               # Token generation & verification
│   │   │   ├── password.js          # bcrypt hashing & comparison
│   │   │   └── suggestionEngine.js  # Smart recommendations generator
│   │   │
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # Server entry point
│   │
│   ├── .env                         # Backend environment variables
│   ├── .env.example
│   ├── schema.sql                   # Supabase PostgreSQL schema
│   ├── seed.sql                     # Development sample data SQL
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Top navigation & user profile
    │   │   ├── Sidebar.jsx          # Sidebar & mobile bottom navigation
    │   │   ├── ExpenseCard.jsx      # Individual expense item
    │   │   ├── ExpenseForm.jsx      # Reusable expense form
    │   │   ├── BudgetCard.jsx       # Budget card with progress indicator
    │   │   ├── SpendingChart.jsx    # AreaChart for daily/weekly spending
    │   │   ├── CategoryChart.jsx    # Donut & Bar charts for categories
    │   │   ├── StatsCard.jsx        # Summary metric tile
    │   │   └── ProtectedRoute.jsx   # Route guard for authenticated views
    │   │
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── AddExpense.jsx
    │   │   ├── Budgets.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Suggestions.jsx
    │   │   └── Profile.jsx
    │   │
    │   ├── services/
    │   │   ├── api.js               # Axios instance with auth interceptor
    │   │   ├── authService.js
    │   │   ├── expenseService.js
    │   │   ├── budgetService.js
    │   │   └── analyticsService.js
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx      # Global authentication provider
    │   │
    │   ├── hooks/
    │   │   └── useAuth.js           # Auth consumer hook
    │   │
    │   ├── utils/
    │   │   ├── currency.js          # INR (₹) formatting utilities
    │   │   └── date.js              # Date formatters & helpers
    │   │
    │   ├── App.jsx                  # Main router setup
    │   ├── main.jsx                 # React root mount
    │   └── index.css                # Vibrant modern design system
    │
    ├── .env                         # Frontend environment variables
    ├── .env.example
    └── package.json
```

---

## ⚡ Quick Start Guide

### Step 1: Start the Backend

1. Open your terminal in the backend directory:
   ```bash
   cd teen-expense-tracker/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend will start at `http://localhost:5000`.

### Step 2: Start the Frontend

1. Open a new terminal in the frontend directory:
   ```bash
   cd teen-expense-tracker/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a free account at [Supabase.com](https://supabase.com) and create a new project.
2. In the Supabase Dashboard, open the **SQL Editor**.
3. Copy the contents of [`backend/schema.sql`](file:///c:/Users/SAYAN/OneDrive/Desktop/Start/teen-expense-tracker/backend/schema.sql) and click **Run**.
4. In Supabase, navigate to **Project Settings** -> **API**.
5. Copy your **Project URL** and **service_role secret key** (never share the service role key with the frontend).
6. Open [`backend/.env`](file:///c:/Users/SAYAN/OneDrive/Desktop/Start/teen-expense-tracker/backend/.env) and update:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
   ```
7. Restart the backend server. TeenSpend will automatically connect to your live Supabase PostgreSQL database!

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `confirmPassword`)
- `POST /api/auth/login` — Log in (`email`, `password`)
- `GET /api/auth/me` — Verify token and get current user profile [Protected]

### Expenses (`/api/expenses`)
- `GET /api/expenses` — Query filtered expenses (`category`, `from`, `to`, `search`, `sort`, `page`, `limit`) [Protected]
- `GET /api/expenses/:id` — Get single expense by ID [Protected]
- `POST /api/expenses` — Create expense (`title`, `amount`, `category`, `description`, `expense_date`, `payment_method`) [Protected]
- `PUT /api/expenses/:id` — Update expense fields [Protected]
- `DELETE /api/expenses/:id` — Delete expense [Protected]

### Budgets (`/api/budgets`)
- `GET /api/budgets?month=9&year=2026` — Get category budgets with actual spending and alert levels [Protected]
- `POST /api/budgets` — Create or update budget (`category`, `amount`, `month`, `year`) [Protected]
- `PUT /api/budgets/:id` — Edit budget [Protected]
- `DELETE /api/budgets/:id` — Remove category budget [Protected]

### Categories (`/api/categories`)
- `GET /api/categories` — Get default and custom categories
- `POST /api/categories` — Add new category [Protected]

### Analytics & Insights (`/api/analytics`)
- `GET /api/analytics/summary?period=month` — Key metrics: total spent, today's spending, average daily, remaining budget, top category, health indicators [Protected]
- `GET /api/analytics/category?period=month` — Category percentages and totals for donut/bar charts [Protected]
- `GET /api/analytics/monthly?period=month` — Daily and weekly timeline data for area charts [Protected]
- `GET /api/analytics/comparison` — Month-to-month shift (totals, transaction count, average size, category comparison) [Protected]
- `GET /api/analytics/suggestions` — Personalized rule-based recommendations [Protected]

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: `bcryptjs` salted hashing prevents storing plaintext credentials.
2. **Stateless JWT Tokens**: Tokens signed with secret keys and verified on every protected route.
3. **Database-Level User Isolation**: Every query filters by `user_id` extracted from verified JWT tokens. Client-provided user IDs are strictly ignored for authorization.
4. **Input Validation**: Backend validator middleware validates types, positive values, date strings, and prevents malformed requests.
5. **Secret Protection**: All sensitive tokens and database keys are managed via `.env` and kept strictly on the backend.
