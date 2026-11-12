import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  GitBranch,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CloudRain,
  Landmark,
  ChevronRight,
} from 'lucide-react';

export const TrackClaimStatus = () => {
  const { claims } = useApp();
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id || '');

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            PMFBY Claim Lifecycle & Turnaround Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Transparent real-time tracking of AI diagnosis, surveyor scrutiny, and DBT disbursement
          </p>
        </div>
        <div>
          <Link
            to="/farmer/submit-claim"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            Submit Another Claim
          </Link>
        </div>
      </div>

      {/* Claim Selection Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {claims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            onClick={() => setSelectedClaimId(claim.id)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeClaim?.id === claim.id
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4 text-emerald-600" />
            <span className="font-mono">{claim.id}</span>
            <StatusBadge status={claim.status} size="sm" />
          </button>
        ))}
      </div>

      {activeClaim ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Stepper Timeline & Full Dossier */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{activeClaim.cropName}</h2>
                    <StatusBadge status={activeClaim.status} size="md" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Claim Docket: {activeClaim.id} • Khasra: {activeClaim.khasraNo}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block">Claimed Loss Amount</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    ₹{activeClaim.claimedAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Verification & Processing Pipeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeClaim.statusTimeline?.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 text-xs">
                      <div
                        className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                          step.completed
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-bold text-sm ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.step}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">{step.date}</span>
                        </div>
                        {step.completed && (
                          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stage validated & authenticated
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Telemetry Correlation Card */}
              {activeClaim.weatherCorrelation && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900">
                    <CloudRain className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Agro-Meteorological Cross-Verification (IMD Telemetry)
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-blue-950 pt-1">
                    <div>
                      <span className="text-blue-700 block text-[10px] font-bold">Rainfall on Incident Date:</span>
                      <span className="font-mono font-bold text-sm">{activeClaim.weatherCorrelation.incidentRainfallMm} mm</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block text-[10px] font-bold">Precipitation Anomaly:</span>
                      <span className="font-mono font-bold text-sm">{activeClaim.weatherCorrelation.precipitationAnomaly}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block text-[10px] font-bold">Validation Result:</span>
                      <span className="font-bold text-emerald-800">AUTHENTIC (Weather Sync)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Assessment Dossier & Settlement Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Settlement & Payout Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Incident Date:</span>
                  <span className="font-mono text-slate-800">{activeClaim.incidentDate}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">AI Assessed Severity:</span>
                  <span className="font-mono font-bold text-rose-600">{activeClaim.aiAssessedLossPct}%</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">AI Recommended Indemnity:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{activeClaim.aiRecommendedAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Approved Payout Amount:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {activeClaim.officerApprovedAmount
                      ? `₹${activeClaim.officerApprovedAmount.toLocaleString('en-IN')}`
                      : 'Under Officer Scrutiny'}
                  </span>
                </div>
              </div>

              {activeClaim.officerNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900">Surveyor & Officer Remarks:</span>
                  <p className="text-slate-600 italic">"{activeClaim.officerNotes}"</p>
                </div>
              )}

              {activeClaim.status === 'SETTLED_DISBURSED' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    DBT Payment Disbursed to SBI A/c
                  </span>
                  <p className="text-[11px] font-mono text-emerald-800">
                    PFMS UTR: SBIN2026040298114402
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No claims filed yet.
        </div>
      )}
    </div>
  );
};

