"""
Prescription medicine extraction: OCR + catalog dictionary match for high-precision linking.
Fallback: catalog-constrained demo when Tesseract is unavailable.
"""
import re
import hashlib
import requests
from io import BytesIO

try:
    from PIL import Image
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

COMMON_MEDICINE_PATTERNS = [
    r'\b[A-Z][a-z]+(?:mycin|cillin|oxacin|azole|statin|prazole|sartan|dipine|olol|pril|cillin)\b',
    r'\b(?:Tab|Cap|Syp|Inj|Oint|Gel|Drops?)\.?\s*[A-Za-z][a-zA-Z]+\b',
    r'\b[A-Z][a-zA-Z]+\s+\d+\s*mg\b',
    r'\b(?:Paracetamol|Metformin|Omeprazole|Azithromycin|Cetirizine|Ibuprofen|Atorvastatin|Aspirin|Amoxicillin|Vitamin)\b',
]

DOSAGE_PATTERN = r'\b(\d+\s*(?:mg|ml|mcg|g))\b'
QUANTITY_PATTERN = r'\b(\d+)\s*(?:tabs?|tablets?|caps?|capsules?|strips?|x)\b'


def _normalize(t):
    if not t:
        return ''
    t = t.lower().replace('-', ' ')
    t = re.sub(r'[\t\n\r]+', ' ', t)
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def _match_catalog_in_text(raw_text, catalog):
    """High-confidence: product catalog name appears verbatim (normalized) in OCR text."""
    if not catalog or not raw_text:
        return []
    nt = _normalize(raw_text)
    if len(nt) < 3:
        return []
    found = []
    seen = set()
    for name in catalog:
        if not name or len(str(name).strip()) < 3:
            continue
        nn = _normalize(name)
        if len(nn) < 3:
            continue
        if nn in nt:
            key = nn
            if key not in seen:
                seen.add(key)
                found.append({
                    'name': name.strip(),
                    'dosage': None,
                    'quantity': '1',
                    'confidence': 0.94,
                    'source': 'catalog_dictionary',
                })
            continue
        first = nn.split()[0]
        if len(first) > 4 and first in nt:
            key = first
            if key not in seen:
                seen.add(key)
                found.append({
                    'name': name.strip(),
                    'dosage': None,
                    'quantity': '1',
                    'confidence': 0.86,
                    'source': 'catalog_token',
                })
    return found


def _parse_medicines_regex(text):
    medicines = []
    lines = text.strip().split('\n')
    seen_norm = set()

    for line in lines:
        line = line.strip()
        if len(line) < 3:
            continue

        dosage_match = re.search(DOSAGE_PATTERN, line, re.IGNORECASE)
        dosage = dosage_match.group(1).replace(' ', '') if dosage_match else None

        qty_match = re.search(QUANTITY_PATTERN, line, re.IGNORECASE)
        quantity = qty_match.group(1) if qty_match else '1'

        matched = False
        for pattern in COMMON_MEDICINE_PATTERNS:
            name_match = re.search(pattern, line)
            if name_match:
                raw_name = name_match.group(0).strip()
                nk = _normalize(raw_name)
                if nk and nk not in seen_norm:
                    seen_norm.add(nk)
                    medicines.append({
                        'name': raw_name,
                        'dosage': dosage,
                        'quantity': quantity,
                        'confidence': 0.72,
                        'source': 'ocr_regex',
                        'raw_line': line[:120],
                    })
                matched = True
                break

        if not matched and dosage and re.match(r'^[A-Za-z]', line):
            word = re.split(r'\s+', line)[0]
            if len(word) > 3:
                nk = _normalize(word)
                if nk not in seen_norm:
                    seen_norm.add(nk)
                    medicines.append({
                        'name': word,
                        'dosage': dosage,
                        'quantity': quantity,
                        'confidence': 0.48,
                        'source': 'ocr_heuristic',
                        'raw_line': line[:120],
                    })

    return medicines


