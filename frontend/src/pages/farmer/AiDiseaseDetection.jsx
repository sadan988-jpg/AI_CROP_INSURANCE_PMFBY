import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Activity,
  AlertTriangle,
  Pill,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';

export const AiDiseaseDetection = () => {
  const { aiAssessments, cropImages } = useApp();

  // Find assessments of type DISEASE
  const diseaseAssessments = aiAssessments.filter((a) => a.diagnosisType === 'DISEASE');
  const activeAssessment = diseaseAssessments[0] || aiAssessments[0];
  const associatedImage = cropImages.find((img) => img.assessmentId === activeAssessment?.id) || cropImages[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            AI-Based Crop Disease Detection
          </h1>
          <p className="text-xs text-slate-500">
            Real-time deep learning leaf pathology diagnosis using YOLOv8 & PyTorch Vision
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/farmer/treatment-recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Pill className="w-4 h-4" />
            Recommended Treatments
          </Link>
          <Link
            to="/farmer/submit-claim"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            Submit PMFBY Claim
          </Link>
        </div>
      </div>

      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Detection Canvas */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Live Model Inference: {activeAssessment.cropName}
                  </span>
                </div>
                <StatusBadge status={activeAssessment.riskCategory} size="sm" />
              </div>

              {/* AI Detection Overlay with Bounding Boxes & Heatmaps */}
              <AiDetectionOverlay
                imageUrl={associatedImage?.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80'}
                cropName={activeAssessment.cropName}
                diagnosisType={activeAssessment.diagnosisType}
                primaryIssue={activeAssessment.primaryIssue}
                confidenceScore={activeAssessment.confidenceScore}
                severityPercentage={activeAssessment.severityPercentage}
                boundingBoxes={activeAssessment.boundingBoxes}
                pixelSegmentation={activeAssessment.pixelSegmentation}
                height="h-96"
              />

              {/* Clinical Pathology Symptoms */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Detected Morphological Symptoms
                </h3>
                <div className="space-y-2">
                  {activeAssessment.symptoms?.map((symptom, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Diagnosis Metrics & Insurance Impact */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                Diagnostic Scorecard
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">Primary Pathogen</span>
                  <p className="font-extrabold text-base text-rose-700 mt-0.5">
                    {activeAssessment.primaryIssue}
                  </p>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Model Confidence:</span>
                  <span className="font-mono font-bold text-emerald-700">{activeAssessment.confidenceScore}%</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Leaf Necrosis Severity:</span>
                  <span className="font-mono font-bold text-rose-600">{activeAssessment.severityPercentage}%</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Affected Plot:</span>
                  <span className="font-semibold text-slate-800">{activeAssessment.affectedAreaRatio}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Risk Severity Level:</span>
                  <span className="font-bold text-rose-600">{activeAssessment.riskCategory}</span>
                </div>
              </div>

              {/* PMFBY Scheme Eligibility Alert */}
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>PMFBY Claim Recommendation</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {activeAssessment.recommendation}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/farmer/treatment-recommendations"
                  className="w-full text-center block py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  View Treatment Prescriptions
                </Link>
                <Link
                  to="/farmer/submit-claim"
                  className="w-full text-center block py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                >
                  Initiate Insurance Claim
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No disease assessments available yet. Upload a crop photo to trigger analysis.
        </div>
      )}
    </div>
  );
};

