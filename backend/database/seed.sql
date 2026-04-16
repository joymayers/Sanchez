-- HR Workforce Management System - Seed Data
-- Sample data for testing with multi-level hierarchy

-- ============================================
-- DEPARTMENT Data
-- ============================================
INSERT INTO DEPARTMENT (name, description) VALUES
    ('Executive', 'Executive Leadership Team'),
    ('Engineering', 'Software Development and Technical Services'),
    ('Human Resources', 'HR and People Operations'),
    ('Finance', 'Financial Planning and Management'),
    ('Sales', 'Sales and Business Development'),
    ('Marketing', 'Marketing and Communications'),
    ('Operations', 'Operations and Administration');

-- ============================================
-- EMPLOYEE Data (With Hierarchy: CEO → Dept Heads → Managers → Employees)
-- ============================================
INSERT INTO EMPLOYEE (
    first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country,
    employee_id, job_title, department_id, manager_id, employment_status, employment_type, hire_date, salary, annual_leave_balance
) VALUES
    -- Level 1: CEO (no manager)
    ('John', 'Smith', 'john.smith@company.com', '+1-555-0101', '1970-05-15', 'Male', '123 Executive Ave', 'New York', 'NY', '10001', 'USA',
     'EMP001', 'Chief Executive Officer', 1, NULL, 'ACTIVE', 'FULL_TIME', '2015-01-01', 250000, 25),
    
    -- Level 2: Department Heads (report to CEO)
    ('Sarah', 'Johnson', 'sarah.johnson@company.com', '+1-555-0102', '1982-08-22', 'Female', '456 Tech Blvd', 'New York', 'NY', '10002', 'USA',
     'EMP002', 'VP Engineering', 2, 1, 'ACTIVE', 'FULL_TIME', '2016-03-15', 180000, 25),
    
    ('Michael', 'Brown', 'michael.brown@company.com', '+1-555-0103', '1975-12-10', 'Male', '789 Finance St', 'Boston', 'MA', '02101', 'USA',
     'EMP003', 'VP Finance', 4, 1, 'ACTIVE', 'FULL_TIME', '2014-06-01', 175000, 25),
    
    ('Emily', 'Davis', 'emily.davis@company.com', '+1-555-0104', '1985-03-18', 'Female', '321 HR Plaza', 'Chicago', 'IL', '60601', 'USA',
     'EMP004', 'Head of Human Resources', 3, 1, 'ACTIVE', 'FULL_TIME', '2017-01-10', 165000, 25),
    
    -- Level 3: Managers (report to Department Heads)
    ('Robert', 'Wilson', 'robert.wilson@company.com', '+1-555-0105', '1980-07-20', 'Male', '555 Dev Lane', 'New York', 'NY', '10003', 'USA',
     'EMP005', 'Engineering Manager - Backend', 2, 2, 'ACTIVE', 'FULL_TIME', '2018-02-01', 130000, 20),
    
    ('Jessica', 'Martinez', 'jessica.martinez@company.com', '+1-555-0106', '1988-11-05', 'Female', '666 UI Road', 'New York', 'NY', '10004', 'USA',
     'EMP006', 'Engineering Manager - Frontend', 2, 2, 'ACTIVE', 'FULL_TIME', '2019-05-15', 125000, 20),
    
    ('David', 'Garcia', 'david.garcia@company.com', '+1-555-0107', '1978-01-30', 'Male', '777 Accounting Ave', 'Boston', 'MA', '02102', 'USA',
     'EMP007', 'Finance Manager - Accounting', 4, 3, 'ACTIVE', 'FULL_TIME', '2016-09-01', 95000, 20),
    
    ('Lisa', 'Anderson', 'lisa.anderson@company.com', '+1-555-0108', '1987-09-14', 'Female', '888 Recruitment St', 'Chicago', 'IL', '60602', 'USA',
     'EMP008', 'Recruitment Manager', 3, 4, 'ACTIVE', 'FULL_TIME', '2019-03-01', 90000, 20),
    
    -- Level 4: Individual Contributors (report to Managers)
    ('Alex', 'Taylor', 'alex.taylor@company.com', '+1-555-0109', '1995-04-22', 'Male', '999 Backend St', 'New York', 'NY', '10005', 'USA',
     'EMP009', 'Senior Backend Developer', 2, 5, 'ACTIVE', 'FULL_TIME', '2020-01-15', 110000, 20),
    
    ('Maria', 'Thomas', 'maria.thomas@company.com', '+1-555-0110', '1993-06-30', 'Female', '101 Frontend Ave', 'New York', 'NY', '10006', 'USA',
     'EMP010', 'Frontend Developer', 2, 6, 'ACTIVE', 'FULL_TIME', '2020-06-01', 95000, 20),
    
    ('Chris', 'Jackson', 'chris.jackson@company.com', '+1-555-0111', '1998-02-14', 'Male', '102 Backend Ave', 'New York', 'NY', '10007', 'USA',
     'EMP011', 'Junior Backend Developer', 2, 5, 'ACTIVE', 'FULL_TIME', '2022-01-10', 75000, 20),
    
    ('Jennifer', 'Lee', 'jennifer.lee@company.com', '+1-555-0112', '1994-08-08', 'Female', '103 Frontend Blvd', 'New York', 'NY', '10008', 'USA',
     'EMP012', 'Frontend Developer', 2, 6, 'ACTIVE', 'FULL_TIME', '2021-03-15', 90000, 20),
    
    ('Tom', 'Harris', 'tom.harris@company.com', '+1-555-0113', '1992-10-20', 'Male', '104 Accounting Rd', 'Boston', 'MA', '02103', 'USA',
     'EMP013', 'Accountant', 4, 7, 'ACTIVE', 'FULL_TIME', '2020-07-01', 65000, 20),
    
    ('Anna', 'Clark', 'anna.clark@company.com', '+1-555-0114', '1996-12-12', 'Female', '105 Recruitment Rd', 'Chicago', 'IL', '60603', 'USA',
     'EMP014', 'Recruitment Specialist', 3, 8, 'ACTIVE', 'FULL_TIME', '2021-09-01', 60000, 20),
    
    ('Kevin', 'White', 'kevin.white@company.com', '+1-555-0115', '1991-05-25', 'Male', '106 Sales Ave', 'San Francisco', 'CA', '94101', 'USA',
     'EMP015', 'Sales Representative', 5, 1, 'ACTIVE', 'FULL_TIME', '2019-11-01', 85000, 20);

