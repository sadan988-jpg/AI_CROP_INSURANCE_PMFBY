import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GpsMapPlaceholder } from '../../components/common/GpsMapPlaceholder';
import {
  Sprout,
  Camera,
  FileCheck2,
  MapPin,
  Calendar,
  Layers,
  Search,
  Plus,
} from 'lucide-react';

export const MyRegisteredCrops = () => {
  const { crops } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(crops[0] || null);

  const filteredCrops = crops.filter(c =>
    c.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.khasraNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">My Registered Standing Crops</h1>
          <p className="text-xs text-slate-500">
            Active crop sowings, cadastral mapping, and PMFBY insurance coverage status
          </p>
        </div>
        <Link
          to="/farmer/crop-registration"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Crop
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop name, survey no, khasra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredCrops.length} of {crops.length} Parcels
        </span>
      </div>

      {/* Main Grid: Crop Cards + Selected Plot Map Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cards list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredCrops.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400">
              No registered crops match your search query.
            </div>
          ) : (
            filteredCrops.map((crop) => {
              const isSelected = selectedCrop?.id === crop.id;
              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`p-5 rounded-xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sprout className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">{crop.cropName}</h3>
                          <StatusBadge status={crop.healthStatus} size="sm" />
                          <StatusBadge status={crop.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Survey #{crop.surveyNumber} • Khasra: {crop.khasraNumber} • Area: {crop.areaAcres} Acres
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        to="/farmer/image-upload"
                        className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload
                      </Link>
                      <Link
                        to="/farmer/submit-claim"
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Claim
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Sowing Date</span>
                      <span className="font-medium text-slate-700">{crop.sowingDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Harvest Expected</span>
                      <span className="font-medium text-slate-700">{crop.harvestExpectedDate || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Season</span>
                      <span className="font-medium text-slate-700">{crop.season}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Policy ID</span>
                      <span className="font-mono text-emerald-700 font-bold">{crop.policyId}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Col: Cadastral Map & Parcel Details */}
        <div className="space-y-4">
          {selectedCrop ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Cadastral Plot Telemetry
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {selectedCrop.id}
                </span>
              </div>

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
                  <span className="text-slate-500">Soil Classification:</span>
                  <span className="font-semibold text-slate-800">{selectedCrop.soilType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Irrigation Setup:</span>
                  <span className="font-semibold text-slate-800">{selectedCrop.irrigationType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">PMFBY Coverage:</span>
                  <span className="font-semibold text-emerald-700">100% Subsidized Premium</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Link
                  to="/farmer/image-upload"
                  className="flex-1 text-center py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Capture Field Photo
                </Link>
                <Link
                  to="/farmer/policy-details"
                  className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  View Policy
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border text-center text-xs text-slate-400">
              Select a crop parcel to inspect cadastral map
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

