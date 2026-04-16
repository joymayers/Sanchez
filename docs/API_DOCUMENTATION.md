# HR Workforce Management System - API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token (obtained via `/auth/login`)  
**Content-Type:** `application/json`

---

## Table of Contents
1. [Authentication API](#authentication-api)
2. [Employee API](#employee-api)
3. [Department API](#department-api)
4. [Leave Request API](#leave-request-api)
5. [Performance Review & Feedback API](#performance-review--feedback-api)
6. [Payroll API](#payroll-api)
7. [Training Enrollment API](#training-enrollment-api)
8. [Recruitment API](#recruitment-api)
9. [Error Handling](#error-handling)
10. [Role-Based Access Control](#role-based-access-control)

---

## Authentication API

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "john.smith",
  "password": "any_password"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

**Error (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
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

**Error (401 Unauthorized):**
```json
{
  "message": "Invalid token"
}
```

---

## Employee API

### GET /employees
List all employees with pagination, search, and filtering.

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 10) - Records per page
- `department_id` (int, optional) - Filter by department
- `search` (string, optional) - Search by name, email

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 9,
      "first_name": "Alex",
      "last_name": "Taylor",
      "email": "alex.taylor@company.com",
      "phone": "+1-555-0109",
      "job_title": "Senior Backend Developer",
      "department_id": 2,
      "manager_id": 5,
      "employee_id": "EMP009",
      "employment_status": "ACTIVE",
      "hire_date": "2020-01-15",
      "salary": 110000,
      "annual_leave_balance": 20
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15
  }
}
```

---

### GET /employees/:id
Get detailed employee record.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": 9,
  "first_name": "Alex",
  "last_name": "Taylor",
  "email": "alex.taylor@company.com",
  "phone": "+1-555-0109",
  "date_of_birth": "1995-04-22",
  "gender": "Male",
  "address": "999 Backend St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10005",
  "country": "USA",
  "employee_id": "EMP009",
  "job_title": "Senior Backend Developer",
  "department_id": 2,
  "manager_id": 5,
  "employment_status": "ACTIVE",
  "employment_type": "FULL_TIME",
  "hire_date": "2020-01-15",
  "salary": 110000,
  "annual_leave_balance": 20,
  "created_at": "2026-04-16T22:00:00.000Z",
  "updated_at": "2026-04-16T22:00:00.000Z"
}
```

---

### GET /employees/:id/reports
Get direct reports (team members) for a manager.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 9,
    "first_name": "Alex",
    "last_name": "Taylor",
    "email": "alex.taylor@company.com",
    "job_title": "Senior Backend Developer",
    "department_id": 2
  },
  {
    "id": 11,
    "first_name": "Chris",
    "last_name": "Jackson",
    "email": "chris.jackson@company.com",
    "job_title": "Junior Backend Developer",
    "department_id": 2
  }
]
```

---

### POST /employees
Create new employee. **(HR_ADMIN only)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-9999",
  "employee_id": "EMP999",
  "job_title": "Software Engineer",
  "department_id": 2,
  "manager_id": 5,
  "employment_type": "FULL_TIME",
  "hire_date": "2026-05-01",
  "salary": 95000
}
```

**Response (201 Created):**
```json
{
  "id": 16,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "employee_id": "EMP999",
  "job_title": "Software Engineer",
  "department_id": 2,
  "manager_id": 5,
  "employment_status": "ACTIVE",
  "employment_type": "FULL_TIME",
  "hire_date": "2026-05-01",
  "salary": 95000,
  "annual_leave_balance": 20,
  "created_at": "2026-04-16T22:30:00.000Z"
}
```

---

### PUT /employees/:id
Update employee. **(HR_ADMIN only)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "job_title": "Senior Software Engineer",
  "salary": 120000,
  "manager_id": 2
}
```

**Response (200 OK):** Updated employee record

---

### DELETE /employees/:id
Terminate employee (soft delete). **(HR_ADMIN only)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "Employee terminated successfully",
  "data": {
    "id": 9,
    "employment_status": "TERMINATED",
    "termination_date": "2026-04-16"
  }
}
```

---

## Department API

### GET /departments
List all departments.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Executive",
    "description": "Executive Leadership Team",
    "created_at": "2026-04-16T22:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Engineering",
    "description": "Software Development and Technical Services",
    "created_at": "2026-04-16T22:00:00.000Z"
  }
]
```

---

### GET /departments/:id
Get department by ID.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Department object

---

## Leave Request API

### GET /leave
List leave requests with role-based filtering.

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `employee_id` (int, optional)
- `status` (string, optional) - PENDING, APPROVED, REJECTED, CANCELLED
- `from_date` (date, optional) - Filter from date
- `to_date` (date, optional) - Filter to date

**Role-Based Behavior:**
- EMPLOYEE: sees only own leaves
- MANAGER: sees team's leaves
- HR_ADMIN: sees all leaves

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "employee_id": 9,
      "first_name": "Alex",
      "last_name": "Taylor",
      "leave_type": "ANNUAL",
      "start_date": "2026-05-01",
      "end_date": "2026-05-05",
      "number_of_days": 5,
      "reason": "Vacation",
      "status": "APPROVED",
      "requested_date": "2026-04-10T10:00:00.000Z",
      "approved_by": 5,
      "approver_first": "Robert",
      "approver_last": "Wilson",
      "approval_date": "2026-04-10T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /leave/:id
Get single leave request.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Leave request object

---

### POST /leave
Submit new leave request.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "employee_id": 9,
  "leave_type": "ANNUAL",
  "start_date": "2026-06-01",
  "end_date": "2026-06-10",
  "reason": "Summer vacation"
}
```

**Validation:**
- End date must be >= start date
- Annual leave balance must be sufficient
- Only employees can submit for themselves

**Response (201 Created):**
```json
{
  "id": 5,
  "employee_id": 9,
  "leave_type": "ANNUAL",
  "start_date": "2026-06-01",
  "end_date": "2026-06-10",
  "number_of_days": 10,
  "reason": "Summer vacation",
  "status": "PENDING",
  "requested_date": "2026-04-16T22:00:00.000Z"
}
```

---

### PUT /leave/:id
Approve or reject leave request. **(Manager or HR_ADMIN only)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "APPROVED"
}
```

**Workflow:**
1. Manager/HR reviews PENDING request
2. Sets status to APPROVED or REJECTED
3. If APPROVED and ANNUAL: balance is automatically deducted

**Response (200 OK):**
```json
{
  "id": 5,
  "status": "APPROVED",
  "approved_by": 5,
  "approval_date": "2026-04-16T22:30:00.000Z"
}
```

---

### DELETE /leave/:id
Cancel leave request. **(Employee or HR_ADMIN)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Restrictions:**
- Employees can only cancel their own PENDING leaves
- HR can cancel any leave
- If cancelling approved ANNUAL leave, balance is restored

**Response (200 OK):**
```json
{
  "message": "Leave request cancelled successfully",
  "data": {
    "id": 5,
    "status": "CANCELLED"
  }
}
```

---

## Performance Review & Feedback API

### GET /performance
List performance reviews (paginated).

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `employee_id` (int, optional)
- `status` (string, optional) - DRAFT, SUBMITTED, APPROVED, FINALIZED

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "employee_id": 9,
      "first_name": "Alex",
      "last_name": "Taylor",
      "review_period_start": "2025-01-01",
      "review_period_end": "2025-12-31",
      "reviewed_by": 5,
      "reviewer_first": "Robert",
      "reviewer_last": "Wilson",
      "rating": 4,
      "comments": "Excellent technical skills",
      "status": "FINALIZED",
      "review_date": "2026-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /performance/:id
Get single performance review.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Review object

---

### POST /performance
Create performance review. **(Manager or HR_ADMIN)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "employee_id": 9,
  "review_period_start": "2026-01-01",
  "review_period_end": "2026-12-31",
  "rating": 4,
  "comments": "Strong technical performer"
}
```

**Response (201 Created):** Review object with status=DRAFT

---

### PUT /performance/:id
Update performance review. **(Review author or HR_ADMIN)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "SUBMITTED",
  "rating": 5,
  "review_date": "2026-04-16"
}
```

**Response (200 OK):** Updated review object

---

### GET /performance/:id/feedback
Get all feedback for a performance review with aggregation.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "review_id": 1,
  "all_feedback": [
    {
      "id": 1,
      "performance_review_id": 1,
      "feedback_from_id": 5,
      "first_name": "Robert",
      "last_name": "Wilson",
      "feedback_type": "MANAGER",
      "rating": 5,
      "feedback_text": "Outstanding leadership",
      "is_anonymous": false,
      "submitted_date": "2026-04-15T10:00:00.000Z"
    }
  ],
  "aggregated_feedback": [
    {
      "type": "MANAGER",
      "count": 1,
      "avg_rating": 5,
      "feedback_list": [...]
    },
    {
      "type": "PEER",
      "count": 2,
      "avg_rating": 4,
      "feedback_list": [...]
    }
  ]
}
```

---

### POST /performance/:id/feedback
Submit 360° feedback for a performance review.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "feedback_type": "PEER",
  "rating": 4,
  "feedback_text": "Great collaboration on the backend project",
  "is_anonymous": false
}
```

**Valid feedback_type values:**
- PEER - feedback from colleagues
- MANAGER - feedback from manager
- SELF - self-assessment
- SUBORDINATE - feedback from direct reports

**Response (201 Created):** Feedback object

---

### GET /performance/feedback-by/:employee_id
Get all feedback submitted by an employee.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Array of feedback objects submitted by the employee

---

## Payroll API

### GET /payroll
List payroll records (paginated, filtered by employee and period).

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `employee_id` (int, optional)
- `period_start` (date, optional)
- `period_end` (date, optional)
- `status` (string, optional)

**Role-Based Behavior:**
- EMPLOYEE: sees only own payroll
- HR_ADMIN/PAYROLL_OFFICER: sees all payroll

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "employee_id": 9,
      "first_name": "Alex",
      "last_name": "Taylor",
      "emp_id_number": "EMP009",
      "payroll_period_start": "2026-04-01",
      "payroll_period_end": "2026-04-15",
      "base_salary": 5416.67,
      "bonus": 0,
      "overtime_pay": 250,
      "other_earnings": 0,
      "tax_deduction": 850,
      "social_security": 412,
      "health_insurance": 350,
      "retirement_contribution": 325,
      "other_deductions": 0,
      "gross_pay": 5666.67,
      "total_deductions": 1937,
      "net_pay": 3729.67,
      "payment_method": "DIRECT_DEPOSIT",
      "payment_date": "2026-04-17",
      "status": "PAID"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /payroll/:id
Get single payroll record.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Payroll object

---

### POST /payroll
Create payroll record. **(HR_ADMIN or PAYROLL_OFFICER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "employee_id": 9,
  "payroll_period_start": "2026-05-01",
  "payroll_period_end": "2026-05-15",
  "base_salary": 5416.67,
  "bonus": 500,
  "overtime_pay": 200,
  "tax_deduction": 900,
  "social_security": 420,
  "health_insurance": 350,
  "retirement_contribution": 325,
  "payment_method": "DIRECT_DEPOSIT"
}
```

