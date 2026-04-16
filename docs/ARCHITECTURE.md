# HR Workforce Management System - Architecture

## System Overview

The HR Workforce Management System is a full-stack, role-based application designed to manage all aspects of human resources operations. The system follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│                   (React + Vite SPA)                        │
│  • Six System Idea Cards with Role-Based Tabs              │
│  • ER Diagram Visualization                                │
│  • Employee Management UI                                  │
│  • Leave, Performance, Payroll, Training, Recruitment UI  │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ HTTP/HTTPS
┌──────────────────────┴──────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│              (Node.js + Express Backend)                    │
│  • JWT Authentication & RBAC                               │
│  • RESTful API Endpoints                                   │
│  • Business Logic & Workflows                              │
│  • Error Handling & Logging                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │ TCP Connection Pool
┌──────────────────────┴──────────────────────────────────────┐
│                   DATA LAYER                               │
│          (PostgreSQL Relational Database)                  │
│  • 10 Entities with Relationships                          │
│  • Self-Referencing Employee Hierarchy                     │
│  • 360° Feedback Storage                                   │
│  • Audit Trails (created_at, updated_at)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend (React + Vite)

```
src/
├── components/
│   ├── Cards/
│   │   └── SystemCard.jsx              # Six system idea cards
│   ├── Diagram/
│   │   └── ERDiagram.jsx               # ER diagram visualization
│   ├── Employee/
│   │   ├── EmployeeList.jsx            # Employee table with search/filter
│   │   ├── EmployeeForm.jsx            # Create/edit form
│   │   └── EmployeeHierarchy.jsx       # Manager-subordinate tree
│   ├── Navigation/
│   │   ├── Sidebar.jsx                 # Role-based menu
│   │   └── Header.jsx                  # User info & logout
│   └── Common/
│       ├── Input.jsx                   # Input field
│       ├── Select.jsx                  # Dropdown
│       └── Modal.jsx                   # Modal dialog
│
├── pages/
│   ├── Dashboard.jsx                   # Role-based dashboard
│   ├── Login.jsx                       # Authentication page
│   ├── EmployeeManagement/
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeDetail.jsx
│   │   └── EmployeeForm.jsx
│   ├── LeaveManagement/                # Phase 2
│   ├── PerformanceManagement/          # Phase 2
│   ├── PayrollManagement/              # Phase 2
│   ├── TrainingManagement/             # Phase 2
│   └── Recruitment/                    # Phase 2
│
├── services/
│   ├── api.js                          # Axios wrapper for API calls
│   └── authService.js                  # Auth-related API calls
│
├── context/
│   └── AuthContext.jsx                 # Global auth state (JWT, user, role)
│
├── hooks/
│   ├── useAuth.js                      # Auth hook
│   └── useFetch.js                     # Data fetching hook
│
├── App.jsx                             # Main component with routing
└── main.jsx                            # React entry point
```

**Technologies:**
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Material-UI / Tailwind** - Component styling (Phase 3)

---

### Backend (Node.js + Express)

```
backend/
├── database/
│   ├── connection.js                   # PostgreSQL connection pool
│   ├── schema.sql                      # Database schema (10 tables)
│   └── seed.sql                        # Test data (15 employees, reviews, etc.)
│
├── middleware/
│   └── auth.js                         # JWT verification & role authorization
│
├── routes/
│   ├── auth.js                         # POST /login, GET /me
│   ├── employees.js                    # Employee CRUD + hierarchy queries
│   ├── departments.js                  # Department endpoints
│   ├── leave.js                        # Leave request workflows (Phase 2)
│   ├── performance.js                  # Performance reviews & 360° feedback (Phase 2)
│   ├── payroll.js                      # Payroll management (Phase 2)
│   ├── training.js                     # Training enrollment (Phase 2)
│   └── recruitment.js                  # Job postings & applications (Phase 2)
│
├── controllers/                        # Business logic (Phase 2)
│   ├── employeeController.js
│   ├── leaveController.js
│   ├── performanceController.js
│   └── ...
│
├── models/                             # Database query functions (Phase 2)
│   ├── employeeModel.js
│   ├── leaveModel.js
│   └── ...
│
├── index.js                            # Express app initialization & routing
├── .env                                # Environment variables (database, JWT, CORS)
└── package.json                        # Dependencies & scripts
```

