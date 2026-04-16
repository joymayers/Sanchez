# HR Workforce Management System - Entity Relationship Diagram (ERD)

## Database Architecture Overview

The HR Workforce Management System uses a relational PostgreSQL database with 9 core entities designed to support comprehensive HR operations including employee management, leave requests, performance reviews with 360° feedback, payroll, training, and recruitment.

---

## Entities

### 1. **DEPARTMENT**
Core organizational structure entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique department identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Department name |
| description | TEXT | | Department description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Purpose:** Organize employees into logical business units.

---

### 2. **EMPLOYEE** ⭐ (Self-Referencing)
Core employee record entity with manager-subordinate hierarchy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique employee identifier |
| first_name | VARCHAR(50) | NOT NULL | Employee's first name |
| last_name | VARCHAR(50) | NOT NULL | Employee's last name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Employee email (unique) |
| phone | VARCHAR(20) | | Phone number |
| date_of_birth | DATE | | Date of birth |
| gender | VARCHAR(20) | | Gender/Pronouns |
| address | TEXT | | Street address |
| city | VARCHAR(50) | | City |
| state | VARCHAR(50) | | State/Province |
| postal_code | VARCHAR(10) | | Postal code |
| country | VARCHAR(50) | | Country |
| employee_id | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable employee ID (EMP001, etc.) |
| job_title | VARCHAR(100) | | Job title/position |
| department_id | INTEGER | NOT NULL, FK → DEPARTMENT | Department assignment |
| manager_id | INTEGER | NULLABLE, **FK → EMPLOYEE (self)** | Reports to manager |
| employment_status | VARCHAR(50) | DEFAULT 'ACTIVE' | ACTIVE, INACTIVE, ON_LEAVE, TERMINATED |
| employment_type | VARCHAR(50) | | FULL_TIME, PART_TIME, CONTRACT |
| hire_date | DATE | NOT NULL | Date hired |
| termination_date | DATE | NULLABLE | Termination date (if terminated) |
| salary | DECIMAL(12,2) | | Annual salary |
| annual_leave_balance | INT | DEFAULT 20 | Remaining leave days |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Key Features:**
- **Self-Reference:** `manager_id` references `EMPLOYEE.id` to create hierarchical relationships
- **Hierarchy Example:** CEO (manager_id=NULL) → VP (manager_id=1) → Manager (manager_id=2) → Individual Contributor (manager_id=5)
- All employees except CEO have a manager
- Supports multi-level organizational structures

**Relationships:**
- Many-to-One: EMPLOYEE → DEPARTMENT
- Self-Reference: EMPLOYEE.manager_id → EMPLOYEE.id

**Indexes:**
- `idx_employee_department` on `department_id`
- `idx_employee_manager` on `manager_id`

---

### 3. **USER** (Authentication & Authorization)
Extends EMPLOYEE with login credentials and role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | User record ID |
| employee_id | INTEGER | NOT NULL, UNIQUE, FK → EMPLOYEE | Links to EMPLOYEE record |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | DEFAULT 'EMPLOYEE' | HR_ADMIN, MANAGER, EMPLOYEE, RECRUITER, PAYROLL_OFFICER |
| is_active | BOOLEAN | DEFAULT TRUE | Account active/inactive |
| last_login | TIMESTAMP | | Timestamp of last login |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Role-Based Access Control (RBAC):**
- **HR_ADMIN:** Full system access, can manage all employees and workflows
- **MANAGER:** Can manage direct reports and approve leave/reviews
- **EMPLOYEE:** Can view own record, submit leave requests, participate in reviews
- **RECRUITER:** Job posting and application management
- **PAYROLL_OFFICER:** Payroll processing and reporting

**Relationship:**
- One-to-One: USER ↔ EMPLOYEE (with cascade delete)

**Index:**
- `idx_user_username` on `username`

---

