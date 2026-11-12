import React, { useState } from 'react';
import { Eye, ShieldAlert, Cpu, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const AiDetectionOverlay = ({
  imageUrl,
  cropName = "Paddy (Basmati)",
  diagnosisType = "DISEASE",
  primaryIssue = "Bacterial Leaf Blight",
  confidenceScore = 94.6,
  severityPercentage = 42.5,
  boundingBoxes = [],
  pixelSegmentation = { healthyGreenPct: 57.5, necroticDamagedPct: 42.5 },
  height = "h-80",
}) => {
  const [activeLayer, setActiveLayer] = useState('boxes'); // 'boxes' | 'heatmap' | 'raw'

  return (
    <div className="space-y-3">
      {/* Visual Canvas Container */}
      <div className={`relative w-full ${height} rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-md group select-none`}>
        {/* Base Image */}
        <img
          src={imageUrl}
          alt={cropName}
          className="w-full h-full object-cover"
        />

        {/* OpenCV Necrosis / Chlorosis Segmentation Heatmap Overlay */}
        {activeLayer === 'heatmap' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/40 via-amber-500/30 to-emerald-600/20 mix-blend-color-burn backdrop-blur-[0.5px]">
            {/* Simulated spot masks of leaf necrosis */}
            <div className="absolute top-[25%] left-[20%] w-36 h-48 bg-rose-500/50 rounded-full blur-md" />
            <div className="absolute top-[35%] right-[25%] w-28 h-40 bg-amber-500/50 rounded-full blur-sm" />
            
            <div className="absolute bottom-4 left-4 bg-slate-950/90 text-white p-2.5 rounded-lg border border-slate-700 text-xs backdrop-blur font-mono space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                Necrotic / Damaged Foliage: {pixelSegmentation.necroticDamagedPct}%
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                Healthy Chlorophyll Area: {pixelSegmentation.healthyGreenPct}%
              </div>
            </div>
          </div>
        )}

        {/* YOLOv8 Bounding Boxes Overlay */}
        {activeLayer === 'boxes' && boundingBoxes && boundingBoxes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {boundingBoxes.map((box, index) => (
              <div
                key={index}
                style={{
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
                className="absolute border-2 border-rose-500 bg-rose-500/15 rounded transition-all duration-300 shadow-sm"
              >
                {/* Bounding box label badge */}
                <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1 font-mono">
                  <span>{box.label}</span>
                  <span className="bg-rose-950/80 text-rose-200 px-1 rounded text-[9px]">
                    {(box.conf * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 bg-slate-900/90 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur border border-slate-700 font-mono shadow">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              YOLOv8 + OpenCV Engine
            </span>
            <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
              {confidenceScore}% Conf
            </span>
          </div>

          {/* Layer switcher */}
          <div className="pointer-events-auto bg-slate-900/85 backdrop-blur p-0.5 rounded-lg border border-slate-700 flex text-xs">
            <button
              type="button"
              onClick={() => setActiveLayer('boxes')}
              className={`px-2 py-1 rounded font-medium transition ${
                activeLayer === 'boxes' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              YOLO Boxes
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('heatmap')}
              className={`px-2 py-1 rounded font-medium transition ${
                activeLayer === 'heatmap' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Pixel Mask
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('raw')}
              className={`px-2 py-1 rounded font-medium transition ${
                activeLayer === 'raw' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Raw View
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Pill below canvas */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span className="font-semibold text-slate-800">{primaryIssue}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">Type: <strong className="text-slate-800">{diagnosisType}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600">
            Calculated Damage Severity: <strong className="text-rose-600 font-bold">{severityPercentage}%</strong>
          </span>
          <span className="text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI Verified
          </span>
        </div>
      </div>
    </div>
  );
};

