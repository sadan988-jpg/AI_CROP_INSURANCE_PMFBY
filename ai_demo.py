import sys
import os
# Ensure project root is on PYTHONPATH for module imports
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)
from fastapi.testclient import TestClient

# Import the FastAPI app
from backend.app.main import app

# Initialize the test client
client = TestClient(app)

def authenticate_farmer():
    resp = client.post('/api/v1/auth/farmer/login', json={
        'phone': '+91 98234 56789',
        'password': 'farmer123',
        'otp': '4819'
    })
    assert resp.status_code == 200, f'Farmer login failed: {resp.text}'
    token = resp.json()['access_token']
    return {'Authorization': f'Bearer {token}'}

def get_first_crop(headers):
    crops = client.get('/api/v1/crops', headers=headers).json()
    assert crops, 'No crops found for farmer'
    return crops[0]

def create_foliage_image(width=640, height=480):
    import numpy as np, cv2
    # Simple green background with a yellow ellipse (chlorosis) and brown ellipse (necrosis)
    img = np.full((height, width, 3), (34, 139, 34), dtype=np.uint8)
    cv2.ellipse(img, (width // 3, height // 3), (80, 120), 30, 0, 360, (30, 210, 230), -1)  # chlorosis
    cv2.ellipse(img, (width // 3, height // 3), (45, 65), 30, 0, 360, (20, 70, 140), -1)   # necrosis
    _, buf = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return buf.tobytes()

def upload_image(headers, crop_id, image_bytes):
    resp = client.post(
        '/api/v1/images/upload',
        headers=headers,
        data={
            'crop_id': crop_id,
            'latitude': 29.6858,
            'longitude': 76.9906,
            'client_capture_time': '2026-08-16 11:30:00',
            'category': 'Foliar Monitoring'
        },
        files={'file': ('demo.jpg', image_bytes, 'image/jpeg')}
    )
    assert resp.status_code == 201, f'Upload failed: {resp.text}'
    return resp.json()['image']['id']

def analyze_image(headers, image_id):
    resp = client.post(f'/api/v1/ai/analyze/{image_id}', headers=headers)
    assert resp.status_code == 200, f'AI analysis failed: {resp.text}'
    data = resp.json()
    print('\nAI Analysis Result')
    for k, v in data.items():
        print(f'{k}: {v}')
    return data

if __name__ == '__main__':
    farmer_headers = authenticate_farmer()
    crop = get_first_crop(farmer_headers)
    img_bytes = create_foliage_image()
    img_id = upload_image(farmer_headers, crop['id'], img_bytes)
    analyze_image(farmer_headers, img_id)

