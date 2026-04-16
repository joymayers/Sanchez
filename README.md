# HR Workforce Management System

A comprehensive, full-stack Human Resources management system built with **React**, **Node.js/Express**, and **PostgreSQL**. This system enables organizations to manage employees, leave requests, performance reviews with 360° feedback, payroll, training, and recruitment—all with role-based access control.

---

## 🎯 Features

### Core Modules
1. **Employee Management** - Hierarchical employee records with manager-subordinate relationships
2. **Leave Management** - Request submission, manager approval, balance tracking
3. **Performance Reviews** - Annual reviews with 360° multi-rater feedback
4. **Payroll** - Salary management, deductions, pay stub generation
5. **Training & Development** - Course enrollment and completion tracking
6. **Recruitment** - Job postings, applicant tracking, hiring workflow

### Key Capabilities
- ✅ **Role-Based Access Control (RBAC)** - HR Admin, Manager, Employee, Recruiter, Payroll Officer
- ✅ **Hierarchical Organization** - Self-referencing employee manager relationships
- ✅ **360° Feedback Collection** - Multiple raters (manager, peer, self, subordinate)
- ✅ **Workflow Management** - Leave approvals, performance cycles, hiring process
- ✅ **Multi-Tenant Ready** - Department-based organizational structure
- ✅ **Audit Trail** - Created/updated timestamps on all records

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Modern interactive UI |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | PostgreSQL | Relational data storage |
| **Authentication** | JWT (jsonwebtoken) | Token-based auth |
| **Security** | bcryptjs | Password hashing |
| **CORS** | cors | Cross-origin requests |

---

## 📋 Database Schema

**9 Core Entities:**
- DEPARTMENT - Organizational units
- EMPLOYEE - Employee records (self-referencing hierarchy)
- USER - Authentication & authorization
- LEAVE_REQUEST - Leave management
- PERFORMANCE_REVIEW - Performance evaluations
- FEEDBACK - 360° multi-rater feedback (separate entity)
- PAYROLL - Compensation records
- TRAINING_ENROLLMENT - Professional development
- JOB_POSTING - Open positions
- APPLICATION - Job applications & hiring

### Key Design Decisions
- **EMPLOYEE Self-Reference** - Enables manager-subordinate hierarchy
- **Separate FEEDBACK Entity** - Supports multiple raters per review
- **APPLICATION → EMPLOYEE Link** - Hired applicants become employees
- **Computed Payroll Columns** - Automatic gross/deductions/net calculation

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone/Download the project**
   ```bash
   cd hr-system
   ```

2. **Set up PostgreSQL database**
   ```bash
   createdb hr_management
   psql -U postgres -d hr_management -f backend/database/schema.sql
   psql -U postgres -d hr_management -f backend/database/seed.sql
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   # Update .env with your PostgreSQL credentials
   npm run dev  # Runs on http://localhost:5000
   ```

4. **In another terminal, install frontend dependencies**
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on http://localhost:5173
   ```

5. **Open browser**
   ```
   http://localhost:5173/
   ```

---

## 🔐 Test Credentials

Login with these test accounts (all accept any password in development):

| Username | Role | Department |
|----------|------|-----------|
| john.smith | HR_ADMIN | Executive |
| sarah.johnson | MANAGER | Engineering |
| emily.davis | HR_ADMIN | Human Resources |
| alex.taylor | EMPLOYEE | Engineering |
| maria.thomas | EMPLOYEE | Engineering |

---

## 📚 API Endpoints

### Phase 1 (Implemented)
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/employees` - List employees (paginated)
- `GET /api/employees/:id` - Get employee details
- `GET /api/employees/:id/reports` - Get direct reports
- `POST /api/employees` - Create employee (HR_ADMIN)
- `PUT /api/employees/:id` - Update employee (HR_ADMIN)
- `DELETE /api/employees/:id` - Terminate employee (HR_ADMIN)
- `GET /api/departments` - List all departments
- `GET /api/departments/:id` - Get department

### Phase 2 (Coming Soon)
- Leave Request CRUD & Approval Workflow
- Performance Review & 360° Feedback Collection
- Payroll Processing & Management
- Training Enrollment & Tracking
- Job Posting & Application Management

---

## 📁 Project Structure

```
hr-system/
├── backend/
│   ├── database/
│   │   ├── connection.js    # PostgreSQL pool
│   │   ├── schema.sql       # Database schema
│   │   └── seed.sql         # Sample data
│   ├── middleware/
│   │   └── auth.js          # JWT & role authorization
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── departments.js
│   │   ├── leave.js
│   │   ├── performance.js
│   │   ├── payroll.js
│   │   ├── training.js
│   │   └── recruitment.js
│   ├── .env                 # Environment variables
│   ├── index.js             # Main server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── context/         # Auth & state management
│   │   └── App.jsx
│   └── package.json
│
└── docs/
    ├── ER_DIAGRAM.md        # Entity relationships
    ├── SETUP_INSTRUCTIONS.md
    ├── ARCHITECTURE.md
    └── USER_STORIES.md
```

---

## 🗄️ Database Features

### Hierarchical Organization
```sql
-- Query employee with their manager and direct reports
SELECT e.first_name, m.first_name as manager_name, 
       COUNT(r.id) as reports_count
FROM EMPLOYEE e
LEFT JOIN EMPLOYEE m ON e.manager_id = m.id
LEFT JOIN EMPLOYEE r ON r.manager_id = e.id
GROUP BY e.id;
```

