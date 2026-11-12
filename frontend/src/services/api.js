// Centralized PMFBY API Client for Frontend-Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pmfby_token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.detail || res.statusText || 'Request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.warn(`[PMFBY API Warning] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth APIs
  auth: {
    farmerLogin: (phone, password = 'farmer123', otp = '4819') =>
      request('/auth/farmer/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password, otp }),
      }),
    farmerRegister: (userData) =>
      request('/auth/farmer/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    officerLogin: (officerId, password) =>
      request('/auth/officer/login', {
        method: 'POST',
        body: JSON.stringify({ officerId, password }),
      }),
    me: () => request('/auth/me'),
  },

  // Farmer APIs
  farmers: {
    getProfile: () => request('/farmers/profile'),
    updateProfile: (data) =>
      request('/farmers/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getPolicies: () => request('/farmers/policies'),
    getTreatmentRecommendations: () => request('/farmers/treatment-recommendations'),
    getTreatmentHistory: () => request('/farmers/treatment-history'),
    addTreatmentLog: (data) =>
      request('/farmers/treatment-history', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getNotifications: () => request('/farmers/notifications'),
    markNotificationRead: (id) =>
      request(`/farmers/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // Crop & GIS APIs
  crops: {
    list: () => request('/crops'),
    get: (id) => request(`/crops/${id}`),
    create: (data) =>
      request('/crops', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/crops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/crops/${id}`, {
        method: 'DELETE',
      }),
    uploadImageMetadata: (cropId, data) =>
      request(`/crops/${cropId}/images`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Claims APIs
  claims: {
    list: () => request('/claims'),
    get: (id) => request(`/claims/${id}`),
    create: (data) =>
      request('/claims', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Officer Operations APIs
  officers: {
    getDashboardStats: () => request('/officers/dashboard-stats'),
    listFarmers: () => request('/officers/farmers'),
    listCrops: () => request('/officers/crops'),
    verifyCrop: (cropId, status) =>
      request(`/officers/crops/${cropId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    listApplications: () => request('/officers/applications'),
    listCropImages: () => request('/officers/crop-images'),
    verifyClaim: (claimId, decisionData) =>
      request(`/officers/claims/${claimId}/verify`, {
        method: 'POST',
        body: JSON.stringify(decisionData),
      }),
    scheduleInspection: (data) =>
      request('/officers/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listInspections: () => request('/officers/inspections'),
    listSettlements: () => request('/officers/settlements'),
  },

  // AI & Vision Diagnostics
  ai: {
    listReports: () => request('/ai/reports'),
    getReport: (reportId) => request(`/ai/reports/${reportId}`),
    analyzeImageById: (imageId) =>
      request(`/ai/analyze/${imageId}`, {
        method: 'POST',
      }),
    getImageAnalysis: (imageId) => request(`/ai/images/${imageId}/analysis`),
    flagForCce: (reportId, reason, priority = 'URGENT') =>
      request(`/ai/reports/${reportId}/flag-for-cce`, {
        method: 'POST',
        body: JSON.stringify({ reason, priority }),
      }),
    analyzeImage: (payload) =>
      request('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Image Management & GPS Verification APIs
  images: {
    upload: (formData) =>
      request('/images/upload', {
        method: 'POST',
        body: formData,
      }),
    myImages: () => request('/images/my-images'),
    get: (id) => request(`/images/${id}`),
    getLocation: (id) => request(`/images/${id}/location`),
    delete: (id) => request(`/images/${id}`, { method: 'DELETE' }),
    officerList: (statusFilter) =>
      request(`/images/officer/queue${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
    officerVerify: (id, decision, remarks = '') =>
      request(`/images/officer/${id}/verification`, {
        method: 'PUT',
        body: JSON.stringify({ decision, officer_remarks: remarks }),
      }),
    officerRequestRecapture: (id, reason, guidelines = '') =>
      request(`/images/officer/${id}/request-recapture`, {
        method: 'POST',
        body: JSON.stringify({ reason, guidelines }),
      }),
  },
};