### 4. **LEAVE_REQUEST**
Tracks employee leave requests with approval workflow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Leave request ID |
| employee_id | INTEGER | NOT NULL, FK → EMPLOYEE | Employee requesting leave |
| leave_type | VARCHAR(50) | NOT NULL | ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID, COMPASSIONATE |
| start_date | DATE | NOT NULL | Leave start date |
| end_date | DATE | NOT NULL, CHECK(end_date ≥ start_date) | Leave end date |
| number_of_days | INT | NOT NULL | Calculated days |
| reason | TEXT | | Reason for leave |
| status | VARCHAR(50) | DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED, CANCELLED |
| requested_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request submission time |
| approved_by | INTEGER | NULLABLE, FK → EMPLOYEE | Manager/HR who approved |
| approval_date | TIMESTAMP | | Date of approval |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: LEAVE_REQUEST.employee_id → EMPLOYEE.id
- Many-to-One: LEAVE_REQUEST.approved_by → EMPLOYEE.id

**Indexes:**
- `idx_leave_employee` on `employee_id`
- `idx_leave_status` on `status`

**Workflow:**
1. Employee submits leave request (PENDING)
2. Manager reviews and approves/rejects (APPROVED/REJECTED)
3. HR views all approved leaves for payroll impact

---

### 5. **PERFORMANCE_REVIEW**
Performance evaluations with standard 1-5 rating scale.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Review ID |
| employee_id | INTEGER | NOT NULL, FK → EMPLOYEE | Employee being reviewed |
| review_period_start | DATE | NOT NULL | Review period start |
| review_period_end | DATE | NOT NULL | Review period end |
| reviewed_by | INTEGER | NOT NULL, FK → EMPLOYEE | Reviewing manager |
| review_date | DATE | | Date review completed |
| rating | INT | CHECK(1-5) | Performance rating (1-5 stars) |
| comments | TEXT | | Detailed feedback |
| status | VARCHAR(50) | DEFAULT 'DRAFT' | DRAFT, SUBMITTED, APPROVED, FINALIZED |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: PERFORMANCE_REVIEW.employee_id → EMPLOYEE.id (employee being reviewed)
- Many-to-One: PERFORMANCE_REVIEW.reviewed_by → EMPLOYEE.id (manager conducting review)
- One-to-Many: PERFORMANCE_REVIEW ← FEEDBACK (multi-rater feedback collection)

**Indexes:**
- `idx_performance_employee` on `employee_id`
- `idx_performance_reviewer` on `reviewed_by`

**Key Design Decision:**
PERFORMANCE_REVIEW is separated from FEEDBACK to support 360° multi-rater feedback. A single review can collect feedback from multiple sources (managers, peers, subordinates, self).

---

### 6. **FEEDBACK** 🔑 (360° Multi-Rater Feedback)
Multi-rater feedback collection linked to performance reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Feedback ID |
| performance_review_id | INTEGER | NOT NULL, FK → PERFORMANCE_REVIEW | Associated review |
| feedback_from_id | INTEGER | NOT NULL, FK → EMPLOYEE | Person giving feedback |
| feedback_type | VARCHAR(50) | NOT NULL | PEER, MANAGER, SELF, SUBORDINATE |
| rating | INT | CHECK(1-5) | Feedback rating (1-5) |
| feedback_text | TEXT | NOT NULL | Detailed feedback comments |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymous feedback option |
| submitted_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When feedback was submitted |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Relationships:**
- Many-to-One: FEEDBACK.performance_review_id → PERFORMANCE_REVIEW.id (with cascade delete)
- Many-to-One: FEEDBACK.feedback_from_id → EMPLOYEE.id

**Indexes:**
- `idx_feedback_review` on `performance_review_id`
- `idx_feedback_from` on `feedback_from_id`

**360° Feedback Workflow:**
1. Manager creates PERFORMANCE_REVIEW for employee (status: DRAFT)
2. System collects FEEDBACK from multiple sources:
   - Manager feedback (feedback_type='MANAGER')
   - Peer feedback (feedback_type='PEER')
   - Self feedback (feedback_type='SELF')
   - Subordinate feedback (feedback_type='SUBORDINATE')
3. All feedback records link to the same PERFORMANCE_REVIEW
4. HR/Manager can view aggregated feedback

**Key Design Decision:**
Separate FEEDBACK table enables:
- Multiple raters per review
- Flexibility in feedback types and sources
- Easy querying of feedback by type
- Support for anonymous feedback

---