def _merge_medicines(regex_list, catalog_list):
    """Prefer catalog_dictionary matches; merge by normalized name."""
    by_key = {}

    for m in regex_list + catalog_list:
        key = _normalize(m.get('name', ''))
        if not key:
            continue
        prev = by_key.get(key)
        conf = float(m.get('confidence') or 0)
        if prev is None or conf > float(prev.get('confidence') or 0):
            by_key[key] = m

    merged = list(by_key.values())
    merged.sort(key=lambda x: -float(x.get('confidence') or 0))
    return merged[:15]


def _demo_from_catalog(catalog, seed_str=''):
    """Deterministic demo when OCR unavailable: pick catalog items likely in a typical Rx."""
    if not catalog:
        return [
            {'name': 'Paracetamol 500mg', 'dosage': '500mg', 'quantity': '1', 'confidence': 0.72, 'source': 'demo_default'},
        ]

    preferred_sub = ['paracetamol', 'metformin', 'vitamin', 'omeprazole', 'cetirizine', 'ibuprofen',
                   'azithromycin', 'atorvastatin', 'ciprofloxacin', 'clotrimazole']

    picked = []
    cat_list = list(dict.fromkeys([c for c in catalog if c and str(c).strip()]))
    lower_map = [(c, _normalize(c)) for c in cat_list]

    for sub in preferred_sub:
        for c, nc in lower_map:
            if sub in nc and c not in picked:
                picked.append(c)
                if len(picked) >= 5:
                    break
        if len(picked) >= 5:
            break

    if len(picked) < 3 and cat_list:
        h = int(hashlib.md5((seed_str or 'midcart').encode()).hexdigest(), 16)
        idx = h % max(1, len(cat_list))
        for i in range(min(5, len(cat_list))):
            c = cat_list[(idx + i) % len(cat_list)]
            if c not in picked:
                picked.append(c)
            if len(picked) >= 5:
                break

    return [
        {'name': n, 'dosage': '', 'quantity': '1', 'confidence': 0.78, 'source': 'catalog_demo'}
        for n in picked[:5]
    ]


def extract_medicines_from_prescription(image_url=None, image_file=None, catalog=None, is_image=True):
    catalog = catalog or []

    if not is_image:
        demo = _demo_from_catalog(catalog, seed_str=image_url or '')
        return {
            'success': True,
            'medicines': demo,
            'raw_text': '',
            'total_found': len(demo),
            'note': 'Non-image upload (e.g. PDF): using catalog-based suggestions. Upload a JPG/PNG photo of the Rx for full OCR.',
        }

    raw_text = ''

    if not image_url and not image_file:
        return {'success': False, 'medicines': [], 'error': 'No image provided'}

    if TESSERACT_AVAILABLE:
        try:
            if image_url:
                response = requests.get(image_url, timeout=25, headers={'User-Agent': 'MidCart-OCR/1.0'})
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
            else:
                try:
                    image_file.seek(0)
                except Exception:
                    pass
                img = Image.open(image_file)

            img = img.convert('L')
            raw_text = pytesseract.image_to_string(img, config='--psm 6')
        except Exception as e:
            print(f'OCR load/tesseract error: {e}')
            raw_text = ''

    medicines_regex = _parse_medicines_regex(raw_text) if raw_text else []
    medicines_catalog = _match_catalog_in_text(raw_text, catalog) if raw_text else []

    merged = _merge_medicines(medicines_regex, medicines_catalog)

    if merged:
        return {
            'success': True,
            'medicines': merged,
            'raw_text': raw_text[:800] if raw_text else '',
            'total_found': len(merged),
        }

    if not TESSERACT_AVAILABLE or not raw_text.strip():
        demo = _demo_from_catalog(catalog, seed_str=image_url or '')
        return {
            'success': True,
            'medicines': demo,
            'raw_text': raw_text[:500] if raw_text else '',
            'total_found': len(demo),
            'note': 'OCR produced no lines or Tesseract not installed — showing catalog-based suggestions. Install tesseract-ocr + pytesseract for real scanning.',
        }

    return {
        'success': True,
        'medicines': [],
        'raw_text': raw_text[:800],
        'total_found': 0,
        'note': 'No medicine lines detected — use a sharper, well-lit photo of the prescription.',
    }
