-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('nurse', 'lab_tech', 'pathologist', 'lis')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    medical_record_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specimens table
CREATE TABLE specimens (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Blood', 'Urine', 'Tissue', 'Saliva')),
    collected_by INT REFERENCES users(id),
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Collected' CHECK (status IN ('Collected', 'Received', 'Processing', 'Resulted', 'Verified'))
);

-- Specimen log table (audit trail)
CREATE TABLE specimen_log (
    id SERIAL PRIMARY KEY,
    specimen_id INT REFERENCES specimens(id),
    updated_by INT REFERENCES users(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Insert fake users
INSERT INTO users (name, email, password, role) VALUES
('Alice Nurse', 'alice@hospital.com', 'fake1', 'nurse'),
('Bob LabTech', 'bob@hospital.com', 'fake2', 'lab_tech'),
('Carol Path', 'carol@hospital.com', 'fake3', 'pathologist');

-- Insert fake patients
INSERT INTO patients (name, date_of_birth, medical_record_number) VALUES
('John Smith', '1985-03-15', 'MRN001'),
('Jane Doe', '1992-07-22', 'MRN002'),
('Bob Johnson', '1978-11-08', 'MRN003');

-- Insert fake specimens
INSERT INTO specimens (patient_id, type, collected_by, status) VALUES
(1, 'Blood', 1, 'Collected'),
(2, 'Urine', 1, 'Processing'),
(3, 'Tissue', 1, 'Resulted');