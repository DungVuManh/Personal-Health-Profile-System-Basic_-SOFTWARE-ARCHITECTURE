import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Stethoscope,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Pill,
  RefreshCw,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  ClipboardList,
} from "lucide-react";

// API base URL configuration from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9999";

// ─── Hardcoded Doctor Context (until auth is implemented) ───────────────────
const CURRENT_DOCTOR_ID = "DOC-12345";
const CURRENT_DOCTOR_NAME = "Dr. Lê Văn Quân";

// ─── Mock Data (offline fallbacks) ──────────────────────────────────────────
const MOCK_APPOINTMENTS = [
  {
    appointment_id: "APP-10023",
    patient_id: "PAT-48920",
    doctor_id: "DOC-12345",
    appointment_date: new Date().toISOString().split("T")[0],
    start_time: "14:30:00",
    status: "Pending",
    patient_name: "Nguyễn Văn Hùng",
    patient_dob: "1992-05-18",
    patient_phone: "0987654321",
    patient_email: "hung.nguyen@email.com",
    patient_address: "123 Đường Cầu Giấy, Hà Nội",
  },
  {
    appointment_id: "APP-10024",
    patient_id: "PAT-48921",
    doctor_id: "DOC-12345",
    appointment_date: new Date().toISOString().split("T")[0],
    start_time: "15:00:00",
    status: "Pending",
    patient_name: "Trần Thị Bích",
    patient_dob: "1985-11-03",
    patient_phone: "0912345678",
    patient_email: "bich.tran@email.com",
    patient_address: "45 Lê Lợi, Quận 1, TP.HCM",
  },
  {
    appointment_id: "APP-10025",
    patient_id: "PAT-48922",
    doctor_id: "DOC-12345",
    appointment_date: new Date().toISOString().split("T")[0],
    start_time: "15:30:00",
    status: "In Progress",
    patient_name: "Lê Minh Hoàng",
    patient_dob: "1978-07-22",
    patient_phone: "0908765432",
    patient_email: "hoang.le@email.com",
    patient_address: "78 Trần Hưng Đạo, Đà Nẵng",
  },
];

const MOCK_ICD10 = [
  { icd_code: "J06", disease_name: "Acute upper respiratory infections of multiple sites", description: "Acute nasopharyngitis, common cold" },
  { icd_code: "I10", disease_name: "Essential (primary) hypertension", description: "High blood pressure with no known cause" },
  { icd_code: "E11", disease_name: "Non-insulin-dependent diabetes mellitus", description: "Type 2 diabetes" },
  { icd_code: "A09", disease_name: "Infectious gastroenteritis and colitis", description: "Acute digestive tract infection" },
  { icd_code: "K21", disease_name: "Gastro-esophageal reflux disease (GERD)", description: "Stomach acid reflux" },
  { icd_code: "M54", disease_name: "Dorsalgia", description: "Back pain, spinal column region pain" },
];

const MOCK_MEDICINES = [
  { medicine_id: "MED-001", name: "Paracetamol 500mg", active_ingredient: "Paracetamol", dosage_form: "Tablet", strength: "500 mg" },
  { medicine_id: "MED-002", name: "Amoxicillin 500mg", active_ingredient: "Amoxicillin", dosage_form: "Capsule", strength: "500 mg" },
  { medicine_id: "MED-003", name: "Ibuprofen 400mg", active_ingredient: "Ibuprofen", dosage_form: "Tablet", strength: "400 mg" },
  { medicine_id: "MED-004", name: "Omeprazole 20mg", active_ingredient: "Omeprazole", dosage_form: "Capsule", strength: "20 mg" },
  { medicine_id: "MED-005", name: "Salbutamol 100mcg", active_ingredient: "Salbutamol inhaler", dosage_form: "Inhaler", strength: "100 mcg" },
];

