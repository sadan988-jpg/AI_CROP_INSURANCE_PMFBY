import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BrainCircuit,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileCheck2,
} from 'lucide-react';

export const AiAssessmentReports = () => {
  const { aiAssessments, cropImages } = useApp();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(aiAssessments[0]?.id || '');

  const activeAssessment = aiAssessments.find((a) => a.id === selectedAssessmentId) || aiAssessments[0];
  const associatedImage = cropImages.find((img) => img.assessmentId === activeAssessment?.id) || cropImages[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            AI Computer Vision Model Assessment Dossiers
          </h1>
          <p className="text-xs text-slate-500">
            Real-time inference logs generated via YOLOv8 object detection and OpenCV necrosis segmentation
          </p>
        </div>
      </div>

      {/* Assessment Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {aiAssessments.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelectedAssessmentId(a.id)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 flex items-center gap-2 ${
              activeAssessment?.id === a.id
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-emerald-600" />
            <span className="font-mono">{a.id}</span>
            <span className="text-slate-700">({a.cropName})</span>
            <StatusBadge status={a.riskCategory} size="sm" />
          </button>
        ))}
      </div>

      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Model Visualization Canvas */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Model Inference: {activeAssessment.cropName} ({activeAssessment.primaryIssue})
                  </span>
                </div>
                <StatusBadge status={activeAssessment.riskCategory} size="sm" />
              </div>

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

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700">
                  Detected Morphological Biomarkers & Symptoms
                </h4>
                <div className="space-y-1.5">
                  {activeAssessment.symptoms?.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Machine Learning Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                Model Evaluation Metrics
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Inference Architecture:</span>
                  <span className="font-mono font-bold text-slate-800">YOLOv8x + ResNet-50</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Detection Confidence:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {activeAssessment.confidenceScore}%
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Pixel Necrosis Severity:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {activeAssessment.severityPercentage}%
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Diagnosis Type:</span>
                  <span className="font-semibold text-slate-800">{activeAssessment.diagnosisType}</span>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <span className="font-bold block">Officer Action Advisory:</span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {activeAssessment.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
          No reports available.
        </div>
      )}
    </div>
  );
};

