from datetime import datetime
import numpy as np


def predict_expiry_risk(products):
    """
    Scores each product on likelihood of expiring before being sold.
    Risk Score = (days_to_expiry_weight * stock_weight) / sales_rate_weight
    Returns sorted list with risk level: HIGH / MEDIUM / LOW
    """
    results = []
    now = datetime.now()

    for p in products:
        try:
            expiry_str = p.get('expiry_date')
            if not expiry_str:
                continue

            # Parse expiry date (ISO format)
            if isinstance(expiry_str, str):
                expiry_date = datetime.fromisoformat(expiry_str.replace('Z', '+00:00').replace('+00:00', ''))
            else:
                expiry_date = expiry_str

            days_to_expiry = (expiry_date - now).days
            if days_to_expiry < 0:
                risk_level = "EXPIRED"
                risk_score = 100
            else:
                stock = int(p.get('stock', 0))
                sales_rate = max(int(p.get('sales_rate', 1)), 1)  # units/month

                # Days needed to sell current stock at current rate
                days_to_sell = (stock / sales_rate) * 30

                if days_to_sell > days_to_expiry:
                    # Will expire before selling all stock
                    unsold_pct = min(100, ((days_to_sell - days_to_expiry) / days_to_sell) * 100)
                    risk_score = round(unsold_pct, 1)
                else:
                    risk_score = 0

                if risk_score >= 60 or days_to_expiry <= 15:
                    risk_level = "HIGH"
                elif risk_score >= 30 or days_to_expiry <= 30:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"

            # Recommendation
            if risk_level == "EXPIRED":
                recommendation = "⛔ Remove from shelf immediately"
            elif risk_level == "HIGH":
                recommendation = f"🔴 Apply heavy discount immediately — risk of {risk_score:.0f}% stock expiring"
            elif risk_level == "MEDIUM":
                recommendation = f"🟡 Run promotions to boost sales — {days_to_expiry} days left"
            else:
                recommendation = f"✅ Normal — {days_to_expiry} days to expiry"

            results.append({
                "id": str(p.get('id', '')),
                "name": p.get('name', ''),
                "days_to_expiry": days_to_expiry,
                "stock": p.get('stock', 0),
                "sales_rate_monthly": p.get('sales_rate', 0),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "recommendation": recommendation,
            })
        except Exception as e:
            print(f"Error processing product {p.get('name')}: {e}")
            continue

    # Sort by risk score descending
    results.sort(key=lambda x: x['risk_score'], reverse=True)

    high = [r for r in results if r['risk_level'] == 'HIGH']
    medium = [r for r in results if r['risk_level'] == 'MEDIUM']

    return {
        "total_products_analyzed": len(results),
        "high_risk_count": len(high),
        "medium_risk_count": len(medium),
        "products": results,
        "summary": f"Found {len(high)} high-risk and {len(medium)} medium-risk products requiring attention",
    }
