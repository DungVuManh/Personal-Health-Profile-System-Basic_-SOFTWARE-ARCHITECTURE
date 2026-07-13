-- ==========================================
-- Database Creation Script
-- Target Database: SQL Server (T-SQL)
-- ==========================================

-- Create Database
CREATE DATABASE swd;
GO

USE swd;
GO


-- =========================
-- Table: Patient
-- =========================
CREATE TABLE Patient (
    patient_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    dob DATE,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address NVARCHAR(255)
);
GO


-- =========================
-- Table: Doctor
-- =========================
CREATE TABLE Doctor (
    doctor_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    specialty NVARCHAR(100),
    experience_years INT,
    license_number INT UNIQUE
);
GO


-- =========================
-- Table: Appointment
-- =========================
CREATE TABLE Appointment (
    appointment_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    status NVARCHAR(50),
    CONSTRAINT FK_Appointment_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_Appointment_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id)
);
GO


-- =========================
-- Table: ICD10 (International Classification of Diseases)
-- =========================
CREATE TABLE ICD10 (
    icd_code VARCHAR(10) PRIMARY KEY,
    disease_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX)
);
GO


-- =========================
-- Table: Medicine (Drug Catalog)
-- =========================
CREATE TABLE Medicine (
    medicine_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    active_ingredient NVARCHAR(100),
    dosage_form NVARCHAR(50),            -- e.g., Tablet, Capsule, Liquid
    strength NVARCHAR(50),               -- e.g., 500 mg, 10 ml
    manufacturer NVARCHAR(100),
    description NVARCHAR(MAX)
);
GO


-- =========================
-- Table: HealthRecord (Clinical Records)
-- =========================
CREATE TABLE HealthRecord (
    record_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50),
    appointment_id VARCHAR(50) NULL,
    record_date DATETIME NOT NULL DEFAULT GETDATE(),
    symptoms NVARCHAR(MAX),
    diagnosis NVARCHAR(MAX),              -- Plain text diagnosis summary
    icd_code VARCHAR(10) NULL,           -- Primary diagnosis ICD-10 Code
    treatment_plan NVARCHAR(MAX),
    notes NVARCHAR(MAX),
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
GO


-- =========================
-- Table: Prescription (Prescription Headers)
-- =========================
CREATE TABLE Prescription (
    prescription_id VARCHAR(50) PRIMARY KEY,
    record_id VARCHAR(50) NOT NULL,      -- Associated medical visit/record
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    created_date DATETIME NOT NULL DEFAULT GETDATE(),
    notes NVARCHAR(MAX),
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
GO


-- =========================
-- Table: PrescriptionDetail (Prescribed Medicines)
-- =========================
CREATE TABLE PrescriptionDetail (
    prescription_detail_id VARCHAR(50) PRIMARY KEY,
    prescription_id VARCHAR(50) NOT NULL,
    medicine_id VARCHAR(50) NOT NULL,
    dosage NVARCHAR(100) NOT NULL,        -- e.g., 1 tablet, 2 puffs
    frequency NVARCHAR(100) NOT NULL,     -- e.g., 3 times daily, before meals
    duration NVARCHAR(50) NOT NULL,       -- e.g., 7 days, 1 month
    quantity INT NOT NULL DEFAULT 1,
    notes NVARCHAR(255),
    CONSTRAINT FK_PrescriptionDetail_Prescription
        FOREIGN KEY (prescription_id)
        REFERENCES Prescription(prescription_id),
    CONSTRAINT FK_PrescriptionDetail_Medicine
        FOREIGN KEY (medicine_id)
        REFERENCES Medicine(medicine_id)
);
GO


-- =========================
-- Table: Users (Authentication & Roles)
-- =========================
CREATE TABLE Users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Patient', 'Staff')),
    patient_id VARCHAR(50) NULL,         -- Links to Patient table if user is a Patient
    doctor_id VARCHAR(50) NULL,          -- Links to Doctor table if user is a Doctor
    status NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    CONSTRAINT FK_Users_Patient
        FOREIGN KEY (patient_id)
        REFERENCES Patient(patient_id),
    CONSTRAINT FK_Users_Doctor
        FOREIGN KEY (doctor_id)
        REFERENCES Doctor(doctor_id)
);
GO


-- ==========================================
-- Seed Data for Testing (UC14)
-- ==========================================

-- Insert Patients
INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48920', N'Nguyễn Văn Hùng', '1992-05-18', '0987654321', 'hung.nguyen@email.com', N'123 Đường Cầu Giấy, Hà Nội');
GO

INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48921', N'Trần Thị Bích', '1985-11-03', '0912345678', 'bich.tran@email.com', N'45 Lê Lợi, Quận 1, TP.HCM');
GO

INSERT INTO Patient (patient_id, name, dob, phone, email, address)
VALUES ('PAT-48922', N'Lê Minh Hoàng', '1978-07-22', '0908765432', 'hoang.le@email.com', N'78 Trần Hưng Đạo, Đà Nẵng');
GO

-- Insert Doctors
INSERT INTO Doctor (doctor_id, name, specialty, experience_years, license_number)
VALUES ('DOC-12345', N'Lê Văn Quân', N'Đa Khoa', 8, 9876543);
GO

-- Insert Appointments (today = 2026-07-13, all Pending/In Progress for the worklist demo)
INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10023', 'PAT-48920', 'DOC-12345', '2026-07-13', '14:30:00', N'Pending');
GO

INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10024', 'PAT-48921', 'DOC-12345', '2026-07-13', '15:00:00', N'Pending');
GO

INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
VALUES ('APP-10025', 'PAT-48922', 'DOC-12345', '2026-07-13', '15:30:00', N'In Progress');
GO

-- Insert ICD10 Codes
INSERT INTO ICD10 (icd_code, disease_name, description)
VALUES 
('J06', N'Nhiễm khuẩn đường hô hấp trên cấp tính nhiều nơi', N'Viêm mũi họng cấp, cảm lạnh thông thường'),
('I10', N'Tăng huyết áp vô căn (nguyên phát)', N'Huyết áp cao không rõ nguyên nhân'),
('E11', N'Đái tháo đường không phụ thuộc insulin', N'Tiểu đường type 2'),
('A09', N'Tiêu chảy và viêm dạ dày ruột do nhiễm khuẩn', N'Nhiễm trùng tiêu hóa cấp tính');
GO

-- Insert Medicines
INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
VALUES 
('MED-001', 'Paracetamol 500mg', 'Paracetamol', 'Tablet', '500 mg', 'DHG Pharma', N'Giảm đau, hạ sốt'),
('MED-002', 'Amoxicillin 500mg', 'Amoxicillin', 'Capsule', '500 mg', 'Mekophar', N'Kháng sinh điều trị nhiễm khuẩn'),
('MED-003', 'Ibuprofen 400mg', 'Ibuprofen', 'Tablet', '400 mg', 'Domesco', N'Kháng viêm giảm đau'),
('MED-004', 'Omeprazole 20mg', 'Omeprazole', 'Capsule', '20 mg', 'Imexpharm', N'Giảm axit dạ dày');
GO
