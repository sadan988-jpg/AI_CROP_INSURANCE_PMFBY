import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Bug, AlertTriangle, Pill, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

export const AiPestDetection = () => {
  const { aiAssessments, cropImages } = useApp();

  const pestAssessments = aiAssessments.filter((a) => a.diagnosisType === 'PEST');
  const activeAssessment = pestAssessments[0] || aiAssessments[0];
  const associatedImage = cropImages.find((img) => img.assessmentId === activeAssessment?.id) || cropImages[2] || cropImages[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            AI-Based Insect & Pest Infestation Detection
          </h1>
          <p className="text-xs text-slate-500">
            Automated entomological pest identification (Bollworm, Whitefly, Stem Borer, Aphids)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/farmer/treatment-recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Pill className="w-4 h-4" />
            Biological & IPM Control
          </Link>
        </div>
      </div>

      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Pest Infestation Analysis: {activeAssessment.cropName}
                  </span>
                </div>
                <StatusBadge status={activeAssessment.riskCategory} size="sm" />
              </div>

              <AiDetectionOverlay
                imageUrl={associatedImage?.imageUrl || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80'}
                cropName={activeAssessment.cropName}
                diagnosisType={activeAssessment.diagnosisType}
                primaryIssue={activeAssessment.primaryIssue}
                confidenceScore={activeAssessment.confidenceScore}
                severityPercentage={activeAssessment.severityPercentage}
                boundingBoxes={activeAssessment.boundingBoxes}
                pixelSegmentation={activeAssessment.pixelSegmentation}
                height="h-96"
              />

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Pest Damage Biomarkers
                </h3>
                <div className="space-y-2">
                  {activeAssessment.symptoms?.map((symptom, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                Entomology Diagnostic Report
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">Identified Pest Specie</span>
                  <p className="font-extrabold text-base text-amber-700 mt-0.5">
                    {activeAssessment.primaryIssue}
                  </p>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">YOLOv8 Detection Confidence:</span>
                  <span className="font-mono font-bold text-emerald-700">{activeAssessment.confidenceScore}%</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Defoliation / Square Damage:</span>
                  <span className="font-mono font-bold text-amber-600">{activeAssessment.severityPercentage}%</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Economic Threshold Level (ETL):</span>
                  <span className="font-bold text-rose-600">BREACHED (Action Needed)</span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>IPM Control Recommendation</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {activeAssessment.recommendation}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/farmer/treatment-recommendations"
                  className="w-full text-center block py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  View Bio-Pesticide Prescriptions
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No pest assessments found.
        </div>
      )}
    </div>
  );
};

