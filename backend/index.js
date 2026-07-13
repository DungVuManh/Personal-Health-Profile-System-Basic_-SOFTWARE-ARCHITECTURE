const express = require('express');
const cors = require('cors');
require('dotenv').config();

const appointmentRoutes = require('./routes/appointmentRoutes');
const icd10Routes = require('./routes/icd10Routes');
const medicineRoutes = require('./routes/medicineRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 9999;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/icd10', icd10Routes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/booking', bookingRoutes);

app.get('/', (req, res) => {
    res.send('Personal Health Profile System API Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});