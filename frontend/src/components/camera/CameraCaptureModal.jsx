import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  MapPin,
  Check,
  AlertCircle,
  FlipHorizontal,
  Compass,
  Radio,
  Clock
} from 'lucide-react';

export const CameraCaptureModal = ({ isOpen, onClose, onPhotoCaptured, defaultCrop = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for rear, 'user' for selfie
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [gpsCoordinates, setGpsCoordinates] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    status: 'REQUESTING' // 'REQUESTING', 'ACQUIRED', 'DENIED', 'ERROR'
  });

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setCapturedImage(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera initialization error:', err.message);
      setCameraError(
        'Unable to access camera. Please allow camera permissions or use the file upload fallback.'
      );
      setCameraActive(false);
    }
  };

  // Request GPS
  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGpsCoordinates((prev) => ({
        ...prev,
        status: 'UNSUPPORTED'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoordinates({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date(pos.timestamp).toISOString(),
          status: 'ACQUIRED'
        });
      },
      (err) => {
        console.warn('Geolocation capture notice:', err.message);
        // Fallback to crop registered coordinates or demo coordinates
        setGpsCoordinates({
          latitude: defaultCrop?.latitude || 29.6857,
          longitude: defaultCrop?.longitude || 76.9905,
          accuracy: 12,
          timestamp: new Date().toISOString(),
          status: 'FALLBACK_CROP_PARCEL'
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
      acquireLocation();
    } else {
      // Stop camera when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCapturedImage(null);
      setCapturedBlob(null);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // Export Data URL and Blob
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    canvas.toBlob(
      (blob) => {
        setCapturedBlob(blob);
      },
      'image/jpeg',
      0.92
    );

    // Stop camera video to freeze frame
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onPhotoCaptured({
        dataUrl: capturedImage,
        blob: capturedBlob,
        gps: gpsCoordinates,
        timestamp: new Date().toISOString(),
        resolution: canvasRef.current
          ? `${canvasRef.current.width}x${canvasRef.current.height}`
          : '1280x720'
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Real-Time Foliar Camera</h3>
              <p className="text-[11px] text-slate-400">
                Live GNSS Geo-Tagging • PMFBY Field Surveillance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Capture Canvas Container */}
        <div className="relative aspect-video sm:aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured Foliage"
              className="w-full h-full object-cover"
            />
          ) : cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Starting camera video feed...</span>
            </div>
          )}

          {/* Grid lines overlay for framing leaf symptoms */}
          {cameraActive && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10 flex items-center justify-center">
                <div className="w-8 h-8 border border-emerald-400/60 rounded-full" />
              </div>
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
          )}

          {/* Live telemetry badge over viewfinder */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>GPS: {gpsCoordinates.latitude ? `${gpsCoordinates.latitude}°N, ${gpsCoordinates.longitude}°E` : 'Acquiring...'}</span>
            </div>
            {gpsCoordinates.accuracy && (
              <div className="text-[10px] text-slate-400">Accuracy: ±{gpsCoordinates.accuracy}m</div>
            )}
          </div>

          {/* Switch Camera Button */}
          {cameraActive && !capturedImage && (
            <button
              onClick={toggleCameraFacing}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition"
              title="Switch Camera (Front/Rear)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Telemetry Strip */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Plot: {defaultCrop?.cropName || 'Standing Crop'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            *GPS data serves as supporting evidence alongside EXIF integrity
          </span>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
              >
                Retake Photo
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Attach Photo with GPS
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={!cameraActive}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Capture Snapshot
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

