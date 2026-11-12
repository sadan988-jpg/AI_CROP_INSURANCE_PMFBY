import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { GpsMapPlaceholder } from '../../components/common/GpsMapPlaceholder';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarClock,
  CloudRain,
  DollarSign,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const ClaimVerification = () => {
  const navigate = useNavigate();
  const { claims, updateClaimDecision, scheduleInspection, cropImages, aiAssessments } = useApp();

  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id || '');
  const [decisionNotes, setDecisionNotes] = useState(
    'AI multi-modal damage assessment (68.0%) corroborates localized IMD Doppler radar hailstorm report (+604% precipitation anomaly). Verified eligible under PMFBY Localized Calamity provisions.'
  );
  const [approvedAmount, setApprovedAmount] = useState(119680);
  const [actionSuccess, setActionSuccess] = useState('');

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];
  const assessment = aiAssessments[0];
  const image = cropImages[0];

  const handleApprove = () => {
    updateClaimDecision(activeClaim.id, 'APPROVED', approvedAmount, decisionNotes);
    setActionSuccess(`Claim ${activeClaim.id} approved for ₹${Number(approvedAmount).toLocaleString('en-IN')}! Payout scheduled via DBT PFMS.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleReject = () => {
    updateClaimDecision(activeClaim.id, 'REJECTED', 0, decisionNotes);
    setActionSuccess(`Claim ${activeClaim.id} rejected.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRequestCCE = () => {
    scheduleInspection({
      claimId: activeClaim.id,
      farmerName: activeClaim.farmerName,
      village: `${activeClaim.district} Block`,
      khasraNo: activeClaim.khasraNo,
      scheduledDate: '2026-08-20',
      purpose: `Physical CCE crop cutting spot check for ${activeClaim.id}`,
      priority: 'URGENT',
    });
    setActionSuccess(`Physical CCE surveyor visit scheduled for ${activeClaim.id}!`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Claim Scrutiny & Multi-Modal Verification Desk
          </h1>
          <p className="text-xs text-slate-500">
            Triangulate farmer claim, YOLOv8 vision analytics, cadastral geo-fence, and IMD radar telemetry
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          {actionSuccess}
        </div>
      )}

      {/* Claim Selection Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {claims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            onClick={() => {
              setSelectedClaimId(claim.id);
              setApprovedAmount(claim.aiRecommendedAmount || claim.claimedAmount);
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeClaim?.id === claim.id
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="font-mono">{claim.id}</span>
            <span className="text-slate-700 font-semibold">{claim.farmerName}</span>
            <StatusBadge status={claim.status} size="sm" />
          </button>
        ))}
      </div>

      {activeClaim ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: AI Evidence & Telemetry Triangulation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Claim Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-700">{activeClaim.id}</span>
                    <StatusBadge status={activeClaim.status} size="sm" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeClaim.cropName} • {activeClaim.farmerName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    District: {activeClaim.district}, {activeClaim.state} • Khasra: {activeClaim.khasraNo}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Claimed Loss</span>
                  <span className="text-xl font-mono font-extrabold text-slate-900">
                    ₹{activeClaim.claimedAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* AI Image Analysis Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    YOLOv8 + OpenCV Field Image Assessment
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    AI Loss: {activeClaim.aiAssessedLossPct}%
                  </span>
                </div>

                <AiDetectionOverlay
                  imageUrl={image?.imageUrl || 'https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?auto=format&fit=crop&w=1200&q=80'}
                  cropName={activeClaim.cropName}
                  diagnosisType="DAMAGE"
                  primaryIssue={activeClaim.causeLabel || activeClaim.causeOfLoss}
                  confidenceScore={94.6}
                  severityPercentage={activeClaim.aiAssessedLossPct}
                  boundingBoxes={assessment?.boundingBoxes || []}
                  pixelSegmentation={{ healthyGreenPct: 32.0, necroticDamagedPct: 68.0 }}
                  height="h-80"
                />
              </div>

              {/* IMD Weather Radar Verification Panel */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-900">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    Doppler Radar & Precipitation Telemetry Cross-Check
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-blue-950">
                  <div>
                    <span className="text-blue-700 block text-[10px] font-bold">Rainfall Recorded:</span>
                    <span className="font-mono font-bold text-sm">84.5 mm</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block text-[10px] font-bold">Precipitation Anomaly:</span>
                    <span className="font-mono font-bold text-sm">+604% (Excessive)</span>
                  </div>
                  <div>
                    <span className="text-blue-700 block text-[10px] font-bold">Hailstorm Confirmed:</span>
                    <span className="font-bold text-emerald-700">YES (Radar Verified)</span>
                  </div>
                </div>
              </div>

              {/* Cadastral Geo-Lock Map */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Cadastral Plot & Geo-Fence Validation
                </h3>
                <GpsMapPlaceholder
                  lat={29.6857}
                  lng={76.9905}
                  pinLat={29.6859}
                  pinLng={76.9908}
                  surveyNo="142/2A"
                  khasraNo={activeClaim.khasraNo}
                  areaAcres={3.2}
                  cropName={activeClaim.cropName}
                  isValidGeoFence={true}
                  distanceMeters={14.2}
                  height="h-56"
                />
              </div>
            </div>
          </div>

          {/* Right Col: Officer Action & Decision Console */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-20">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Official Scrutiny Decision Console
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Declared Loss:</span>
                  <span className="font-mono font-bold text-slate-900">₹{activeClaim.claimedAmount?.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">AI Model Assessment:</span>
                  <span className="font-mono font-bold text-rose-600">{activeClaim.aiAssessedLossPct}% Loss</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">AI Recommended Payout:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    ₹{activeClaim.aiRecommendedAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approved Indemnity Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full font-mono text-sm font-bold text-emerald-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-emerald-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Officer Decision Justification Notes
                  </label>
                  <textarea
                    rows="4"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Claim & Queue PFMS Payout
                </button>

                <button
                  type="button"
                  onClick={handleRequestCCE}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <CalendarClock className="w-4 h-4" />
                  Schedule Physical Field CCE Survey
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Claim with Justification
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No claims available for verification.
        </div>
      )}
    </div>
  );
};