### 7. **PAYROLL**
Employee compensation records with earnings and deductions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Payroll record ID |
| employee_id | INTEGER | NOT NULL, FK → EMPLOYEE | Employee |
| payroll_period_start | DATE | NOT NULL | Period start date |
| payroll_period_end | DATE | NOT NULL | Period end date |
| base_salary | DECIMAL(12,2) | NOT NULL | Base salary amount |
| bonus | DECIMAL(12,2) | DEFAULT 0 | Bonus amount |
| overtime_pay | DECIMAL(12,2) | DEFAULT 0 | Overtime pay |
| other_earnings | DECIMAL(12,2) | DEFAULT 0 | Other earnings (commissions, etc.) |
| tax_deduction | DECIMAL(12,2) | NOT NULL | Income tax withholding |
| social_security | DECIMAL(12,2) | DEFAULT 0 | Social security contribution |
| health_insurance | DECIMAL(12,2) | DEFAULT 0 | Health insurance deduction |
| retirement_contribution | DECIMAL(12,2) | DEFAULT 0 | 401k or pension contribution |
| other_deductions | DECIMAL(12,2) | DEFAULT 0 | Other deductions |
| gross_pay | DECIMAL(12,2) | GENERATED AS (base + bonus + overtime + other) | Calculated gross pay |
| total_deductions | DECIMAL(12,2) | GENERATED AS (tax + ss + insurance + retirement + other) | Calculated total deductions |
| net_pay | DECIMAL(12,2) | GENERATED AS (gross - total_deductions) | Calculated net pay |
| payment_method | VARCHAR(50) | | CHECK, DIRECT_DEPOSIT, WIRE_TRANSFER |
| payment_date | DATE | | Actual payment date |
| status | VARCHAR(50) | DEFAULT 'PENDING' | PENDING, PROCESSED, PAID, DISPUTED |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: PAYROLL.employee_id → EMPLOYEE.id

**Indexes:**
- `idx_payroll_employee` on `employee_id`
- `idx_payroll_period` on `(payroll_period_start, payroll_period_end)`

**Key Features:**
- Computed columns for automatic calculation of totals
- Support for various earnings types (bonus, overtime, commissions)
- Comprehensive deduction tracking
- Payment method tracking

---

### 8. **TRAINING_ENROLLMENT**
Employee training and professional development records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Enrollment ID |
| employee_id | INTEGER | NOT NULL, FK → EMPLOYEE | Employee enrolled |
| training_name | VARCHAR(255) | NOT NULL | Training course/program name |
| training_description | TEXT | | Course description |
| start_date | DATE | NOT NULL | Training start date |
| end_date | DATE | | Training end date |
| duration_hours | INT | | Total training hours |
| provider | VARCHAR(100) | | Training provider name |
| location | VARCHAR(100) | | Training location |
| status | VARCHAR(50) | DEFAULT 'ENROLLED' | ENROLLED, IN_PROGRESS, COMPLETED, CANCELLED |
| completion_date | DATE | | Actual completion date |
| certificate_issued | BOOLEAN | DEFAULT FALSE | Whether certificate was issued |
| cost | DECIMAL(10,2) | | Training cost |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: TRAINING_ENROLLMENT.employee_id → EMPLOYEE.id

**Index:**
- `idx_training_employee` on `employee_id`

---

### 9. **JOB_POSTING**
Open job positions and recruitment requirements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Job posting ID |
| job_title | VARCHAR(100) | NOT NULL | Position title |
| job_description | TEXT | NOT NULL | Full job description |
| department_id | INTEGER | NOT NULL, FK → DEPARTMENT | Hiring department |
| location | VARCHAR(100) | | Job location |
| employment_type | VARCHAR(50) | | FULL_TIME, PART_TIME, CONTRACT |
| salary_min | DECIMAL(12,2) | | Minimum salary |
| salary_max | DECIMAL(12,2) | | Maximum salary |
| posted_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When posted |
| closing_date | DATE | NOT NULL | Application closing date |
| status | VARCHAR(50) | DEFAULT 'OPEN' | OPEN, CLOSED, FILLED, CANCELLED |
| created_by | INTEGER | NULLABLE, FK → EMPLOYEE | HR who posted job |
| requirements | TEXT | | Required skills/qualifications |
| benefits | TEXT | | Job benefits |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: JOB_POSTING.department_id → DEPARTMENT.id
- Many-to-One: JOB_POSTING.created_by → EMPLOYEE.id
- One-to-Many: JOB_POSTING ← APPLICATION

