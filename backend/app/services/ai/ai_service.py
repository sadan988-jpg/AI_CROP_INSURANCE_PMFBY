import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.entities import (
    CropImage,
    Crop,
    AiAnalysisReport,
    DiseaseDetection,
    PestDetection,
    Notification
)
from backend.app.services.image_quality import assess_image_quality
from backend.app.services.ai.damage_detection import analyze_foliar_damage_opencv
from backend.app.services.ai.disease_detection import classify_crop_disease
from backend.app.services.ai.pest_detection import detect_crop_pests

logger = logging.getLogger("pmfby_ai_service")

PMFBY_LEGAL_DISCLAIMER = (
    "LEGAL DISCLAIMER: AI foliar analysis provides advisory decision-support for evidence screening. "
    "A crop photograph cannot independently determine total field yield loss, PMFBY claim eligibility, "
    "or insurance payout amounts. Official claim decisions follow statutory PMFBY operational guidelines, "
    "agro-meteorological correlation, and authorized surveyor Crop Cutting Experiments (CCE)."
)

def run_ai_crop_analytics(crop_image_id: int, db: Session) -> Dict[str, Any]:
    """
    Executes the full end-to-end AI crop analytics pipeline:
    1. Retrieves CropImage record and image bytes.
    2. Quality Screening: Checks blur, exposure, and corruption.
    3. Foliar Segmentation: Measures healthy vs chlorotic/necrotic leaf tissue ratios.
    4. Pathology Classification: PlantVillage / PlantDoc taxonomy analysis.
    5. Entomological Detection: IP102 insect pest infestation & ETL assessment.
    6. Physical Calamity Detection: Lodging and hailstorm stem snapping.
    7. Database Persistence: Updates/creates AiAnalysisReport, DiseaseDetection, PestDetection.
    """
    # 1. Fetch CropImage record
    crop_img = db.query(CropImage).filter(CropImage.id == crop_image_id).first()
    if not crop_img:
        return {"success": False, "error": f"CropImage record with ID {crop_image_id} not found."}

    # Retrieve physical file or URL
    img_bytes = None
    if crop_img.image_path and os.path.exists(crop_img.image_path):
        with open(crop_img.image_path, "rb") as f:
            img_bytes = f.read()
    elif crop_img.image_url and crop_img.image_url.startswith("http"):
        try:
            import requests
            resp = requests.get(crop_img.image_url, timeout=5)
            if resp.status_code == 200:
                img_bytes = resp.content
        except Exception as e:
            logger.warning("Remote image fetch note: %s", e)

    if not img_bytes:
        return {
            "success": False,
            "error": "Image file could not be read from disk or remote storage."
        }

    # 2. Quality & Blur Validation
    quality = assess_image_quality(img_bytes, crop_img.original_filename or "foliage.jpg")
    if not quality["is_valid"]:
        crop_img.ai_analysis_status = "REJECTED_QUALITY"
        db.commit()
        return {
            "success": False,
            "status": "REJECTED_QUALITY",
            "error": quality["error"],
            "quality_assessment": quality,
            "recommendation": "Please capture a fresh photo under indirect daylight avoiding camera motion."
        }

    if quality.get("quality_status") in ["WARNING_BLURRY", "WARNING_TOO_DARK"]:
        crop_img.ai_analysis_status = "REJECTED_BLURRY"
        db.commit()
        return {
            "success": False,
            "status": "REJECTED_QUALITY",
            "error": "Image is excessively blurry or dark for diagnostic classification.",
            "quality_assessment": quality,
            "recommendation": "Foliar details are indistinct. Please hold the camera steady and re-capture under clear light."
        }

    # 3. OpenCV Foliar Color-Space Segmentation & Physical Damage Detection
    crop_name = crop_img.crop.crop_name if crop_img.crop else "Standing Crop"
    damage_result = analyze_foliar_damage_opencv(img_bytes, target_crop_name=crop_name)

    if not damage_result["success"] or not damage_result.get("is_foliar", True):
        crop_img.ai_analysis_status = "REJECTED_NON_FOLIAR"
        db.commit()
        return {
            "success": False,
            "status": "REJECTED_NON_FOLIAR",
            "error": damage_result.get("error", "Non-foliar image submitted."),
            "primary_issue": "Unable to determine – non-crop or non-foliar image",
            "recommendation": "Please submit photographs of crop leaves, canopy, or affected plant parts."
        }

    affected_pct = damage_result["visible_affected_area_pct"]
    chlorosis_pct = damage_result["chlorosis_pct"]
    necrosis_pct = damage_result["necrosis_pct"]
    healthy_pct = damage_result["healthy_green_pct"]
    boxes = damage_result["bounding_boxes"]
    physical_damage = damage_result["physical_damage"]

    # 4. Disease Classification
    disease_res = classify_crop_disease(
        image_bgr=None, # Already processed via color spectrum
        crop_name=crop_name,
        affected_area_pct=affected_pct,
        chlorosis_pct=chlorosis_pct,
        necrosis_pct=necrosis_pct
    )

    # 5. Entomological Pest Detection
    pest_res = detect_crop_pests(
        image_bgr=None,
        crop_name=crop_name,
        affected_area_pct=affected_pct,
        bounding_boxes=boxes
    )

    # 6. Determine Primary Diagnosis & Synthesis
    if physical_damage.get("lodging_detected"):
        diagnosis_type = "DAMAGE"
        primary_issue = "Crop Lodging & Stem Snap (Physical Calamity)"
        confidence_score = physical_damage["lodging_confidence"] * 100
        recommendation = "Document lodging area for PMFBY Localized Calamity claim (Hailstorm / Inundation)."
    elif disease_res["disease_detected"] and disease_res["confidence_score"] >= 75.0:
        diagnosis_type = "DISEASE"
        primary_issue = f"{disease_res['disease_name']} ({disease_res['pathogen']})"
        confidence_score = disease_res["confidence_score"]
        recommendation = disease_res["recommendation"]
    elif pest_res["pest_detected"] and pest_res["etl_breached"]:
        diagnosis_type = "PEST"
        primary_issue = f"{pest_res['pest_name']} ({pest_res['specie']})"
        confidence_score = pest_res["confidence_score"]
        recommendation = f"{pest_res['chemical_control']} | Bio: {pest_res['bio_control']}"
    else:
        diagnosis_type = "DISEASE"
        primary_issue = disease_res["disease_name"]
        confidence_score = disease_res["confidence_score"]
        recommendation = disease_res["recommendation"]

    # Calculate affected acreage estimation
    area_acres = crop_img.crop.area_acres if crop_img.crop else 3.2
    affected_acres = round((affected_pct / 100.0) * area_acres, 2)
    affected_area_ratio = f"{affected_acres} Acres affected out of {area_acres} Acres"

    # 7. Database Persistence
    report_count = db.query(AiAnalysisReport).count() + 1
    report_uid = f"RPT-AI-2026-{report_count:04d}"

    # Check if report already exists for this image
    existing_report = db.query(AiAnalysisReport).filter(AiAnalysisReport.crop_image_id == crop_img.id).first()
    if existing_report:
        report = existing_report
        report.diagnosis_type = diagnosis_type
        report.primary_issue = primary_issue
        report.confidence_score = confidence_score
        report.severity_percentage = affected_pct
        report.affected_area_ratio = affected_area_ratio
        report.risk_category = damage_result["risk_category"]
        report.recommendation = recommendation
        report.bounding_boxes_json = json.dumps(boxes)
        report.pixel_segmentation_json = json.dumps({
            "healthyGreenPct": healthy_pct,
            "necroticDamagedPct": necrosis_pct,
            "chlorosisPct": chlorosis_pct,
            "affectedAreaPct": affected_pct
        })
    else:
        report = AiAnalysisReport(
            report_uid=report_uid,
            crop_image_id=crop_img.id,
            diagnosis_type=diagnosis_type,
            primary_issue=primary_issue,
            confidence_score=confidence_score,
            severity_percentage=affected_pct,
            affected_area_ratio=affected_area_ratio,
            risk_category=damage_result["risk_category"],
            recommendation=recommendation,
            bounding_boxes_json=json.dumps(boxes),
            pixel_segmentation_json=json.dumps({
                "healthyGreenPct": healthy_pct,
                "necroticDamagedPct": necrosis_pct,
                "chlorosisPct": chlorosis_pct,
                "affectedAreaPct": affected_pct
            })
        )
        db.add(report)
        db.flush()

    # Link/update DiseaseDetection record
    if disease_res.get("disease_detected"):
        disease_record = db.query(DiseaseDetection).filter(DiseaseDetection.ai_report_id == report.id).first()
        if not disease_record:
            disease_record = DiseaseDetection(ai_report_id=report.id)
            db.add(disease_record)
        disease_record.pathogen_name = disease_res.get("pathogen", "N/A")
        disease_record.chlorosis_ratio = chlorosis_pct
        disease_record.symptoms_json = json.dumps(disease_res.get("symptoms", []))
        disease_record.recommended_fungicide = disease_res.get("chemical_control", "N/A")

    # Link/update PestDetection record
    if pest_res.get("pest_detected"):
        pest_record = db.query(PestDetection).filter(PestDetection.ai_report_id == report.id).first()
        if not pest_record:
            pest_record = PestDetection(ai_report_id=report.id)
            db.add(pest_record)
        pest_record.pest_specie = pest_res.get("specie", "N/A")
        pest_record.infestation_stage = pest_res.get("infestation_stage", "Vegetative")
        pest_record.etl_breached = pest_res.get("etl_breached", False)
        pest_record.bio_control_method = pest_res.get("bio_control", "N/A")

    # Update CropImage status
    crop_img.ai_analysis_status = "ANALYZED"
    db.commit()
    db.refresh(report)

    return {
        "success": True,
        "report_id": report.report_uid,
        "db_report_id": report.id,
        "image_id": crop_img.id,
        "image_uid": crop_img.image_uid,
        "crop_identified": crop_name,
        "diagnosis_type": diagnosis_type,
        "primary_issue": primary_issue,
        "confidence_score": round(confidence_score, 1),
        "severity_percentage": affected_pct,
        "risk_category": damage_result["risk_category"],
        "affected_area_ratio": affected_area_ratio,
        "bounding_boxes": boxes,
        "pixel_segmentation": {
            "healthyGreenPct": healthy_pct,
            "necroticDamagedPct": necrosis_pct,
            "chlorosisPct": chlorosis_pct,
            "visibleAffectedPct": affected_pct
        },
        "pathology_details": disease_res,
        "pest_details": pest_res,
        "physical_damage_details": physical_damage,
        "recommendation": recommendation,
        "requires_expert_review": disease_res.get("requires_expert_review", False),
        "model_version": disease_res.get("model_version", "PMFBY-CropVision-Ensemble-v1.0"),
        "legal_disclaimer": PMFBY_LEGAL_DISCLAIMER
    }

