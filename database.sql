-- ==========================================
-- Database Creation Script
-- Target Database: SQL Server (T-SQL)
-- ==========================================

-- Create Database
CREATE DATABASE AppointmentDB;
GO

USE AppointmentDB;
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
