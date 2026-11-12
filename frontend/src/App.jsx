import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import { FarmerLayout } from './components/layouts/FarmerLayout';
import { OfficerLayout } from './components/layouts/OfficerLayout';

// Landing Page
import { LandingPage } from './pages/LandingPage';

// Farmer Pages
import { FarmerRegister, FarmerLogin } from './pages/farmer/FarmerAuth';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { CropRegistration } from './pages/farmer/CropRegistration';
import { MyRegisteredCrops } from './pages/farmer/MyRegisteredCrops';
import { CropImageUpload } from './pages/farmer/CropImageUpload';
import { AiDiseaseDetection } from './pages/farmer/AiDiseaseDetection';
import { AiPestDetection } from './pages/farmer/AiPestDetection';
import { CropDamageAssessment } from './pages/farmer/CropDamageAssessment';
import { TreatmentRecommendations } from './pages/farmer/TreatmentRecommendations';
import { TreatmentHistory } from './pages/farmer/TreatmentHistory';
import { InsurancePolicyDetails } from './pages/farmer/InsurancePolicyDetails';
import { SubmitClaim } from './pages/farmer/SubmitClaim';
import { TrackClaimStatus } from './pages/farmer/TrackClaimStatus';
import { FarmerNotifications } from './pages/farmer/FarmerNotifications';

// Officer Pages
import { OfficerLogin } from './pages/officer/OfficerLogin';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { FarmerManagement } from './pages/officer/FarmerManagement';
import { CropRegistrationVerification } from './pages/officer/CropRegistrationVerification';
import { InsuranceApplications } from './pages/officer/InsuranceApplications';
import { UploadedCropImages } from './pages/officer/UploadedCropImages';
import { AiAssessmentReports } from './pages/officer/AiAssessmentReports';
import { DamageAnalysis } from './pages/officer/DamageAnalysis';
import { ClaimVerification } from './pages/officer/ClaimVerification';
import { FieldInspectionRequests } from './pages/officer/FieldInspectionRequests';
import { ClaimDecisions } from './pages/officer/ClaimDecisions';
import { SettlementTracking } from './pages/officer/SettlementTracking';
import { ReportsAnalytics } from './pages/officer/ReportsAnalytics';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Role Selection Gateway */}
          <Route path="/" element={<LandingPage />} />

          {/* Standalone Auth Routes */}
          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/farmer/register" element={<FarmerRegister />} />
          <Route path="/officer/login" element={<OfficerLogin />} />

          {/* Farmer Portal (Wrapped in FarmerLayout) */}
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<Navigate to="/farmer/dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="crop-registration" element={<CropRegistration />} />
            <Route path="registered-crops" element={<MyRegisteredCrops />} />
            <Route path="image-upload" element={<CropImageUpload />} />
            <Route path="disease-detection" element={<AiDiseaseDetection />} />
            <Route path="pest-detection" element={<AiPestDetection />} />
            <Route path="damage-assessment" element={<CropDamageAssessment />} />
            <Route path="treatment-recommendations" element={<TreatmentRecommendations />} />
            <Route path="treatment-history" element={<TreatmentHistory />} />
            <Route path="policy-details" element={<InsurancePolicyDetails />} />
            <Route path="submit-claim" element={<SubmitClaim />} />
            <Route path="track-claim" element={<TrackClaimStatus />} />
            <Route path="notifications" element={<FarmerNotifications />} />
          </Route>

          {/* Insurance Officer Portal (Wrapped in OfficerLayout) */}
          <Route path="/officer" element={<OfficerLayout />}>
            <Route index element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="farmers" element={<FarmerManagement />} />
            <Route path="crop-verification" element={<CropRegistrationVerification />} />
            <Route path="applications" element={<InsuranceApplications />} />
            <Route path="crop-images" element={<UploadedCropImages />} />
            <Route path="ai-reports" element={<AiAssessmentReports />} />
            <Route path="damage-analysis" element={<DamageAnalysis />} />
            <Route path="claim-verification" element={<ClaimVerification />} />
            <Route path="inspection-requests" element={<FieldInspectionRequests />} />
            <Route path="claim-decisions" element={<ClaimDecisions />} />
            <Route path="settlement-tracking" element={<SettlementTracking />} />
            <Route path="analytics" element={<ReportsAnalytics />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

