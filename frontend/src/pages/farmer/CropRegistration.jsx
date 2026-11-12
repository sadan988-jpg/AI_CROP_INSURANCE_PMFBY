import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sprout, MapPin, Compass, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GpsMapPlaceholder } from '../../components/common/GpsMapPlaceholder';

export const CropRegistration = () => {
  const navigate = useNavigate();
  const { addCrop } = useApp();
  const [formData, setFormData] = useState({
    cropName: 'Paddy (Basmati PB-1121)',
    season: 'Kharif 2026',
    sowingDate: '2026-06-25',
    harvestExpectedDate: '2026-10-28',
    areaAcres: '2.5',
    surveyNumber: '142/4C',
    khasraNumber: 'KH-882-905',
    soilType: 'Alluvial Clay Loam',
    irrigationType: 'Tube-well & Canal',
    gpsCoords: { lat: 29.6857, lng: 76.9905 },
  });
  const [geoLocating, setGeoLocating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGetLocation = () => {
    setGeoLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            gpsCoords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setGeoLocating(false);
        },
        (error) => {
          // Fallback to simulated high precision plot coordinate
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              gpsCoords: { lat: 29.6872, lng: 76.9918 },
            }));
            setGeoLocating(false);
          }, 600);
        }
      );
    } else {
      setGeoLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCrop(formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/farmer/registered-crops');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">PMFBY Crop Sowing Registration</h1>
          <p className="text-xs text-slate-500">
            Enroll standing crops for seasonal coverage under Pradhan Mantri Fasal Bima Yojana
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          Crop registered successfully! A PMFBY insurance policy proposal has been auto-generated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form fields */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Crop & Cultivation Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type & Variety</label>
              <select
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
              >
                <option value="Paddy (Basmati PB-1121)">Paddy (Basmati PB-1121)</option>
                <option value="Cotton (Bt Cotton Bollgard II)">Cotton (Bt Cotton Bollgard II)</option>
                <option value="Soybean (JS-335)">Soybean (JS-335)</option>
                <option value="Wheat (HD-2967)">Wheat (HD-2967)</option>
                <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
                <option value="Maize (HQPM-1)">Maize (HQPM-1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cropping Season</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
              >
                <option value="Kharif 2026">Kharif 2026 (Monsoon Sown)</option>
                <option value="Rabi 2026-27">Rabi 2026-27 (Winter Sown)</option>
                <option value="Zaid 2026">Zaid 2026 (Summer Crops)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Actual Sowing Date</label>
              <input
                type="date"
                required
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvesting Date</label>
              <input
                type="date"
                required
                value={formData.harvestExpectedDate}
                onChange={(e) => setFormData({ ...formData, harvestExpectedDate: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cultivated Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.areaAcres}
                onChange={(e) => setFormData({ ...formData, areaAcres: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cadastral Survey Number</label>
              <input
                type="text"
                required
                value={formData.surveyNumber}
                onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                placeholder="e.g. 142/4C"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Revenue Khasra Number</label>
              <input
                type="text"
                required
                value={formData.khasraNumber}
                onChange={(e) => setFormData({ ...formData, khasraNumber: e.target.value })}
                placeholder="e.g. KH-882-905"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation Source</label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
              >
                <option value="Tube-well & Canal">Tube-well & Canal</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler System">Sprinkler System</option>
                <option value="Rainfed (Non-irrigated)">Rainfed (Non-irrigated)</option>
              </select>
            </div>
          </div>

          {/* GPS Coordinates Capture */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                Land Plot Geo-Tag Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLocating}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                {geoLocating ? 'Reading GPS Telemetry...' : 'Fetch Live GPS Location'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-500">Latitude</label>
                <input
                  type="text"
                  readOnly
                  value={formData.gpsCoords.lat}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500">Longitude</label>
                <input
                  type="text"
                  readOnly
                  value={formData.gpsCoords.lng}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              Register Crop Sowing & Generate Policy
            </button>
          </div>
        </div>

        {/* Right Col: Interactive Cadastral Map Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Live Cadastral Mapping Preview
            </h3>
            <GpsMapPlaceholder
              lat={formData.gpsCoords.lat}
              lng={formData.gpsCoords.lng}
              surveyNo={formData.surveyNumber}
              khasraNo={formData.khasraNumber}
              areaAcres={formData.areaAcres}
              cropName={formData.cropName}
              height="h-64"
            />
            <p className="text-[11px] text-slate-500">
              Your plot will be cross-checked with the state remote sensing agency (HARSAC) satellite pass for yield verification.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

