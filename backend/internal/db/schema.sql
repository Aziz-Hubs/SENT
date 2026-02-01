-- Core tables
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    identifier VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255),
    transaction_limit NUMERIC DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants (id),
    app_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    actor_id VARCHAR(255),
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants (id),
    ticket_id INTEGER REFERENCES tickets (id),
    technician_id INTEGER REFERENCES users (id),
    duration_hours NUMERIC NOT NULL,
    note TEXT,
    is_billable BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    zitadel_id VARCHAR(255) UNIQUE NOT NULL,
    employee_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    status VARCHAR(50) DEFAULT 'STAGED', -- STAGED, ACTIVE, TERMINATED
    salary_encrypted TEXT NOT NULL,
    bank_details_encrypted TEXT,
    hipo_status BOOLEAN DEFAULT false,
    department_id INTEGER REFERENCES departments (id),
    manager_id INTEGER REFERENCES employees (id),
    signature_hash TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    zitadel_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    job_title VARCHAR(255),
    department VARCHAR(255),
    role VARCHAR(50),
    seniority VARCHAR(50),
    max_wip INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- People module tables
CREATE TABLE compensation_agreements (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    base_salary NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    effective_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE succession_maps (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    backup_candidate_id INTEGER NOT NULL REFERENCES employees (id),
    readiness_level VARCHAR(50), -- EMERGENCY, READY_1_YEAR, READY_2_YEAR
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE benefit_plans (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- HEALTH, DENTAL, VISION, 401K
    employer_contribution NUMERIC,
    employee_deduction NUMERIC,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE benefit_enrollments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    benefit_plan_id INTEGER NOT NULL REFERENCES benefit_plans (id),
    tier VARCHAR(50), -- INDIVIDUAL, COUPLE, FAMILY
    employee_cost NUMERIC,
    employer_cost NUMERIC,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (email, tenant_id)
);

CREATE TABLE time_off_policies (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    annual_allowance NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE time_off_balances (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    policy_id INTEGER NOT NULL REFERENCES time_off_policies (id),
    year INTEGER NOT NULL,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_cycles (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE performance_reviews (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    reviewer_id INTEGER REFERENCES employees (id),
    cycle_id INTEGER REFERENCES review_cycles (id),
    status VARCHAR(50) DEFAULT 'draft',
    review_type VARCHAR(50) DEFAULT 'annual', -- annual, peer, 360
    overall_rating VARCHAR(50),
    strengths TEXT,
    areas_for_improvement TEXT,
    manager_comments TEXT,
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    target_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    job_posting_id INTEGER REFERENCES job_postings (id),
    candidate_id INTEGER NOT NULL REFERENCES candidates (id),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    application_id INTEGER NOT NULL REFERENCES applications (id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interviewers (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (interview_id, employee_id)
);

-- Finance & Accounting (SENTcapital)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance NUMERIC DEFAULT 0,
    is_intercompany BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    description TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    total_amount NUMERIC NOT NULL,
    type VARCHAR(50),
    reference VARCHAR(255),
    uuid UUID UNIQUE,
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    is_intercompany BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    transaction_id INTEGER NOT NULL REFERENCES transactions (id),
    account_id INTEGER NOT NULL REFERENCES accounts (id),
    amount NUMERIC NOT NULL,
    direction VARCHAR(10) NOT NULL, -- debit, credit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    account_id INTEGER NOT NULL REFERENCES accounts (id),
    amount NUMERIC NOT NULL,
    direction VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_forecasts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    projected_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory & Stock (SENTstock)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    sku VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_cost NUMERIC DEFAULT 0,
    quantity NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    quantity NUMERIC NOT NULL,
    type VARCHAR(50) NOT NULL, -- IN, OUT, ADJUST
    reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets & IT (SENTnexus)
CREATE TABLE asset_types (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    hardware_id VARCHAR(255) UNIQUE,
    type VARCHAR(50) NOT NULL, -- HARDWARE, SOFTWARE, LICENSE
    status VARCHAR(50) DEFAULT 'available',
    owner_id INTEGER REFERENCES employees (id),
    purchase_date DATE,
    cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pilot module tables (Billing/Contracts)
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    remaining_hours NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_rates (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    work_type VARCHAR(255) NOT NULL,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    contract_id INTEGER NOT NULL REFERENCES contracts (id),
    hours NUMERIC NOT NULL,
    description TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    requester_id INTEGER REFERENCES users (id),
    assignee_id INTEGER REFERENCES users (id),
    asset_id INTEGER REFERENCES assets (id),
    deep_link VARCHAR(255),
    execution_plan JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE remediation_steps (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    ticket_id INTEGER NOT NULL REFERENCES tickets (id),
    action_name VARCHAR(255) NOT NULL,
    sequence INTEGER NOT NULL,
    content TEXT, -- Renamed/kept for flexibility
    output TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pulse module tables
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants (id),
    hostname VARCHAR(255) NOT NULL,
    os VARCHAR(50),
    arch VARCHAR(50),
    ip VARCHAR(50),
    mac VARCHAR(50),
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'online',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scripts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50), -- ps1, sh
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    name VARCHAR(255) NOT NULL,
    script_id INTEGER NOT NULL REFERENCES scripts (id),
    targets TEXT [],
    cron_schedule VARCHAR(255),
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE time_off_requests (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    type VARCHAR(50) NOT NULL, -- VACATION, SICK, etc.
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    requested_hours NUMERIC,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by_id INTEGER REFERENCES employees (id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);