**Response (201 Created):** Payroll object with auto-calculated gross_pay, total_deductions, net_pay

---

### PUT /payroll/:id
Update payroll record status or payment details. **(HR_ADMIN or PAYROLL_OFFICER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "PAID",
  "payment_date": "2026-04-17",
  "payment_method": "DIRECT_DEPOSIT"
}
```

**Valid statuses:** PENDING, PROCESSED, PAID, DISPUTED

**Response (200 OK):** Updated payroll object

---

### GET /payroll/employee/:employee_id/history
Get payroll history for an employee with YTD totals.

**Query Parameters:**
- `limit` (int, default: 12) - Last N months

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "payroll_records": [
    { ...payroll_objects... }
  ],
  "ytd_summary": {
    "gross_pay": "55666.70",
    "total_deductions": "19370.00",
    "net_pay": "36296.70"
  }
}
```

---

## Training Enrollment API

### GET /training
List training enrollments (paginated).

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `employee_id` (int, optional)
- `status` (string, optional) - ENROLLED, IN_PROGRESS, COMPLETED, CANCELLED

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "employee_id": 9,
      "first_name": "Alex",
      "last_name": "Taylor",
      "training_name": "Advanced Python Programming",
      "training_description": "Deep dive into Python advanced features",
      "start_date": "2026-02-01",
      "end_date": "2026-03-15",
      "duration_hours": 40,
      "provider": "TechLearn",
      "location": "Online",
      "status": "COMPLETED",
      "completion_date": "2026-03-15",
      "certificate_issued": true,
      "cost": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /training/:id
