-- ==========================================
-- Database Creation Script
-- Target Database: PostgreSQL
-- ==========================================

-- Note: In PostgreSQL, you should create the database first, then connect to it
-- and run the schema script.
-- CREATE DATABASE swd;
-- \c swd;

-- =========================
-- Table: Patient
-- =========================
CREATE TABLE Patient (
    patient_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address VARCHAR(255)
);

-- =========================
-- Table: Doctor
-- =========================
CREATE TABLE Doctor (
    doctor_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    experience_years INT,
    license_number INT UNIQUE,
    working_time INT CHECK (working_time IN (1, 2)) -- 1 = Morning, 2 = Afternoon
);

-- =========================
-- Table: Appointment
-- =========================
CREATE TABLE Appointment (
    appointment_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    status VARCHAR(50),
    CONSTRAINT FK_Appointment_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_Appointment_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id)
);

-- =========================
-- Table: ICD10 (International Classification of Diseases)
-- =========================
CREATE TABLE ICD10 (
    icd_code VARCHAR(10) PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- =========================
-- Table: Medicine (Drug Catalog)
-- =========================
CREATE TABLE Medicine (
    medicine_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active_ingredient VARCHAR(100),
    dosage_form VARCHAR(50),            -- e.g., Tablet, Capsule, Liquid
    strength VARCHAR(50),               -- e.g., 500 mg, 10 ml
    manufacturer VARCHAR(100),
    description TEXT
);

-- =========================
-- Table: HealthRecord (Clinical Records)
-- =========================
CREATE TABLE HealthRecord (
    record_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50),
    appointment_id VARCHAR(50) NULL,
    record_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    diagnosis TEXT,              -- Plain text diagnosis summary
    icd_code VARCHAR(10) NULL,           -- Primary diagnosis ICD-10 Code
    treatment_plan TEXT,
    notes TEXT,
    CONSTRAINT FK_HealthRecord_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_HealthRecord_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id),
    CONSTRAINT FK_HealthRecord_Appointment
        FOREIGN KEY (appointment_id)
        REFERENCES Appointment(appointment_id),
    CONSTRAINT FK_HealthRecord_ICD10
        FOREIGN KEY (icd_code)
        REFERENCES ICD10(icd_code)
);

-- =========================
-- Table: Prescription (Prescription Headers)
-- =========================
CREATE TABLE Prescription (
    prescription_id VARCHAR(50) PRIMARY KEY,
    record_id VARCHAR(50) NOT NULL,      -- Associated medical visit/record
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT FK_Prescription_HealthRecord
        FOREIGN KEY (record_id)
        REFERENCES HealthRecord(record_id),
    CONSTRAINT FK_Prescription_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_Prescription_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id)
);

-- =========================
-- Table: PrescriptionDetail (Prescribed Medicines)
-- =========================
CREATE TABLE PrescriptionDetail (
    prescription_detail_id VARCHAR(50) PRIMARY KEY,
    prescription_id VARCHAR(50) NOT NULL,
    medicine_id VARCHAR(50) NOT NULL,
    dosage VARCHAR(100) NOT NULL,        -- e.g., 1 tablet, 2 puffs
    frequency VARCHAR(100) NOT NULL,     -- e.g., 3 times daily, before meals
    duration VARCHAR(50) NOT NULL,       -- e.g., 7 days, 1 month
    quantity INT NOT NULL DEFAULT 1,
    notes VARCHAR(255),
    CONSTRAINT FK_PrescriptionDetail_Prescription
        FOREIGN KEY (prescription_id)
        REFERENCES Prescription(prescription_id),
    CONSTRAINT FK_PrescriptionDetail_Medicine
        FOREIGN KEY (medicine_id)
        REFERENCES Medicine(medicine_id)
);

-- =========================
-- Table: Users (Authentication & Roles)
-- =========================
CREATE TABLE Users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Patient', 'Staff')),
    patient_id VARCHAR(50) NULL,         -- Links to Patient table if user is a Patient
    doctor_id VARCHAR(50) NULL,          -- Links to Doctor table if user is a Doctor
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    CONSTRAINT FK_Users_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_Users_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id)
);

