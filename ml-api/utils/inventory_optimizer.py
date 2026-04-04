"""
Inventory optimization — suggests reorder quantities and flags issues.
Uses EOQ (Economic Order Quantity) formula as a base heuristic.
"""
import math


CATEGORY_LEAD_TIME_DAYS = {
    'fever-cold': 3, 'diabetes': 5, 'heart': 7,
    'vitamins': 2, 'antibiotics': 4, 'pain-relief': 3,
    'skin': 4, 'digestive': 3, 'eye-ear': 5, 'other': 5,
}

HOLDING_COST_RATE = 0.02   # 2% of unit cost per month
ORDERING_COST = 500        # ₹500 per order placed


def optimize_inventory(products):
    suggestions = []

    for p in products:
        try:
            current_stock = int(p.get('current_stock', 0))
            low_threshold = int(p.get('low_threshold', 10))
            sales_count = int(p.get('sales_count', 1))
            category = p.get('category', 'other')
            name = p.get('name', 'Unknown')

            # Monthly demand estimate (lifetime sales, approximate)
            monthly_demand = max(sales_count / 6, 1)  # assume 6 months of data
            lead_time = CATEGORY_LEAD_TIME_DAYS.get(category, 5)

            # Reorder Point = (Daily demand × Lead time) + Safety stock
            daily_demand = monthly_demand / 30
            safety_stock = daily_demand * lead_time * 1.5
            reorder_point = math.ceil(daily_demand * lead_time + safety_stock)

            # EOQ formula (simplified) — sqrt(2DS/H)
            D = monthly_demand * 12  # annual demand
            S = ORDERING_COST
            H = HOLDING_COST_RATE * 12  # annual holding cost per unit
            eoq = math.ceil(math.sqrt((2 * D * S) / max(H, 1)))

            # Status
            if current_stock == 0:
                status = "OUT_OF_STOCK"
                priority = "CRITICAL"
                action = f"🚨 URGENT: Out of stock — Order {eoq} units immediately"
            elif current_stock <= low_threshold:
                status = "LOW_STOCK"
                priority = "HIGH"
                action = f"🔴 Low stock — Reorder {eoq} units (threshold: {low_threshold})"
            elif current_stock <= reorder_point:
                status = "REORDER_SOON"
                priority = "MEDIUM"
                action = f"🟡 Approaching reorder point — Plan to order {eoq} units"
            else:
                days_of_stock = int(current_stock / daily_demand) if daily_demand > 0 else 999
                status = "ADEQUATE"
                priority = "LOW"
                action = f"✅ Stock adequate — ~{min(days_of_stock, 365)} days of supply"

            suggestions.append({
                "id": str(p.get('id', '')),
                "name": name,
                "current_stock": current_stock,
                "status": status,
                "priority": priority,
                "reorder_point": reorder_point,
                "recommended_order_qty": eoq,
                "monthly_demand_estimate": round(monthly_demand, 1),
                "action": action,
            })
        except Exception as e:
            print(f"Error optimizing {p.get('name')}: {e}")

    # Sort by priority
    priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    suggestions.sort(key=lambda x: priority_order.get(x['priority'], 9))

    critical = [s for s in suggestions if s['priority'] == 'CRITICAL']
    high = [s for s in suggestions if s['priority'] == 'HIGH']

    return {
        "total_analyzed": len(suggestions),
        "critical_count": len(critical),
        "high_priority_count": len(high),
        "suggestions": suggestions,
        "summary": f"{len(critical)} critical out-of-stock, {len(high)} high-priority reorders needed",
    }
