import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  Search,
  ShieldCheck,
  MapPin,
  CreditCard,
  Phone,
  Landmark,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const FarmerManagement = () => {
  const { farmerProfile, crops } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  // Sample farmer list incorporating the primary active profile and additional realistic PMFBY beneficiaries
  const farmersList = [
    {
      ...farmerProfile,
      activePolicies: 2,
      totalClaims: 2,
    },
    {
      id: "FARM-2026-9043",
      fullName: "Harbhajan Singh Sandhu",
      phone: "+91 94162 33411",
      aadhaarMasked: "XXXX-XXXX-9901",
      aadhaarStatus: "VERIFIED",
      landHoldingsTotalAcres: 8.2,
      address: {
        village: "Indri",
        tehsil: "Indri",
        district: "Karnal",
        state: "Haryana",
      },
      bankAccount: {
        accountNumber: "XXXXXXXX8811",
        bankName: "Punjab National Bank",
        ifsc: "PUNB0021400",
        verified: true,
      },
      activePolicies: 3,
      totalClaims: 1,
    },
    {
      id: "FARM-2026-9044",
      fullName: "Baldev Raj Saini",
      phone: "+91 98120 77124",
      aadhaarMasked: "XXXX-XXXX-1102",
      aadhaarStatus: "VERIFIED",
      landHoldingsTotalAcres: 3.8,
      address: {
        village: "Taraori",
        tehsil: "Nilokheri",
        district: "Karnal",
        state: "Haryana",
      },
      bankAccount: {
        accountNumber: "XXXXXXXX9012",
        bankName: "HDFC Bank Ltd",
        ifsc: "HDFC0001048",
        verified: true,
      },
      activePolicies: 1,
      totalClaims: 0,
    },
    {
      id: "FARM-2026-9045",
      fullName: "Kuldeep Mann",
      phone: "+91 97281 99042",
      aadhaarMasked: "XXXX-XXXX-7320",
      aadhaarStatus: "VERIFIED",
      landHoldingsTotalAcres: 6.0,
      address: {
        village: "Assandh",
        tehsil: "Assandh",
        district: "Karnal",
        state: "Haryana",
      },
      bankAccount: {
        accountNumber: "XXXXXXXX3219",
        bankName: "State Bank of India",
        ifsc: "SBIN0002189",
        verified: true,
      },
      activePolicies: 2,
      totalClaims: 1,
    },
  ];

  const filteredFarmers = farmersList.filter((f) =>
    f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.address.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            District Farmer Registry (PMFBY Beneficiaries)
          </h1>
          <p className="text-xs text-slate-500">
            Aadhaar authenticated farmer landholders, cadastral plots, and bank DBT accounts
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search farmer name, ID, village, tehsil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredFarmers.length} Verified Beneficiaries
        </span>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Beneficiary ID</th>
                <th className="px-5 py-3">Farmer Full Name</th>
                <th className="px-5 py-3">Village & Tehsil</th>
                <th className="px-5 py-3">Total Land</th>
                <th className="px-5 py-3">Aadhaar Status</th>
                <th className="px-5 py-3">DBT Bank Account</th>
                <th className="px-5 py-3">Active Policies</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">{f.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{f.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{f.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-800 font-medium">{f.address.village}</span>
                    <span className="text-slate-400 block text-[10px]">{f.address.tehsil}, {f.address.district}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{f.landHoldingsTotalAcres} Acres</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px]">
                    <span className="text-slate-800 block font-semibold">{f.bankAccount.bankName}</span>
                    <span className="text-slate-400">{f.bankAccount.accountNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                      {f.activePolicies} Policies
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedFarmer(f)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View KYC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Farmer KYC Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Farmer Verification Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-lg">
                  {selectedFarmer.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedFarmer.fullName}</h4>
                  <p className="font-mono text-emerald-800 text-[11px]">Beneficiary ID: {selectedFarmer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Masked Aadhaar</span>
                  <span className="font-mono font-bold">{selectedFarmer.aadhaarMasked}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Phone</span>
                  <span className="font-mono font-bold">{selectedFarmer.phone}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Land Holding</span>
                  <span className="font-bold text-emerald-700">{selectedFarmer.landHoldingsTotalAcres} Acres</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tehsil Jurisdiction</span>
                  <span className="font-semibold">{selectedFarmer.address.tehsil}, {selectedFarmer.address.district}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">DBT PFMS Bank Account:</span>
                <p className="font-mono font-bold text-slate-900">
                  {selectedFarmer.bankAccount.bankName} - {selectedFarmer.bankAccount.accountNumber}
                </p>
                <p className="text-slate-500 font-mono text-[10px]">IFSC: {selectedFarmer.bankAccount.ifsc}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

