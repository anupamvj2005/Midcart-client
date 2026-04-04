import numpy as np
from datetime import datetime, timedelta


def predict_demand(product_id, product_name, category, sales_history):
    """
    Predicts next 3 months demand using simple time-series (linear regression / moving avg).
    In production, replace with Prophet or ARIMA.
    """

    if not sales_history or len(sales_history) < 2:
        # Not enough data — return category-based heuristic
        category_defaults = {
            'fever-cold': 80, 'diabetes': 60, 'heart': 40,
            'vitamins': 100, 'antibiotics': 50, 'pain-relief': 90,
            'skin': 30, 'digestive': 70, 'eye-ear': 25, 'other': 40,
        }
        base = category_defaults.get(category, 50)
        forecast = [
            {"month": _next_month(i), "predicted_quantity": base + np.random.randint(-10, 10)}
            for i in range(1, 4)
        ]
        return {
            "product_id": str(product_id),
            "product_name": product_name,
            "forecast": forecast,
            "confidence": "low",
            "method": "category_heuristic",
            "recommendation": f"Maintain ~{base} units/month based on category average",
        }

    # Extract quantities
    quantities = [item['quantity'] for item in sales_history]
    n = len(quantities)

    # Moving average (last 3 months)
    window = min(3, n)
    moving_avg = np.mean(quantities[-window:])

    # Simple linear trend
    x = np.arange(n)
    if n >= 3:
        coeffs = np.polyfit(x, quantities, 1)
        trend = coeffs[0]  # slope
    else:
        trend = 0

    # Generate 3-month forecast
    forecast = []
    for i in range(1, 4):
        predicted = max(0, int(moving_avg + trend * i))
        forecast.append({
            "month": _next_month(i),
            "predicted_quantity": predicted,
        })

    # Determine confidence
    if n >= 6:
        confidence = "high"
    elif n >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    avg_qty = np.mean(quantities)
    recommended_stock = int(max(forecast, key=lambda x: x['predicted_quantity'])['predicted_quantity'] * 1.2)

    return {
        "product_id": str(product_id),
        "product_name": product_name,
        "forecast": forecast,
        "confidence": confidence,
        "method": "moving_average_with_trend",
        "average_monthly_sales": round(avg_qty, 1),
        "trend": "increasing" if trend > 2 else "decreasing" if trend < -2 else "stable",
        "recommended_stock_level": recommended_stock,
        "recommendation": f"Stock {recommended_stock} units to meet predicted demand with 20% buffer",
    }


def _next_month(offset):
    dt = datetime.now()
    month = (dt.month + offset - 1) % 12 + 1
    year = dt.year + (dt.month + offset - 1) // 12
    return f"{year}-{month:02d}"
