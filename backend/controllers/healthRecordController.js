const { pool } = require('../db');

const generateId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const createHealthRecord = async (req, res) => {
    const client = await pool.connect();
    
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
        
        if (!patient_id || !doctor_id || !appointment_id || !icd_code) {
            client.release();
            return res.status(400).json({ message: 'Patient ID, Doctor ID, Appointment ID, and ICD Code are required.' });
        }
        
        await client.query('BEGIN');
        
        const icdCheck = await client.query('SELECT 1 FROM ICD10 WHERE icd_code = $1', [icd_code]);
            
        if (icdCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ message: `Invalid ICD-10 code: ${icd_code}.` });
        }
        
        const record_id = generateId('HR');
        await client.query(`
            INSERT INTO HealthRecord (
                record_id, patient_id, doctor_id, appointment_id, 
                record_date, symptoms, diagnosis, icd_code, treatment_plan, notes
            ) VALUES (
                $1, $2, $3, $4, 
                CURRENT_TIMESTAMP, $5, $6, $7, $8, $9
            )
        `, [
            record_id, patient_id, doctor_id, appointment_id,
            symptoms || null, diagnosis || null, icd_code, treatment_plan || null, notes || null
        ]);
            
        let createdPrescriptionId = null;
        if (prescription && prescription.details && prescription.details.length > 0) {
            createdPrescriptionId = generateId('PR');
            
            await client.query(`
                INSERT INTO Prescription (
                    prescription_id, record_id, patient_id, doctor_id, created_date, notes
                ) VALUES (
                    $1, $2, $3, $4, CURRENT_TIMESTAMP, $5
                )
            `, [
                createdPrescriptionId, record_id, patient_id, doctor_id, prescription.notes || null
            ]);
                
            for (const item of prescription.details) {
                const { medicine_id, dosage, frequency, duration, quantity, detail_notes } = item;
                if (!medicine_id || !dosage || !frequency || !duration) {
                    throw new Error('Prescription details must contain medicine_id, dosage, frequency, and duration.');
                }
                
                const detail_id = generateId('PD');
                await client.query(`
                    INSERT INTO PrescriptionDetail (
                        prescription_detail_id, prescription_id, medicine_id, 
                        dosage, frequency, duration, quantity, notes
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8
                    )
                `, [
                    detail_id, createdPrescriptionId, medicine_id,
                    dosage, frequency, duration, quantity || 1, detail_notes || null
                ]);
            }
        }
        
        await client.query("UPDATE Appointment SET status = 'Completed' WHERE appointment_id = $1", [appointment_id]);
            
        await client.query('COMMIT');
        client.release();
        
        res.status(201).json({
            message: 'Health record and prescription created successfully.',
            record_id,
            prescription_id: createdPrescriptionId
        });
        
    } catch (error) {
        console.error('Error in transaction, rolling back:', error);
        await client.query('ROLLBACK');
        client.release();
        res.status(500).json({ message: 'Error saving health record.', error: error.message });
    }
};

module.exports = {
    createHealthRecord
};
