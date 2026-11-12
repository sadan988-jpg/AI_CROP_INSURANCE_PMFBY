import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const SubmitClaim = () => {
  const navigate = useNavigate();
  const { crops, policies, cropImages, aiAssessments, submitClaim, farmerProfile } = useApp();

  const [selectedCropId, setSelectedCropId] = useState(crops[0]?.id || '');
  const [incidentDate, setIncidentDate] = useState('2026-08-14');
  const [causeOfLoss, setCauseOfLoss] = useState('HAILSTORM_AND_INUNDATION');
  const [lossPercentage, setLossPercentage] = useState(68);
  const [remarks, setRemarks] = useState(
    'Torrential downpour with high-speed hailstones resulted in 68% lodging of standing Basmati crop. Submerged panicles are rotting.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0];
  const policy = policies.find((p) => p.cropId === selectedCrop?.id) || policies[0];

  const estimatedClaimAmount = Math.round(((policy?.sumInsured || 150000) * lossPercentage) / 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const newClaim = submitClaim({
        policyId: policy.id,
        cropId: selectedCrop.id,
        cropName: selectedCrop.cropName,
        khasraNo: selectedCrop.khasraNumber,
        incidentDate,
        causeOfLoss,
        causeLabel:
          causeOfLoss === 'HAILSTORM_AND_INUNDATION'
            ? 'Severe Localized Hailstorm & Torrential Inundation'
            : causeOfLoss === 'PEST_ATTACK'
            ? 'Bacterial Blight & Pest Defoliation'
            : 'Unseasonal Monsoon Flooding',
        claimedAmount: estimatedClaimAmount,
        aiAssessedLossPct: parseFloat(lossPercentage),
        officerNotes: remarks,
        imageEvidence: cropImages.slice(0, 2).map((img) => ({
          id: img.id,
          url: img.imageUrl,
          label: img.category || 'Field Loss Evidence',
          gps: `${img.gps.lat.toFixed(4)}° N, ${img.gps.lng.toFixed(4)}° E`,
        })),
      });

      setSubmitting(false);
      setSubmittedTicket(newClaim.id);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Submit PMFBY Crop Loss Insurance Claim
          </h1>
          <p className="text-xs text-slate-500">
            Intimate localized calamity damage within 72 hours with AI telemetry backing
          </p>
        </div>
      </div>

      {submittedTicket ? (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-200 p-8 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Claim Intimation Registered!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your crop insurance claim has been routed to the District Scrutiny Officer and AICIL underwriter.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Claim Docket Number:</span>
              <strong className="text-emerald-700 font-bold">{submittedTicket}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Crop Parcel:</span>
              <span className="text-slate-800">{selectedCrop?.cropName} (Survey #{selectedCrop?.surveyNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Claimed Loss Amount:</span>
              <span className="font-bold text-slate-900">₹{estimatedClaimAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AI Damage Assessment:</span>
              <span className="font-bold text-rose-600">{lossPercentage}% Verified</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/farmer/track-claim')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              Track Live Claim Timeline
            </button>
            <button
              type="button"
              onClick={() => navigate('/farmer/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form fields */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              1. Calamity & Crop Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Standing Crop Parcel</label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cropName} (Survey #{c.surveyNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Calamity Incident</label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nature & Cause of Loss</label>
                <select
                  value={causeOfLoss}
                  onChange={(e) => setCauseOfLoss(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                >
                  <option value="HAILSTORM_AND_INUNDATION">Hailstorm & Heavy Inundation (Torrential Rain)</option>
                  <option value="UNSEASONAL_RAIN">Unseasonal Rain & Crop Lodging</option>
                  <option value="PEST_ATTACK">Widespread Pest / Epidemic Attack</option>
                  <option value="DROUGHT_WILTING">Terminal Drought & Dry Spell Stress</option>
                  <option value="NATURAL_FIRE">Natural Fire / Lightning Strike</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  AI Assessed Damage Severity: <strong className="text-rose-600">{lossPercentage}%</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={lossPercentage}
                  onChange={(e) => setLossPercentage(Number(e.target.value))}
                  className="w-full accent-rose-600 mt-2"
                />
              </div>
            </div>

            {/* Field Image Attachments Preview */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Attached Geotagged Field Photos ({cropImages.length} available)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cropImages.slice(0, 3).map((img, idx) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-300 h-24 group">
                    <img src={img.imageUrl} alt="Damage evidence" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-mono p-1 text-center">
                      <span>{img.gps.lat.toFixed(4)}°N, {img.gps.lng.toFixed(4)}°E</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmer Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Field Description & Remarks
              </label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                {submitting ? 'Authenticating Telemetry & Filing...' : 'Submit Claim Dossier to PMFBY'}
              </button>
            </div>
          </div>

          {/* Right Col: Live Claim Calculation */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                Claim Valuation Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Active PMFBY Policy:</span>
                  <span className="font-mono font-bold text-slate-800">{policy?.id}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Full Sum Insured:</span>
                  <span className="font-mono text-slate-800">₹{policy?.sumInsured?.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Loss Percentage:</span>
                  <span className="font-bold text-rose-600">{lossPercentage}%</span>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-900 block">Indemnity Payable:</span>
                  <p className="font-mono text-2xl font-extrabold text-rose-700">
                    ₹{estimatedClaimAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-rose-800">
                    Calculated under PMFBY Clause 14 (Localized Calamity Compensation)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">PFMS Direct Payout Account:</span>
                <p className="font-mono">{farmerProfile.bankAccount.bankName} - {farmerProfile.bankAccount.accountNumber}</p>
                <span className="text-emerald-700 font-semibold block">Aadhaar Payment Bridge Ready</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