**Technologies:**
- **Express.js** - Web framework
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment config
- **cors** - Cross-origin requests

**Key Middleware:**
- `authenticateToken()` - JWT verification
- `authorizeRole('HR_ADMIN', 'MANAGER')` - Role-based access control
- `canAccessEmployee()` - Owner/manager/admin permission check

---

### Database (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────┐
│                     ENTITY RELATIONSHIPS                     │
└─────────────────────────────────────────────────────────────┘

DEPARTMENT (1:N)→ EMPLOYEE
EMPLOYEE (Self: 1:N)→ EMPLOYEE (manager_id → id)
EMPLOYEE (1:1)→ USER
EMPLOYEE (1:N)→ LEAVE_REQUEST
EMPLOYEE (1:N)→ PERFORMANCE_REVIEW
PERFORMANCE_REVIEW (1:N)→ FEEDBACK
EMPLOYEE ←(N:1)← FEEDBACK (feedback_from_id)
EMPLOYEE (1:N)→ PAYROLL
EMPLOYEE (1:N)→ TRAINING_ENROLLMENT
DEPARTMENT (1:N)→ JOB_POSTING
JOB_POSTING (1:N)→ APPLICATION
APPLICATION (1:1 on hire)→ EMPLOYEE

⭐ Key Design Features:
• Self-referencing EMPLOYEE for hierarchical organization
• Separate FEEDBACK entity for 360° multi-rater feedback
• APPLICATION → EMPLOYEE link for hiring workflow
• Computed columns in PAYROLL for automatic calculations
• Audit timestamps on all entities
```

**Indexes:**
- Employee hierarchy: `idx_employee_department`, `idx_employee_manager`
- Leave management: `idx_leave_employee`, `idx_leave_status`
- Performance: `idx_performance_employee`, `idx_performance_reviewer`
- Feedback: `idx_feedback_review`, `idx_feedback_from`
- Payroll: `idx_payroll_employee`, `idx_payroll_period`
- Training: `idx_training_employee`
- Recruitment: `idx_job_department`, `idx_application_posting`, `idx_application_status`

---

## Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                      │
└──────────────────────────────────────────────────────────┘

1. USER LOGIN
   ├─ Frontend: POST /api/auth/login { username, password }
   ├─ Backend: Query USER table
   ├─ Verify password (bcrypt)
   └─ Generate JWT token with claims:
      ├─ id (user ID)
      ├─ employeeId
      ├─ username
      ├─ role (HR_ADMIN, MANAGER, EMPLOYEE, etc.)
      └─ firstName, lastName

2. TOKEN STORAGE
   ├─ Frontend: Store JWT in LocalStorage or SessionStorage
   └─ Include in Authorization header for all requests

3. API REQUEST
   ├─ Frontend: GET /api/employees
   │            Headers: { Authorization: "Bearer <JWT_TOKEN>" }
   └─ Backend middleware: authenticateToken()
      ├─ Extract token from header
      ├─ Verify signature (JWT_SECRET)
      ├─ Decode claims
      └─ Attach user object to req.user

4. AUTHORIZATION
   ├─ Backend middleware: authorizeRole('HR_ADMIN')
   ├─ Check req.user.role
   ├─ If authorized: next()
   └─ If unauthorized: 403 Forbidden

5. DATA ACCESS
   ├─ Controller checks req.user for fine-grained access
   └─ Return only data user is authorized to see
```

**Role Hierarchy:**
```
HR_ADMIN
├─ Manage all employees
├─ Approve all workflows
├─ Access all reports
└─ System administration

MANAGER
├─ View/edit direct reports
├─ Approve leave for team
├─ Conduct reviews for team
└─ View payroll (own team)

EMPLOYEE
├─ View own record
├─ Submit leave requests
├─ Participate in reviews
└─ View own payroll

RECRUITER
├─ Create job postings
├─ Manage applications
└─ (View hiring pipeline)

PAYROLL_OFFICER
├─ View all payroll records
├─ Process payroll
└─ Generate pay stubs
```

