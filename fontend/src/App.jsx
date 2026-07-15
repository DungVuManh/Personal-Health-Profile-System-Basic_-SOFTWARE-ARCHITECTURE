import { useState } from 'react'
// import heroImg from './assets/hero.png'
import ConsultationScreen from './pages/ConsultationScreen'
import BookingScreen from './pages/BookingScreen'
import UserManagementScreen from './pages/UserManagementScreen'
import {
  Activity,
  Home,
  Stethoscope,
  BookOpen,
  HeartPulse,
  ShieldCheck,
  Calendar
} from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('booking') // Default to booking for testing!

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Premium Header/Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-1.5 rounded-xl border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              HealthProfile
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'booking'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment(UC2)</span>
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'consultation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Clinical Consultation (UC14)</span>
            </button>

            <button
              onClick={() => setActiveTab('userman')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'userman'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Admin User Management (UC7)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {activeTab === 'consultation' ? (
          <ConsultationScreen />
        ) : activeTab === 'booking' ? (
          <BookingScreen />
        ) : activeTab === 'userman' ? (
                    <UserManagementScreen />
        ) :(
          <div className="max-w-4xl mx-auto px-4 py-16 flex-grow flex flex-col justify-center items-center text-center">
            {/* Hero Section with professional medical icons */}
            <div className="mb-10 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-lg flex items-center justify-center gap-6 border border-slate-100">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-md transform scale-110">
                  <HeartPulse className="w-12 h-12 animate-pulse" />
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Personal Health Profile System
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mb-12 leading-relaxed">
              Welcome to the proactive health management and care system. Seamlessly connect electronic health records, assist clinical consultations, and optimize the e-prescription workflow.
            </p>

            {/* Navigation Card Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              <div
                onClick={() => setActiveTab('booking')}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 p-6 rounded-2xl border border-blue-100 text-left cursor-pointer transition-all duration-300 hover:shadow-md group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">Book Appointment</h3>
                <p className="text-sm text-blue-700">Find doctors, filter schedule options, choose service type, and confirm bookings instantly.</p>
              </div>

              <div
                onClick={() => setActiveTab('consultation')}
                className="bg-slate-50 hover:bg-slate-100 p-6 rounded-2xl border border-slate-200 text-left cursor-pointer transition-all duration-300 hover:shadow-md group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Doctor's Panel (UC14)</h3>
                <p className="text-sm text-slate-600">Enter medical records, search ICD-10 diagnostic codes, and generate e-prescriptions dynamically.</p>
              </div>

              <div className="bg-slate-50 hover:bg-slate-100 p-6 rounded-2xl border border-slate-200 text-left transition-all duration-300 hover:shadow-sm group">
                <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Group 6 Documentation</h3>
                <p className="text-sm text-slate-600">Read SQL Server configuration guides and debug API connection issues in the project.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500 font-medium">
        <p>© 2026 Personal Health Profile System - Group 6 Software Architecture</p>
      </footer>
    </div>
  )
}

export default App
