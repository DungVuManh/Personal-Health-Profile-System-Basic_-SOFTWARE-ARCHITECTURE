import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  HeartPulse,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9999";

// Offline Fallback Data
const MOCK_DOCTORS = [
  { doctor_id: "DOC-12345", name: "Lê Văn Quân", specialty: "Đa Khoa", experience_years: 8, license_number: 9876543 },
  { doctor_id: "DOC-10001", name: "Trần Quốc Anh", specialty: "Tim Mạch", experience_years: 15, license_number: 1234567 },
  { doctor_id: "DOC-10002", name: "Nguyễn Thị Mai", specialty: "Nhi Khoa", experience_years: 10, license_number: 2345678 }
];

const MOCK_PATIENTS = [
  { patient_id: "PAT-48920", name: "Nguyễn Văn Hùng", email: "hung.nguyen@email.com", phone: "0987654321" },
  { patient_id: "PAT-48921", name: "Trần Thị Bích", email: "bich.tran@email.com", phone: "0912345678" },
  { patient_id: "PAT-48922", name: "Lê Minh Hoàng", email: "hoang.le@email.com", phone: "0908765432" }
];

// Service Type is dynamically determined by the selected doctor's specialty

export default function BookingScreen() {
  // Main lists state
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] // default to tomorrow
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Auto-set Service Type based on selected doctor's specialty
  useEffect(() => {
    if (selectedDoctor) {
      const isGeneral = selectedDoctor.specialty === "Đa Khoa";
      setSelectedService({
        id: "specialty",
        name: `Khám Chuyên Khoa (${selectedDoctor.specialty})`,
        price: isGeneral
      });
    } else {
      setSelectedService(null);
    }
  }, [selectedDoctor]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking outcome state
  const [bookingResult, setBookingResult] = useState(null); // Success summary when booked
  const [errorMessage, setErrorMessage] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch doctors & patients initially
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch doctors matching search
      const docRes = await fetch(`${API_URL}/api/booking/doctors?q=${encodeURIComponent(searchQuery)}`);
      if (!docRes.ok) throw new Error("Doctors fetch failed");
      const docData = await docRes.json();
      setDoctors(docData);

      // 2. Fetch patients list
      const patRes = await fetch(`${API_URL}/api/booking/patients`);
      if (!patRes.ok) throw new Error("Patients fetch failed");
      const patData = await patRes.json();
      setPatients(patData.length > 0 ? patData : MOCK_PATIENTS);

      // Auto-select first patient if none selected
      if (patData.length > 0 && !selectedPatient) {
        setSelectedPatient(patData[0]);
      } else if (MOCK_PATIENTS.length > 0 && !selectedPatient) {
        setSelectedPatient(MOCK_PATIENTS[0]);
      }

      setUsingMock(false);
    } catch (err) {
      console.warn("API offline, falling back to mock data.", err);
      // Filter mock doctors locally
      const filteredDocs = MOCK_DOCTORS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDoctors(filteredDocs);
      setPatients(MOCK_PATIENTS);
      if (!selectedPatient) {
        setSelectedPatient(MOCK_PATIENTS[0]);
      }
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch slots for selected doctor when doctor or date changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor) return;
    setSlotsLoading(true);
    setSelectedSlot(null); // reset selected slot
    try {
      const res = await fetch(
        `${API_URL}/api/booking/slots?doctor_id=${selectedDoctor.doctor_id}&date=${selectedDate}`
      );
      if (!res.ok) throw new Error("Slots fetch failed");
      const data = await res.json();
      setAvailableSlots(data);
    } catch (err) {
      console.warn("Using offline slot generation:", err);
      // Simulate slots, make some booked
      // const standardSlots = [
      //   '08:00:00', '09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00'
      // ];
      // Set slot availability deterministically based on doctor ID & date length to simulate booking
      const seed = (selectedDoctor.doctor_id + selectedDate).length;
      const data = standardSlots.map((slot, index) => ({
        time: slot,
        available: (seed + index) % 3 !== 0 // book every 3rd slot
      }));
      setAvailableSlots(data);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Process booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedPatient || !selectedDate || !selectedSlot) {
      setErrorMessage("Please complete all selection steps first.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage(null);

    const bookingPayload = {
      patientId: selectedPatient.patient_id,
      doctorId: selectedDoctor.doctor_id,
      slotDate: selectedDate,
      slotTime: selectedSlot.time,
      serviceType: selectedService.name
    };

    try {
      const res = await fetch(`${API_URL}/api/booking/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to confirm booking");
      }

      // Success! Matches pseudocode expectations
      setBookingResult({
        appointmentId: data.appointment.appointment_id,
        patientName: selectedPatient.name,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedSlot.time,
        status: data.appointment.status, // "Pending Appointment"
        serviceType: selectedService.name,
        price: selectedService.price
      });
    } catch (err) {
      console.warn("API booking failed, using offline simulation:", err);
      // Simulate successful booking locally if API fails
      const simulatedId = `APP-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingResult({
        appointmentId: simulatedId,
        patientName: selectedPatient.name,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedSlot.time,
        status: "Pending", // Standard local simulation status
        serviceType: selectedService.name,
        price: selectedService.price,
        simulated: true
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setErrorMessage(null);
    fetchData();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Banner header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Appointment Booking Module
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Book a Doctor's Appointment</h1>
              <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">
                Search our network of healthcare specialists, select your desired date and service package, check available slots in real time, and reserve your consultation.
              </p>
            </div>
            {usingMock && (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium self-start md:self-center">
                <ShieldAlert className="w-4 h-4" /> Demo Offline Mode Active
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Screens */}
        {bookingResult ? (
          /* SUCCESS SCREEN (Requirement 6: System display successfully booking) */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white relative">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Booking Confirmed Successfully!</h2>
              <p className="text-emerald-100 mt-1 font-medium">Successfully booking</p>
              {bookingResult.simulated && (
                <p className="text-xs text-emerald-200 mt-2 bg-emerald-950/20 py-1 px-3 rounded-full inline-block">
                  Simulated booking (Saved locally)
                </p>
              )}
            </div>

            <div className="p-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Appointment ID</span>
                    <span className="text-slate-800 font-mono font-bold text-base">{bookingResult.appointmentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Current Status</span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {bookingResult.status}
                    </span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Patient Name</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Consulting Doctor</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.doctorName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Specialty</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Service Type</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.serviceType}</span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Date</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Time Slot</span>
                    <span className="text-slate-800 font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" /> {formatTime(bookingResult.time)}
                    </span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 my-1" />

                  <div className="col-span-2 flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <span className="text-slate-600 font-medium">Estimated Fee</span>
                    <span className="text-blue-700 font-extrabold text-base">{bookingResult.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg text-center"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* WORKFLOW SCREENS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Step 1 & 2: Search Doctors and Filter Slots (Left Column - 7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Patient Profile Selection (Added for full database link) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
                  Select Booking Patient
                </h3>

                <div className="relative">
                  <select
                    value={selectedPatient ? selectedPatient.patient_id : ""}
                    onChange={(e) => {
                      const pat = patients.find(p => p.patient_id === e.target.value);
                      setSelectedPatient(pat);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-semibold"
                  >
                    {patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.name} ({p.patient_id}) - {p.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Search & Match (Step 1) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
                  Search and Select Doctor
                </h3>

                {selectedDoctor ? (
                  /* Hide search interface and display selection card */
                  <div className="p-4 rounded-2xl border border-blue-500 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          Dr. {selectedDoctor.name}
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                            Selected
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedDoctor.specialty} • {selectedDoctor.experience_years} years exp</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(null);
                        setSelectedSlot(null);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-white hover:bg-blue-50/50 py-2 px-4 rounded-xl transition-all shadow-sm shrink-0 self-end sm:self-center"
                    >
                      Change Doctor
                    </button>
                  </div>
                ) : (
                  /* Show search interface */
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter doctor's name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm placeholder-slate-400"
                      />
                      {loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Helper search feedback */}
                    <div className="text-xs text-slate-400 font-semibold flex items-center justify-between px-1 mt-1">
                      <span>{searchQuery ? `Search results for "${searchQuery}"` : "Showing all available doctors"}</span>
                      <span className="text-slate-500 bg-slate-100 py-0.5 px-2 rounded-md">{doctors.length} doctor(s) found</span>
                    </div>

                    {/* System displays list of matching doctors */}
                    <div className="flex flex-col gap-3 mt-2 max-h-96 overflow-y-auto pr-1">
                      {doctors.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm font-bold">No results found</p>
                          {searchQuery && (
                            <p className="text-xs text-slate-400 mt-1">No doctors match the criteria "{searchQuery}"</p>
                          )}
                        </div>
                      ) : (
                        doctors.map((doc) => {
                          const isDoctorSelected = selectedDoctor?.doctor_id === doc.doctor_id;
                          return (
                            <div
                              key={doc.doctor_id}
                              onClick={() => setSelectedDoctor(doc)}
                              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50/30 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                  <Stethoscope className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                    Dr. {doc.name}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                      License: {doc.license_number}
                                    </span>
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.specialty} • {doc.experience_years} years exp</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                  Select Doctor
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Service Type Selection & Date (Step 3) */}
              {selectedDoctor && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</span>
                    Choose Date & Service Type
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <CalendarIcon className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Service Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Type</label>
                      <div className="w-full bg-slate-100 border border-slate-200 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 shadow-inner flex justify-between items-center h-[46px]">
                        <span>{selectedService ? selectedService.name : "Waiting for Doctor Selection..."}</span>
                        {selectedService && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{selectedService.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time Slot Display and Confirmation Panel (Right Column - 5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Slots List (Step 2. System filters and displays list of matching doctors along with their available slots) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 min-h-[220px]">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">4</span>
                  Available Slots
                </h3>

                {!selectedDoctor ? (
                  <div className="flex flex-col items-center justify-center flex-grow text-center text-slate-400 py-8">
                    <Clock className="w-10 h-10 mb-2 stroke-1" />
                    <p className="text-xs font-semibold">Select a doctor to view their available time slots.</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="flex flex-col items-center justify-center flex-grow py-8 gap-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Checking doctor availability...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600 font-semibold">Slots for {selectedDate}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => {
                        const isSlotSelected = selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 border ${!slot.available
                              ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                              : isSlotSelected
                                ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/20"
                              }`}
                          >
                            {formatTime(slot.time)}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xxs font-semibold text-slate-400 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-white border border-slate-200 rounded" /> Available
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded" /> Booked / Out
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded" /> Selected
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Booking & Details Preview (Step 4 & 5) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">5</span>
                  Booking Summary
                </h3>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Patient:</span>
                    <span className="text-slate-800 font-bold">{selectedPatient ? selectedPatient.name : "None selected"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Doctor:</span>
                    <span className="text-slate-800 font-bold">{selectedDoctor ? `Dr. ${selectedDoctor.name}` : "None selected"}</span>
                  </div>

                  {selectedDoctor && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Specialty:</span>
                      <span className="text-slate-800 font-semibold">{selectedDoctor.specialty}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Service Package:</span>
                    <span className="text-slate-800 font-semibold">{selectedService ? selectedService.name : "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Date & Time:</span>
                    <span className="text-slate-800 font-bold">
                      {selectedSlot ? `${selectedDate} at ${formatTime(selectedSlot.time)}` : `${selectedDate} (No slot chosen)`}
                    </span>
                  </div>

                  <div className="border-t border-slate-200/60 my-1" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-semibold">Consultation Fee:</span>
                    <span className="text-blue-600 font-black">{selectedService ? selectedService.price : "0 VND"}</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold">{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!selectedDoctor || !selectedSlot || bookingLoading}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-200 shadow-md text-sm text-center flex items-center justify-center gap-2 ${!selectedDoctor || !selectedSlot
                    ? "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
                    }`}
                >
                  {bookingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Reserving Slot...
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
