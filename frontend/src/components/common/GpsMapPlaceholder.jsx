import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

export const GpsMapPlaceholder = ({
  lat = 29.6857,
  lng = 76.9905,
  surveyNo = "142/2A",
  khasraNo = "KH-882-901",
  areaAcres = 3.2,
  cropName = "Paddy (Basmati)",
  pinLat,
  pinLng,
  isValidGeoFence = true,
  distanceMeters = 14.2,
  height = "h-72",
}) => {
  const [viewMode, setViewMode] = useState('satellite'); // 'satellite' | 'cadastral'

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden border border-slate-200 shadow-inner group bg-slate-900`}>
      {/* Background Graphic representing GIS Satellite or Cadastral field */}
      {viewMode === 'satellite' ? (
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')`,
          }}
        >
          {/* Subtle grid lines simulating satellite survey grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-emerald-950 p-4">
          <div className="w-full h-full border-2 border-emerald-400/40 rounded-lg relative bg-emerald-900/40 p-4 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-emerald-300">CADASTRAL REVENUE PLOT #{surveyNo}</span>
            <div className="text-center font-mono text-emerald-200 text-xs">
              KHASRA PARCEL: {khasraNo} ({areaAcres} ACRES)
            </div>
            <span className="text-[10px] font-mono text-emerald-400 text-right">DATUM: WGS-84 / UTM-43N</span>
          </div>
        </div>
      )}

      {/* Cadastral Polygon Overlay */}
      <div className="absolute inset-8 border-2 border-dashed border-emerald-400 bg-emerald-500/20 rounded-lg flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
        <div className="bg-slate-900/80 text-emerald-300 text-xs px-2.5 py-1 rounded shadow backdrop-blur font-mono border border-emerald-500/40">
          Parcel Boundary: {surveyNo} ({areaAcres} Acres)
        </div>
      </div>

      {/* Primary Registered Land Center Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-2 bg-emerald-500/40 rounded-full animate-ping" />
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <span className="mt-1 bg-white/95 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded shadow">
          {cropName}
        </span>
      </div>

      {/* If secondary captured image coordinates are provided */}
      {pinLat && pinLng && (
        <div className="absolute top-1/3 left-1/3 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <span className="mt-1 bg-blue-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow">
            Photo EXIF ({distanceMeters}m offset)
          </span>
        </div>
      )}

      {/* Top Left GIS Telemetry Pill */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <div className="bg-slate-900/85 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 font-mono shadow">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>{Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E</span>
        </div>
        
        {isValidGeoFence ? (
          <div className="bg-emerald-900/90 backdrop-blur text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-600/50 flex items-center gap-1 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Geo-Fence Match (Within 50m)</span>
          </div>
        ) : (
          <div className="bg-rose-900/90 backdrop-blur text-rose-200 text-xs px-2.5 py-1.5 rounded-lg border border-rose-600/50 flex items-center gap-1 shadow">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Geo-Fence Mismatch: Outside Plot</span>
          </div>
        )}
      </div>

      {/* Top Right Map Layers Control */}
      <div className="absolute top-3 right-3 flex bg-slate-900/80 rounded-lg p-0.5 border border-slate-700 backdrop-blur">
        <button
          type="button"
          onClick={() => setViewMode('satellite')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            viewMode === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setViewMode('cadastral')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            viewMode === 'cadastral' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Cadastral
        </button>
      </div>

      {/* Bottom telemetry footer */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/85 px-3 py-1.5 rounded-md backdrop-blur border border-slate-800 font-mono">
        <span>Survey: {surveyNo} | Khasra: {khasraNo}</span>
        <span className="text-emerald-400 font-semibold">NIC-BharatMaps API Sync</span>
      </div>
    </div>
  );
};

