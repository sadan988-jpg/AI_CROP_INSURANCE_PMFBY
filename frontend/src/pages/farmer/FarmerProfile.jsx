import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  CreditCard,
  MapPin,
  Landmark,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const FarmerProfile = () => {
  const { farmerProfile, setFarmerProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [formData, setFormData] = useState({ ...farmerProfile });

  const handleSave = (e) => {
    e.preventDefault();
    setFarmerProfile(formData);
    setIsEditing(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Farmer KYC & Land Profile</h1>
          <p className="text-xs text-slate-500">
            Aadhaar-authenticated beneficiary records linked to PMFBY and DBT PFMS
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile Details'}
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Profile updated and synchronized with PMFBY records successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Identity & Aadhaar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-500 text-emerald-800 flex items-center justify-center font-extrabold text-lg">
              RP
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">{farmerProfile.fullName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                UIDAI Aadhaar Verified
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Beneficiary ID</label>
              <p className="font-mono font-bold text-slate-800">{farmerProfile.id}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Masked Aadhaar UID</label>
              <p className="font-mono font-semibold text-slate-800">{farmerProfile.aadhaarMasked}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Mobile Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded border-slate-300 font-mono text-xs"
                />
              ) : (
                <p className="font-mono text-slate-800">{farmerProfile.phone}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Father's Name</label>
              <p className="text-slate-800">{farmerProfile.fatherName}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Farmer Category</label>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                {farmerProfile.casteCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Land Parcels & Revenue Jurisdiction */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">Registered Land & Village</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Total Land Holdings</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={formData.landHoldingsTotalAcres}
                  onChange={(e) => setFormData({ ...formData, landHoldingsTotalAcres: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded border-slate-300 font-mono text-xs"
                />
              ) : (
                <p className="text-base font-extrabold text-emerald-700">
                  {farmerProfile.landHoldingsTotalAcres} Acres (2.18 Hectares)
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Village & Tehsil</label>
              <p className="font-semibold text-slate-800">
                {farmerProfile.address.village}, Tehsil: {farmerProfile.address.tehsil}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">District & State</label>
              <p className="font-semibold text-slate-800">
                {farmerProfile.address.district}, {farmerProfile.address.state} - {farmerProfile.address.pincode}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-700">Revenue Cadastral Check:</span>
              <p className="text-slate-500">
                Digitally cross-matched with Haryana Land Records (JAMABANDI) portal. Khasra 882 & 712 authenticated.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Bank Details & DBT */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">Direct Benefit Transfer (DBT)</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Designated Bank</label>
              <p className="font-bold text-slate-800">{farmerProfile.bankAccount.bankName}</p>
              <p className="text-slate-500">{farmerProfile.bankAccount.branch}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">Account Number</label>
              <p className="font-mono font-bold text-slate-800">{farmerProfile.bankAccount.accountNumber}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400">IFSC Code</label>
              <p className="font-mono text-slate-800">{farmerProfile.bankAccount.ifsc}</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>NPCI Aadhaar Mapping Active:</strong> All PMFBY claim settlements will automatically disburse into this account via PFMS DBT gateway.
              </span>
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

