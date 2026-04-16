-- HR Workforce Management System - PostgreSQL Schema
-- Created: April 16, 2026

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS FEEDBACK CASCADE;
DROP TABLE IF EXISTS PERFORMANCE_REVIEW CASCADE;
DROP TABLE IF EXISTS TRAINING_ENROLLMENT CASCADE;
DROP TABLE IF EXISTS APPLICATION CASCADE;
DROP TABLE IF EXISTS JOB_POSTING CASCADE;
DROP TABLE IF EXISTS PAYROLL CASCADE;
DROP TABLE IF EXISTS LEAVE_REQUEST CASCADE;
DROP TABLE IF EXISTS EMPLOYEE CASCADE;
DROP TABLE IF EXISTS DEPARTMENT CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;

-- ============================================
-- DEPARTMENT Table
-- ============================================
CREATE TABLE DEPARTMENT (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EMPLOYEE Table (Self-referencing for manager-subordinate hierarchy)
-- ============================================
CREATE TABLE EMPLOYEE (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(10),
    country VARCHAR(50),
    
    -- Employment Information
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    job_title VARCHAR(100),
    department_id INTEGER NOT NULL,
    manager_id INTEGER, -- Self-reference: NULL for CEO, otherwise points to another EMPLOYEE
    employment_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
    employment_type VARCHAR(50), -- FULL_TIME, PART_TIME, CONTRACT
    hire_date DATE NOT NULL,
    termination_date DATE,
    
    -- Account/System Information
    salary DECIMAL(12, 2),
    annual_leave_balance INT DEFAULT 20,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id) ON DELETE RESTRICT,
    FOREIGN KEY (manager_id) REFERENCES EMPLOYEE(id) ON DELETE SET NULL
);

-- ============================================
-- USER Table (Authentication - extends EMPLOYEE)
-- ============================================
CREATE TABLE "USER" (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- HR_ADMIN, MANAGER, EMPLOYEE, RECRUITER, PAYROLL_OFFICER
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id) ON DELETE CASCADE
);

-- ============================================
-- LEAVE_REQUEST Table
-- ============================================
CREATE TABLE LEAVE_REQUEST (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID, COMPASSIONATE
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INT NOT NULL,
    reason TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER, -- References EMPLOYEE (manager or HR)
    approval_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES EMPLOYEE(id) ON DELETE SET NULL,
    
    CHECK (end_date >= start_date)
);

-- ============================================
-- PERFORMANCE_REVIEW Table
-- ============================================
CREATE TABLE PERFORMANCE_REVIEW (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    
    -- Review details
    reviewed_by INTEGER NOT NULL, -- Usually manager, references EMPLOYEE
    review_date DATE,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 star scale
    comments TEXT,
    
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, FINALIZED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES EMPLOYEE(id) ON DELETE RESTRICT
);

-- ============================================
-- FEEDBACK Table (Separate for 360° multi-rater feedback)
-- ============================================
CREATE TABLE FEEDBACK (
    id SERIAL PRIMARY KEY,
    performance_review_id INTEGER NOT NULL,
    feedback_from_id INTEGER NOT NULL, -- Employee giving feedback, references EMPLOYEE
    feedback_type VARCHAR(50) NOT NULL, -- PEER, MANAGER, SELF, SUBORDINATE
    
    -- Feedback content
    rating INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 star scale
    feedback_text TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (performance_review_id) REFERENCES PERFORMANCE_REVIEW(id) ON DELETE CASCADE,
    FOREIGN KEY (feedback_from_id) REFERENCES EMPLOYEE(id) ON DELETE RESTRICT
);

