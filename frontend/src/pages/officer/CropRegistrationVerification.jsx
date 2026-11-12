import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GpsMapPlaceholder } from '../../components/common/GpsMapPlaceholder';
import {
  CheckSquare,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

export const CropRegistrationVerification = () => {
  const { crops, setCrops } = useApp();
  const [selectedCrop, setSelectedCrop] = useState(crops[0] || null);
  const [actionMsg, setActionMsg] = useState('');

  const handleVerify = (cropId, status) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === cropId ? { ...c, status } : c))
    );
    setActionMsg(`Crop ${cropId} marked as ${status}!`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Crop Sowing & Cadastral Verification Desk
          </h1>
          <p className="text-xs text-slate-500">
            Validate farmer self-declared sowing acreage against GIS survey numbers and state Jamabandi records
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          {actionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Crop Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              Crop Parcels Submitted for Scrutiny ({crops.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Crop & Variety</th>
                  <th className="px-4 py-3">Cadastral Survey / Khasra</th>
                  <th className="px-4 py-3">Area (Acres)</th>
                  <th className="px-4 py-3">Sowing Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crops.map((crop) => (
                  <tr
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className={`cursor-pointer transition ${
                      selectedCrop?.id === crop.id ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{crop.cropName}</p>
                      <span className="text-[10px] font-mono text-slate-400">{crop.id} • {crop.season}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700">
                      Survey #{crop.surveyNumber} • {crop.khasraNumber}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{crop.areaAcres} Ac</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{crop.sowingDate}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={crop.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleVerify(crop.id, 'INSURED')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        title="Approve Sowing"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(crop.id, 'UNDER_SCRUTINY')}
                        className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px]"
                        title="Flag For CCE"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Cadastral Map Inspection */}
        <div className="space-y-4">
          {selectedCrop ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Cadastral Plot Ground-Truth</span>
                <span className="font-mono text-emerald-700">{selectedCrop.id}</span>
              </h3>

              <GpsMapPlaceholder
                lat={selectedCrop.gpsCoords?.lat || 29.6857}
                lng={selectedCrop.gpsCoords?.lng || 76.9905}
                surveyNo={selectedCrop.surveyNumber}
                khasraNo={selectedCrop.khasraNumber}
                areaAcres={selectedCrop.areaAcres}
                cropName={selectedCrop.cropName}
                height="h-56"
              />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Declared Area:</span>
                  <span className="font-bold text-slate-800">{selectedCrop.areaAcres} Acres</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Revenue Portal Match:</span>
                  <span className="font-bold text-emerald-700">100% Geometry Matched</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Soil & Irrigation:</span>
                  <span className="text-slate-700">{selectedCrop.soilType} ({selectedCrop.irrigationType})</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify(selectedCrop.id, 'INSURED')}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Verify & Issue Coverage
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(selectedCrop.id, 'REJECTED')}
                  className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border text-center text-xs text-slate-400">
              Select a crop parcel from the left table to inspect GIS boundary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

