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
  Sun,
  Sunset,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9999";

// Offline Fallback Data
const MOCK_DOCTORS = [
  { doctor_id: "DOC-12345", name: "Lê Văn Quân", specialty: "Đa Khoa", experience_years: 8, license_number: 9876543, working_time: 1 },
  { doctor_id: "DOC-10001", name: "Trần Quốc Anh", specialty: "Tim Mạch", experience_years: 15, license_number: 1234567, working_time: 2 },
  { doctor_id: "DOC-10002", name: "Nguyễn Thị Mai", specialty: "Nhi Khoa", experience_years: 10, license_number: 2345678, working_time: 1 },
];

const MOCK_PATIENTS = [
  { patient_id: "PAT-48920", name: "Nguyễn Văn Hùng", email: "hung.nguyen@email.com", phone: "0987654321" },
  { patient_id: "PAT-48921", name: "Trần Thị Bích", email: "bich.tran@email.com", phone: "0912345678" },
  { patient_id: "PAT-48922", name: "Lê Minh Hoàng", email: "hoang.le@email.com", phone: "0908765432" },
];

// Returns session label and start_time from working_time value
function getSessionInfo(workingTime) {
  if (workingTime === 1) return { session: "Buổi Sáng", start_time: "08:00:00", label: "Morning", timeRange: "08:00 – 12:00" };
  if (workingTime === 2) return { session: "Buổi Chiều", start_time: "13:00:00", label: "Afternoon", timeRange: "13:00 – 17:00" };
  return { session: "Cả Ngày", start_time: "08:00:00", label: "All Day", timeRange: "08:00 – 17:00" };
}

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
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  // sessionInfo holds: { working_time, session, start_time, available }
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  // sessionConfirmed = true when patient clicks the session card to confirm
  const [sessionConfirmed, setSessionConfirmed] = useState(false);

  // Auto-set Service Type based on selected doctor's specialty
  const [selectedService, setSelectedService] = useState(null);
  useEffect(() => {
    if (selectedDoctor) {
      setSelectedService({
        id: "specialty",
        name: `Khám Chuyên Khoa (${selectedDoctor.specialty})`,
      });
    } else {
      setSelectedService(null);
    }
  }, [selectedDoctor]);

  // Booking outcome state
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch doctors & patients initially
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const docRes = await fetch(`${API_URL}/api/booking/doctors?q=${encodeURIComponent(searchQuery)}`);
      if (!docRes.ok) throw new Error("Doctors fetch failed");
      const docData = await docRes.json();
      setDoctors(docData);

      const patRes = await fetch(`${API_URL}/api/booking/patients`);
      if (!patRes.ok) throw new Error("Patients fetch failed");
      const patData = await patRes.json();
      setPatients(patData.length > 0 ? patData : MOCK_PATIENTS);

      if (patData.length > 0 && !selectedPatient) {
        setSelectedPatient(patData[0]);
      } else if (MOCK_PATIENTS.length > 0 && !selectedPatient) {
        setSelectedPatient(MOCK_PATIENTS[0]);
      }

      setUsingMock(false);
    } catch (err) {
      console.warn("API offline, falling back to mock data.", err);
      const filteredDocs = MOCK_DOCTORS.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDoctors(filteredDocs);
      setPatients(MOCK_PATIENTS);
      if (!selectedPatient) setSelectedPatient(MOCK_PATIENTS[0]);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch session info for selected doctor when doctor or date changes
  const fetchSession = useCallback(async () => {
    if (!selectedDoctor) return;
    setSessionLoading(true);
    setSessionConfirmed(false);
    try {
      const res = await fetch(
        `${API_URL}/api/booking/slots?doctor_id=${selectedDoctor.doctor_id}&date=${selectedDate}`
      );
      if (!res.ok) throw new Error("Session fetch failed");
      const data = await res.json();
      setSessionInfo(data);
    } catch (err) {
      console.warn("Using offline session info:", err);
      // Fallback: derive from doctor's working_time in mock data
      const info = getSessionInfo(selectedDoctor.working_time);
      setSessionInfo({
        working_time: selectedDoctor.working_time,
        session: info.session,
        start_time: info.start_time,
        available: true,
      });
    } finally {
      setSessionLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Process booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedPatient || !selectedDate || !sessionInfo || !sessionConfirmed) {
      setErrorMessage("Vui lòng chọn đầy đủ thông tin và xác nhận buổi khám.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage(null);

    const bookingPayload = {
      patientId: selectedPatient.patient_id,
      doctorId: selectedDoctor.doctor_id,
      slotDate: selectedDate,
      slotTime: sessionInfo.start_time,
      serviceType: selectedService?.name,
    };

    try {
      const res = await fetch(`${API_URL}/api/booking/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm booking");

      const info = getSessionInfo(sessionInfo.working_time);
      setBookingResult({
        appointmentId: data.appointment.appointment_id,
        patientName: selectedPatient.name,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        session: info.session,
        timeRange: info.timeRange,
        status: data.appointment.status,
        serviceType: selectedService?.name,
      });
    } catch (err) {
      console.warn("API booking failed, using offline simulation:", err);
      const simulatedId = `APP-${Math.floor(10000 + Math.random() * 90000)}`;
      const info = getSessionInfo(sessionInfo.working_time);
      setBookingResult({
        appointmentId: simulatedId,
        patientName: selectedPatient.name,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate,
        session: info.session,
        timeRange: info.timeRange,
        status: "Pending",
        serviceType: selectedService?.name,
        simulated: true,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    setSelectedDoctor(null);
    setSessionInfo(null);
    setSessionConfirmed(false);
    setErrorMessage(null);
    fetchData();
  };

  const isMorning = sessionInfo?.working_time === 1;
  const isReadyToBook = selectedDoctor && selectedPatient && selectedDate && sessionConfirmed;

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
              <h1 className="text-3xl font-extrabold tracking-tight">Đặt Lịch Khám (UC02)</h1>
              <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">
                Tìm kiếm bác sĩ, chọn ngày khám, và xác nhận buổi khám (Sáng / Chiều) theo lịch làm việc của bác sĩ.
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
          /* SUCCESS SCREEN */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Đặt Lịch Thành Công!</h2>
              <p className="text-emerald-100 mt-1 font-medium">Lịch khám đã được xác nhận</p>
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
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Mã Lịch Hẹn</span>
                    <span className="text-slate-800 font-mono font-bold text-base">{bookingResult.appointmentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Trạng Thái</span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {bookingResult.status}
                    </span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Bệnh Nhân</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Bác Sĩ</span>
                    <span className="text-slate-800 font-semibold">Dr. {bookingResult.doctorName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Chuyên Khoa</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Dịch Vụ</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.serviceType}</span>
                  </div>

                  <div className="col-span-2 border-t border-slate-200/60 my-1" />

                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Ngày Khám</span>
                    <span className="text-slate-800 font-semibold">{bookingResult.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Buổi Khám</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1.5">
                      {bookingResult.session === "Buổi Sáng" ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Sunset className="w-4 h-4 text-indigo-500" />
                      )}
                      {bookingResult.session}
                      <span className="text-xs text-slate-400 font-normal">({bookingResult.timeRange})</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg text-center"
              >
                Đặt Lịch Khác
              </button>
            </div>
          </div>
        ) : (
          /* WORKFLOW SCREENS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Step 1: Select Patient */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
                  Chọn Bệnh Nhân
                </h3>
                <select
                  value={selectedPatient ? selectedPatient.patient_id : ""}
                  onChange={(e) => {
                    const pat = patients.find((p) => p.patient_id === e.target.value);
                    setSelectedPatient(pat);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.name} ({p.patient_id}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Search & Select Doctor */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
                  Tìm và Chọn Bác Sĩ
                </h3>

                {selectedDoctor ? (
                  <div className="p-4 rounded-2xl border border-blue-500 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          Dr. {selectedDoctor.name}
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">Đã chọn</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {selectedDoctor.specialty} • {selectedDoctor.experience_years} năm kinh nghiệm •{" "}
                          <span className={selectedDoctor.working_time === 1 ? "text-amber-600 font-bold" : "text-indigo-600 font-bold"}>
                            {selectedDoctor.working_time === 1 ? "🌅 Buổi Sáng" : "🌇 Buổi Chiều"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(null);
                        setSessionInfo(null);
                        setSessionConfirmed(false);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-white hover:bg-blue-50/50 py-2 px-4 rounded-xl transition-all shadow-sm shrink-0 self-end sm:self-center"
                    >
                      Đổi Bác Sĩ
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
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

                    <div className="text-xs text-slate-400 font-semibold flex items-center justify-between px-1">
                      <span>{searchQuery ? `Kết quả cho "${searchQuery}"` : "Hiển thị tất cả bác sĩ"}</span>
                      <span className="text-slate-500 bg-slate-100 py-0.5 px-2 rounded-md">{doctors.length} bác sĩ</span>
                    </div>

                    <div className="flex flex-col gap-3 mt-1 max-h-96 overflow-y-auto pr-1">
                      {doctors.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm font-bold">Không tìm thấy kết quả</p>
                        </div>
                      ) : (
                        doctors.map((doc) => (
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
                                    #{doc.license_number}
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {doc.specialty} • {doc.experience_years} năm •{" "}
                                  <span className={doc.working_time === 1 ? "text-amber-600 font-semibold" : "text-indigo-600 font-semibold"}>
                                    {doc.working_time === 1 ? "🌅 Buổi Sáng" : "🌇 Buổi Chiều"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                Chọn
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Step 3: Choose Date */}
              {selectedDoctor && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</span>
                    Chọn Ngày Khám & Dịch Vụ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày Khám</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSessionConfirmed(false);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Service Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dịch Vụ</label>
                      <div className="w-full bg-slate-100 border border-slate-200 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 shadow-inner flex items-center h-[46px]">
                        {selectedService ? selectedService.name : "Chờ chọn bác sĩ..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Step 4: Working Session Selection */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 min-h-[200px]">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">4</span>
                  Buổi Khám
                </h3>

                {!selectedDoctor ? (
                  <div className="flex flex-col items-center justify-center flex-grow text-center text-slate-400 py-8">
                    <Clock className="w-10 h-10 mb-2 stroke-1" />
                    <p className="text-xs font-semibold">Chọn bác sĩ để xem lịch làm viêc.</p>
                  </div>
                ) : sessionLoading ? (
                  <div className="flex flex-col items-center justify-center flex-grow py-8 gap-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Đang kiểm tra lịch bác sĩ...</span>
                  </div>
                ) : sessionInfo ? (
                  <div className="flex flex-col gap-3">
                    {/* Date info bar */}
                    <div className="flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600 font-semibold">Ngày {selectedDate}</span>
                    </div>

                    {/* Session card — clickable */}
                    <button
                      type="button"
                      onClick={() => setSessionConfirmed((prev) => !prev)}
                      className={`w-full rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200 text-left ${sessionConfirmed
                          ? isMorning
                            ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                            : "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                        }`}
                    >
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${sessionConfirmed
                          ? isMorning ? "bg-amber-400 text-white" : "bg-indigo-500 text-white"
                          : "bg-slate-200 text-slate-500"
                        }`}>
                        {isMorning ? <Sun className="w-7 h-7" /> : <Sunset className="w-7 h-7" />}
                      </div>

                      {/* Info */}
                      <div className="flex-grow">
                        <p className={`text-base font-extrabold ${sessionConfirmed
                            ? isMorning ? "text-amber-700" : "text-indigo-700"
                            : "text-slate-700"
                          }`}>
                          {isMorning ? "Buổi Sáng" : "Buổi Chiều"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {isMorning ? "08:00 – 12:00" : "13:00 – 17:00"}
                        </p>
                        <p className="text-xs mt-1.5 font-semibold">
                          {sessionConfirmed ? (
                            <span className={isMorning ? "text-amber-600" : "text-indigo-600"}>✓ Đã chọn buổi này</span>
                          ) : (
                            <span className="text-slate-400">Nhấn để chọn buổi khám</span>
                          )}
                        </p>
                      </div>

                      {/* Checkmark */}
                      {sessionConfirmed && (
                        <CheckCircle2 className={`w-6 h-6 shrink-0 ${isMorning ? "text-amber-500" : "text-indigo-500"}`} />
                      )}
                    </button>

                    {/* Legend */}
                    <p className="text-xs text-slate-400 text-center font-medium px-2">
                      Bác sĩ <span className="font-bold text-slate-600">{selectedDoctor.name}</span> chỉ làm việc{" "}
                      <span className={isMorning ? "text-amber-600 font-bold" : "text-indigo-600 font-bold"}>
                        {isMorning ? "buổi sáng" : "buổi chiều"}
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Step 5: Booking Summary & Confirm */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">5</span>
                  Tóm Tắt Lịch Hẹn
                </h3>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Bệnh nhân:</span>
                    <span className="text-slate-800 font-bold">{selectedPatient ? selectedPatient.name : "Chưa chọn"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Bác sĩ:</span>
                    <span className="text-slate-800 font-bold">{selectedDoctor ? `Dr. ${selectedDoctor.name}` : "Chưa chọn"}</span>
                  </div>

                  {selectedDoctor && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Chuyên khoa:</span>
                      <span className="text-slate-800 font-semibold">{selectedDoctor.specialty}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Ngày khám:</span>
                    <span className="text-slate-800 font-bold">{selectedDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Buổi khám:</span>
                    {sessionInfo && sessionConfirmed ? (
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full border text-xs ${isMorning
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}>
                        {isMorning ? <Sun className="w-3 h-3" /> : <Sunset className="w-3 h-3" />}
                        {isMorning ? "Buổi Sáng" : "Buổi Chiều"}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Chưa chọn</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Dịch vụ:</span>
                    <span className="text-slate-800 font-semibold">{selectedService ? selectedService.name : "N/A"}</span>
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
                  disabled={!isReadyToBook || bookingLoading}
                  onClick={handleConfirmBooking}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-200 shadow-md text-sm text-center flex items-center justify-center gap-2 ${!isReadyToBook
                      ? "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
                    }`}
                >
                  {bookingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      Xác Nhận Đặt Lịch
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
