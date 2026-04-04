"""
Simple content-based + collaborative filtering recommendation engine.
In production, use a trained ML model with embeddings.
"""

# Category affinity map — medicines often bought together
CATEGORY_AFFINITY = {
    'fever-cold': ['pain-relief', 'vitamins'],
    'diabetes': ['heart', 'vitamins'],
    'heart': ['diabetes', 'vitamins'],
    'vitamins': ['digestive', 'fever-cold'],
    'antibiotics': ['digestive', 'vitamins'],
    'pain-relief': ['fever-cold', 'skin'],
    'skin': ['vitamins', 'pain-relief'],
    'digestive': ['vitamins', 'fever-cold'],
    'eye-ear': ['vitamins', 'fever-cold'],
    'other': ['vitamins'],
}


def get_recommendations(product_id, category, co_purchased_ids):
    """
    Returns recommended product IDs.
    Priority: co_purchased > category affinity
    """
    # If we have co-purchase data, trust it
    if co_purchased_ids and len(co_purchased_ids) >= 4:
        return {
            "product_id": product_id,
            "method": "collaborative_filtering",
            "recommended_ids": co_purchased_ids[:6],
            "confidence": "high",
        }

    # Supplement with category affinity signals
    related_categories = CATEGORY_AFFINITY.get(category, ['vitamins'])

    return {
        "product_id": product_id,
        "method": "content_based",
        "recommended_ids": co_purchased_ids,  # will be filled by Node from DB
        "related_categories": related_categories,
        "confidence": "medium",
        "note": "Filtered by category affinity — co-purchase data insufficient",
    }
