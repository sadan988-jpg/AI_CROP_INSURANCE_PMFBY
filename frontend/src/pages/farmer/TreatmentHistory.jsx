import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Calendar, CheckCircle2, Pill, ArrowLeft } from 'lucide-react';

export const TreatmentHistory = () => {
  const { treatmentHistory } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Foliar & Soil Treatment History
          </h1>
          <p className="text-xs text-slate-500">
            Historical log of applied chemical and biological interventions for PMFBY audit trails
          </p>
        </div>
        <div>
          <Link
            to="/farmer/treatment-recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Pill className="w-4 h-4" />
            New Treatment Recommendation
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Recorded Treatment Interventions ({treatmentHistory.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Audit-compliant record for PMFBY surveyors
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {treatmentHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No treatments have been logged yet.
            </div>
          ) : (
            treatmentHistory.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-400">{item.id}</span>
                    <h3 className="font-bold text-sm text-slate-900">{item.cropName}</h3>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Applied: {item.dateApplied}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Issue</span>
                    <span className="font-semibold text-rose-700">{item.issueTreated}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Formulation Applied</span>
                    <span className="font-medium text-slate-800">{item.treatmentApplied}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Dosage Rate</span>
                    <span className="font-mono text-slate-700">{item.dosageUsed}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-2">
                    <strong>Field Notes:</strong> {item.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