**Index:**
- `idx_job_department` on `department_id`

---

### 10. **APPLICATION**
Job applications with hiring workflow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Application ID |
| job_posting_id | INTEGER | NOT NULL, FK → JOB_POSTING | Applied for position |
| first_name | VARCHAR(50) | NOT NULL | Applicant's first name |
| last_name | VARCHAR(50) | NOT NULL | Applicant's last name |
| email | VARCHAR(100) | NOT NULL | Applicant email |
| phone | VARCHAR(20) | | Applicant phone |
| applied_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Application date |
| cover_letter | TEXT | | Cover letter content |
| resume_url | VARCHAR(255) | | Link to resume/CV |
| status | VARCHAR(50) | DEFAULT 'NEW' | NEW, UNDER_REVIEW, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN |
| notes | TEXT | | Reviewer notes |
| hired_employee_id | INTEGER | NULLABLE, FK → EMPLOYEE | **Employee record created on hire** |
| hire_date | DATE | | Date hired |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification time |

**Relationships:**
- Many-to-One: APPLICATION.job_posting_id → JOB_POSTING.id
- **One-to-One (on hire):** APPLICATION.hired_employee_id → EMPLOYEE.id

**Indexes:**
- `idx_application_posting` on `job_posting_id`
- `idx_application_status` on `status`
- `idx_application_hired_employee` on `hired_employee_id`

**Hiring Workflow:**
1. External candidate applies (APPLICATION status: NEW)
2. HR reviews application (APPLICATION status: UNDER_REVIEW)
3. Interview conducted (APPLICATION status: INTERVIEWED)
4. Offer extended (APPLICATION status: OFFERED)
5. **Offer accepted:**
   - New EMPLOYEE record created
   - APPLICATION.hired_employee_id linked to new EMPLOYEE.id
   - APPLICATION status: HIRED
6. Employee on-boarded into EMPLOYEE table

**Key Design Decision:**
Separate APPLICATION from EMPLOYEE allows:
- Tracking of all applicants (not just hired)
- Historical record of hiring process
- Easy querying of rejected/withdrawn applications
- Link between job posting and ultimately hired employee

---

## Entity Relationship Diagram (Text Visualization)

```
┌─────────────────────┐
│    DEPARTMENT       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
└─────────┬───────────┘
          │
          │ (1:N)
          │
┌─────────┴──────────────────────────────────┐
│           EMPLOYEE (SELF-REFERENCING)      │
├──────────────────────────────────────────┤
│ id (PK)                                    │
│ first_name, last_name, email              │
│ department_id (FK → DEPARTMENT)           │
│ manager_id (FK → EMPLOYEE) ⭐ SELF-REF   │
│ job_title, hire_date, salary, etc.       │
└─────┬─────────────────────────────────────┘
      │
      ├──────────────┬─────────┬─────────────┬─────────────┐
      │ (1:1)        │ (1:N)   │ (1:N)       │ (1:N)       │
      │              │         │             │             │
   ┌──┴──┐    ┌──────┴────┐ ┌─┴────────┐ ┌──┴──────────┐
   │USER │    │LEAVE_     │ │PERFORMANCE│ │TRAINING_   │
   │     │    │REQUEST    │ │REVIEW     │ │ENROLLMENT  │
   └─────┘    │(1:N)      │ │(1:N)      │ │(1:N)       │
              │approval   │ │reviewed_by│ │            │
              │by → EMP   │ │by → EMP   │ │            │
              └──────┬────┘ └─────┬─────┘ └────────┬────┘
                     │           │               │
                     │           │(1:N)          │
                     │           │               │
                     │        ┌──┴─────┐         │
                     │        │FEEDBACK│         │
                     │        │(360°)  │         │
                     │        │feedback_│        │
                     │        │from_id  │        │
                     │        │→ EMPLOYEE        │
                     │        └────────┘         │
                     │                          │
         ┌───────────┴──────────┬────────────────┘
         │                      │
    ┌────┴─────┐          ┌─────┴──────┐
    │ PAYROLL  │          │JOB_POSTING │
    │(1:N)     │          │(1:N)       │
    │emp_id→EMP│          │dept_id→DEPT│
    └──────────┘          │created_by  │
                          │→ EMPLOYEE  │
                          └─────┬──────┘
                                │ (1:N)
                                │
                          ┌─────┴────────┐
                          │APPLICATION   │
                          │(1:1 on hire) │
                          │hired_emp_id  │
                          │→ EMPLOYEE    │
                          └──────────────┘
```

