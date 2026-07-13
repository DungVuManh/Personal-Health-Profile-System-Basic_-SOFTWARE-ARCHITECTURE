const { poolPromise, sql } = require('../db');

const generateId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const createHealthRecord = async (req, res) => {
    const pool = await poolPromise;
    if (!pool) {
        return res.status(503).json({ message: 'Database is offline or not configured correctly.' });
    }
    
    const transaction = new sql.Transaction(pool);
    
    try {
        const {
            patient_id,
            doctor_id,
            appointment_id,
            symptoms,
            diagnosis,
            icd_code,
            treatment_plan,
            notes,
            prescription
        } = req.body;
        
        // 1. Basic validation
        if (!patient_id || !doctor_id || !appointment_id || !icd_code) {
            return res.status(400).json({ message: 'Patient ID, Doctor ID, Appointment ID, and ICD Code are required.' });
        }
        
        // Start Transaction
        await transaction.begin();
        
        // 2. Validate ICD-10 Code
        const icdCheck = await transaction.request()
            .input('icd_code', icd_code)
            .query('SELECT 1 FROM ICD10 WHERE icd_code = @icd_code');
            
        if (icdCheck.recordset.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: `Invalid ICD-10 code: ${icd_code}.` });
        }
        
        // 3. Create Health Record
        const record_id = generateId('HR');
        await transaction.request()
            .input('record_id', record_id)
            .input('patient_id', patient_id)
            .input('doctor_id', doctor_id)
            .input('appointment_id', appointment_id)
            .input('symptoms', symptoms || null)
            .input('diagnosis', diagnosis || null)
            .input('icd_code', icd_code)
            .input('treatment_plan', treatment_plan || null)
            .input('notes', notes || null)
            .query(`
                INSERT INTO HealthRecord (
                    record_id, patient_id, doctor_id, appointment_id, 
                    record_date, symptoms, diagnosis, icd_code, treatment_plan, notes
                ) VALUES (
                    @record_id, @patient_id, @doctor_id, @appointment_id, 
                    GETDATE(), @symptoms, @diagnosis, @icd_code, @treatment_plan, @notes
                )
            `);
            
        // 4. Create Prescription and details if provided
        let createdPrescriptionId = null;
        if (prescription && prescription.details && prescription.details.length > 0) {
            createdPrescriptionId = generateId('PR');
            
            // Insert Prescription Header
            await transaction.request()
                .input('prescription_id', createdPrescriptionId)
                .input('record_id', record_id)
                .input('patient_id', patient_id)
                .input('doctor_id', doctor_id)
                .input('notes', prescription.notes || null)
                .query(`
                    INSERT INTO Prescription (
                        prescription_id, record_id, patient_id, doctor_id, created_date, notes
                    ) VALUES (
                        @prescription_id, @record_id, @patient_id, @doctor_id, GETDATE(), @notes
                    )
                `);
                
            // Insert Prescription Details
            for (const item of prescription.details) {
                const { medicine_id, dosage, frequency, duration, quantity, detail_notes } = item;
                if (!medicine_id || !dosage || !frequency || !duration) {
                    throw new Error('Prescription details must contain medicine_id, dosage, frequency, and duration.');
                }
                
                const detail_id = generateId('PD');
                await transaction.request()
                    .input('prescription_detail_id', detail_id)
                    .input('prescription_id', createdPrescriptionId)
                    .input('medicine_id', medicine_id)
                    .input('dosage', dosage)
                    .input('frequency', frequency)
                    .input('duration', duration)
                    .input('quantity', quantity || 1)
                    .input('notes', detail_notes || null)
                    .query(`
                        INSERT INTO PrescriptionDetail (
                            prescription_detail_id, prescription_id, medicine_id, 
                            dosage, frequency, duration, quantity, notes
                        ) VALUES (
                            @prescription_detail_id, @prescription_id, @medicine_id, 
                            @dosage, @frequency, @duration, @quantity, @notes
                        )
                    `);
            }
        }
        
        // 5. Update Appointment status to 'Completed'
        await transaction.request()
            .input('appointment_id', appointment_id)
            .query("UPDATE Appointment SET status = 'Completed' WHERE appointment_id = @appointment_id");
            
        // Commit Transaction
        await transaction.commit();
        
        res.status(201).json({
            message: 'Health record and prescription created successfully.',
            record_id,
            prescription_id: createdPrescriptionId
        });
        
    } catch (error) {
        console.error('Error in transaction, rolling back:', error);
        if (transaction.isOpen) {
            await transaction.rollback();
        }
        res.status(500).json({ message: 'Error saving health record.', error: error.message });
    }
};

module.exports = {
    createHealthRecord
};
