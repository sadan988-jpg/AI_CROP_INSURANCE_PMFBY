import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileCheck2,
  BrainCircuit,
  Landmark,
  ShieldAlert,
  AlertTriangle,
  Search,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CAUSE_WISE_LOSS_DATA, MONTHLY_TREND_DATA } from '../../data/mockData';

export const OfficerDashboard = () => {
  const { officerProfile, claims, cropImages, crops, inspections } = useApp();
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.officers.getDashboardStats()
      .then((data) => {
        if (mounted && data) setDbStats(data);
      })
      .catch((err) => {
        console.warn('Backend officer stats fetch notice:', err.message);
      });
    return () => { mounted = false; };
  }, []);

  const pendingClaimsCount = dbStats ? dbStats.pendingClaimsCount : claims.filter((c) => c.status === 'UNDER_OFFICER_REVIEW').length;
  const totalSettledAmount = dbStats ? dbStats.totalDisbursedAmount : claims
    .filter((c) => c.status === 'SETTLED_DISBURSED')
    .reduce((acc, c) => acc + (c.officerApprovedAmount || 0), 0);
  const imagesCount = dbStats ? dbStats.totalImagesCount : cropImages.length;
  const inspectionsCount = dbStats ? dbStats.scheduledInspectionsCount : inspections.length;

  return (
    <div className="space-y-6">
      {/* Officer Hero Banner */}
      <div className="rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {officerProfile.id} • {officerProfile.role}
              </span>
              <span className="bg-emerald-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                Active Duty
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {officerProfile.fullName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              {officerProfile.designation} • {officerProfile.jurisdiction}. {officerProfile.department}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/officer/claim-verification"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-xs sm:text-sm"
            >
              <Search className="w-4 h-4" />
              Scrutinize Pending Queue ({pendingClaimsCount})
            </Link>
            <Link
              to="/officer/inspection-requests"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition text-xs sm:text-sm"
            >
              <CalendarClock className="w-4 h-4 text-emerald-400" />
              Field CCE Schedule ({inspectionsCount})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Scrutiny Queue"
          value={pendingClaimsCount}
          subtitle="Awaiting District Officer Decision"
          icon={FileCheck2}
          trend={dbStats ? "Live DB Count" : "Urgent Actions"}
          trendPositive={false}
          colorScheme="amber"
        />
        <StatCard
          title="AI Evaluated Telemetry"
          value={`${imagesCount} Imagery`}
          subtitle="YOLOv8 + OpenCV Verified"
          icon={BrainCircuit}
          trend={dbStats ? `${dbStats.averageConfidence || 94.6}% Avg Conf` : "94.6% Avg Conf"}
          trendPositive={true}
          colorScheme="emerald"
        />
        <StatCard
          title="Scheduled Field CCEs"
          value={inspectionsCount}
          subtitle="Physical Ground-Truth Surveys"
          icon={CalendarClock}
          trend="On Schedule"
          trendPositive={true}
          colorScheme="blue"
        />
        <StatCard
          title="Total DBT Settled"
          value={`₹${(totalSettledAmount / 100000).toFixed(2)} Lakh`}
          subtitle="PFMS Disbursed Payouts"
          icon={Landmark}
          trend="+100% TAT Met"
          trendPositive={true}
          colorScheme="emerald"
        />
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Claim & Settlement Volume */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Monthly PMFBY Claims & Settlement Trajectory</h2>
              <p className="text-xs text-slate-500">Volume of filed vs settled claims across Karnal zone</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">Kharif 2026</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="submitted" name="Claims Submitted" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="settled" name="Claims Disbursed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Cause-wise Loss Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">Calamity Cause Breakdown</h2>
            <p className="text-xs text-slate-500">Categorization of reported yield losses</p>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CAUSE_WISE_LOSS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  paddingAngle={3}
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

          <div className="space-y-1.5 text-xs">
            {CAUSE_WISE_LOSS_DATA.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold font-mono text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Claims Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">Urgent Claims Scrutiny Queue</h2>
            <p className="text-xs text-slate-500">AI-assessed dossiers requiring official review & payout authorization</p>
          </div>
          <Link
            to="/officer/claim-verification"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Open Full Verification Desk <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Docket ID</th>
                <th className="px-5 py-3">Farmer & Village</th>
                <th className="px-5 py-3">Crop & Khasra</th>
                <th className="px-5 py-3">Calamity Cause</th>
                <th className="px-5 py-3">AI Loss Est.</th>
                <th className="px-5 py-3">Claim Value</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{claim.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-800">{claim.farmerName}</p>
                    <p className="text-[10px] text-slate-400">{claim.district}, {claim.state}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{claim.cropName}</p>
                    <p className="text-[10px] font-mono text-slate-400">Khasra: {claim.khasraNo}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{claim.causeLabel || claim.causeOfLoss}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {claim.aiAssessedLossPct}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    ₹{claim.claimedAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={claim.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <Link
                      to="/officer/claim-verification"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-block shadow-2xs"
                    >
                      Inspect Dossier
                    </Link>
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

