# 🚀 TeenSpend Backend (Express & Supabase MVC API)

## Structure
- `src/config/`: Database and environment configurations
- `src/controllers/`: HTTP request handlers
- `src/models/`: Database operations (Supabase PostgreSQL / local store fallback)
- `src/routes/`: REST API route endpoints
- `src/middleware/`: JWT authentication, centralized errors, validation handlers
- `src/validators/`: Input validation chains using express-validator
- `src/utils/`: JWT sign/verify, bcrypt hashing, and suggestion engine
- `schema.sql`: Supabase PostgreSQL schema with tables, foreign keys, and indexes

## Running the Server
```bash
npm install
npm run dev
```

Server listens on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`.
