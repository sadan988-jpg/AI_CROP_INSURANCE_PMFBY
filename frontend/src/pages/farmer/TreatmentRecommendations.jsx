import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  Leaf,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
} from 'lucide-react';

export const TreatmentRecommendations = () => {
  const navigate = useNavigate();
  const { treatments, addTreatmentRecord, crops } = useApp();
  const [selectedCropId, setSelectedCropId] = useState(crops[0]?.id || 'CRP-01');
  const [loggedMsg, setLoggedMsg] = useState('');

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  const handleApplyLog = (treatment, mode) => {
    addTreatmentRecord({
      cropId: currentCrop.id,
      cropName: currentCrop.cropName,
      issueTreated: treatment.issueName,
      treatmentApplied: mode === 'organic' ? treatment.organicTreatment.product : treatment.chemicalTreatment.product,
      dosageUsed: mode === 'organic' ? treatment.organicTreatment.dosage : treatment.chemicalTreatment.dosage,
      notes: `Applied to parcel survey #${currentCrop.surveyNumber}.`,
    });
    setLoggedMsg(`Logged ${mode === 'organic' ? 'Organic' : 'Chemical'} treatment to your treatment history!`);
    setTimeout(() => setLoggedMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Pesticide & Organic Treatment Prescriptions
          </h1>
          <p className="text-xs text-slate-500">
            ICAR & PMFBY compliant integrated pest & disease management (IPM) guidelines
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate('/farmer/treatment-history')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            <History className="w-4 h-4 text-emerald-700" />
            View Past Applied Logs
          </button>
        </div>
      </div>

      {loggedMsg && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          {loggedMsg}
        </div>
      )}

      {/* Select Crop */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Prescriptions For Crop:</label>
        <select
          value={selectedCropId}
          onChange={(e) => setSelectedCropId(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
        >
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cropName} (Survey #{c.surveyNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Treatments List */}
      <div className="space-y-6">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 font-mono">
                  CLINICAL DIAGNOSIS
                </span>
                <h2 className="text-lg font-bold">{treatment.issueName}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">Category: {treatment.type}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chemical Treatment Box */}
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-900">
                    <FlaskConical className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-sm">Recommended Chemical Formulation</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Approved Active Ingredient:</span>
                      <p className="font-bold text-slate-900">{treatment.chemicalTreatment.product}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Dosage & Dilution Ratio:</span>
                      <p className="font-mono text-blue-900 font-semibold">{treatment.chemicalTreatment.dosage}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Method of Application:</span>
                      <p className="text-slate-700">{treatment.chemicalTreatment.applicationMethod}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Safety Waiting Period (Pre-Harvest):</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold font-mono">
                        {treatment.chemicalTreatment.safetyPeriodWaiting}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyLog(treatment, 'chemical')}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Chemical Application
                </button>
              </div>

              {/* Organic & Biological Treatment Box */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm">Eco-Friendly & Organic Remedy</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Bio-Control Formulations:</span>
                      <p className="font-bold text-slate-900">{treatment.organicTreatment.product}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Application Ratio:</span>
                      <p className="font-mono text-emerald-900 font-semibold">{treatment.organicTreatment.dosage}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Ecological Advantage:</span>
                      <p className="text-slate-700 leading-relaxed">{treatment.organicTreatment.benefits}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyLog(treatment, 'organic')}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Organic Application
                </button>
              </div>
            </div>

            {/* Preventive Agro-Guidelines */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Preventive Agronomic Measures
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                {treatment.preventiveGuidelines.map((guideline, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