Get single training enrollment.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Training enrollment object

---

### POST /training
Enroll employee in training.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "employee_id": 9,
  "training_name": "Kubernetes Fundamentals",
  "training_description": "Learn Kubernetes containerization",
  "start_date": "2026-05-01",
  "end_date": "2026-05-15",
  "duration_hours": 20,
  "provider": "Cloud Academy",
  "location": "Online",
  "cost": 600
}
```

**Response (201 Created):** Training enrollment object with status=ENROLLED

---

### PUT /training/:id
Update training enrollment (status, completion).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "COMPLETED",
  "completion_date": "2026-05-15",
  "certificate_issued": true
}
```

**Response (200 OK):** Updated training object

---

### GET /training/employee/:employee_id/history
Get training history for an employee with statistics.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "training_records": [
    { ...training_objects... }
  ],
  "statistics": {
    "total_trainings": 4,
    "completed": 2,
    "in_progress": 1,
    "enrolled": 1,
    "certificates": 2,
    "total_hours": 96,
    "total_cost": 1950
  }
}
```

---

### GET /training/programs/available
Get list of all available training programs (distinct training names).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "training_name": "Advanced Python Programming",
    "training_description": "Deep dive into Python advanced features",
    "provider": "TechLearn"
  },
  {
    "training_name": "React Advanced Patterns",
    "training_description": "Master React hooks and performance optimization",
    "provider": "ReactCourse"
  }
]
```

