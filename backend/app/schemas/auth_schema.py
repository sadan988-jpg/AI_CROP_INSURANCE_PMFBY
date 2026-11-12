from pydantic import BaseModel, Field
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class FarmerRegisterRequest(BaseModel):
    fullName: str
    phone: str
    aadhaar: str
    password: str = "farmer123"
    state: str = "Haryana"
    district: str = "Karnal"
    tehsil: str = "Gharaunda"
    village: str = "Sambhalkha"
    bankAccount: str = "30198824820"
    ifsc: str = "SBIN0001248"
    landAcres: float = 4.5

class FarmerLoginRequest(BaseModel):
    phone: str
    password: Optional[str] = "farmer123"
    otp: Optional[str] = None

class OfficerLoginRequest(BaseModel):
    officerId: str  # e.g. "OFF-HR-402" or phone/email
    password: str

class ForgotPasswordRequest(BaseModel):
    phone: str
    newPassword: str
    otp: str = "4819"

