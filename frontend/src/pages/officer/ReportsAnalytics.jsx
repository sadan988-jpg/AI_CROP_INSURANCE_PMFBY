import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Download,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DISTRICT_ANALYTICS_DATA, CAUSE_WISE_LOSS_DATA, MONTHLY_TREND_DATA } from '../../data/mockData';

export const ReportsAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            PMFBY Scheme Analytics & District Loss Reports
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive business intelligence, actuarial loss ratios, and turnaround time metrics
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => alert('Generating Comprehensive PMFBY Kharif 2026 Analytical Dossier...')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download Complete Analytics Report (PDF)
          </button>
        </div>
      </div>

      {/* Row 1: District Exposure & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">District-Level Financial Exposure</h2>
              <p className="text-xs text-slate-500">Claimed vs Approved Payouts (₹ in Lakhs)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">Haryana Agro-Zone</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_ANALYTICS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="totalClaimedLakhs" name="Total Claimed (₹L)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedLakhs" name="Total Approved (₹L)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Monthly Processing Velocity</h2>
              <p className="text-xs text-slate-500">Number of submitted claims vs settled</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">TAT: 3.4 Days Avg</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="submitted" name="Claims Submitted" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="settled" name="Claims Settled" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: District Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            District-Wise Loss Ratio & Rejection Performance
          </span>
          <span className="text-[11px] text-slate-500">
            Kharif 2026 Audit Benchmarks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">District</th>
                <th className="px-5 py-3">Claims Filed</th>
                <th className="px-5 py-3">Claimed Value (₹ Lakhs)</th>
                <th className="px-5 py-3">Disbursed Value (₹ Lakhs)</th>
                <th className="px-5 py-3">Settlement Ratio</th>
                <th className="px-5 py-3">Fraud / Rejection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DISTRICT_ANALYTICS_DATA.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{d.district}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800">{d.claims}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800">₹{d.totalClaimedLakhs} L</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">₹{d.approvedLakhs} L</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">
                    {((d.approvedLakhs / d.totalClaimedLakhs) * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3.5 font-mono text-rose-600 font-semibold">
                    {d.rejectionPct}%
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

