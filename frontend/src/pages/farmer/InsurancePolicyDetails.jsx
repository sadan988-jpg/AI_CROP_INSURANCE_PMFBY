import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldCheck,
  Download,
  FileCheck2,
  Calendar,
  Building,
  CheckCircle2,
  Info,
  DollarSign,
} from 'lucide-react';

export const InsurancePolicyDetails = () => {
  const { policies } = useApp();
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || '');

  const activePolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            PMFBY Insurance Policy Dossier
          </h1>
          <p className="text-xs text-slate-500">
            Pradhan Mantri Fasal Bima Yojana coverage certificates & subsidized premium breakdown
          </p>
        </div>
        <div>
          <Link
            to="/farmer/submit-claim"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            File Claim on Active Policy
          </Link>
        </div>
      </div>

      {/* Policy Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {policies.map((policy) => (
          <button
            key={policy.id}
            type="button"
            onClick={() => setSelectedPolicyId(policy.id)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activePolicy?.id === policy.id
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{policy.cropName}</span>
            <span className="font-mono text-[10px] text-slate-400">({policy.id})</span>
          </button>
        ))}
      </div>

      {activePolicy ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Comprehensive Policy Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 font-mono">
                    GOVERNMENT OF INDIA • MINISTRY OF AGRICULTURE
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">{activePolicy.cropName}</h2>
                  <p className="font-mono text-xs text-slate-500">
                    PMFBY Policy Number: <strong className="text-slate-800">{activePolicy.id}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={activePolicy.status} size="lg" />
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Season: {activePolicy.season}</p>
                </div>
              </div>

              {/* Sum Insured Callout */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-900 to-green-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    Total Guaranteed Sum Insured
                  </span>
                  <p className="text-3xl font-extrabold tracking-tight mt-1">
                    ₹{activePolicy.sumInsured?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Maximum payable indemnity against localized calamities and crop failure
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Downloading official PMFBY Policy Certificate for ${activePolicy.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow self-start sm:self-auto"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  Download Certificate (PDF)
                </button>
              </div>

              {/* Premium Breakdown Matrix (PMFBY 2% Farmer share) */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Government Premium Subsidy Breakdown
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 block text-[10px] font-bold uppercase">Farmer Share (2%)</span>
                    <span className="font-mono text-base font-bold text-emerald-900">
                      ₹{activePolicy.farmerSharePremium?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Paid by Beneficiary</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Central Subsidy</span>
                    <span className="font-mono text-base font-bold text-slate-800">
                      ₹{activePolicy.centralSubsidy?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Paid by GoI</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">State Subsidy</span>
                    <span className="font-mono text-base font-bold text-slate-800">
                      ₹{activePolicy.stateSubsidy?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Paid by Haryana Govt</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-blue-800 block text-[10px] font-bold uppercase">Total Actuarial Premium</span>
                    <span className="font-mono text-base font-bold text-blue-900">
                      ₹{activePolicy.totalGrossPremium?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-blue-700 block mt-0.5">Underwritten</span>
                  </div>
                </div>
              </div>

              {/* Coverage Terms & Inclusions */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Insured Perils & Clauses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">1. Prevented Sowing / Planting Risk:</span>
                    <p className="text-slate-600 text-[11px]">
                      Up to 25% of sum insured if adverse rainfall prevents deficit area sowing.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">2. Standing Crop Calamity:</span>
                    <p className="text-slate-600 text-[11px]">
                      Yield loss coverage against flood, hailstorm, drought, pest attacks.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">3. Post-Harvest Losses:</span>
                    <p className="text-slate-600 text-[11px]">
                      Coverage up to 14 days post-harvest for crops dried in cut condition.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">4. Localized Calamities:</span>
                    <p className="text-slate-600 text-[11px]">
                      Hailstorm, landslide, inundation, cloudburst, natural fire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Insurance Company & Validity */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                Underwriting Insurer
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Insurance Company</span>
                  <p className="font-bold text-slate-900 mt-0.5">{activePolicy.insuranceCompany}</p>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Coverage Start:</span>
                  <span className="font-mono text-slate-800">{activePolicy.policyStartDate}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Coverage Expiry:</span>
                  <span className="font-mono text-slate-800">{activePolicy.policyEndDate}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Khasra / Plot:</span>
                  <span className="font-mono text-slate-800">KH-882-901</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>PMFBY Policy is Active</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  You are eligible to file instant AI crop loss claims within 72 hours of any localized calamity.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/farmer/submit-claim"
                  className="w-full text-center block py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition shadow-md"
                >
                  File Claim Against This Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No policies found.
        </div>
      )}
    </div>
  );
};

