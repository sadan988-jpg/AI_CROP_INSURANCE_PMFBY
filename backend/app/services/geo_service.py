import math
from typing import Optional, Dict, Any

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in meters using the Haversine formula.
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)

def verify_coordinates_against_crop(
    crop_lat: Optional[float],
    crop_lon: Optional[float],
    img_lat: Optional[float],
    img_lon: Optional[float],
    threshold_meters: float = 1000.0
) -> Dict[str, Any]:
    """
    Compares image capture GPS against registered farm parcel coordinates.
    IMPORTANT: GPS verification is treated as supporting evidence, not absolute proof.
    """
    if img_lat is None or img_lon is None or (img_lat == 0.0 and img_lon == 0.0):
        return {
            "has_gps": False,
            "distance_meters": None,
            "is_within_bounds": False,
            "status": "GPS_NOT_RECORDED",
            "message": "GPS coordinates were not provided or device geolocation was disabled. Requires manual officer scrutiny.",
            "is_suspicious": False,
            "legal_disclaimer": "GPS location is supporting evidence, not conclusive proof of parcel origin."
        }

    if crop_lat is None or crop_lon is None or (crop_lat == 0.0 and crop_lon == 0.0):
        return {
            "has_gps": True,
            "image_latitude": img_lat,
            "image_longitude": img_lon,
            "distance_meters": None,
            "is_within_bounds": True,
            "status": "FARM_COORDINATES_PENDING",
            "message": "Image contains GPS coordinates, but registered farm coordinates are pending survey recording.",
            "is_suspicious": False,
            "legal_disclaimer": "GPS location is supporting evidence, not conclusive proof of parcel origin."
        }

    distance = calculate_haversine_distance(crop_lat, crop_lon, img_lat, img_lon)
    is_within = distance <= threshold_meters

    if distance <= 250.0:
        status = "VERIFIED_ON_PARCEL"
        message = f"Coordinates are within {distance}m of registered farm center (cadastral match)."
        is_suspicious = False
    elif distance <= threshold_meters:
        status = "VERIFIED_VICINITY"
        message = f"Coordinates are within farm boundary buffer ({distance}m from registered center)."
        is_suspicious = False
    else:
        status = "FLAGGED_LOCATION_MISMATCH"
        message = (
            f"Coordinates mismatch: Image captured {distance / 1000.0:.2f} km away from registered parcel "
            f"({crop_lat:.4f}, {crop_lon:.4f}). Flagged for officer scrutiny."
        )
        is_suspicious = True

    return {
        "has_gps": True,
        "image_latitude": img_lat,
        "image_longitude": img_lon,
        "crop_latitude": crop_lat,
        "crop_longitude": crop_lon,
        "distance_meters": distance,
        "threshold_meters": threshold_meters,
        "is_within_bounds": is_within,
        "status": status,
        "message": message,
        "is_suspicious": is_suspicious,
        "legal_disclaimer": "GPS location is supporting evidence, not conclusive proof of parcel origin."
    }