---

## API Architecture (Phase 1)

### Implemented Endpoints

```
Authentication:
  POST   /api/auth/login              # Authenticate user, return JWT
  GET    /api/auth/me                 # Get current user info

Employees:
  GET    /api/employees               # List all employees (paginated)
  GET    /api/employees?dept=2        # Filter by department
  GET    /api/employees?search=john   # Search by name/email
  GET    /api/employees/:id           # Get employee details
  GET    /api/employees/:id/reports   # Get direct reports (team)
  POST   /api/employees               # Create employee (HR_ADMIN only)
  PUT    /api/employees/:id           # Update employee (HR_ADMIN only)
  DELETE /api/employees/:id           # Terminate employee (HR_ADMIN only)

Departments:
  GET    /api/departments             # List all departments
  GET    /api/departments/:id         # Get department details

Placeholder Routes (Phase 2):
  /api/leave                          # Leave management
  /api/performance                    # Performance reviews
  /api/payroll                        # Payroll management
  /api/training                       # Training enrollment
  /api/recruitment                    # Job postings & applications
```

### Response Format

**Success (200 OK):**
```json
{
  "data": { /* entity or list */ },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Single Entity:**
```json
{
  "id": 9,
  "first_name": "Alex",
  "last_name": "Taylor",
  "email": "alex.taylor@company.com",
  "job_title": "Senior Backend Developer",
  "department_id": 2,
  "manager_id": 5
  // ... other fields
}
```

**Error (4xx/5xx):**
```json
{
  "message": "Error description",
  "error": { /* details in development */ }
}
```

---

## Data Flow Diagram

### Leave Request Workflow (Example - Phase 2)

```
┌──────────────┐
│   EMPLOYEE   │
│  Submits     │
│  Leave Req   │
└──────┬───────┘
       │ POST /api/leave
       │ { start_date, end_date, reason }
       ↓
┌──────────────────────────────────────┐
│         BACKEND API LAYER            │
│  leaveController.submitLeaveRequest()│
│  ├─ Validate dates                   │
│  ├─ Calculate days                   │
│  ├─ Check balance                    │
│  └─ Insert to LEAVE_REQUEST table    │
│     (status: PENDING)                │
└──────┬──────────────────────────────┘
       │ Emit notification (Phase 3)
       ↓
┌──────────────┐
│   MANAGER    │
│  Sees new    │
│  request     │
└──────┬───────┘
       │ GET /api/leave?pending=true
       │ PUT /api/leave/:id
       │ { status: 'APPROVED' }
       ↓
┌──────────────────────────────────────┐
│    BACKEND BUSINESS LOGIC            │
│  leaveController.approveLeaveRequest()│
│  ├─ Verify manager is approver       │
│  ├─ Update LEAVE_REQUEST status      │
│  ├─ Deduct from balance              │
│  └─ Log audit trail                  │
└──────┬──────────────────────────────┘
       │
       ↓
┌──────────────┐
│   DATABASE   │
│  LEAVE_      │
│  REQUEST     │
│  Updated     │
└──────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│               SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────┘

1. NETWORK LAYER
   ├─ HTTPS (production)
   └─ CORS validation (frontend origin checking)

2. AUTHENTICATION LAYER
   ├─ JWT tokens with expiry (24 hours)
   ├─ Bcrypt password hashing (saltRounds: 10)
   └─ Credentials stored securely in database

3. AUTHORIZATION LAYER
   ├─ Role-based access control (RBAC)
   ├─ Middleware: authenticateToken()
   ├─ Middleware: authorizeRole(role)
   └─ Row-level security (managers see only their team)

4. DATA LAYER
   ├─ Foreign key constraints
   ├─ NOT NULL enforcement
   ├─ CHECK constraints (ratings 1-5, dates valid)
   ├─ Unique constraints (email, username)
   └─ Parameterized queries (prevent SQL injection)

5. ENVIRONMENT SECURITY
   ├─ .env file (not committed to git)
   ├─ DATABASE_PASSWORD not hardcoded
   ├─ JWT_SECRET not hardcoded
   └─ NODE_ENV for development/production toggle