-- ============================================
-- USER Data (Authentication)
-- ============================================
INSERT INTO "USER" (employee_id, username, password_hash, role, is_active) VALUES
    (1, 'john.smith', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'HR_ADMIN', TRUE),
    (2, 'sarah.johnson', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (3, 'michael.brown', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (4, 'emily.davis', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'HR_ADMIN', TRUE),
    (5, 'robert.wilson', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (6, 'jessica.martinez', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (7, 'david.garcia', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (8, 'lisa.anderson', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'MANAGER', TRUE),
    (9, 'alex.taylor', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (10, 'maria.thomas', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (11, 'chris.jackson', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (12, 'jennifer.lee', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (13, 'tom.harris', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (14, 'anna.clark', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE),
    (15, 'kevin.white', '$2b$10$YK5wJCZrE.5.JGCzGJqJte.m9vPfBv6W8H0L1e.9rz0b0H8G4qVEm', 'EMPLOYEE', TRUE);

-- ============================================
-- LEAVE_REQUEST Data
-- ============================================
INSERT INTO LEAVE_REQUEST (employee_id, leave_type, start_date, end_date, number_of_days, reason, status, approved_by, approval_date) VALUES
    (9, 'ANNUAL', '2026-05-01', '2026-05-05', 5, 'Vacation', 'APPROVED', 5, '2026-04-10'),
    (10, 'SICK', '2026-04-14', '2026-04-14', 1, 'Medical appointment', 'APPROVED', 6, '2026-04-14'),
    (11, 'ANNUAL', '2026-06-01', '2026-06-10', 10, 'Summer vacation', 'PENDING', NULL, NULL),
    (12, 'ANNUAL', '2026-05-15', '2026-05-20', 5, 'Personal time', 'APPROVED', 6, '2026-04-15');

-- ============================================
-- PERFORMANCE_REVIEW Data
-- ============================================
INSERT INTO PERFORMANCE_REVIEW (employee_id, review_period_start, review_period_end, reviewed_by, review_date, rating, comments, status) VALUES
    (9, '2025-01-01', '2025-12-31', 5, '2026-01-15', 4, 'Excellent technical skills and team collaboration', 'FINALIZED'),
    (10, '2025-01-01', '2025-12-31', 6, '2026-01-20', 4, 'Strong front-end development abilities', 'FINALIZED'),
    (11, '2025-01-01', '2025-12-31', 5, '2026-01-18', 3, 'Good potential, needs more experience', 'FINALIZED'),
    (5, '2025-01-01', '2025-12-31', 2, '2026-02-01', 5, 'Outstanding leadership and technical expertise', 'FINALIZED');

-- ============================================
-- FEEDBACK Data (360° Multi-rater Feedback)
-- ============================================
INSERT INTO FEEDBACK (performance_review_id, feedback_from_id, feedback_type, rating, feedback_text, is_anonymous) VALUES
    -- Feedback for Alex Taylor (EMP009) - Performance Review ID 1
    (1, 5, 'SELF', 4, 'I have strong technical skills and contribute well to the team. I could improve my communication with non-technical stakeholders.', FALSE),
    (1, 6, 'PEER', 4, 'Alex is great to work with, always willing to help with backend-frontend integration issues.', FALSE),
    (1, 10, 'PEER', 3, 'Good backend work but could be more proactive in cross-team communication.', FALSE),
    
    -- Feedback for Maria Thomas (EMP010) - Performance Review ID 2
    (2, 6, 'SELF', 4, 'Proud of my frontend development work. I want to improve my project leadership skills.', FALSE),
    (2, 5, 'PEER', 4, 'Maria delivers quality frontend code on time consistently.', FALSE),
    (2, 9, 'PEER', 4, 'Very professional and responsive to code reviews.', TRUE),
    
    -- Feedback for Chris Jackson (EMP011) - Performance Review ID 3
    (3, 5, 'SELF', 3, 'I am learning quickly but need more guidance on complex architectural decisions.', FALSE),
    (3, 9, 'PEER', 3, 'Chris shows promise but still developing technical depth.', FALSE),
    (3, 12, 'PEER', 3, 'Good energy and willing to learn. Code quality could be improved.', FALSE),
    
    -- Feedback for Robert Wilson (EMP005) - Performance Review ID 4
    (4, 2, 'SELF', 5, 'Proud of the backend team I have built and the projects we deliver.', FALSE),
    (4, 9, 'SUBORDINATE', 5, 'Robert is an excellent mentor and provides clear guidance.', FALSE),
    (4, 11, 'SUBORDINATE', 4, 'Great manager, very supportive and patient.', FALSE),
    (4, 3, 'PEER', 5, 'Robert collaborates well with other departments on financial systems.', FALSE);

-- ============================================
-- PAYROLL Data
-- ============================================
INSERT INTO PAYROLL (
    employee_id, payroll_period_start, payroll_period_end, 
    base_salary, bonus, overtime_pay, other_earnings,
    tax_deduction, social_security, health_insurance, retirement_contribution, other_deductions,
    payment_method, payment_date, status
) VALUES
    (9, '2026-04-01', '2026-04-15', 5416.67, 0, 250, 0, 850, 412, 350, 325, 0, 'DIRECT_DEPOSIT', '2026-04-17', 'PAID'),
    (10, '2026-04-01', '2026-04-15', 4583.33, 0, 0, 0, 680, 350, 350, 275, 0, 'DIRECT_DEPOSIT', '2026-04-17', 'PAID'),
    (11, '2026-04-01', '2026-04-15', 2916.67, 0, 150, 0, 380, 223, 350, 175, 0, 'DIRECT_DEPOSIT', '2026-04-17', 'PAID'),
    (5, '2026-04-01', '2026-04-15', 6333.33, 1000, 0, 0, 1200, 484, 350, 380, 0, 'DIRECT_DEPOSIT', '2026-04-17', 'PAID');

-- ============================================
-- TRAINING_ENROLLMENT Data
-- ============================================
INSERT INTO TRAINING_ENROLLMENT (
    employee_id, training_name, training_description, 
    start_date, end_date, duration_hours, provider, location,
    status, completion_date, certificate_issued, cost
) VALUES
    (9, 'Advanced Python Programming', 'Deep dive into Python advanced features', '2026-02-01', '2026-03-15', 40, 'TechLearn', 'Online', 'COMPLETED', '2026-03-15', TRUE, 500),
    (10, 'React Advanced Patterns', 'Master React hooks and performance optimization', '2026-03-01', '2026-04-15', 30, 'ReactCourse', 'Online', 'IN_PROGRESS', NULL, FALSE, 450),
    (11, 'Git & Version Control', 'Professional Git workflows', '2026-04-15', '2026-04-20', 16, 'DevOps Academy', 'Online', 'ENROLLED', NULL, FALSE, 300),
    (5, 'Leadership Excellence', 'Strategic leadership and team management', '2026-02-01', '2026-03-01', 20, 'Executive Training', 'New York', 'COMPLETED', '2026-03-01', TRUE, 1500);

-- ============================================
-- JOB_POSTING Data
-- ============================================
INSERT INTO JOB_POSTING (
    job_title, job_description, department_id,
    location, employment_type, salary_min, salary_max,
    closing_date, status, created_by,
    requirements, benefits
) VALUES
    ('Senior Frontend Developer', 'We are looking for an experienced React developer to lead our frontend team.', 2,
     'New York, NY', 'FULL_TIME', 120000, 150000, '2026-05-15', 'OPEN', 6,
     'React, TypeScript, CSS, REST APIs, 5+ years experience', 'Health insurance, 401k, flexible hours'),
    
    ('Data Analyst', 'Join our analytics team to transform business data into insights.', 4,
     'Boston, MA', 'FULL_TIME', 85000, 110000, '2026-05-20', 'OPEN', 3,
     'SQL, Python, Tableau, 3+ years experience', 'Health insurance, 401k, training budget'),
    
    ('HR Coordinator', 'Support HR operations and employee engagement initiatives.', 3,
     'Chicago, IL', 'FULL_TIME', 55000, 70000, '2026-05-10', 'OPEN', 4,
     'HR knowledge, excellent communication, 2+ years experience', 'Health insurance, 401k, flexible hours'),
    
    ('Sales Engineer', 'Technical sales support for enterprise clients.', 5,
     'San Francisco, CA', 'FULL_TIME', 95000, 130000, '2026-05-25', 'CLOSED', 1,
     'Technical background, sales experience, client relations', 'Commission, health insurance, 401k');

-- ============================================
-- APPLICATION Data
-- ============================================
INSERT INTO APPLICATION (
    job_posting_id, first_name, last_name, email, phone,
    cover_letter, resume_url, status, notes, hired_employee_id, hire_date
) VALUES
    (1, 'Robert', 'Chen', 'robert.chen@email.com', '+1-555-0201',
     'Excited to join your team and leverage my React expertise.', 'https://resume.storage/robert-chen.pdf', 'OFFERED', 'Strong technical skills', NULL, NULL),
    
    (1, 'Sarah', 'Wong', 'sarah.wong@email.com', '+1-555-0202',
     'Passionate about frontend development and mentoring junior developers.', 'https://resume.storage/sarah-wong.pdf', 'UNDER_REVIEW', 'Excellent communication skills', NULL, NULL),
    
    (2, 'James', 'Miller', 'james.miller@email.com', '+1-555-0203',
     'Data analyst with 3 years SQL and Tableau experience.', 'https://resume.storage/james-miller.pdf', 'INTERVIEWED', 'Good technical background', NULL, NULL),
    
    (3, 'Michelle', 'Garcia', 'michelle.garcia@email.com', '+1-555-0204',
     'HR professional eager to contribute to employee experience.', 'https://resume.storage/michelle-garcia.pdf', 'HIRED', 'Great fit for the team', NULL, '2026-05-01');
