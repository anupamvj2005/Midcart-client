# MidCart – Database Documentation

## Connection
MongoDB (local or Atlas). Set `MONGO_URI` in `backend/.env`.

## Collections & Schemas

### users
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, lowercase |
| password | String | bcrypt hashed |
| phone | String | Indian mobile |
| role | Enum | user / admin / pharmacist |
| addresses | Array | shipping addresses |
| savedPrescriptions | ObjectId[] | ref: Prescription |
| wishlist | ObjectId[] | ref: Product |
| isActive | Boolean | default true |

### products
| Field | Type | Notes |
|-------|------|-------|
| name | String | text-indexed |
| genericName | String | |
| brand | String | |
| category | Enum | fever-cold, diabetes, heart, vitamins... |
| price.mrp | Number | original price |
| price.selling | Number | discounted price |
| stock.quantity | Number | current stock |
| stock.lowStockThreshold | Number | alert threshold |
| expiryDate | Date | |
| requiresPrescription | Boolean | |
| images | Array | {url, public_id} |
| ratings | Object | {average, count} |
| salesCount | Number | for ML demand |
| isActive | Boolean | soft delete |
| isFeatured | Boolean | show on homepage |

### orders
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | ref: User |
| orderNumber | String | auto-generated SP{timestamp} |
| items | Array | {product, name, qty, price} |
| shippingAddress | Object | street, city, state, pincode |
| pricing | Object | subtotal, discount, delivery, total |
| payment | Object | method, status, transactionId |
| status | Enum | placed→confirmed→processing→shipped→delivered |
| statusHistory | Array | audit trail |
| estimatedDelivery | Date | |

### prescriptions
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | ref: User |
| images | Array | {url, public_id} |
| status | Enum | pending / verified / rejected / expired |
| extractedMedicines | Array | from ML OCR |
| verifiedBy | ObjectId | ref: User (pharmacist) |
| validUntil | Date | default 6 months |

### carts
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | ref: User, unique |
| items | Array | {product, quantity, price} |
| coupon | Object | {code, discount, type} |

## Indexes
- users: email (unique)
- products: name+genericName+brand+tags (text), category, isActive
- orders: user, status, createdAt
- prescriptions: user, status
- carts: user (unique)

## Seed Data
Run `cd backend && npm run seed` to populate with:
- 1 admin user (admin@midcart.com / Admin@123)
- 1 pharmacist (pharmacist@midcart.com / Pharm@123)
- 1 test user (user@midcart.com / User@123)
- 6 sample products across different categories
