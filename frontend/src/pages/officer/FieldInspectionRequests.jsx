import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CalendarClock,
  MapPin,
  UserCheck,
  CheckCircle2,
  Plus,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export const FieldInspectionRequests = () => {
  const { inspections, scheduleInspection, claims } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    claimId: claims[0]?.id || 'CLM-PMFBY-2026-0041',
    farmerName: 'Rameshwar Singh Patel',
    village: 'Sambhalkha, Gharaunda',
    khasraNo: 'KH-882-901',
    scheduledDate: '2026-08-22',
    purpose: 'Crop Cutting Experiment (CCE) physical harvest quadrant yield check',
    priority: 'URGENT',
  });
  const [msg, setMsg] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    scheduleInspection(formData);
    setShowModal(false);
    setMsg('New Field CCE Inspection Scheduled!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Physical Field Crop Cutting Experiment (CCE) Requests
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch government surveyors for spot-checks on border cases or severe calamity claims
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Schedule New Inspection
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Active Survey Dispatches ({inspections.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Surveyor Mobile App Sync Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Task ID</th>
                <th className="px-5 py-3">Claim Reference</th>
                <th className="px-5 py-3">Farmer & Location</th>
                <th className="px-5 py-3">Assigned Surveyor</th>
                <th className="px-5 py-3">Scheduled Date</th>
                <th className="px-5 py-3">Inspection Purpose</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{insp.id}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">{insp.claimId}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{insp.farmerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{insp.village} • {insp.khasraNo}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{insp.assignedOfficer}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{insp.scheduledDate}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{insp.purpose}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={insp.priority} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={insp.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Schedule New Inspection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-emerald-600" />
                Schedule Field Surveyor Inspection
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Claim Docket Number</label>
                <select
                  value={formData.claimId}
                  onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  {claims.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.cropName} ({c.farmerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Inspection Date</label>
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Survey Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  <option value="URGENT">URGENT (Severe Calamity &gt; 60% Loss)</option>
                  <option value="MEDIUM">MEDIUM (Standard Validation)</option>
                  <option value="ROUTINE">ROUTINE (Random 5% Audit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Instructions for Surveyor</label>
                <textarea
                  rows="3"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Dispatch Inspection Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

