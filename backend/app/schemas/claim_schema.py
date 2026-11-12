from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ClaimCreateRequest(BaseModel):
    policyId: Optional[str] = None
    cropId: Optional[str] = None
    cropName: str
    khasraNo: str
    incidentDate: str
    causeOfLoss: str
    causeLabel: Optional[str] = None
    claimedAmount: float
    aiAssessedLossPct: float = 68.0
    officerNotes: Optional[str] = None
    imageEvidence: Optional[List[Dict[str, Any]]] = None

class ClaimVerificationDecision(BaseModel):
    decision: str  # APPROVED, REJECTED, ADDITIONAL_EVIDENCE_REQUESTED
    approvedAmount: Optional[float] = None
    remarks: str

class InspectionScheduleRequest(BaseModel):
    claimId: str
    scheduledDate: str
    priority: str = "URGENT"
    purpose: str

