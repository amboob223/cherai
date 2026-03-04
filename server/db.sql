-- there are four tables in this software as a service system with a secdevops focus 




CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN('admin','manager','employee','auditor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE Policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    owner_id UUID REFERENCES Users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft','active','archived')),
    review_date DATE,
    version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES Users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending','in_progress','completed')),
    priority VARCHAR(20) CHECK (priority IN ('low','medium','high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AuditLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);