---

## Recruitment API

### GET /recruitment/postings
List job postings (public).

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `status` (string, default: 'OPEN') - OPEN, CLOSED, FILLED, CANCELLED
- `department_id` (int, optional)
- `location` (string, optional)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "job_title": "Senior Frontend Developer",
      "job_description": "We are looking for an experienced React developer...",
      "department_id": 2,
      "department_name": "Engineering",
      "location": "New York, NY",
      "employment_type": "FULL_TIME",
      "salary_min": 120000,
      "salary_max": 150000,
      "posted_date": "2026-04-10T10:00:00.000Z",
      "closing_date": "2026-05-15",
      "status": "OPEN",
      "created_by": 6,
      "posted_by_first": "Jessica",
      "posted_by_last": "Martinez",
      "requirements": "React, TypeScript, CSS, REST APIs, 5+ years experience",
      "benefits": "Health insurance, 401k, flexible hours"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /recruitment/postings/:id
Get single job posting.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Job posting object

---

### POST /recruitment/postings
Create job posting. **(HR_ADMIN or RECRUITER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "job_title": "DevOps Engineer",
  "job_description": "Looking for experienced DevOps engineer...",
  "department_id": 2,
  "location": "San Francisco, CA",
  "employment_type": "FULL_TIME",
  "salary_min": 130000,
  "salary_max": 160000,
  "closing_date": "2026-06-15",
  "requirements": "Kubernetes, Docker, AWS, 5+ years experience",
  "benefits": "Health insurance, 401k, stock options"
}
```

**Response (201 Created):** Job posting object with status=OPEN

---

### PUT /recruitment/postings/:id
Update job posting. **(HR_ADMIN or RECRUITER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "CLOSED",
  "salary_min": 140000,
  "salary_max": 170000
}
```

**Response (200 OK):** Updated job posting

---

### GET /recruitment/applications
List all job applications. **(HR_ADMIN or RECRUITER only)**

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `job_posting_id` (int, optional)
- `status` (string, optional)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "job_posting_id": 1,
      "job_title": "Senior Frontend Developer",
      "first_name": "Robert",
      "last_name": "Chen",
      "email": "robert.chen@email.com",
      "phone": "+1-555-0201",
      "applied_date": "2026-04-12T10:00:00.000Z",
      "cover_letter": "Excited to join your team...",
      "resume_url": "https://resume.storage/robert-chen.pdf",
      "status": "OFFERED",
      "notes": "Strong technical skills",
      "hired_employee_id": null,
      "hire_date": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4
  }
}
```

---

### GET /recruitment/applications/:id
Get single application.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):** Application object

---

### POST /recruitment/applications
Submit job application (public - no auth required).

**Request:**
```json
{
  "job_posting_id": 1,
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1-555-9999",
  "cover_letter": "I am excited about this opportunity...",
  "resume_url": "https://resume.storage/jane-smith.pdf"
}
```

**Validation:**
- Job posting must be OPEN
- Email is required

**Response (201 Created):** Application object with status=NEW

---

### PUT /recruitment/applications/:id
Update application status. **(HR_ADMIN or RECRUITER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "status": "INTERVIEWED",
  "notes": "Great performance in technical interview"
}
```

