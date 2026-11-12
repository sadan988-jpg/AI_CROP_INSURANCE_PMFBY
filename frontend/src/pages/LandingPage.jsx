import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Sprout,
  Cpu,
  BrainCircuit,
  Building,
  CheckCircle2,
  ArrowRight,
  CloudRain,
  Compass,
  FileCheck2,
  Landmark,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { switchRole } = useApp();

  const handleSelectRole = (role) => {
    switchRole(role);
    if (role === 'FARMER') {
      navigate('/farmer/dashboard');
    } else {
      navigate('/officer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">PMFBY</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Analytics Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Pradhan Mantri Fasal Bima Yojana • Ministry of Agriculture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => handleSelectRole('FARMER')}
              className="text-slate-300 hover:text-white font-semibold transition hidden sm:block"
            >
              Farmer Access
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('OFFICER')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
            >
              Officer Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98115,transparent_70%)] pointer-events-none" />

        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            Next-Gen Crop Insurance Claim Assessment
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Based Real-Time Crop Image Analytics for PMFBY
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Eliminating claim settlement delays through <strong>YOLOv8 deep learning</strong>, <strong>OpenCV foliage damage quantification</strong>, and <strong>cryptographic geo-fence verification</strong>.
          </p>

          {/* Dual Portal Selection Cards */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {/* Farmer Portal Gateway Card */}
            <div
              onClick={() => handleSelectRole('FARMER')}
              className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-emerald-500 transition duration-300 shadow-xl cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
                    1. Farmer Self-Service Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Crop sowing registration, in-field geotagged photo capture, instant AI disease & pest diagnostics, and 1-click insurance claim initiation with live TAT tracking.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-time GPS & Camera Geo-locking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Blight & Pest Detection (YOLOv8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Benefit Transfer (DBT) Status</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
                  Enter Farmer Portal <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Officer Portal Gateway Card */}
            <div
              onClick={() => handleSelectRole('OFFICER')}
              className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 hover:border-blue-500 transition duration-300 shadow-xl cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-110 transition">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                    2. Insurance Officer Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Multi-modal dossier scrutiny, bounding box inspection, satellite cadastral verification, IMD Doppler weather cross-check, and PFMS claim settlement adjudication.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Side-by-side AI Defoliation Segmentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Precipitation Anomaly & Radar Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Field CCE Inspection Dispatcher</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition">
                  Enter Officer Portal <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Pradhan Mantri Fasal Bima Yojana (PMFBY) • AI Crop Insurance Management System</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">
          Powered by React 18 • Tailwind CSS • YOLOv8 • OpenCV • PyTorch • FastAPI • MySQL
        </p>
      </footer>
    </div>
  );
};