```

---

## Scalability Considerations

### Current (Phase 1)
- Single PostgreSQL instance
- In-memory session (no persistence)
- Local file uploads (no S3)
- No caching layer

### Future Enhancements (Phase 3+)

**Database:**
- Connection pooling (already implemented)
- Read replicas for reporting
- Partitioning large tables (LEAVE_REQUEST, PAYROLL)
- Materialized views for aggregations

**Backend:**
- Redis caching for frequently accessed data
- Message queue (RabbitMQ) for async workflows
- Load balancing across multiple servers
- Containerization (Docker) & orchestration (Kubernetes)

**Frontend:**
- Code splitting & lazy loading
- Asset minification
- Service workers for offline support
- CDN for static assets

---

## Error Handling Strategy

```
Frontend Error Handling:
├─ Try/catch blocks in async operations
├─ User-friendly error messages
├─ Network error detection
├─ Automatic retry with exponential backoff
└─ Fallback UI for network failures

Backend Error Handling:
├─ Input validation (type, range, format)
├─ Try/catch in async handlers
├─ Logging all errors with context
├─ Standardized error responses
├─ Rate limiting (Phase 2)
└─ Request timeouts

Database Error Handling:
├─ Connection pool recovery
├─ Transaction rollback on error
├─ Constraint violation handling
└─ Query timeout protection
```

---

## Monitoring & Logging (Future)

```
Logs to Capture:
├─ API request/response (method, status, duration)
├─ Authentication events (login, logout, failed attempts)
├─ Authorization events (permission denied)
├─ Database queries (slow queries, failed queries)
├─ Business logic events (leave approved, review finalized)
└─ System events (server start, database connection, errors)

Monitoring Metrics:
├─ API response times (P50, P95, P99)
├─ Error rates by endpoint
├─ Database query performance
├─ Concurrent user sessions
└─ Resource utilization (CPU, memory, disk)
```

---

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev          # Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev          # Runs on http://localhost:5173
```

### Database Updates
```bash
# Modify schema.sql
# Then:
psql -U postgres -d hr_management -f backend/database/schema.sql
psql -U postgres -d hr_management -f backend/database/seed.sql
```

### Git Workflow (if using version control)
```bash
git add .
git commit -m "Phase 1: Foundation - database, backend, frontend setup"
git push origin main
```

---

## Deployment Architecture (Future - Phase 6+)

```
┌─────────────────────────────────────────────────────────┐
│                   CDN (CloudFlare)                      │
│              Cache static assets                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              LOAD BALANCER (Nginx)                      │
│            Route requests to servers                    │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
    ┌────▼──┐     ┌────▼──┐     ┌────▼──┐
    │Backend│     │Backend│     │Backend│
    │Server │     │Server │     │Server │
    │  #1   │     │  #2   │     │  #3   │
    └────┬──┘     └────┬──┘     └────┬──┘
         │             │              │
         └─────────────┼──────────────┘
                       │
              ┌────────▼──────────┐
              │  RDS PostgreSQL   │
              │  (with failover)  │
              │                   │
              │ - Primary DB      │
              │ - Read replicas   │
              │ - Backups         │
              └───────────────────┘
```

---

## Performance Optimization Strategies

### Query Optimization
- Use indexes on foreign keys and common filters
- Limit joins and subqueries
- Use EXPLAIN ANALYZE for slow queries
- Implement query caching

### Backend Optimization
- Connection pooling (already done: pg.Pool)
- Compress responses (gzip)
- HTTP caching headers
- Lazy load related data

### Frontend Optimization
- Code splitting by route
- Tree shaking (remove unused code)
- Image optimization & lazy loading
- Service workers for offline

---

## Conclusion

The HR Workforce Management System architecture is designed to be:
- **Scalable** - Easy to add more entities and workflows
- **Secure** - Multiple layers of authentication & authorization
- **Maintainable** - Clear separation of concerns (MVC-like)
- **Performant** - Indexed queries, connection pooling, caching
- **Extensible** - Modular route handlers and components

Phase 1 establishes the solid foundation upon which Phase 2-6 will build comprehensive features and polish.
