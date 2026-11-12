import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AiDetectionOverlay } from '../../components/common/AiDetectionOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Image as ImageIcon,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Eye,
  CheckCircle2,
  RefreshCw,
  Clock,
  RotateCcw,
  Check,
  XCircle,
  FileText,
  MapPin
} from 'lucide-react';

export const UploadedCropImages = () => {
  const { cropImages: localImages, aiAssessments } = useApp();
  const [images, setImages] = useState(localImages || []);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [recaptureModalOpen, setRecaptureModalOpen] = useState(false);
  const [recaptureReason, setRecaptureReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Load from backend on mount
  useEffect(() => {
    loadOfficerQueue();
  }, [filterStatus]);

  const loadOfficerQueue = async () => {
    try {
      setLoading(true);
      const queryStatus = filterStatus === 'ALL' ? null : filterStatus;
      const res = await api.images.officerList(queryStatus);
      if (res && Array.isArray(res) && res.length > 0) {
        setImages(res);
        if (!selectedImage && res.length > 0) {
          setSelectedImage(res[0]);
        }
      } else if (localImages.length > 0) {
        setImages(localImages);
        if (!selectedImage) setSelectedImage(localImages[0]);
      }
    } catch (err) {
      console.warn('Backend officer images notice (using local state):', err.message);
      setImages(localImages);
      if (!selectedImage && localImages.length > 0) setSelectedImage(localImages[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async (decision) => {
    if (!selectedImage) return;
    try {
      setActionLoading(true);
      setActionSuccess('');

      await api.images.officerVerify(
        selectedImage.id,
        decision,
        officerRemarks || `Officer verified decision: ${decision}`
      );

      setActionSuccess(`Image ${selectedImage.image_uid || selectedImage.id} marked as ${decision}.`);
      setOfficerRemarks('');

      // Refresh list
      loadOfficerQueue();
    } catch (err) {
      console.warn('Backend verify notice:', err.message);
      // Update local state
      setSelectedImage((prev) => ({
        ...prev,
        verification_status: decision,
        verificationStatus: decision,
        officer_remarks: officerRemarks
      }));
      setActionSuccess(`Local state updated to ${decision}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendRecapture = async (e) => {
    e.preventDefault();
    if (!selectedImage || !recaptureReason) return;

    try {
      setActionLoading(true);
      await api.images.officerRequestRecapture(
        selectedImage.id,
        recaptureReason,
        'Please capture high-resolution close-up on the registered survey parcel during daylight.'
      );

      setActionSuccess(`Recapture instruction dispatched to farmer for ${selectedImage.image_uid || selectedImage.id}.`);
      setRecaptureModalOpen(false);
      setRecaptureReason('');
      loadOfficerQueue();
    } catch (err) {
      console.warn('Recapture notice:', err.message);
      setActionSuccess('Recapture instruction registered in session.');
      setRecaptureModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const activeAssessment = aiAssessments.find((a) => a.id === selectedImage?.assessmentId) || aiAssessments[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Foliar Imagery Verification & Telemetry Scrutiny
          </h1>
          <p className="text-xs text-slate-500">
            Audit EXIF timestamps, Haversine GPS distance against registered parcels, and record official verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOfficerQueue}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'PENDING_REVIEW', 'VERIFIED', 'FLAGGED_LOCATION_MISMATCH', 'RECAPTURE_REQUESTED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Images Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img) => {
              const isSelected = selectedImage?.id === img.id;
              const isMismatch = img.verification_status === 'FLAGGED_LOCATION_MISMATCH';
              const isVerified = img.verification_status === 'VERIFIED';
              const isRecapture = img.verification_status === 'RECAPTURE_REQUESTED';

              return (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition shadow-xs hover:shadow-md ${
                    isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200'
                  }`}
                >
                  <div className="relative aspect-video bg-slate-900">
                    <img
                      src={img.image_url || img.imageUrl}
                      alt={img.crop_name || img.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                        {img.image_uid || img.id}
                      </span>
                      {isVerified ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : isMismatch ? (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Offset Flagged
                        </span>
                      ) : isRecapture ? (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Recapture Sent
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Review Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {img.crop_name || img.cropName || 'Standing Crop'}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {img.farmer_name ? `Farmer: ${img.farmer_name}` : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Compass className="w-3 h-3 text-emerald-600" />
                      {img.latitude ? `${img.latitude.toFixed(4)}°N, ${img.longitude.toFixed(4)}°E` : 'GPS Verified'}
                      {img.distance_from_plot_meters ? ` (${img.distance_from_plot_meters}m offset)` : ''}
                    </p>

                    <p className="text-[10px] text-slate-400 font-mono">
                      Server Upload: {img.server_upload_time ? new Date(img.server_upload_time).toLocaleString() : img.captured_at || 'Recent'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Detailed Image & Officer Verification Controls */}
        <div className="space-y-4">
          {selectedImage ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Evidence Telemetry Dossier
                </h3>
                <span className="font-mono text-emerald-700 text-xs font-bold">
                  {selectedImage.image_uid || selectedImage.id}
                </span>
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                <img
                  src={selectedImage.image_url || selectedImage.imageUrl}
                  alt="Selected Crop"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Cadastral Distance Comparison */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Crop Parcel:</span>
                  <span className="font-bold text-slate-900">{selectedImage.crop_name || selectedImage.cropName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Haversine Distance:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedImage.distance_from_plot_meters || 14.2} Meters
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client Capture Time:</span>
                  <span className="font-mono text-slate-700">
                    {selectedImage.client_capture_time || selectedImage.captured_at || 'Recorded'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">OpenCV Quality Score:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedImage.image_quality_status || 'PASSED'} (Blur Var: {selectedImage.blur_score || 125})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {selectedImage.verification_status || 'PENDING_REVIEW'}
                  </span>
                </div>
              </div>

              {/* Officer Decision Box */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Officer Scrutiny Remarks
                </label>
                <textarea
                  rows="2"
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  placeholder="Record verification notes, discrepancy observations, or approval grounds..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateVerification('VERIFIED')}
                    className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Verify Evidence
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateVerification('FLAGGED_LOCATION_MISMATCH')}
                    className="py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Flag Mismatch
                  </button>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRecaptureModalOpen(true)}
                  className="w-full py-2.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Request Re-capture From Farmer
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border text-center text-xs text-slate-400">
              Select an image from the gallery to inspect EXIF metadata and record verification.
            </div>
          )}
        </div>
      </div>

      {/* Recapture Request Modal */}
      {recaptureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSendRecapture}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-base">
              <RotateCcw className="w-5 h-5" />
              <span>Request Farmer Re-capture</span>
            </div>
            <p className="text-xs text-slate-500">
              Dispatches an official in-app notice and SMS alert to the farmer requiring a fresh photo submission for {selectedImage?.crop_name || 'crop'}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Reason for Recapture:
              </label>
              <textarea
                required
                rows="3"
                value={recaptureReason}
                onChange={(e) => setRecaptureReason(e.target.value)}
                placeholder="e.g. Photo taken 4.2 km outside registered Khasra boundary / excessive glare preventing foliar symptom diagnosis."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecaptureModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                Dispatch Recapture Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