---

## Key Relationships Summary

| Relationship | Type | From | To | Notes |
|--------------|------|------|----|----|
| Department → Employee | 1:N | DEPARTMENT | EMPLOYEE | Employees assigned to departments |
| Manager → Subordinates | 1:N | EMPLOYEE | EMPLOYEE | Self-referencing hierarchy |
| User Account | 1:1 | USER | EMPLOYEE | One login per employee |
| Leave Requests | 1:N | EMPLOYEE | LEAVE_REQUEST | Employees submit multiple leaves |
| Leave Approval | N:1 | LEAVE_REQUEST | EMPLOYEE | Manager/HR approves |
| Performance Reviews | 1:N | EMPLOYEE | PERFORMANCE_REVIEW | Multiple reviews per employee over time |
| 360° Feedback | 1:N | PERFORMANCE_REVIEW | FEEDBACK | Multiple raters per review |
| Feedback Source | N:1 | FEEDBACK | EMPLOYEE | Different employees provide feedback |
| Payroll Records | 1:N | EMPLOYEE | PAYROLL | Multiple pay periods |
| Training Enrollment | 1:N | EMPLOYEE | TRAINING_ENROLLMENT | Multiple trainings per employee |
| Job Postings | 1:N | DEPARTMENT | JOB_POSTING | Multiple open positions per department |
| Job Applications | 1:N | JOB_POSTING | APPLICATION | Multiple applications per posting |
| Hiring | 1:1 | APPLICATION | EMPLOYEE | Applied applicant becomes employee when hired |

---

## Key Design Features

### 1. **Hierarchical Organization (Self-Referencing EMPLOYEE)**
```sql
-- Query direct reports for a manager
SELECT id, first_name, last_name, job_title 
FROM EMPLOYEE 
WHERE manager_id = 5;  -- All employees reporting to manager with ID 5

-- Query full hierarchy (recursive)
WITH RECURSIVE org_hierarchy AS (
  SELECT id, first_name, manager_id, 0 as level FROM EMPLOYEE WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.first_name, e.manager_id, h.level + 1 
  FROM EMPLOYEE e
  JOIN org_hierarchy h ON e.manager_id = h.id
)
SELECT * FROM org_hierarchy;
```

### 2. **360° Multi-Rater Feedback (FEEDBACK Separate from PERFORMANCE_REVIEW)**
```sql
-- Collect feedback from multiple raters for one review
SELECT pr.id, pr.employee_id, f.feedback_type, f.feedback_from_id, f.rating, f.feedback_text
FROM PERFORMANCE_REVIEW pr
JOIN FEEDBACK f ON pr.id = f.performance_review_id
WHERE pr.employee_id = 9
  AND pr.review_period_start = '2025-01-01';

-- Aggregate feedback by type
SELECT feedback_type, AVG(rating) as avg_rating
FROM FEEDBACK
WHERE performance_review_id = 1
GROUP BY feedback_type;
```

### 3. **Hiring Workflow (APPLICATION → EMPLOYEE)**
```sql
-- When offer is accepted, create EMPLOYEE from APPLICATION
BEGIN TRANSACTION;
  INSERT INTO EMPLOYEE (first_name, last_name, email, employee_id, 
                        department_id, hire_date, employment_type, ...)
  VALUES ('John', 'Doe', 'john.doe@company.com', 'EMP999', 2, CURRENT_DATE, 'FULL_TIME', ...);
  
  UPDATE APPLICATION 
  SET hired_employee_id = (SELECT id FROM EMPLOYEE WHERE email = 'john.doe@company.com'),
      status = 'HIRED',
      hire_date = CURRENT_DATE
  WHERE id = 42;
COMMIT;
```

