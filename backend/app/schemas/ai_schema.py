from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class BoundingBoxItem(BaseModel):
    label: str
    x: float
    y: float
    w: float
    h: float
    conf: float

class PixelSegmentationStats(BaseModel):
    healthyGreenPct: float
    necroticDamagedPct: float
    chlorosisPct: float
    visibleAffectedPct: float

class AiAnalysisReportResponse(BaseModel):
    id: str
    report_uid: Optional[str] = None
    image_id: int
    image_uid: Optional[str] = None
    crop_name: str
    diagnosis_type: str
    primary_issue: str
    confidence_score: float
    severity_percentage: float
    risk_category: str
    affected_area_ratio: Optional[str] = None
    bounding_boxes: List[Dict[str, Any]] = []
    pixel_segmentation: Dict[str, Any] = {}
    recommendation: Optional[str] = None
    symptoms: List[str] = []
    chemical_control: Optional[str] = None
    bio_control: Optional[str] = None
    requires_expert_review: bool = False
    model_version: Optional[str] = "PMFBY-CropVision-Ensemble-v1.0"
    legal_disclaimer: str
    created_at: Optional[datetime] = None

class FlagReportForCceRequest(BaseModel):
    reason: str = Field(..., description="Reason for triggering physical on-field Crop Cutting Experiment")
    priority: Optional[str] = "URGENT"

