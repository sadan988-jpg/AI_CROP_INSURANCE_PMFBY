from pydantic import BaseModel
from typing import Optional

class CropCreateRequest(BaseModel):
    cropName: str
    season: str = "Kharif 2026"
    sowingDate: str = "2026-06-28"
    harvestExpectedDate: Optional[str] = "2026-10-25"
    areaAcres: float = 3.2
    surveyNumber: str
    khasraNumber: str
    soilType: str = "Alluvial Clay Loam"
    irrigationType: str = "Canal & Tube-well"
    latitude: Optional[float] = 29.6857
    longitude: Optional[float] = 76.9905

class CropUpdateRequest(BaseModel):
    cropName: Optional[str] = None
    areaAcres: Optional[float] = None
    status: Optional[str] = None
    healthStatus: Optional[str] = None

class CropResponse(BaseModel):
    id: str
    cropName: str
    season: str
    sowingDate: str
    harvestExpectedDate: Optional[str]
    areaAcres: float
    surveyNumber: str
    khasraNumber: str
    soilType: str
    irrigationType: str
    status: str
    healthStatus: str
    policyId: Optional[str]
    gpsCoords: dict