### 4. **Leave Balance Tracking**
```sql
-- Calculate remaining leave balance
SELECT 
  e.first_name,
  e.annual_leave_balance as balance_available,
  COALESCE(SUM(lr.number_of_days), 0) as leaves_taken
FROM EMPLOYEE e
LEFT JOIN LEAVE_REQUEST lr ON e.id = lr.employee_id 
                           AND lr.status = 'APPROVED'
                           AND YEAR(lr.start_date) = YEAR(CURRENT_DATE)
WHERE e.id = 9
GROUP BY e.id;
```

### 5. **Payroll Aggregation (Computed Columns)**
```sql
-- Automatic calculation of gross, total deductions, net pay
SELECT 
  employee_id,
  gross_pay,              -- Automatically calculated
  total_deductions,       -- Automatically calculated
  net_pay                 -- Automatically calculated (gross - deductions)
FROM PAYROLL
WHERE payroll_period_start = '2026-04-01';
```

---

## Indexes for Performance

All key lookup columns are indexed:
- `employee_department`, `employee_manager` — Organizational hierarchy queries
- `leave_employee`, `leave_status` — Leave request lookups
- `performance_employee`, `performance_reviewer` — Review queries
- `feedback_review`, `feedback_from` — Feedback collection and aggregation
- `payroll_employee`, `payroll_period` — Payroll processing
- `training_employee` — Training history
- `job_department` — Posting lookups
- `application_posting`, `application_status`, `application_hired_employee` — Recruitment

---

## Data Integrity & Constraints

1. **Referential Integrity:** Foreign keys ensure no orphaned records
2. **Check Constraints:** 
   - LEAVE_REQUEST: `end_date >= start_date`
   - PERFORMANCE_REVIEW/FEEDBACK: `rating` between 1-5
3. **Unique Constraints:**
   - EMPLOYEE: `email`, `employee_id`
   - USER: `username`, `employee_id`
   - DEPARTMENT: `name`
4. **Cascade Deletes:** When APPLICATION is deleted, any FEEDBACK linked through PERFORMANCE_REVIEW cascades
5. **NOT NULL Constraints:** Enforce required fields (hire_date, email, department_id, etc.)

---

## Sample Organizational Hierarchy (from seed data)

```
CEO (ID: 1, Manager_ID: NULL)
├── VP Engineering (ID: 2, Manager_ID: 1)
│   ├── Engineering Manager - Backend (ID: 5, Manager_ID: 2)
│   │   ├── Senior Backend Developer (ID: 9, Manager_ID: 5)
│   │   └── Junior Backend Developer (ID: 11, Manager_ID: 5)
│   └── Engineering Manager - Frontend (ID: 6, Manager_ID: 2)
│       ├── Frontend Developer (ID: 10, Manager_ID: 6)
│       └── Frontend Developer (ID: 12, Manager_ID: 6)
├── VP Finance (ID: 3, Manager_ID: 1)
│   └── Finance Manager - Accounting (ID: 7, Manager_ID: 3)
│       └── Accountant (ID: 13, Manager_ID: 7)
├── Head of HR (ID: 4, Manager_ID: 1)
│   └── Recruitment Manager (ID: 8, Manager_ID: 4)
│       └── Recruitment Specialist (ID: 14, Manager_ID: 8)
└── Sales Rep (ID: 15, Manager_ID: 1) — Direct report to CEO
```

This demonstrates:
- Multi-level hierarchy (4 levels deep)
- CEO at top (no manager)
- Various department structures
- Clear reporting lines

---

## Seed Data Statistics

- **15 Employees** across 7 departments with 4-level hierarchy
- **15 User Accounts** with roles: 1 HR_ADMIN (CEO), 7 MANAGER, 7 EMPLOYEE
- **4 Leave Requests** (mixed approval statuses)
- **4 Performance Reviews** with **13 Feedback entries** (360° feedback)
- **4 Payroll Records** (monthly pay periods)
- **4 Training Enrollments** (various statuses)
- **4 Job Postings** (different statuses)
- **4 Applications** (various hiring stages)

---

## Notes for Implementation

1. All timestamps use `CURRENT_TIMESTAMP` for automatic UTC recording
2. Currency fields use DECIMAL(12,2) for precision
3. Status fields use VARCHAR to allow easy queries and updates
4. Soft deletes (status=TERMINATED) are preferred over hard deletes
5. All major operations should include audit trails (created_at, updated_at)
6. Foreign key cascades are configured to prevent orphaned records
