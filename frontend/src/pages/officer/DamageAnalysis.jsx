import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BarChart3,
  TrendingDown,
  CloudLightning,
  AlertTriangle,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DISTRICT_ANALYTICS_DATA, CAUSE_WISE_LOSS_DATA } from '../../data/mockData';

export const DamageAnalysis = () => {
  const { aiAssessments } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Automated Damage Quantification & Spatial Loss Analytics
          </h1>
          <p className="text-xs text-slate-500">
            OpenCV pixel-level vegetation index (NDVI / HSV foliage ratio) and district severity benchmarks
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District-wise Claim Loss Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">District-Wise Reported vs Approved Loss</h2>
              <p className="text-xs text-slate-500">Comparing claimed value against AI-adjusted loss (₹ Lakhs)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">Karnal Region</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_ANALYTICS_DATA}>
                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="totalClaimedLakhs" name="Claimed Loss (₹L)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedLakhs" name="AI Approved Indemnity (₹L)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Loss Cause Distribution by Calamity</h2>
            <p className="text-xs text-slate-500">Percentage share of affected area</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CAUSE_WISE_LOSS_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  dataKey="value"
                >
                  {CAUSE_WISE_LOSS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OpenCV Pixel Necrosis Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Active Plot Loss Assessments ({aiAssessments.length})
          </span>
          <span className="text-[11px] text-slate-500">
            HSV Color-Space Defoliation Index
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Assessment ID</th>
                <th className="px-5 py-3">Crop Name</th>
                <th className="px-5 py-3">Diagnosis Issue</th>
                <th className="px-5 py-3">Necrosis / Damage %</th>
                <th className="px-5 py-3">Healthy Canopy %</th>
                <th className="px-5 py-3">Confidence</th>
                <th className="px-5 py-3">PMFBY Risk Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiAssessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{a.id}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{a.cropName}</td>
                  <td className="px-5 py-3.5 text-slate-700">{a.primaryIssue}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-rose-600">
                    {a.severityPercentage}%
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">
                    {a.pixelSegmentation?.healthyGreenPct || 50}%
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{a.confidenceScore}%</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={a.riskCategory} size="sm" />
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

