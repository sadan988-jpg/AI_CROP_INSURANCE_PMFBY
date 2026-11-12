import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  Download,
} from 'lucide-react';

export const InsuranceApplications = () => {
  const { policies, setPolicies } = useApp();
  const [selectedPolicy, setSelectedPolicy] = useState(policies[0] || null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            PMFBY Insurance Policy Underwriting Applications
          </h1>
          <p className="text-xs text-slate-500">
            Review seasonal insurance enrollments, premium subsidy allocations, and insurance company bindings
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Enrolled Crop Policies ({policies.length})
          </span>
          <span className="text-[11px] text-slate-500">
            AICIL & General Insurance Tie-ups
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Policy Number</th>
                <th className="px-5 py-3">Crop & Season</th>
                <th className="px-5 py-3">Guaranteed Sum Insured</th>
                <th className="px-5 py-3">Farmer Premium (2%)</th>
                <th className="px-5 py-3">Govt. Subsidy</th>
                <th className="px-5 py-3">Underwriter</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{p.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{p.cropName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{p.season}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    ₹{p.sumInsured?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-800 font-semibold">
                    ₹{p.farmerSharePremium?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    ₹{((p.centralSubsidy || 0) + (p.stateSubsidy || 0))?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{p.insuranceCompany}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Certificate ${p.id} verified and ready for download.`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      PDF
                    </button>
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

