import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Landmark,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Building,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

export const SettlementTracking = () => {
  const { settlements } = useApp();

  const totalDisbursed = settlements
    .filter((s) => s.status === 'SUCCESSFUL')
    .reduce((acc, s) => acc + (s.payoutAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            PFMS Direct Benefit Transfer (DBT) Settlement Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time tracking of electronic claim disbursements directly into farmer Aadhaar-seeded bank accounts
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => alert('Exporting PFMS DBT disbursement batch ledger...')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export DBT Batch Report (PFMS)
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-emerald-900 text-white border border-emerald-800 shadow-sm">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Total Disbursed Indemnity
          </span>
          <p className="text-2xl font-extrabold font-mono mt-1">
            ₹{totalDisbursed.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-300 mt-1 block">100% Directly Credited to Farmer A/Cs</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settlement Batches
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {settlements.length} Transactions
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Zero Intermediary Deductions</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Settlement Turnaround
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            3.4 Days
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">PMFBY Statutory Benchmark: 21 Days</span>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Electronic Transfer Records ({settlements.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            NPCI Aadhaar Payment Bridge (APB)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Settlement ID</th>
                <th className="px-5 py-3">Claim Reference</th>
                <th className="px-5 py-3">Beneficiary Farmer</th>
                <th className="px-5 py-3">Disbursed Amount</th>
                <th className="px-5 py-3">Bank & Account</th>
                <th className="px-5 py-3">Bank UTR Number</th>
                <th className="px-5 py-3">Disbursement Date</th>
                <th className="px-5 py-3">DBT Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{s.id}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">{s.claimId}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{s.farmerName}</p>
                    <p className="text-[10px] font-mono text-slate-400">UID: {s.aadhaarMasked}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700 text-sm">
                    ₹{s.payoutAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700 text-[11px]">
                    {s.bankAccount}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-900 font-semibold text-[11px]">
                    {s.utrNumber}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{s.disbursedDate}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.status} size="sm" />
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

