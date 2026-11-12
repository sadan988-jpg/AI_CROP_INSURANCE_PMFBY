from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, farmers, crops, claims, officers, ai_reports, images

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(farmers.router)
api_router.include_router(crops.router)
api_router.include_router(claims.router)
api_router.include_router(officers.router)
api_router.include_router(ai_reports.router)
api_router.include_router(images.router, prefix="/images", tags=["Crop Images"])