**Valid statuses:** NEW, UNDER_REVIEW, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN

**Response (200 OK):** Updated application

---

### POST /recruitment/applications/:id/hire
Convert application to hired employee. **(HR_ADMIN only)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "employee_id": "EMP016",
  "job_title": "Senior Frontend Developer",
  "department_id": 2,
  "manager_id": 6,
  "employment_type": "FULL_TIME",
  "hire_date": "2026-05-01",
  "salary": 135000
}
```

**Workflow:**
1. Creates new EMPLOYEE record from APPLICATION data
2. Links APPLICATION.hired_employee_id to new EMPLOYEE
3. Updates APPLICATION.status to HIRED
4. Application data is preserved in audit trail

**Response (201 Created):**
```json
{
  "message": "Applicant hired successfully",
  "employee_id": 16,
  "application": {
    "id": 1,
    "first_name": "Robert",
    "last_name": "Chen",
    "email": "robert.chen@email.com",
    "status": "HIRED",
    "hired_employee_id": 16
  }
}
```

---

### POST /recruitment/applications/:id/reject
Reject application. **(HR_ADMIN or RECRUITER)**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "notes": "Position filled internally"
}
```

**Response (200 OK):** Updated application with status=REJECTED

---

## Error Handling

### Standard Error Response Format

**401 Unauthorized:**
```json
{
  "message": "No token provided" or "Invalid token" or "Token expired"
}
```

**403 Forbidden:**
```json
{
  "message": "You do not have permission to perform this action"
}
```

**400 Bad Request:**
```json
{
  "message": "Missing required fields" or "Invalid input"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error",
  "error": {} // details in development mode
}
```

---

## Role-Based Access Control

### Endpoint Access Matrix

| Endpoint | EMPLOYEE | MANAGER | HR_ADMIN | RECRUITER | PAYROLL_OFFICER |
|----------|----------|---------|----------|-----------|-----------------|
| GET /employees | Own only | Own + team | All | All | All |
| POST /employees | ✗ | ✗ | ✓ | ✗ | ✗ |
| PUT /employees | ✗ | ✗ | ✓ | ✗ | ✗ |
| GET /leave | Own only | Own + team | All | ✗ | ✗ |
| POST /leave | Self only | Own + team | All | ✗ | ✗ |
| PUT /leave | Manager review | Manager review | ✓ | ✗ | ✗ |
| GET /performance | Own only | Own + team | All | ✗ | ✗ |
| POST /performance | ✗ | Own team | ✓ | ✗ | ✗ |
| POST /performance/:id/feedback | ✓ | ✓ | ✓ | ✗ | ✗ |
| GET /payroll | Own only | Own + team | All | ✗ | All |
| POST /payroll | ✗ | ✗ | ✓ | ✗ | ✓ |
| GET /training | Own only | ✓ | All | ✗ | ✗ |
| POST /training | Self + HR | ✓ | ✓ | ✗ | ✗ |
| POST /recruitment/postings | ✗ | ✗ | ✓ | ✓ | ✗ |
| GET /recruitment/applications | ✗ | ✗ | ✓ | ✓ | ✗ |
| POST /recruitment/applications/:id/hire | ✗ | ✗ | ✓ | ✗ | ✗ |

---

## Authentication Example (cURL)

### Step 1: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.smith",
    "password": "any_password"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Step 2: Use token in subsequent requests
```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## API Testing Tools

Recommended tools for testing this API:
- **Postman** - Visual API testing client
- **Insomnia** - REST client alternative
- **curl** - Command-line HTTP client
- **VS Code REST Client** - Extension for testing in VS Code
- **Thunder Client** - VS Code extension for REST APIs

---

## Rate Limiting (Future)

Future versions may implement rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per user account

---

## API Versioning (Future)

Future API versions will use URL versioning:
- `/api/v1/...` - Current version
- `/api/v2/...` - Future major versions

---

## Conclusion

This API provides comprehensive HR management capabilities with:
- ✅ Full CRUD operations for all entities
- ✅ Role-based access control
- ✅ Workflow management (leave approvals, hiring, reviews)
- ✅ Aggregate calculations (payroll, leave balance, feedback ratings)
- ✅ Comprehensive error handling
- ✅ Pagination and filtering

For questions or issues, refer to the main README and Architecture documentation.