-- ==========================================
-- Seed Data for Testing (UC14)
-- ==========================================

-- Insert Patients
INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48920', 'Nguyễn Văn Hùng', '1992-05-18', '0987654321', 'hung.nguyen@email.com', '123 Đường Cầu Giấy, Hà Nội');

INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48921', 'Trần Thị Bích', '1985-11-03', '0912345678', 'bich.tran@email.com', '45 Lê Lợi, Quận 1, TP.HCM');

INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48922', 'Lê Minh Hoàng', '1978-07-22', '0908765432', 'hoang.le@email.com', '78 Trần Hưng Đạo, Đà Nẵng');

-- Insert Doctors
-- working_time: 1 = Morning (08:00-12:00), 2 = Afternoon (13:00-17:00)
INSERT INTO Doctor (doctor_id, name, specialty, experience_years, license_number, working_time)
VALUES ('DOC-12345', 'Lê Văn Quân', 'Đa Khoa', 8, 9876543, 1);

-- Insert Appointments (today = 2026-07-13, all Pending/In Progress for the worklist demo)
INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10023', 'PAT-48920', 'DOC-12345', '2026-07-13', '14:30:00', 'Pending');

INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10024', 'PAT-48921', 'DOC-12345', '2026-07-13', '15:00:00', 'Pending');

INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10025', 'PAT-48922', 'DOC-12345', '2026-07-13', '15:30:00', 'In Progress');

-- Insert ICD10 Codes
INSERT INTO ICD10 (icd_code, disease_name, description)
VALUES 
('J06', 'Nhiễm khuẩn đường hô hấp trên cấp tính nhiều nơi', 'Viêm mũi họng cấp, cảm lạnh thông thường'),
('I10', 'Tăng huyết áp vô căn (nguyên phát)', 'Huyết áp cao không rõ nguyên nhân'),
('E11', 'Đái tháo đường không phụ thuộc insulin', 'Tiểu đường type 2'),
('A09', 'Tiêu chảy và viêm dạ dày ruột do nhiễm khuẩn', 'Nhiễm trùng tiêu hóa cấp tính');

-- Insert Medicines
INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
VALUES 
('MED-001', 'Paracetamol 500mg', 'Paracetamol', 'Tablet', '500 mg', 'DHG Pharma', 'Giảm đau, hạ sốt'),
('MED-002', 'Amoxicillin 500mg', 'Amoxicillin', 'Capsule', '500 mg', 'Mekophar', 'Kháng sinh điều trị nhiễm khuẩn'),
('MED-003', 'Ibuprofen 400mg', 'Ibuprofen', 'Tablet', '400 mg', 'Domesco', 'Kháng viêm giảm đau'),
('MED-004', 'Omeprazole 20mg', 'Omeprazole', 'Capsule', '20 mg', 'Imexpharm', 'Giảm axit dạ dày');



    -- Permission Table: Defines access levels for management [Source 8]
    CREATE TABLE IF NOT EXISTS Permission (
        permission_id SERIAL PRIMARY KEY,
        permission_name VARCHAR(50) NOT NULL,
        description TEXT
    );

    -- Initial Permission Data [Source 8]
    INSERT INTO Permission (permission_id, permission_name, description) VALUES
    (1, 'Admin', 'Manages the system, have system CRUD Access, see overall log reports'),
    (2, 'Doctor', 'Medical professionals responsible for patient care'),
    (3, 'Patient', 'End-users receiving medical treatment')
    ON CONFLICT (permission_id) DO NOTHING;

    -- UserInfo Table: Separated from login table for management details [Source 7, 8]
    CREATE TABLE IF NOT EXISTS UserInfo (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES Users(user_id), -- Links to your existing login table
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        permission_id INT REFERENCES Permission(permission_id),
        management_status VARCHAR(20) DEFAULT 'Active' -- Active, Locked, Deactivated [Source 7]
    );
