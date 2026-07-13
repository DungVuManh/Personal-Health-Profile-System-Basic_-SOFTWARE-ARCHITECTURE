-- ============================================================
-- FILE: seed_temp_data.sql
-- PURPOSE: Insert temporary/demo data for Appointment Worklist
--          feature testing (UC14 - Clinical Consultation)
-- DATABASE: swd (SQL Server)
-- SAFE TO RE-RUN: Uses IF NOT EXISTS checks on all inserts
-- DATE: 2026-07-13
-- ============================================================

USE swd;
GO

-- ============================================================
-- SECTION 1: PATIENTS (10 patients)
-- ============================================================
PRINT '>> Inserting Patients...';

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48920')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48920', N'Nguyễn Văn Hùng',   '1992-05-18', '0987654321', 'hung.nguyen@email.com',    N'123 Đường Cầu Giấy, Hà Nội');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48921')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48921', N'Trần Thị Bích',      '1985-11-03', '0912345678', 'bich.tran@email.com',      N'45 Lê Lợi, Quận 1, TP.HCM');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48922')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48922', N'Lê Minh Hoàng',      '1978-07-22', '0908765432', 'hoang.le@email.com',       N'78 Trần Hưng Đạo, Đà Nẵng');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48923')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48923', N'Phạm Thị Thu Hà',    '2000-03-15', '0934567890', 'thuha.pham@email.com',     N'22 Hoàng Văn Thụ, Hải Phòng');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48924')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48924', N'Đỗ Quốc Tuấn',       '1969-08-30', '0976543210', 'tuan.do@email.com',        N'56 Nguyễn Huệ, Huế');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48925')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48925', N'Ngô Thị Lan',        '1995-12-01', '0921098765', 'lan.ngo@email.com',        N'101 Đinh Tiên Hoàng, TP.HCM');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48926')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48926', N'Bùi Văn Thành',      '1988-06-20', '0945321678', 'thanh.bui@email.com',      N'9 Lý Thường Kiệt, Hà Nội');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48927')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48927', N'Vũ Thị Hương',       '2003-09-11', '0967812345', 'huong.vu@email.com',       N'34 Phan Đình Phùng, Đà Lạt');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48928')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48928', N'Hoàng Minh Tú',      '1975-04-07', '0902345678', 'tu.hoang@email.com',       N'67 Trường Chinh, Cần Thơ');

IF NOT EXISTS (SELECT 1 FROM Patient WHERE patient_id = 'PAT-48929')
    INSERT INTO Patient (patient_id, name, dob, phone, email, address)
    VALUES ('PAT-48929', N'Lý Thị Ngọc Ánh',   '1990-01-25', '0918765432', 'ngocanh.ly@email.com',     N'14 Võ Thị Sáu, Vũng Tàu');

GO
PRINT '   Done: 10 patients inserted (skipped if exists).';
GO

-- ============================================================
-- SECTION 2: DOCTORS (3 doctors)
-- ============================================================
PRINT '>> Inserting Doctors...';

IF NOT EXISTS (SELECT 1 FROM Doctor WHERE doctor_id = 'DOC-12345')
    INSERT INTO Doctor (doctor_id, name, specialty, experience_years, license_number)
    VALUES ('DOC-12345', N'Lê Văn Quân',        N'General Medicine',    8,  9876543);

IF NOT EXISTS (SELECT 1 FROM Doctor WHERE doctor_id = 'DOC-12346')
    INSERT INTO Doctor (doctor_id, name, specialty, experience_years, license_number)
    VALUES ('DOC-12346', N'Nguyễn Thị Mai',     N'Cardiology',         12, 9876544);

IF NOT EXISTS (SELECT 1 FROM Doctor WHERE doctor_id = 'DOC-12347')
    INSERT INTO Doctor (doctor_id, name, specialty, experience_years, license_number)
    VALUES ('DOC-12347', N'Trần Đức Hải',       N'Pediatrics',          6,  9876545);

GO
PRINT '   Done: 3 doctors inserted (skipped if exists).';
GO

-- ============================================================
-- SECTION 3: APPOINTMENTS
--   - Today (2026-07-13): 6 appointments for DOC-12345
--     (for the worklist demo — mix of Pending + In Progress)
--   - Yesterday (2026-07-12): 2 completed appointments
--   - Tomorrow (2026-07-14): 2 future appointments
-- ============================================================
PRINT '>> Inserting Appointments...';

-- === TODAY: DOC-12345 Worklist ===

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10023')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10023', 'PAT-48920', 'DOC-12345', '2026-07-13', '08:30:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10024')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10024', 'PAT-48921', 'DOC-12345', '2026-07-13', '09:00:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10025')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10025', 'PAT-48922', 'DOC-12345', '2026-07-13', '09:30:00', N'In Progress');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10026')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10026', 'PAT-48923', 'DOC-12345', '2026-07-13', '10:00:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10027')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10027', 'PAT-48924', 'DOC-12345', '2026-07-13', '10:30:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10028')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10028', 'PAT-48925', 'DOC-12345', '2026-07-13', '14:00:00', N'Pending');

-- === TODAY: DOC-12346 (Cardiology) ===

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10029')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10029', 'PAT-48926', 'DOC-12346', '2026-07-13', '09:00:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10030')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10030', 'PAT-48928', 'DOC-12346', '2026-07-13', '10:00:00', N'In Progress');

-- === YESTERDAY: Completed appointments ===

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10020')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10020', 'PAT-48920', 'DOC-12345', '2026-07-12', '08:30:00', N'Completed');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10021')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10021', 'PAT-48927', 'DOC-12345', '2026-07-12', '09:00:00', N'Completed');

