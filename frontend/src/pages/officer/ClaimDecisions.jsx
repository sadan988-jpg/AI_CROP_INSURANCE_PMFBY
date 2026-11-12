import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Download,
  Landmark,
  Calendar,
} from 'lucide-react';

export const ClaimDecisions = () => {
  const { claims } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Claim Adjudication & Official Sanction Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Final statutory determinations, sanctioned indemnity amounts, and rejection justification audit logs
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Adjudicated Claims & Decisions ({claims.length})
          </span>
          <span className="text-[11px] text-slate-500">
            UIDAI & PMFBY Guidelines v2.6 Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Docket ID</th>
                <th className="px-5 py-3">Farmer & Crop</th>
                <th className="px-5 py-3">Incident Date</th>
                <th className="px-5 py-3">Claimed Amount</th>
                <th className="px-5 py-3">Sanctioned Amount</th>
                <th className="px-5 py-3">Adjudication Status</th>
                <th className="px-5 py-3">Officer Finding & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{claim.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{claim.farmerName}</p>
                    <p className="text-[10px] text-slate-400">{claim.cropName} (Khasra: {claim.khasraNo})</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{claim.incidentDate}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">
                    ₹{claim.claimedAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700 text-sm">
                    {claim.officerApprovedAmount
                      ? `₹${claim.officerApprovedAmount.toLocaleString('en-IN')}`
                      : claim.status === 'REJECTED'
                      ? '₹0 (Rejected)'
                      : 'Under Scrutiny'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={claim.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-sm">
                    <p className="line-clamp-2 italic text-[11px]">
                      "{claim.officerNotes || 'Pending final officer sign-off'}"
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