// ─── Helper: format time "14:30:00" → "2:30 PM" ─────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// ─── Helper: calculate age ────────────────────────────────────────────────────
function getAge(dobString) {
  if (!dobString) return "N/A";
  const birth = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    "In Progress": "bg-blue-100 text-blue-700 border border-blue-200",
    Completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  const dots = {
    Pending: "bg-amber-400",
    "In Progress": "bg-blue-500 animate-pulse",
    Completed: "bg-emerald-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

// ─── APPOINTMENT CARD (in queue) ──────────────────────────────────────────────
function AppointmentCard({ appt, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative ${
        isActive
          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
      }`}
    >
      {/* Active indicator stripe */}
      {isActive && (
        <span className="absolute left-0 top-3 bottom-3 w-1 bg-white/60 rounded-full" />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>
            <User className="w-4 h-4" />
          </div>
          <span className={`font-bold text-sm truncate ${isActive ? "text-white" : "text-slate-800"}`}>
            {appt.patient_name}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${isActive ? "text-white/70" : "text-slate-400"}`} />
      </div>

      <div className={`flex items-center gap-3 text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(appt.start_time)}
        </span>
        <span className={`font-mono ${isActive ? "text-white/80" : "text-slate-400"}`}>
          {appt.appointment_id}
        </span>
      </div>

      <div className="mt-2">
        {isActive ? (
          <span className="inline-flex items-center gap-1 text-xs text-white/80 font-semibold">
            <Activity className="w-3 h-3" /> Currently Consulting
          </span>
        ) : (
          <StatusBadge status={appt.status} />
        )}
      </div>
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ConsultationScreen() {
  // ── Queue state ─────────────────────────────────────────────────────────
  const [queueList, setQueueList] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueMock, setQueueMock] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [queueDate, setQueueDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ── Active appointment / form state ─────────────────────────────────────
  const [appointment, setAppointment] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  // ── Clinical notes ───────────────────────────────────────────────────────
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [icdSearchQuery, setIcdSearchQuery] = useState("");
  const [icdSuggestions, setIcdSuggestions] = useState([]);
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [notes, setNotes] = useState("");

  // ── Prescription ─────────────────────────────────────────────────────────
  const [prescriptionDetails, setPrescriptionDetails] = useState([]);
  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedRowIndex, setActiveMedRowIndex] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  // ── Notifications ────────────────────────────────────────────────────────
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("info");

  // ─── Fetch worklist ────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async (date) => {
    setQueueLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments?doctor_id=${CURRENT_DOCTOR_ID}&date=${date}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQueueList(data);
      setQueueMock(false);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Queue fetch failed, using mock data:", err);
      setQueueList(MOCK_APPOINTMENTS);
      setQueueMock(true);
      setLastRefreshed(new Date());
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(queueDate);
  }, [fetchQueue, queueDate]);

  // ─── ICD-10 debounced search ───────────────────────────────────────────────
  useEffect(() => {
    if (!icdSearchQuery) { setIcdSuggestions([]); return; }
    const timer = setTimeout(() => fetchICD10(icdSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [icdSearchQuery]);

  // ─── Select appointment from queue ────────────────────────────────────────
  const selectAppointment = (appt) => {
    resetForm();
    setAppointment(appt);
    setUsingMock(queueMock);
    setStatusMessage(null);
  };

  // ─── ICD-10 fetch ──────────────────────────────────────────────────────────
  const fetchICD10 = async (query) => {
    try {
      const res = await fetch(`${API_URL}/api/icd10?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      setIcdSuggestions(await res.json());
    } catch {
      setIcdSuggestions(
        MOCK_ICD10.filter(
          (i) =>
            i.icd_code.toLowerCase().includes(query.toLowerCase()) ||
            i.disease_name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  // ─── Medicine fetch ────────────────────────────────────────────────────────
  const fetchMedicines = async (query, rowIndex) => {
    try {
      const res = await fetch(`${API_URL}/api/medicines?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      setMedSuggestions(await res.json());
    } catch {
      setMedSuggestions(
        MOCK_MEDICINES.filter(
          (m) =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.active_ingredient.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
    setActiveMedRowIndex(rowIndex);
  };

  const selectICD = (item) => {
    setIcdCode(item.icd_code);
    setDiagnosis(item.disease_name);
    setIcdSearchQuery("");
    setIcdSuggestions([]);
  };

  const removeICD = () => { setIcdCode(""); setDiagnosis(""); };

  // ─── Prescription helpers ─────────────────────────────────────────────────
  const addPrescriptionRow = () =>
    setPrescriptionDetails([...prescriptionDetails, { medicine_id: "", name: "", dosage: "", frequency: "", duration: "", quantity: 1, detail_notes: "" }]);

  const removePrescriptionRow = (index) => {
    setPrescriptionDetails(prescriptionDetails.filter((_, i) => i !== index));
    if (activeMedRowIndex === index) { setMedSuggestions([]); setActiveMedRowIndex(null); }
  };

  const updatePrescriptionRow = (index, field, value) => {
    const updated = [...prescriptionDetails];
    updated[index][field] = value;
    setPrescriptionDetails(updated);
    if (field === "name") {
      if (value.trim()) fetchMedicines(value, index);
      else { setMedSuggestions([]); setActiveMedRowIndex(null); }
    }
  };

  const selectMedicine = (rowIndex, med) => {
    const updated = [...prescriptionDetails];
    updated[rowIndex].medicine_id = med.medicine_id;
    updated[rowIndex].name = med.name;
    setPrescriptionDetails(updated);
    setMedSuggestions([]);
    setActiveMedRowIndex(null);
  };

  const showStatus = (msg, type = "info") => {
    setStatusMessage(msg);
    setStatusType(type);
    if (type === "success") setTimeout(() => setStatusMessage(null), 5000);
  };

  const resetForm = () => {
    setSymptoms(""); setDiagnosis(""); setIcdCode(""); setIcdSearchQuery("");
    setTreatmentPlan(""); setNotes(""); setPrescriptionDetails([]); setPrescriptionNotes("");
    setIcdSuggestions([]); setMedSuggestions([]); setActiveMedRowIndex(null);
  };

  // ─── Submit encounter ─────────────────────────────────────────────────────
  const submitEncounter = async () => {
    if (!appointment) { showStatus("Please select a patient from the queue.", "error"); return; }
    if (!icdCode) { showStatus("Error: A valid ICD-10 diagnostic code must be selected.", "error"); return; }

    for (let i = 0; i < prescriptionDetails.length; i++) {
      const row = prescriptionDetails[i];
      if (!row.medicine_id) { showStatus(`Prescription line ${i + 1}: Please select a valid medicine.`, "error"); return; }
      if (!row.dosage || !row.frequency || !row.duration) { showStatus(`Prescription line ${i + 1}: Dosage, frequency, or duration is missing.`, "error"); return; }
    }

    const payload = {
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_id: appointment.appointment_id,
      symptoms, diagnosis, icd_code: icdCode, treatment_plan: treatmentPlan, notes,
      prescription: prescriptionDetails.length > 0 ? { notes: prescriptionNotes, details: prescriptionDetails } : null,
    };

    try {
      if (usingMock) {
        console.log("Mock payload:", payload);
        showStatus("Encounter submitted (Mock Mode) — record saved successfully!", "success");
        // Remove from queue (mock)
        setQueueList((prev) => prev.filter((a) => a.appointment_id !== appointment.appointment_id));
        setAppointment(null);
        resetForm();
      } else {
        const res = await fetch(`${API_URL}/api/health-records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          showStatus(`Encounter completed! Record ID: ${data.record_id}`, "success");
          setAppointment(null);
          resetForm();
          // Refresh queue so completed appointment disappears
          fetchQueue(queueDate);
        } else {
          showStatus(`Server Error: ${data.message}`, "error");
        }
      }
    } catch {
      showStatus("Connection error while saving the medical record.", "error");
    }
  };

  // ─── Pending count ────────────────────────────────────────────────────────
  const pendingCount = queueList.filter((a) => a.status === "Pending").length;
  const inProgressCount = queueList.filter((a) => a.status === "In Progress").length;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex-grow flex overflow-hidden h-[calc(100vh-64px)]">

      {/* ─── LEFT SIDEBAR: Appointment Queue ──────────────────────────────── */}
      <aside className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800 text-sm">Today's Queue</span>
            </div>
            <button
              onClick={() => fetchQueue(queueDate)}
              disabled={queueLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-all disabled:opacity-40"
              title="Refresh worklist"
            >
              <RefreshCw className={`w-4 h-4 ${queueLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            value={queueDate}
            onChange={(e) => setQueueDate(e.target.value)}
          />

          {/* Stats row */}
          <div className="flex gap-2 mt-2">
            <span className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg px-2 py-1.5 text-center border border-amber-100">
              {pendingCount} Pending
            </span>
            <span className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg px-2 py-1.5 text-center border border-blue-100">
              {inProgressCount} In Progress
            </span>
          </div>

          {queueMock && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Demo mode — showing mock patients
            </div>
          )}

          {lastRefreshed && !queueMock && (
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              Updated {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {queueLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                  <div className="h-3 bg-slate-200 rounded w-28" />
                </div>
                <div className="h-2 bg-slate-200 rounded w-20 mt-2" />
                <div className="h-5 bg-slate-200 rounded-full w-16 mt-2" />
              </div>
            ))
          ) : queueList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No appointments</p>
              <p className="text-xs text-slate-400 mt-1">No pending patients for the selected date.</p>
            </div>
          ) : (
            queueList.map((appt) => (
              <AppointmentCard
                key={appt.appointment_id}
                appt={appt}
                isActive={appointment?.appointment_id === appt.appointment_id}
                onClick={() => selectAppointment(appt)}
              />
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-700 truncate">{CURRENT_DOCTOR_NAME}</p>
              <p className="text-slate-400 font-mono text-[10px]">{CURRENT_DOCTOR_ID}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── RIGHT MAIN PANEL ──────────────────────────────────────────────── */}
      <main className="flex-grow overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 min-h-full">

          {/* ── Page Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Stethoscope className="w-7 h-7 text-blue-600" />
                Clinical Consultation (UC14)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select a patient from the queue on the left to begin the consultation.
              </p>
            </div>
            {appointment && (
              <button
                onClick={() => { setAppointment(null); resetForm(); setStatusMessage(null); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" /> Close Patient
              </button>
            )}
          </div>

          {/* ── Alert Banner ── */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-4 border-l-4 ${
              statusType === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-500"
                : statusType === "error" ? "bg-rose-50 text-rose-800 border-rose-500"
                  : "bg-amber-50 text-amber-800 border-amber-500"
            }`}>
              <div className="flex items-center gap-2.5">
                {statusType === "success"
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  : <AlertCircle className={`w-5 h-5 shrink-0 ${statusType === "error" ? "text-rose-500" : "text-amber-500"}`} />
                }
                <span>{statusMessage}</span>
              </div>
              <button onClick={() => setStatusMessage(null)} className="shrink-0 opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── EMPTY STATE — no patient selected ── */}
          {!appointment ? (
            <div className="flex-grow flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-5">
                <ClipboardList className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Patient Selected</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Choose a patient from the <span className="font-semibold text-blue-500">Today's Queue</span> on the left to begin the clinical consultation and e-prescribing workflow.
              </p>
              {queueLoading ? (
                <div className="flex items-center gap-2 mt-6 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading patient queue...
                </div>
              ) : (
                <p className="mt-5 text-xs text-slate-400">
                  {queueList.length} patient{queueList.length !== 1 ? "s" : ""} waiting
                </p>
              )}
            </div>
          ) : (
            <>
              {/* ── PATIENT INFO CARD ── */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-900/15 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-2xl">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                        Consultation Patient
                      </span>
                      <h3 className="text-2xl font-bold">{appointment.patient_name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={usingMock ? "Pending" : appointment.status} />
                    <div className="bg-white/15 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Appointment
                      </span>
                      <p className="font-mono text-sm font-bold">{appointment.appointment_id}</p>
                      <p className="text-xs text-blue-200">{formatTime(appointment.start_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-200 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-blue-200 font-medium">Age / DOB</span>
                      <span className="font-semibold text-white block mt-0.5">
                        {getAge(appointment.patient_dob)} yrs ({appointment.patient_dob ? new Date(appointment.patient_dob).toLocaleDateString("en-US") : "N/A"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-blue-200 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-blue-200 font-medium">Phone</span>
                      <span className="font-semibold text-white block mt-0.5">{appointment.patient_phone || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-200 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-blue-200 font-medium">Email</span>
                      <span className="font-semibold text-white block mt-0.5 truncate">{appointment.patient_email || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-200 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-blue-200 font-medium">Address</span>
                      <span className="font-semibold text-white block mt-0.5 truncate">{appointment.patient_address || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CLINICAL NOTES + DIAGNOSIS GRID ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clinical Notes — 2/3 width */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-blue-500" /> Clinical Notes & Findings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Symptoms (Subjective)</label>
                      <textarea rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 resize-none" placeholder="Chief complaints, onset, duration, severity..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Clinical Findings (Objective)</label>
                      <textarea rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 resize-none" placeholder="Vital signs (BP, HR, Temp), physical examination, lab results..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Treatment Plan & Patient Advice</label>
                      <textarea rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 resize-none" placeholder="Follow-up instructions, diet, lifestyle, next appointment..." value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Diagnosis — 1/3 width */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Activity className="w-5 h-5 text-blue-500" /> Diagnosis & ICD-10
                  </h3>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      ICD-10 Code <span className="text-rose-500">*</span>
                    </label>
                    {!icdCode ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input type="text" className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="Search code or disease..." value={icdSearchQuery} onChange={(e) => setIcdSearchQuery(e.target.value)} />
                        {icdSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                            {icdSuggestions.map((item) => (
                              <div key={item.icd_code} className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 text-sm" onClick={() => selectICD(item)}>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded font-mono shrink-0 mt-0.5">{item.icd_code}</span>
                                <span className="text-slate-700 font-medium leading-snug">{item.disease_name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-xl flex items-start justify-between gap-2 text-sm">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded font-mono shrink-0 mt-0.5">{icdCode}</span>
                          <span className="font-semibold leading-relaxed">{diagnosis}</span>
                        </div>
                        <button onClick={removeICD} className="w-6 h-6 rounded-lg text-blue-400 hover:bg-blue-100 hover:text-blue-900 flex items-center justify-center shrink-0 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detailed Diagnosis</label>
                    <textarea rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed" placeholder="Auto-filled when ICD-10 is selected..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={!!icdCode} />
                  </div>
                </div>
              </div>

              {/* ── E-PRESCRIPTION ── */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" /> E-Prescription
                  </h3>
                  <button onClick={addPrescriptionRow} className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-indigo-100/50 active:scale-95">
                    <Plus className="w-4 h-4" /> Add Medication
                  </button>
                </div>

                {prescriptionDetails.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200 font-bold">
                          <tr>
                            <th className="px-4 py-3.5 w-[26%]">Medication Name</th>
                            <th className="px-4 py-3.5 w-[14%]">Dosage</th>
                            <th className="px-4 py-3.5 w-[18%]">Frequency</th>
                            <th className="px-4 py-3.5 w-[12%]">Duration</th>
                            <th className="px-4 py-3.5 w-[8%]">Qty</th>
                            <th className="px-4 py-3.5 w-[17%]">Instructions</th>
                            <th className="px-4 py-3.5 w-[5%]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {prescriptionDetails.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 relative">
                                <input type="text" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all" placeholder="Search medicine..." value={row.name} onChange={(e) => updatePrescriptionRow(index, "name", e.target.value)} />
                                {activeMedRowIndex === index && medSuggestions.length > 0 && (
                                  <div className="absolute left-4 right-4 mt-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xl z-40 max-h-52 overflow-y-auto divide-y divide-slate-100">
                                    {medSuggestions.map((med) => (
                                      <div key={med.medicine_id} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs" onClick={() => selectMedicine(index, med)}>
                                        <span className="font-bold text-slate-800">{med.name}</span>
                                        <span className="text-slate-400 italic">({med.dosage_form} – {med.strength})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3"><input type="text" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all" placeholder="e.g. 1 tab" value={row.dosage} onChange={(e) => updatePrescriptionRow(index, "dosage", e.target.value)} /></td>
                              <td className="px-4 py-3"><input type="text" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all" placeholder="e.g. Twice daily" value={row.frequency} onChange={(e) => updatePrescriptionRow(index, "frequency", e.target.value)} /></td>
                              <td className="px-4 py-3"><input type="text" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all" placeholder="e.g. 7 days" value={row.duration} onChange={(e) => updatePrescriptionRow(index, "duration", e.target.value)} /></td>
                              <td className="px-4 py-3"><input type="number" min="1" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all text-center" value={row.quantity} onChange={(e) => updatePrescriptionRow(index, "quantity", parseInt(e.target.value) || 1)} /></td>
                              <td className="px-4 py-3"><input type="text" className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm font-semibold outline-none transition-all" placeholder="After meals..." value={row.detail_notes} onChange={(e) => updatePrescriptionRow(index, "detail_notes", e.target.value)} /></td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => removePrescriptionRow(index)} className="w-8 h-8 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center mx-auto transition-all active:scale-90">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">General Prescription Notes</label>
                      <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-slate-400" placeholder="General warnings or instructions for the entire prescription..." value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/30">
                    <Pill className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold">No medications prescribed yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add Medication" to build the prescription.</p>
                  </div>
                )}
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div className="flex justify-end items-center gap-4 pb-4">
                <button onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all active:scale-95">
                  Reset Form
                </button>
                <button onClick={submitEncounter} className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 text-sm font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Complete Encounter
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