-- === TOMORROW: Future appointments ===

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10031')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10031', 'PAT-48929', 'DOC-12345', '2026-07-14', '08:00:00', N'Pending');

IF NOT EXISTS (SELECT 1 FROM Appointment WHERE appointment_id = 'APP-10032')
    INSERT INTO Appointment (appointment_id, patient_id, doctor_id, appointment_date, start_time, status)
    VALUES ('APP-10032', 'PAT-48927', 'DOC-12347', '2026-07-14', '09:00:00', N'Pending');

GO
PRINT '   Done: 12 appointments inserted (skipped if exists).';
GO

-- ============================================================
-- SECTION 4: ICD-10 CODES (8 common codes)
-- ============================================================
PRINT '>> Inserting ICD-10 Codes...';

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'J06')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('J06', N'Acute upper respiratory infections of multiple sites', N'Viêm mũi họng cấp, cảm lạnh thông thường');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'I10')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('I10', N'Essential (primary) hypertension', N'Huyết áp cao không rõ nguyên nhân');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'E11')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('E11', N'Non-insulin-dependent diabetes mellitus (Type 2)', N'Tiểu đường type 2');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'A09')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('A09', N'Infectious gastroenteritis and colitis', N'Nhiễm trùng tiêu hóa cấp tính');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'K21')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('K21', N'Gastro-oesophageal reflux disease (GERD)', N'Trào ngược axit dạ dày thực quản');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'M54')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('M54', N'Dorsalgia (Back pain)', N'Đau lưng vùng cột sống');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'J45')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('J45', N'Asthma', N'Hen suyễn, co thắt phế quản');

IF NOT EXISTS (SELECT 1 FROM ICD10 WHERE icd_code = 'F32')
    INSERT INTO ICD10 (icd_code, disease_name, description)
    VALUES ('F32', N'Depressive episode', N'Trầm cảm từng giai đoạn');

GO
PRINT '   Done: 8 ICD-10 codes inserted (skipped if exists).';
GO

-- ============================================================
-- SECTION 5: MEDICINES (8 common medicines)
-- ============================================================
PRINT '>> Inserting Medicines...';

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-001')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-001', 'Paracetamol 500mg',    'Paracetamol',   'Tablet',  '500 mg',    'DHG Pharma',   N'Giảm đau, hạ sốt');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-002')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-002', 'Amoxicillin 500mg',    'Amoxicillin',   'Capsule', '500 mg',    'Mekophar',     N'Kháng sinh điều trị nhiễm khuẩn');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-003')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-003', 'Ibuprofen 400mg',      'Ibuprofen',     'Tablet',  '400 mg',    'Domesco',      N'Kháng viêm giảm đau');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-004')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-004', 'Omeprazole 20mg',      'Omeprazole',    'Capsule', '20 mg',     'Imexpharm',    N'Giảm axit dạ dày');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-005')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-005', 'Salbutamol 100mcg',    'Salbutamol',    'Inhaler', '100 mcg',   'GSK',          N'Giãn phế quản, điều trị hen suyễn');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-006')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-006', 'Metformin 500mg',      'Metformin HCl', 'Tablet',  '500 mg',    'Stada',        N'Điều trị tiểu đường type 2');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-007')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-007', 'Amlodipine 5mg',       'Amlodipine',    'Tablet',  '5 mg',      'OPV',          N'Điều trị tăng huyết áp, đau thắt ngực');

IF NOT EXISTS (SELECT 1 FROM Medicine WHERE medicine_id = 'MED-008')
    INSERT INTO Medicine (medicine_id, name, active_ingredient, dosage_form, strength, manufacturer, description)
    VALUES ('MED-008', 'Cetirizine 10mg',      'Cetirizine HCl','Tablet',  '10 mg',     'Pymepharco',   N'Kháng histamine, điều trị dị ứng');

GO
PRINT '   Done: 8 medicines inserted (skipped if exists).';
GO

-- ============================================================
-- SECTION 6: USERS (optional — for future auth)
-- ============================================================
PRINT '>> Inserting Users (demo accounts)...';

IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = 'USR-001')
    INSERT INTO Users (user_id, username, password_hash, role, doctor_id, status)
    VALUES ('USR-001', 'dr.quan', '$2b$10$demoHashNotRealPleaseChange', 'Doctor', 'DOC-12345', 'Active');

IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = 'USR-002')
    INSERT INTO Users (user_id, username, password_hash, role, doctor_id, status)
    VALUES ('USR-002', 'dr.mai', '$2b$10$demoHashNotRealPleaseChange', 'Doctor', 'DOC-12346', 'Active');

IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = 'USR-003')
    INSERT INTO Users (user_id, username, password_hash, role, status)
    VALUES ('USR-003', 'admin', '$2b$10$demoHashNotRealPleaseChange', 'Admin', 'Active');

GO
PRINT '   Done: 3 demo users inserted (skipped if exists).';
GO

-- ============================================================
-- VERIFICATION: Quick row counts
-- ============================================================
PRINT '>> Verification Summary:';
SELECT 'Patient'           AS [Table], COUNT(*) AS [Rows] FROM Patient
UNION ALL
SELECT 'Doctor',                        COUNT(*) FROM Doctor
UNION ALL
SELECT 'Appointment',                   COUNT(*) FROM Appointment
UNION ALL
SELECT 'ICD10',                         COUNT(*) FROM ICD10
UNION ALL
SELECT 'Medicine',                      COUNT(*) FROM Medicine
UNION ALL
SELECT 'Users',                         COUNT(*) FROM Users;
GO

PRINT '';
PRINT '=== Seed completed successfully! ===';
PRINT 'Today appointments (DOC-12345): 6 | (DOC-12346): 2';
PRINT 'Yesterday (Completed): 2 | Tomorrow (Pending): 2';
GO
