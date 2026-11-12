import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Sprout,
  ShieldCheck,
  FileCheck2,
  Landmark,
  CloudRain,
  Camera,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { farmerProfile, crops, policies, claims } = useApp();

  const totalSumInsured = policies.reduce((acc, p) => acc + (p.sumInsured || 0), 0);
  const activeClaimsCount = claims.filter(c => c.status !== 'SETTLED_DISBURSED').length;
  const settledClaimsTotal = claims
    .filter(c => c.status === 'SETTLED_DISBURSED')
    .reduce((acc, c) => acc + (c.officerApprovedAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,#ffffff20,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                PMFBY Beneficiary ID: {farmerProfile.id}
              </span>
              <span className="bg-emerald-400 text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-full">
                Aadhaar Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {farmerProfile.fullName}
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl">
              Village: {farmerProfile.address.village}, Tehsil: {farmerProfile.address.tehsil}, {farmerProfile.address.district} ({farmerProfile.address.state}). Total Registered Land: {farmerProfile.landHoldingsTotalAcres} Acres.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/farmer/image-upload"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-4 py-2.5 rounded-xl shadow hover:bg-emerald-50 transition text-xs sm:text-sm"
            >
              <Camera className="w-4 h-4 text-emerald-700" />
              Capture Crop Photo
            </Link>
            <Link
              to="/farmer/submit-claim"
              className="inline-flex items-center gap-2 bg-emerald-600/60 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl border border-emerald-400/40 transition text-xs sm:text-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              File Damage Claim
            </Link>
          </div>
        </div>
      </div>

      {/* Weather Advisory Alert Card */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
            <CloudRain className="w-5 h-5 text-amber-700 animate-bounce" />
          </div>
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-amber-900">
              IMD Doppler Radar Alert: High Precipitation Expected (65mm - 80mm)
            </p>
            <p className="text-amber-800/90 text-xs mt-0.5">
              Karnal district agro-advisory recommends inspecting water outlets in low-lying Paddy fields. If lodging occurs, photograph crops within 72 hours for PMFBY compensation.
            </p>
          </div>
        </div>
        <Link
          to="/farmer/notifications"
          className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-auto"
        >
          View Advisory
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Crops"
          value={crops.length}
          subtitle={`${crops.filter(c => c.status === 'INSURED').length} Insured under PMFBY`}
          icon={Sprout}
          trend="+1 Season"
          trendPositive={true}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Sum Insured"
          value={`₹${(totalSumInsured / 100000).toFixed(2)} Lakh`}
          subtitle="Kharif 2026 Season Coverage"
          icon={ShieldCheck}
          trend="100% Subsidized"
          trendPositive={true}
          colorScheme="blue"
        />
        <StatCard
          title="Active Claims"
          value={activeClaimsCount}
          subtitle="Under AI & Officer Review"
          icon={FileCheck2}
          trend="In Progress"
          trendPositive={false}
          colorScheme="amber"
        />
        <StatCard
          title="DBT Payouts Settled"
          value={`₹${settledClaimsTotal.toLocaleString('en-IN')}`}
          subtitle="Credited directly to SBI Account"
          icon={Landmark}
          trend="Verified PFMS"
          trendPositive={true}
          colorScheme="emerald"
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/farmer/crop-registration"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
            <Sprout className="w-5 h-5" />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-800">Register Sowing</p>
          <p className="text-[10px] text-slate-500">Khasra & Survey mapping</p>
        </Link>

        <Link
          to="/farmer/disease-detection"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-800">AI Disease Scan</p>
          <p className="text-[10px] text-slate-500">YOLOv8 Instant Analysis</p>
        </Link>

        <Link
          to="/farmer/damage-assessment"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-800">Severity Estimator</p>
          <p className="text-[10px] text-slate-500">OpenCV Leaf Necrosis %</p>
        </Link>

        <Link
          to="/farmer/track-claim"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-center group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-800">Claim Tracker</p>
          <p className="text-[10px] text-slate-500">Live Stage & TAT</p>
        </Link>
      </div>

      {/* Main Grid: My Crops + Active Claim Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registered Crops Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Current Standing Crops</h2>
              <p className="text-xs text-slate-500">Insured agricultural parcels in Karnal district</p>
            </div>
            <Link
              to="/farmer/registered-crops"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View all ({crops.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {crops.map((crop) => (
              <div key={crop.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800">{crop.cropName}</h3>
                      <StatusBadge status={crop.healthStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Survey #{crop.surveyNumber} • Khasra: {crop.khasraNumber} • {crop.areaAcres} Acres
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span>Sown: {crop.sowingDate}</span>
                      <span>•</span>
                      <span>Season: {crop.season}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-700 font-semibold">{crop.policyId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    to="/farmer/image-upload"
                    className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Photo
                  </Link>
                  <Link
                    to="/farmer/submit-claim"
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200"
                  >
                    Claim Loss
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Claim Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">Latest PMFBY Claim</h2>
              <p className="text-xs text-slate-500">Real-time scrutiny status</p>
            </div>
            <Link to="/farmer/track-claim" className="text-xs text-emerald-700 font-semibold hover:underline">
              History
            </Link>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">{claims[0].id}</span>
                  <StatusBadge status={claims[0].status} size="sm" />
                </div>
                <p className="text-xs font-semibold text-slate-800">{claims[0].cropName}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Cause: <span className="font-medium text-slate-700">{claims[0].causeLabel || claims[0].causeOfLoss}</span></p>
                  <p>Claimed: <span className="font-bold text-slate-900">₹{claims[0].claimedAmount.toLocaleString('en-IN')}</span></p>
                  <p>AI Loss Est: <span className="font-bold text-rose-600">{claims[0].aiAssessedLossPct}%</span></p>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Verification Steps</p>
                <div className="space-y-2.5">
                  {claims[0].statusTimeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        step.completed
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-200 text-slate-500 font-medium'
                      }`}>
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.step}
                        </p>
                        <p className="text-[10px] text-slate-400">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/farmer/track-claim"
                className="w-full text-center block py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                Open Full Claim Dossier
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No active insurance claims filed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

