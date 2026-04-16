# HR Workforce Management System - Setup Instructions

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v16+): [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (v12+): [postgresql.org](https://www.postgresql.org/)
- **Git** (optional): [git-scm.com](https://git-scm.com/)

---

## Project Structure

```
hr-system/
├── backend/                          # Node.js/Express API
│   ├── database/
│   │   ├── connection.js             # PostgreSQL connection pool
│   │   ├── schema.sql                # Database schema
│   │   └── seed.sql                  # Sample data
│   ├── middleware/
│   │   └── auth.js                   # JWT & role-based auth
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── employees.js              # Employee CRUD
│   │   ├── departments.js            # Department endpoints
│   │   ├── leave.js                  # Leave management (Phase 2)
│   │   ├── performance.js            # Performance reviews (Phase 2)
│   │   ├── payroll.js                # Payroll endpoints (Phase 2)
│   │   ├── training.js               # Training enrollment (Phase 2)
│   │   └── recruitment.js            # Job postings & apps (Phase 2)
│   ├── .env                          # Environment variables
│   ├── index.js                      # Main server file
│   └── package.json                  # Dependencies
│
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API integration
│   │   ├── context/                  # Auth context & state
│   │   └── App.jsx                   # Main App component
│   └── package.json                  # Dependencies
│
└── docs/
    ├── ER_DIAGRAM.md                 # Entity relationship diagram
    ├── ARCHITECTURE.md               # System architecture
    ├── USER_STORIES.md               # Role-based user stories
    └── API_DOCUMENTATION.md          # API endpoints (Phase 2)
```

---

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Open PostgreSQL CLI (psql) or pgAdmin and create the database:

```sql
CREATE DATABASE hr_management;
```

Alternatively, using command line:

```bash
createdb hr_management
```

### 1.2 Load Database Schema

Navigate to the backend directory and load the schema:

```bash
cd backend
psql -U postgres -d hr_management -f database/schema.sql
```

You should see output confirming all tables were created.

### 1.3 Load Seed Data

Load sample data for testing:

```bash
psql -U postgres -d hr_management -f database/seed.sql
```

This creates:
- 7 departments
- 15 employees with multi-level hierarchy
- 4 leave requests
- 4 performance reviews with 360° feedback
- 4 payroll records
- 4 training enrollments
- 4 job postings
- 4 job applications

### 1.4 Verify Database Connection

```bash
psql -U postgres -d hr_management -c "SELECT COUNT(*) as employee_count FROM EMPLOYEE;"
```

Expected output: `employee_count = 15`

---

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Edit `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/hr_management
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=hr_management
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRY=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**⚠️ Update `DATABASE_PASSWORD` to match your PostgreSQL password!**

### 2.3 Start Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════════════════╗
║  HR Workforce Management System - Backend Server     ║
║  Running on: http://localhost:5000                  ║
║  Environment: development                           ║
╚═══════════════════════════════════════════════════════╝

✓ Connected to PostgreSQL database
✓ Database connection verified at: 2026-04-16T22:00:00.000Z
```

### 2.4 Test Backend API

In another terminal, verify the API is working:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "HR Workforce Management System Backend",
  "timestamp": "2026-04-16T22:00:00.000Z"
}
```

---

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3.2 Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 3.3 Access the Application

Open your browser and navigate to:
```
http://localhost:5173/
```

---

## Step 4: API Testing (Backend Only)

If you want to test the API before the frontend is ready, use **Postman**, **curl**, or **REST Client** (VS Code extension).

### 4.1 Login and Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.smith",
    "password": "any_password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "employeeId": 1,
    "username": "john.smith",
    "role": "HR_ADMIN",
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

### 4.2 Get All Employees (using token)

```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 4.3 Get Departments

```bash
curl http://localhost:5000/api/departments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Test Users (Seed Data)

Use these credentials to test different roles:

| Username | Password | Role | Employee |
|----------|----------|------|----------|
| john.smith | any | HR_ADMIN | CEO |
| sarah.johnson | any | MANAGER | VP Engineering |
| michael.brown | any | MANAGER | VP Finance |
| emily.davis | any | HR_ADMIN | Head of HR |
| alex.taylor | any | EMPLOYEE | Senior Backend Dev |
| maria.thomas | any | EMPLOYEE | Frontend Developer |

---

## Troubleshooting

### Backend Connection Issues

**Error: `connect ECONNREFUSED 127.0.0.1:5432`**
- PostgreSQL is not running
- Solution: Start PostgreSQL service

**Error: `password authentication failed`**
- Wrong PostgreSQL password in `.env`
- Solution: Update `.env` with correct password

**Error: `database "hr_management" does not exist`**
- Database not created
- Solution: Run `createdb hr_management`

### Frontend Issues

**Error: `CORS error` when calling API**
- Backend CORS_ORIGIN doesn't match frontend URL
- Solution: Update `.env` CORS_ORIGIN to match frontend URL

**Error: `Module not found`**
- Dependencies not installed
- Solution: Run `npm install` in frontend directory

### Port Already in Use

**Error: `Error: listen EADDRINUSE :::5000`**
- Port 5000 is already in use
- Solution: Change PORT in `.env` or kill process using the port

**Error: `Error: listen EADDRINUSE :::5173`**
- Port 5173 is already in use
- Solution: Update frontend vite config to use different port

---

## Development Workflow

### Running Both Frontend and Backend

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173/` in your browser.

### Making Database Changes

1. Modify schema in `backend/database/schema.sql`
2. Drop and recreate database:
   ```bash
   dropdb hr_management
   createdb hr_management
   psql -U postgres -d hr_management -f backend/database/schema.sql
   psql -U postgres -d hr_management -f backend/database/seed.sql
   ```

### Adding New Seed Data

1. Open `backend/database/seed.sql`
2. Add INSERT statements
3. Reload database (see above)

---

## Phase 1 Completion Checklist

- ✅ PostgreSQL database created
- ✅ Database schema loaded (all tables created)
- ✅ Seed data loaded (15 employees, sample leave/reviews/payroll/training/recruitment)
- ✅ Backend dependencies installed
- ✅ Backend environment variables configured
- ✅ Backend server starts without errors
- ✅ Database connection verified
- ✅ Frontend project initialized with Vite + React
- ✅ Frontend dependencies installed
- ✅ Frontend dev server starts successfully
- ✅ ER Diagram documentation complete
- ✅ API structure defined (routes, middleware, models)

---

## Next Steps (Phase 2)

See [Phase 2: Backend API & Authentication](../ARCHITECTURE.md) for implementing:
1. Complete authentication system (JWT + role-based access)
2. Full REST API endpoints for all modules
3. Business logic (approvals, workflows, calculations)
4. Error handling and logging

---

## Quick Start Command

One-command setup (after database creation):

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

Then open `http://localhost:5173/`

---

## Docker Setup (Optional)

For containerized deployment, see `docker-compose.yml` (to be created in later phases).

---

## Support & Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **JWT Intro:** https://jwt.io/introduction
