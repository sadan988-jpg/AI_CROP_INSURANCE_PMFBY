import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  INITIAL_FARMER_PROFILE,
  INITIAL_OFFICER_PROFILE,
  INITIAL_CROPS,
  INITIAL_POLICIES,
  INITIAL_CROP_IMAGES,
  INITIAL_AI_ASSESSMENTS,
  INITIAL_TREATMENTS,
  INITIAL_TREATMENT_HISTORY,
  INITIAL_CLAIMS,
  INITIAL_INSPECTIONS,
  INITIAL_SETTLEMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    return localStorage.getItem('pmfby_user_role') || 'FARMER';
  });

  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [farmerProfile, setFarmerProfile] = useState(() => {
    const saved = localStorage.getItem('pmfby_farmer_profile');
    return saved ? JSON.parse(saved) : INITIAL_FARMER_PROFILE;
  });

  const [officerProfile, setOfficerProfile] = useState(() => {
    const saved = localStorage.getItem('pmfby_officer_profile');
    return saved ? JSON.parse(saved) : INITIAL_OFFICER_PROFILE;
  });

  const [crops, setCrops] = useState(() => {
    const saved = localStorage.getItem('pmfby_crops');
    return saved ? JSON.parse(saved) : INITIAL_CROPS;
  });

  const [policies, setPolicies] = useState(() => {
    const saved = localStorage.getItem('pmfby_policies');
    return saved ? JSON.parse(saved) : INITIAL_POLICIES;
  });

  const [cropImages, setCropImages] = useState(() => {
    const saved = localStorage.getItem('pmfby_crop_images');
    return saved ? JSON.parse(saved) : INITIAL_CROP_IMAGES;
  });

  const [aiAssessments, setAiAssessments] = useState(() => {
    const saved = localStorage.getItem('pmfby_ai_assessments');
    return saved ? JSON.parse(saved) : INITIAL_AI_ASSESSMENTS;
  });

  const [treatmentHistory, setTreatmentHistory] = useState(() => {
    const saved = localStorage.getItem('pmfby_treatment_history');
    return saved ? JSON.parse(saved) : INITIAL_TREATMENT_HISTORY;
  });

  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('pmfby_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [inspections, setInspections] = useState(() => {
    const saved = localStorage.getItem('pmfby_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [settlements, setSettlements] = useState(() => {
    const saved = localStorage.getItem('pmfby_settlements');
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('pmfby_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Try syncing with live FastAPI Backend on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const cropsData = await api.crops.list();
        if (Array.isArray(cropsData) && cropsData.length > 0) {
          setCrops(cropsData);
          setBackendConnected(true);
        }

        const claimsData = await api.claims.list();
        if (Array.isArray(claimsData) && claimsData.length > 0) {
          setClaims(claimsData);
        }

        const reportsData = await api.ai.listReports();
        if (Array.isArray(reportsData) && reportsData.length > 0) {
          setAiAssessments(reportsData);
        }
      } catch (err) {
        // Fallback to local state if backend is offline
        setBackendConnected(false);
      }
    }

    loadBackendData();
  }, []);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('pmfby_user_role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem('pmfby_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('pmfby_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('pmfby_crop_images', JSON.stringify(cropImages));
  }, [cropImages]);

  useEffect(() => {
    localStorage.setItem('pmfby_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Action methods
  const switchRole = (role) => {
    setCurrentUserRole(role);
  };

  const loginFarmerUser = async (phone, password = 'farmer123', otp = '4819') => {
    try {
      setLoading(true);
      const res = await api.auth.farmerLogin(phone, password, otp);
      if (res.access_token) {
        localStorage.setItem('pmfby_token', res.access_token);
        setBackendConnected(true);
      }
      return res;
    } catch (err) {
      setApiError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginOfficerUser = async (officerId, password = 'officer123') => {
    try {
      setLoading(true);
      const res = await api.auth.officerLogin(officerId, password);
      if (res.access_token) {
        localStorage.setItem('pmfby_token', res.access_token);
        setBackendConnected(true);
      }
      return res;
    } catch (err) {
      setApiError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addCrop = async (newCropData) => {
    try {
      const res = await api.crops.create(newCropData);
      if (res.crop) {
        setCrops((prev) => [res.crop, ...prev]);
        setBackendConnected(true);
        return res.crop;
      }
    } catch (err) {
      console.warn("Backend crop create failed, saving to local store:", err.message);
    }

    const newCrop = {
      id: `CRP-0${crops.length + 1}`,
      status: "UNDER_VERIFICATION",
      healthStatus: "HEALTHY",
      gpsCoords: newCropData.gpsCoords || { lat: 29.6857, lng: 76.9905 },
      policyId: `POL-PMFBY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newCropData,
    };
    setCrops((prev) => [newCrop, ...prev]);

    const newPolicy = {
      id: newCrop.policyId,
      cropId: newCrop.id,
      cropName: newCrop.cropName,
      season: newCrop.season || "Kharif 2026",
      sumInsured: (parseFloat(newCrop.areaAcres) || 1) * 55000,
      farmerSharePremium: Math.round(((parseFloat(newCrop.areaAcres) || 1) * 55000) * 0.02),
      centralSubsidy: Math.round(((parseFloat(newCrop.areaAcres) || 1) * 55000) * 0.05),
      stateSubsidy: Math.round(((parseFloat(newCrop.areaAcres) || 1) * 55000) * 0.05),
      totalGrossPremium: Math.round(((parseFloat(newCrop.areaAcres) || 1) * 55000) * 0.12),
      insuranceCompany: "Agriculture Insurance Company of India Ltd (AICIL)",
      policyStartDate: "2026-06-01",
      policyEndDate: "2026-11-30",
      coverageType: "PMFBY Standard Comprehensive Coverage",
      status: "UNDER_SCRUTINY",
    };
    setPolicies((prev) => [newPolicy, ...prev]);

    addNotification({
      role: "OFFICER",
      type: "CROP_VERIFICATION",
      title: "New Crop Registration Submitted",
      message: `Farmer ${farmerProfile.fullName} registered ${newCrop.cropName} on survey ${newCrop.surveyNumber}. Pending scrutiny.`,
    });

    return newCrop;
  };

  const addCropImage = async (imageData) => {
    try {
      const res = await api.crops.uploadImageMetadata(imageData.cropId || "CRP-01", {
        imageUrl: imageData.imageUrl,
        category: imageData.category || "Field Disease Surveillance",
        latitude: imageData.gps?.lat || 29.6857,
        longitude: imageData.gps?.lng || 76.9905,
        diagnosisType: imageData.diagnosisType || "DISEASE",
        primaryIssue: imageData.primaryIssue || "Bacterial Leaf Blight",
        severityPercentage: imageData.severityPercentage || 42.5,
        confidenceScore: imageData.confidenceScore || 94.6,
      });

      if (res.image && res.assessment) {
        setCropImages((prev) => [res.image, ...prev]);
        setAiAssessments((prev) => [res.assessment, ...prev]);
        setBackendConnected(true);
        return res;
      }
    } catch (err) {
      console.warn("Backend image upload failed, using local store:", err.message);
    }

    const assessmentId = `ASSESS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newImage = {
      id: `IMG-${Math.floor(9000 + Math.random() * 999)}`,
      capturedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      geoFenceValid: true,
      distanceFromPlotMeters: 11.4,
      deviceInfo: "Chrome Browser GPS Telemetry",
      tamperCheck: "PASSED (EXIF & Geo-hash Verified)",
      aiAssessed: true,
      assessmentId,
      ...imageData,
    };
    setCropImages((prev) => [newImage, ...prev]);

    const newAssessment = {
      id: assessmentId,
      imageId: newImage.id,
      cropName: newImage.cropName || "Paddy (Basmati)",
      diagnosisType: imageData.diagnosisType || "DISEASE",
      primaryIssue: imageData.primaryIssue || "Bacterial Leaf Blight Early Symptoms",
      confidenceScore: imageData.confidenceScore || 93.8,
      severityPercentage: imageData.severityPercentage || 38.5,
      affectedAreaRatio: "1.1 Acres affected",
      riskCategory: "HIGH",
      symptoms: [
        "Marginal yellow-orange chlorosis moving inward",
        "Leaf tips drying out with bacterial ooze spots",
      ],
      boundingBoxes: [
        { label: "Blight Lesion #1", x: 25, y: 30, w: 30, h: 40, conf: 0.94 },
        { label: "Chlorosis Zone", x: 60, y: 20, w: 25, h: 35, conf: 0.91 },
      ],
      pixelSegmentation: {
        healthyGreenPct: 61.5,
        necroticDamagedPct: 38.5,
        chlorosisPct: 15.0,
      },
      recommendation: "Foliar spray with Copper Oxychloride 50% WP + Streptocycline. Monitor water drainage in parcel.",
    };
    setAiAssessments((prev) => [newAssessment, ...prev]);

    return { image: newImage, assessment: newAssessment };
  };

  const submitClaim = async (claimData) => {
    try {
      const res = await api.claims.create(claimData);
      if (res.claim) {
        setClaims((prev) => [res.claim, ...prev]);
        setBackendConnected(true);
        return res.claim;
      }
    } catch (err) {
      console.warn("Backend submitClaim failed, using local store:", err.message);
    }

    const ticketNo = `CLM-PMFBY-2026-00${claims.length + 42}`;
    const newClaim = {
      id: ticketNo,
      farmerName: farmerProfile.fullName,
      farmerPhone: farmerProfile.phone,
      district: farmerProfile.address.district,
      state: farmerProfile.address.state,
      claimedAmount: claimData.claimedAmount || 95000,
      aiAssessedLossPct: claimData.aiAssessedLossPct || 54.0,
      aiRecommendedAmount: Math.round((claimData.claimedAmount || 95000) * 0.95),
      officerApprovedAmount: null,
      status: "UNDER_OFFICER_REVIEW",
      statusTimeline: [
        { step: "Claim Submitted by Farmer", date: new Date().toISOString().replace('T', ' ').substring(0, 16), completed: true },
        { step: "GPS & EXIF Telemetry Verified", date: "Verified Immediately", completed: true },
        { step: "AI Multi-Modal Damage Analysis", date: "Evaluated (Score: " + (claimData.aiAssessedLossPct || 54) + "%)", completed: true },
        { step: "District Officer Scrutiny & Field Survey", date: "Pending Scrutiny", completed: false },
        { step: "AICIL / Bank Direct Payout (DBT)", date: "Awaiting Approval", completed: false },
      ],
      weatherCorrelation: {
        incidentRainfallMm: 72.0,
        normalRainfallMm: 14.5,
        precipitationAnomaly: "+396% Excess Rainfall Recorded",
        hailstormReportedInBlock: true,
        weatherRiskScore: "HIGH_CORRELATION_AUTHENTIC",
      },
      imageEvidence: claimData.imageEvidence || [],
      ...claimData,
    };
    setClaims((prev) => [newClaim, ...prev]);

    addNotification({
      role: "FARMER",
      type: "CLAIM_SUBMITTED",
      title: `Claim ${ticketNo} Filed Successfully`,
      message: `Your insurance claim for ${newClaim.cropName} has been submitted with AI damage assessment (${newClaim.aiAssessedLossPct}%).`,
    });

    addNotification({
      role: "OFFICER",
      type: "CLAIM_ALERT",
      title: `Urgent: New Claim ${ticketNo} Received`,
      message: `Farmer ${farmerProfile.fullName} submitted a claim with ${newClaim.aiAssessedLossPct}% AI-detected damage.`,
    });

    return newClaim;
  };

  const updateClaimDecision = async (claimId, decision, approvedAmount, notes) => {
    try {
      await api.officers.verifyClaim(claimId, {
        decision,
        approvedAmount: parseFloat(approvedAmount) || 0,
        remarks: notes,
      });
      setBackendConnected(true);
    } catch (err) {
      console.warn("Backend verifyClaim failed, updating local state:", err.message);
    }

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const isApproved = decision === "APPROVED";
          const updatedTimeline = c.statusTimeline.map((step, idx) => {
            if (idx === 3) {
              return {
                ...step,
                completed: true,
                date: new Date().toISOString().replace('T', ' ').substring(0, 16) + (isApproved ? " (Approved)" : " (Rejected)"),
              };
            }
            if (idx === 4 && isApproved) {
              return {
                ...step,
                date: "Queued for DBT PFMS Payout",
                completed: false,
              };
            }
            return step;
          });

          return {
            ...c,
            status: isApproved ? "APPROVED" : "REJECTED",
            officerApprovedAmount: isApproved ? parseFloat(approvedAmount) : 0,
            officerNotes: notes,
            statusTimeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    if (decision === "APPROVED") {
      const settlementRecord = {
        id: `SETTLE-${Math.floor(900 + Math.random() * 99)}`,
        claimId,
        farmerName: farmerProfile.fullName,
        aadhaarMasked: farmerProfile.aadhaarMasked,
        bankAccount: farmerProfile.bankAccount.bankName + " " + farmerProfile.bankAccount.accountNumber,
        utrNumber: `PMFBY${new Date().getFullYear()}DBT${Math.floor(10000000 + Math.random() * 90000000)}`,
        payoutAmount: parseFloat(approvedAmount),
        disbursedDate: "Scheduled in Next DBT Batch (24-48 Hours)",
        disbursementMethod: "Direct Benefit Transfer (PFMS / AEPS)",
        status: "PROCESSING",
        insuranceCompany: "Agriculture Insurance Company of India Ltd (AICIL)",
      };
      setSettlements((prev) => [settlementRecord, ...prev]);
    }

    addNotification({
      role: "FARMER",
      type: decision === "APPROVED" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
      title: `Claim ${claimId} ${decision === "APPROVED" ? "Approved" : "Rejected"}`,
      message: `District Officer decided: ${decision}. ${decision === "APPROVED" ? `₹${Number(approvedAmount).toLocaleString('en-IN')} approved for DBT transfer.` : `Reason: ${notes}`}`,
    });
  };

  const scheduleInspection = async (inspectionData) => {
    try {
      const res = await api.officers.scheduleInspection(inspectionData);
      if (res.inspection) {
        setInspections((prev) => [res.inspection, ...prev]);
        setBackendConnected(true);
        return res.inspection;
      }
    } catch (err) {
      console.warn("Backend scheduleInspection failed, using local store:", err.message);
    }

    const newInspection = {
      id: `INSP-${Math.floor(700 + Math.random() * 100)}`,
      status: "SCHEDULED",
      assignedOfficer: officerProfile.fullName,
      ...inspectionData,
    };
    setInspections((prev) => [newInspection, ...prev]);
    return newInspection;
  };

  const addTreatmentRecord = async (record) => {
    try {
      await api.farmers.addTreatmentLog(record);
      setBackendConnected(true);
    } catch (err) {
      console.warn("Backend addTreatmentLog failed:", err.message);
    }

    const newLog = {
      id: `LOG-${Math.floor(500 + Math.random() * 100)}`,
      status: "APPLIED",
      dateApplied: new Date().toISOString().substring(0, 10),
      ...record,
    };
    setTreatmentHistory((prev) => [newLog, ...prev]);
    return newLog;
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      timestamp: "Just now",
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = async (id) => {
    try {
      await api.farmers.markNotificationRead(id);
    } catch (err) {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (role) => {
    setNotifications((prev) =>
      prev.map((n) => (n.role === role ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUserRole,
        switchRole,
        backendConnected,
        loading,
        apiError,
        loginFarmerUser,
        loginOfficerUser,
        farmerProfile,
        setFarmerProfile,
        officerProfile,
        setOfficerProfile,
        crops,
        setCrops,
        addCrop,
        policies,
        cropImages,
        addCropImage,
        aiAssessments,
        treatments: INITIAL_TREATMENTS,
        treatmentHistory,
        addTreatmentRecord,
        claims,
        submitClaim,
        updateClaimDecision,
        inspections,
        scheduleInspection,
        settlements,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