-- ============================================
-- PAYROLL Table
-- ============================================
CREATE TABLE PAYROLL (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    payroll_period_start DATE NOT NULL,
    payroll_period_end DATE NOT NULL,
    
    -- Earnings
    base_salary DECIMAL(12, 2) NOT NULL,
    bonus DECIMAL(12, 2) DEFAULT 0,
    overtime_pay DECIMAL(12, 2) DEFAULT 0,
    other_earnings DECIMAL(12, 2) DEFAULT 0,
    
    -- Deductions
    tax_deduction DECIMAL(12, 2) NOT NULL,
    social_security DECIMAL(12, 2) DEFAULT 0,
    health_insurance DECIMAL(12, 2) DEFAULT 0,
    retirement_contribution DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    
    -- Summary (computed in application layer)
    gross_pay DECIMAL(12, 2),
    total_deductions DECIMAL(12, 2),
    net_pay DECIMAL(12, 2),
    
    payment_method VARCHAR(50), -- CHECK, DIRECT_DEPOSIT, WIRE_TRANSFER
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSED, PAID, DISPUTED
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id) ON DELETE CASCADE
);

-- ============================================
-- TRAINING_ENROLLMENT Table
-- ============================================
CREATE TABLE TRAINING_ENROLLMENT (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_description TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INT,
    provider VARCHAR(100),
    location VARCHAR(100),
    
    status VARCHAR(50) DEFAULT 'ENROLLED', -- ENROLLED, IN_PROGRESS, COMPLETED, CANCELLED
    completion_date DATE,
    certificate_issued BOOLEAN DEFAULT FALSE,
    
    cost DECIMAL(10, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(id) ON DELETE CASCADE
);

-- ============================================
-- JOB_POSTING Table
-- ============================================
CREATE TABLE JOB_POSTING (
    id SERIAL PRIMARY KEY,
    job_title VARCHAR(100) NOT NULL,
    job_description TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    
    -- Posting details
    location VARCHAR(100),
    employment_type VARCHAR(50), -- FULL_TIME, PART_TIME, CONTRACT
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closing_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, FILLED, CANCELLED
    created_by INTEGER, -- References EMPLOYEE (HR who posted)
    
    requirements TEXT,
    benefits TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES EMPLOYEE(id) ON DELETE SET NULL
);

-- ============================================
-- APPLICATION Table (Job applicant tracking)
-- ============================================
CREATE TABLE APPLICATION (
    id SERIAL PRIMARY KEY,
    job_posting_id INTEGER NOT NULL,
    
    -- Applicant Information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    
    -- Application Details
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cover_letter TEXT,
    resume_url VARCHAR(255),
    
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, UNDER_REVIEW, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN
    notes TEXT,
    
    -- Hired Reference
    hired_employee_id INTEGER, -- FK to EMPLOYEE when hired
    hire_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_posting_id) REFERENCES JOB_POSTING(id) ON DELETE CASCADE,
    FOREIGN KEY (hired_employee_id) REFERENCES EMPLOYEE(id) ON DELETE SET NULL
);

-- ============================================
-- Indexes for Performance Optimization
-- ============================================
CREATE INDEX idx_employee_department ON EMPLOYEE(department_id);
CREATE INDEX idx_employee_manager ON EMPLOYEE(manager_id);
CREATE INDEX idx_user_employee ON "USER"(employee_id);
CREATE INDEX idx_user_username ON "USER"(username);
CREATE INDEX idx_leave_employee ON LEAVE_REQUEST(employee_id);
CREATE INDEX idx_leave_status ON LEAVE_REQUEST(status);
CREATE INDEX idx_performance_employee ON PERFORMANCE_REVIEW(employee_id);
CREATE INDEX idx_performance_reviewer ON PERFORMANCE_REVIEW(reviewed_by);
CREATE INDEX idx_feedback_review ON FEEDBACK(performance_review_id);
CREATE INDEX idx_feedback_from ON FEEDBACK(feedback_from_id);
CREATE INDEX idx_payroll_employee ON PAYROLL(employee_id);
CREATE INDEX idx_payroll_period ON PAYROLL(payroll_period_start, payroll_period_end);
CREATE INDEX idx_training_employee ON TRAINING_ENROLLMENT(employee_id);
CREATE INDEX idx_job_department ON JOB_POSTING(department_id);
CREATE INDEX idx_application_posting ON APPLICATION(job_posting_id);
CREATE INDEX idx_application_status ON APPLICATION(status);
CREATE INDEX idx_application_hired_employee ON APPLICATION(hired_employee_id);
