from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ImageQualityAssessment(BaseModel):
    is_valid: bool
    quality_status: str
    blur_score: float
    brightness_score: float
    resolution: str
    warnings: List[str] = []

class GpsVerificationResult(BaseModel):
    has_gps: bool
    image_latitude: Optional[float] = None
    image_longitude: Optional[float] = None
    crop_latitude: Optional[float] = None
    crop_longitude: Optional[float] = None
    distance_meters: Optional[float] = None
    is_within_bounds: bool
    status: str
    message: str
    is_suspicious: bool
    legal_disclaimer: str

class CropImageResponse(BaseModel):
    id: int
    image_uid: str
    image_id: Optional[str] = None
    crop_id: Optional[int] = None
    crop_name: Optional[str] = None
    farmer_id: Optional[int] = None
    farmer_name: Optional[str] = None
    image_url: Optional[str] = None
    original_filename: Optional[str] = None
    file_type: Optional[str] = "image/jpeg"
    file_size: Optional[int] = 0
    image_hash: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_accuracy: Optional[float] = None
    distance_from_plot_meters: Optional[float] = None
    client_capture_time: Optional[str] = None
    server_upload_time: Optional[datetime] = None
    image_quality_status: Optional[str] = "PASSED"
    blur_score: Optional[float] = None
    brightness_score: Optional[float] = None
    resolution: Optional[str] = None
    verification_status: Optional[str] = "PENDING_REVIEW"
    ai_analysis_status: Optional[str] = "PENDING"
    officer_remarks: Optional[str] = None
    is_duplicate: Optional[bool] = False
    category: Optional[str] = "Field Disease Surveillance"
    captured_at: Optional[str] = None
    created_at: Optional[datetime] = None

class ImageVerificationUpdateRequest(BaseModel):
    decision: str = Field(..., description="VERIFIED, FLAGGED_LOCATION_MISMATCH, REJECTED, RECAPTURE_REQUESTED")
    officer_remarks: Optional[str] = None

class RecaptureRequest(BaseModel):
    reason: str = Field(..., description="Specific reason why new image capture is needed (e.g. blurry, wrong angle, location mismatch)")
    guidelines: Optional[str] = "Please capture close-up under bright indirect daylight at the registered survey plot."