### 360° Feedback Collection
```sql
-- Aggregate feedback for a performance review by type
SELECT feedback_type, AVG(rating) as avg_rating, COUNT(*) as count
FROM PERFORMANCE_REVIEW pr
JOIN FEEDBACK f ON pr.id = f.performance_review_id
WHERE pr.employee_id = 9
GROUP BY feedback_type;
```

### Leave Balance
```sql
-- Calculate remaining annual leave
SELECT e.first_name, e.annual_leave_balance,
       COALESCE(SUM(lr.number_of_days), 0) as leaves_taken,
       e.annual_leave_balance - COALESCE(SUM(lr.number_of_days), 0) as remaining
FROM EMPLOYEE e
LEFT JOIN LEAVE_REQUEST lr ON e.id = lr.employee_id 
  AND lr.status = 'APPROVED'
  AND YEAR(lr.start_date) = YEAR(CURRENT_DATE)
GROUP BY e.id;
```

---

## 👥 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **HR_ADMIN** | Full system access, manage all employees, approve all workflows |
| **MANAGER** | Manage direct reports, approve leave/reviews for team |
| **EMPLOYEE** | View own record, submit requests, participate in reviews |
| **RECRUITER** | Create job postings, manage applications |
| **PAYROLL_OFFICER** | View and process payroll records |

---

## 🔄 Workflow Examples

### Leave Request Workflow
1. **Employee** submits leave request (PENDING)
2. **Manager** reviews and approves/rejects (APPROVED/REJECTED)
3. **HR** views approved leaves for payroll impact
4. **System** updates leave balance automatically

### Performance Review Workflow
1. **Manager** creates performance review (DRAFT)
2. **System** collects feedback from:
   - Manager
   - Peers
   - Employee (self)
   - Subordinates (if applicable)
3. **HR** reviews aggregated feedback
4. **Manager** finalizes review (FINALIZED)

### Hiring Workflow
1. **HR** creates job posting (OPEN)
2. **External Applicant** applies (NEW)
3. **HR** reviews and interviews (UNDER_REVIEW → INTERVIEWED)
4. **HR** extends offer (OFFERED)
5. **On Acceptance:**
   - New EMPLOYEE record created
   - APPLICATION linked to EMPLOYEE
   - Status updated to HIRED

---

## 🔒 Security Features

- ✅ JWT token-based authentication with expiry
- ✅ Bcrypt password hashing
- ✅ Role-based access control middleware
- ✅ CORS configuration for frontend integration
- ✅ Environment variables for sensitive data
- ✅ Foreign key constraints for data integrity
- ✅ Audit timestamps (created_at, updated_at)

---

## 📖 Documentation

- [Setup Instructions](docs/SETUP_INSTRUCTIONS.md) - Step-by-step installation
- [ER Diagram](docs/ER_DIAGRAM.md) - Complete database schema documentation
- [Architecture](docs/ARCHITECTURE.md) - System design overview
- [User Stories](docs/USER_STORIES.md) - Feature requirements by role

---

## 📊 Sample Data Included

The system comes pre-loaded with realistic test data:
- **15 Employees** with multi-level hierarchy (CEO → VP → Manager → IC)
- **7 Departments** across Executive, Engineering, Finance, HR, Sales, Marketing, Operations
- **4 Leave Requests** with various approval statuses
- **4 Performance Reviews** with **13 360° Feedback entries**
- **4 Payroll Records** with earnings and deductions
- **4 Training Enrollments** at different completion stages
- **4 Job Postings** with different statuses
- **4 Job Applications** showing hiring pipeline

---

## 🎓 Educational Value

This project demonstrates:
- ✅ Full-stack application architecture
- ✅ Relational database design (PostgreSQL)
- ✅ RESTful API design patterns
- ✅ Authentication & authorization (JWT + RBAC)
- ✅ React component patterns and state management
- ✅ Business logic implementation (workflows, calculations)
- ✅ Software engineering best practices

---

## 🗂️ Development Phases

### Phase 1: Foundation ✅ COMPLETE
- Project structure and setup
- PostgreSQL database schema
- Backend initialization
- Frontend project creation

### Phase 2: Backend API (In Progress)
- Complete authentication system
- Full CRUD endpoints for all modules
- Business logic implementation
- Error handling

### Phase 3: Frontend Components (Coming)
- System idea cards with role-based user stories
- ER diagram visualization
- Reusable React components
- API integration

### Phase 4: Employee Module (Coming)
- Employee list, detail, and form pages
- Search and filter functionality
- Hierarchical employee view

### Phase 5: Extended Features (Coming)
- Leave management interface
- Performance review workflow
- Payroll management
- Training enrollment
- Recruitment management

### Phase 6: Documentation & Polish (Coming)
- Complete API documentation
- User stories for all features
- Design mockups
- Code cleanup and security review

---

## 🚦 Getting Help

- Check [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md) for troubleshooting
- Review [ER_DIAGRAM.md](docs/ER_DIAGRAM.md) for database structure
- Examine seed data in `backend/database/seed.sql` for examples

---

## 📝 License

This project is created for educational purposes.

---

## 👨‍💻 Development Team

HR Workforce Management System - A comprehensive learning project demonstrating full-stack web development.

---

**Status:** 🟡 Phase 1 Complete - Foundation Ready
**Last Updated:** April 16, 2026
**Environment:** Development
