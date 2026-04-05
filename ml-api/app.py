from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from utils.demand_forecast import predict_demand
from utils.expiry_risk import predict_expiry_risk
from utils.recommendations import get_recommendations
from utils.inventory_optimizer import optimize_inventory
from utils.ocr_extractor import extract_medicines_from_prescription

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5000"])

# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "MidCart ML API"})


# ─────────────────────────────────────────────
# Demand Forecasting
# ─────────────────────────────────────────────
@app.route('/demand-forecast', methods=['POST'])
def demand_forecast():
    """
    Predicts future demand for a medicine based on historical sales.
    Body: { product_id, product_name, category, sales_history: [{_id: 'YYYY-MM', quantity: N}] }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = predict_demand(
            product_id=data.get('product_id'),
            product_name=data.get('product_name'),
            category=data.get('category'),
            sales_history=data.get('sales_history', [])
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Expiry Risk Prediction
# ─────────────────────────────────────────────
@app.route('/expiry-risk', methods=['POST'])
def expiry_risk():
    """
    Predicts which medicines are at risk of expiring before being sold.
    Body: { products: [{ id, name, expiry_date, stock, sales_rate, category }] }
    """
    try:
        data = request.get_json()
        if not data or 'products' not in data:
            return jsonify({"error": "No products data provided"}), 400

        result = predict_expiry_risk(data['products'])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Product Recommendations
# ─────────────────────────────────────────────
@app.route('/recommendations', methods=['POST'])
def recommendations():
    """
    Returns recommended product IDs based on category and co-purchase data.
    Body: { product_id, category, co_purchased_ids: [...] }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = get_recommendations(
            product_id=data.get('product_id'),
            category=data.get('category'),
            co_purchased_ids=data.get('co_purchased_ids', [])
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Inventory Optimization
# ─────────────────────────────────────────────
@app.route('/inventory-optimize', methods=['POST'])
def inventory_optimize():
    """
    Suggests reorder quantities and flags issues.
    Body: { products: [{ id, name, current_stock, low_threshold, sales_count, category }] }
    """
    try:
        data = request.get_json()
        if not data or 'products' not in data:
            return jsonify({"error": "No products data provided"}), 400

        result = optimize_inventory(data['products'])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Prescription OCR Extraction
# ─────────────────────────────────────────────
@app.route('/extract-prescription', methods=['POST'])
def extract_prescription():
    """
    Extracts medicine names from prescription image URL.
    Body JSON: { image_url, catalog?: [...product names], is_image?: bool }
    Or: multipart/form-data with file field 'image'
    """
    try:
        if request.is_json:
            data = request.get_json() or {}
            image_url = data.get('image_url')
            catalog = data.get('catalog')
            is_image = data.get('is_image', True)
            if not image_url:
                return jsonify({"error": "image_url required"}), 400
            result = extract_medicines_from_prescription(
                image_url=image_url,
                catalog=catalog,
                is_image=is_image,
            )
        elif 'image' in request.files:
            image_file = request.files['image']
            result = extract_medicines_from_prescription(image_file=image_file, catalog=[])
        else:
            return jsonify({"error": "Provide image_url (JSON) or image file"}), 400

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"\n[ML] MidCart ML API running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
