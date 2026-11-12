import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  CloudLightning,
  ShieldAlert,
  Layers,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const CropDamageAssessment = () => {
  const navigate = useNavigate();
  const { aiAssessments, cropImages, policies } = useApp();

  const damageAssessments = aiAssessments.filter((a) => a.diagnosisType === 'DAMAGE');
  const activeAssessment = damageAssessments[0] || aiAssessments[1] || aiAssessments[0];
  const associatedImage = cropImages.find((img) => img.assessmentId === activeAssessment?.id) || cropImages[1] || cropImages[0];

  const pieData = [
    { name: 'Damaged / Lodged Foliage', value: activeAssessment?.pixelSegmentation?.necroticDamagedPct || 68, color: '#dc2626' },
    { name: 'Healthy Chlorophyll Area', value: activeAssessment?.pixelSegmentation?.healthyGreenPct || 32, color: '#16a34a' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Crop Damage & Loss Severity Estimation
          </h1>
          <p className="text-xs text-slate-500">
            OpenCV pixel-level necrosis segmentation & hailstorm lodging quantification for PMFBY claims
          </p>
        </div>
        <div>
          <Link
            to="/farmer/submit-claim"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md"
          >
            <FileCheck2 className="w-4 h-4" />
            File Claim Using This Assessment
          </Link>
        </div>
      </div>

      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Overlay canvas & OpenCV segmented breakdown */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CloudLightning className="w-5 h-5 text-rose-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Calamity Assessment: {activeAssessment.cropName}
                  </span>
                </div>
                <StatusBadge status={activeAssessment.riskCategory} size="sm" />
              </div>

              {/* AI Detection Overlay */}
              <AiDetectionOverlay
                imageUrl={associatedImage?.imageUrl || 'https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?auto=format&fit=crop&w=1200&q=80'}
                cropName={activeAssessment.cropName}
                diagnosisType={activeAssessment.diagnosisType}
                primaryIssue={activeAssessment.primaryIssue}
                confidenceScore={activeAssessment.confidenceScore}
                severityPercentage={activeAssessment.severityPercentage}
                boundingBoxes={activeAssessment.boundingBoxes}
                pixelSegmentation={activeAssessment.pixelSegmentation}
                height="h-96"
              />

              {/* OpenCV Pixel-Mask Visual Distribution */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                <div className="h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="sm:col-span-2 space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    OpenCV Color-Space Mask Quantification
                  </span>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="flex items-center gap-2 text-rose-700 font-semibold">
                      <span className="w-3 h-3 rounded bg-rose-600" />
                      Damaged / Necrotic Leaf Tissue:
                    </span>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      {activeAssessment.severityPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <span className="w-3 h-3 rounded bg-emerald-600" />
                      Viable Chlorophyll Canopy:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {activeAssessment.pixelSegmentation?.healthyGreenPct || 32}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: PMFBY Compensation Potential */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                PMFBY Claim Valuation
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">Cause of Loss</span>
                  <p className="font-extrabold text-base text-rose-700 mt-0.5">
                    {activeAssessment.primaryIssue}
                  </p>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Calculated Yield Loss:</span>
                  <span className="font-mono font-bold text-rose-600 text-base">
                    {activeAssessment.severityPercentage}%
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Affected Area:</span>
                  <span className="font-semibold text-slate-800">{activeAssessment.affectedAreaRatio}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">PMFBY Coverage Provision:</span>
                  <span className="font-semibold text-slate-800">Localized Calamity (Hailstorm)</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold">Estimated Eligible Indemnity:</span>
                  <p className="font-mono text-xl font-extrabold text-rose-700">
                    ₹1,19,680
                  </p>
                  <p className="text-[10px] text-rose-700/80">
                    (Calculated as 68.0% of ₹1,76,000 Sum Insured under Policy POL-PMFBY-8812)
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/farmer/submit-claim"
                  className="w-full text-center block py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition shadow-md"
                >
                  Proceed to Claim Submission →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No crop damage assessments recorded yet.
        </div>
      )}
    </div>
  );
};

