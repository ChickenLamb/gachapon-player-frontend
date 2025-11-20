# Gachapon Player API Documentation

**Version**: 1.0
**Base URL**: `https://api.gachapon.com/api/v1`
**Authentication**: JWT Bearer Token (provided by OMMiii Unity Hub)

---

## Table of Contents

1. [Authentication & Token Validation](#1-authentication--token-validation)
2. [Machine Discovery](#2-machine-discovery)
3. [QR Code Management](#3-qr-code-management)
4. [Payment Flow](#4-payment-flow)
5. [Product & Prize Catalog](#5-product--prize-catalog)
6. [Merchant Events (Promotions)](#6-merchant-events-promotions)
7. [Player History & Inventory](#7-player-history--inventory)
8. [Support & Utility](#8-support--utility)
9. [TypeScript API Client](#9-typescript-api-client)
10. [Mock Service Implementation](#10-mock-service-implementation)

---

## Global Request Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
Accept: application/json
```

## Global Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ },
  "errorCode": null
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errorCode": "ERROR_CODE"
}
```

---

## 1. Authentication & Token Validation

### 1.1 Validate JWT Token

**Purpose**: Verify JWT token received from Unity Hub is valid

**Endpoint**: Handled automatically by backend filter
**Method**: All `/api/*` endpoints validate tokens automatically
**Headers**: `Authorization: Bearer <token>`

**Token Structure Expected**:
```json
{
  "sub": "user-uuid",
  "userId": "user-uuid",
  "username": "player123",
  "email": "player@example.com",
  "roles": ["user"],
  "iss": "your-sso-issuer",
  "aud": "gachapon-backend",
  "exp": 1704067200,
  "iat": 1704063600
}
```

**Implementation Note**:
- Token validation happens at filter level (JwtAuthenticationFilter.java:30)
- Invalid tokens return 401 with message
- Frontend should redirect to Unity Hub if 401 received

---

## 2. Machine Discovery

### 2.1 List All Available Machines

**Purpose**: Display available Gachapon machines to players

```http
GET /api/v1/machines
```

**Auth Required**: ✅ Yes (Bearer token)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `AVAILABLE`, `IN_USE`, `MAINTENANCE` |
| `search` | string | No | Search in machine name or description |
| `merchantLocationId` | UUID | No | Filter by location |
| `page` | integer | No | Page number (default: 0) |
| `size` | integer | No | Items per page (default: 20) |
| `sort` | string | No | Sort field: `name`, `serialNumber`, `createdAt` |
| `order` | string | No | Sort order: `ASC`, `DESC` |

**Example Request**:
```http
GET /api/v1/machines?status=AVAILABLE&page=0&size=10
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "machineId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Lucky Gachapon #1",
        "serialNumber": "GAC-001",
        "machineType": "STANDARD",
        "status": "AVAILABLE",
        "pricePerDraw": 5.00,
        "currency": "MYR",
        "location": {
          "merchantLocationId": "location-uuid",
          "name": "Pavilion KL - Ground Floor",
          "address": "168, Jalan Bukit Bintang, Kuala Lumpur"
        },
        "description": "Pokemon themed capsules",
        "imageUrl": "https://cdn.example.com/machine-001.jpg",
        "isOnline": true,
        "lastHeartbeat": "2025-11-20T10:30:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5,
    "first": true,
    "last": false
  }
}
```

**Frontend Usage**:
```typescript
// Dashboard: Show all available machines
const machines = await fetch('/api/v1/machines?status=AVAILABLE', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 2.2 Get Machine Details

**Purpose**: Get detailed information about a specific machine

```http
GET /api/v1/machines/{machineId}
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `machineId` | UUID | Yes | Machine identifier |

**Example Request**:
```http
GET /api/v1/machines/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "machineId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Lucky Gachapon #1",
    "serialNumber": "GAC-001",
    "machineType": "STANDARD",
    "status": "AVAILABLE",
    "pricePerDraw": 5.00,
    "currency": "MYR",
    "location": {
      "merchantLocationId": "location-uuid",
      "name": "Pavilion KL - Ground Floor",
      "address": "168, Jalan Bukit Bintang, Kuala Lumpur",
      "city": "Kuala Lumpur",
      "state": "Federal Territory",
      "country": "Malaysia",
      "postalCode": "55100"
    },
    "description": "Pokemon themed capsules with rare collectibles",
    "imageUrl": "https://cdn.example.com/machine-001.jpg",
    "featuredPrizes": [
      {
        "productId": "prize-uuid-1",
        "name": "Pikachu Holographic Card",
        "imageUrl": "https://cdn.example.com/prize-1.jpg",
        "rarity": "LEGENDARY"
      },
      {
        "productId": "prize-uuid-2",
        "name": "Charizard Keychain",
        "imageUrl": "https://cdn.example.com/prize-2.jpg",
        "rarity": "RARE"
      }
    ],
    "isOnline": true,
    "lastHeartbeat": "2025-11-20T10:30:00Z",
    "owner": {
      "ownerType": "MERCHANT",
      "ownerId": "merchant-uuid",
      "ownerName": "Lucky Toys Co."
    }
  }
}
```

**Frontend Usage**:
```typescript
// Machine detail page before play
const machine = await fetch(`/api/v1/machines/${machineId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 3. QR Code Management

### 3.1 Generate QR Code for Play

**Purpose**: Generate QR code containing user session for machine scanning

```http
POST /api/v1/user-activity/qr-codes/generate
```

**Auth Required**: ✅ Yes (Roles: `user`, `admin`)

**Request Body**:
```json
{
  "ttlMinutes": 2  // Optional, defaults to 15 minutes
}
```

**Example Request**:
```http
POST /api/v1/user-activity/qr-codes/generate
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "ttlMinutes": 2
}
```

**Response** (201 CREATED):
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "code": "AES_ENCRYPTED_STRING_BASE64_ENCODED",
    "expiresAt": "2025-11-20T10:32:00Z",
    "ttlMinutes": 2,
    "userId": "user-uuid"
  }
}
```

**QR Code Content Structure**:
```
Encrypted JSON:
{
  "userId": "user-uuid",
  "sessionId": "session-uuid",
  "timestamp": 1700475600000,
  "signature": "hmac-signature"
}
```

**Frontend Usage**:
```typescript
// After payment confirmation
const qrData = await generateQRCode({ ttlMinutes: 2 });
// Display QR code with countdown timer
displayQR(qrData.code, qrData.expiresAt);
```

**Important Notes**:
- QR code expires after 2 minutes (recommended for play flow)
- Backend uses AES encryption with secret key
- Machine backend validates and decrypts QR code
- Redis stores used QR codes to prevent replay attacks

---

### 3.2 Validate QR Code (Machine-Side)

**Purpose**: Validate QR code when machine scans (PUBLIC endpoint for machine)

```http
POST /api/v1/user-activity/qr-codes/validate
```

**Auth Required**: ❌ No (Public endpoint for IoT devices)

**Request Body**:
```json
{
  "code": "AES_ENCRYPTED_STRING_BASE64_ENCODED"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "QR code validated successfully",
  "data": {
    "valid": true,
    "userId": "user-uuid",
    "username": "player123",
    "sessionId": "session-uuid",
    "message": "QR code is valid and ready for use"
  }
}
```

**Response** (Invalid/Expired):
```json
{
  "success": true,
  "data": {
    "valid": false,
    "message": "QR code expired or already used"
  }
}
```

**Frontend Usage**:
```typescript
// Not typically called by frontend
// Machine backend validates QR after scanning
// Frontend polls payment/session status instead
```

---

## 4. Payment Flow

### 4.1 Preview Payment (Before Purchase)

**Purpose**: Calculate final price with tax and event discounts

```http
POST /api/v1/payments/preview
```

**Auth Required**: ❌ No (Guest preview allowed)

**Request Body**:
```json
{
  "machineId": "550e8400-e29b-41d4-a716-446655440000",
  "drawCount": 3,
  "userId": "user-uuid"  // Optional, include for event discount calculation
}
```

**Example Request**:
```http
POST /api/v1/payments/preview
Content-Type: application/json

{
  "machineId": "550e8400-e29b-41d4-a716-446655440000",
  "drawCount": 3,
  "userId": "user-uuid"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment preview generated successfully",
  "data": {
    "machineId": "550e8400-e29b-41d4-a716-446655440000",
    "machineName": "Lucky Gachapon #1",
    "drawCount": 3,
    "basePrice": 5.00,
    "subtotal": 15.00,
    "taxRate": 0.08,
    "taxAmount": 1.20,
    "totalBeforeDiscount": 16.20,
    "currency": "MYR",
    "applicableEvents": [
      {
        "eventId": "event-uuid",
        "eventName": "Christmas Special - Free Play",
        "eventType": "DRAW_COUNT",
        "discountType": "FREE_ITEM",
        "discountAmount": 5.00,
        "discountDescription": "1 free draw for every 3 draws",
        "finalPrice": 16.20,
        "freeDrawsAwarded": 1
      }
    ],
    "hasActiveVoucher": true,
    "voucherDiscount": 2.00,
    "finalPrice": 14.20,
    "breakdown": {
      "basePrice": "RM 5.00 × 3 draws",
      "subtotal": "RM 15.00",
      "tax": "RM 1.20 (8%)",
      "eventDiscount": "+1 free draw",
      "voucherDiscount": "-RM 2.00",
      "total": "RM 14.20"
    }
  }
}
```

**Frontend Usage**:
```typescript
// Checkout page: Show price before payment
const preview = await fetch('/api/v1/payments/preview', {
  method: 'POST',
  body: JSON.stringify({
    machineId: selectedMachine.id,
    drawCount: 3,
    userId: currentUser.id
  })
});
// Display breakdown and get user confirmation
```

---

### 4.2 Create Payment

**Purpose**: Create payment intent and get Airwallex client secret

```http
POST /api/v1/payments
```

**Auth Required**: ✅ Yes (Roles: `USER`)

**Request Body**:
```json
{
  "machineId": "550e8400-e29b-41d4-a716-446655440000",
  "drawCount": 3,
  "eventId": "event-uuid",  // Optional, if applying event discount
  "voucherId": "voucher-uuid"  // Optional, if using voucher
}
```

**Example Request**:
```http
POST /api/v1/payments
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "machineId": "550e8400-e29b-41d4-a716-446655440000",
  "drawCount": 3,
  "eventId": "event-uuid"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "paymentId": "payment-uuid",
    "status": "PENDING",
    "amount": 14.20,
    "currency": "MYR",
    "drawCount": 3,
    "freeDrawsAwarded": 1,
    "airwallexClientSecret": "eyJhbGc...client-secret-for-sdk",
    "airwallexPaymentIntentId": "int_hkdm...airwallex-id",
    "machineId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid",
    "eventApplied": {
      "eventId": "event-uuid",
      "eventName": "Christmas Special",
      "discountAmount": 5.00
    },
    "createdAt": "2025-11-20T10:00:00Z",
    "expiresAt": "2025-11-20T10:15:00Z"
  }
}
```

**Frontend Usage**:
```typescript
// After user confirms payment preview
const payment = await createPayment({
  machineId: selectedMachine.id,
  drawCount: 3,
  eventId: selectedEvent?.id
});

// Initialize Airwallex SDK with clientSecret
await airwallex.confirmPaymentIntent({
  clientSecret: payment.airwallexClientSecret,
  paymentMethod: userSelectedMethod
});

// Then poll payment status
```

---

### 4.3 Get Payment Status

**Purpose**: Check payment completion and retrieve details

```http
GET /api/v1/payments/{paymentId}
```

**Auth Required**: ✅ Yes (Roles: `USER`, `ADMIN`)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paymentId` | UUID | Yes | Payment identifier |

**Example Request**:
```http
GET /api/v1/payments/payment-uuid
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "paymentId": "payment-uuid",
    "userId": "user-uuid",
    "machineId": "550e8400-e29b-41d4-a716-446655440000",
    "machineName": "Lucky Gachapon #1",
    "status": "SUCCEEDED",  // PENDING, SUCCEEDED, FAILED, CANCELLED
    "amount": 14.20,
    "currency": "MYR",
    "drawCount": 3,
    "freeDrawsAwarded": 1,
    "totalDrawsGranted": 4,
    "eventId": "event-uuid",
    "eventName": "Christmas Special",
    "airwallexPaymentIntentId": "int_hkdm...",
    "paymentMethod": "card",
    "cardLast4": "4242",
    "transactionId": "txn-uuid",
    "createdAt": "2025-11-20T10:00:00Z",
    "confirmedAt": "2025-11-20T10:05:12Z",
    "updatedAt": "2025-11-20T10:05:12Z"
  }
}
```

**Status Flow**:
```
PENDING → SUCCEEDED ✅
        → FAILED ❌
        → CANCELLED ⛔
```

**Frontend Usage**:
```typescript
// Poll after Airwallex payment complete
const checkStatus = async () => {
  const payment = await fetch(`/api/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (payment.status === 'SUCCEEDED') {
    // Show QR code
    generateQRCode();
  } else if (payment.status === 'FAILED') {
    // Show error
  }
};

// Poll every 2 seconds, max 30 seconds
const pollInterval = setInterval(checkStatus, 2000);
setTimeout(() => clearInterval(pollInterval), 30000);
```

---

### 4.4 Cancel Payment

**Purpose**: Cancel pending payment

```http
POST /api/v1/payments/{paymentId}/cancel
```

**Auth Required**: ✅ Yes (Roles: `USER`)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paymentId` | UUID | Yes | Payment identifier |

**Example Request**:
```http
POST /api/v1/payments/payment-uuid/cancel
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "paymentId": "payment-uuid",
    "status": "CANCELLED",
    "cancelledAt": "2025-11-20T10:03:00Z"
  }
}
```

**Frontend Usage**:
```typescript
// User clicks "Cancel Payment" before completing
await cancelPayment(paymentId);
```

---

## 5. Product & Prize Catalog

### 5.1 Browse Products (Prizes)

**Purpose**: View available prizes in catalog

```http
GET /api/v1/products
```

**Auth Required**: ✅ Yes

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | UUID | No | Filter by category |
| `merchantId` | string | No | Filter by merchant |
| `status` | string | No | `ACTIVE`, `INACTIVE`, `DISCONTINUED` |
| `isFeatured` | boolean | No | Show only featured items |
| `search` | string | No | Search in name/description |
| `page` | integer | No | Page number (default: 0) |
| `size` | integer | No | Items per page (default: 20) |
| `sort` | string | No | `name`, `basePrice`, `createdAt` |
| `order` | string | No | `ASC`, `DESC` |

**Example Request**:
```http
GET /api/v1/products?status=ACTIVE&isFeatured=true&page=0&size=20
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "productId": "product-uuid",
      "name": "Pikachu Holographic Card",
      "description": "Limited edition holographic Pokemon card",
      "sku": "PKM-PIKA-HOL-001",
      "basePrice": 15.00,
      "currency": "MYR",
      "categoryId": "category-uuid",
      "categoryName": "Trading Cards",
      "merchantId": "merchant-uuid",
      "merchantName": "Lucky Toys Co.",
      "imageUrl": "https://cdn.example.com/pikachu-card.jpg",
      "thumbnailUrl": "https://cdn.example.com/pikachu-card-thumb.jpg",
      "status": "ACTIVE",
      "isFeatured": true,
      "rarity": "LEGENDARY",
      "stockQuantity": 50,
      "isLowStock": false,
      "tags": ["pokemon", "holographic", "limited-edition"],
      "dimensions": {
        "width": 6.3,
        "height": 8.8,
        "unit": "cm"
      },
      "weight": {
        "value": 5.0,
        "unit": "g"
      }
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

**Frontend Usage**:
```typescript
// Prize catalog page
const prizes = await fetch('/api/v1/products?status=ACTIVE', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 5.2 Get Featured Products

**Purpose**: Get homepage featured prizes

```http
GET /api/v1/products/featured
```

**Auth Required**: ✅ Yes

**Example Request**:
```http
GET /api/v1/products/featured
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "productId": "product-uuid",
      "name": "Pikachu Holographic Card",
      "imageUrl": "https://cdn.example.com/pikachu-card.jpg",
      "basePrice": 15.00,
      "currency": "MYR",
      "rarity": "LEGENDARY",
      "isFeatured": true
    }
  ]
}
```

**Frontend Usage**:
```typescript
// Dashboard featured section
const featured = await fetch('/api/v1/products/featured', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 5.3 Get Product Categories

**Purpose**: Browse prize categories for filtering

```http
GET /api/v1/categories/root/active
```

**Auth Required**: ✅ Yes

**Example Request**:
```http
GET /api/v1/categories/root/active
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "categoryId": "category-uuid",
      "name": "Trading Cards",
      "description": "Collectible trading cards from various franchises",
      "imageUrl": "https://cdn.example.com/category-cards.jpg",
      "parentCategoryId": null,
      "level": 0,
      "displayOrder": 1,
      "isActive": true,
      "productCount": 45,
      "hasSubcategories": true
    },
    {
      "categoryId": "category-uuid-2",
      "name": "Keychains",
      "description": "Character keychains and accessories",
      "imageUrl": "https://cdn.example.com/category-keychains.jpg",
      "parentCategoryId": null,
      "level": 0,
      "displayOrder": 2,
      "isActive": true,
      "productCount": 78,
      "hasSubcategories": false
    }
  ]
}
```

**Frontend Usage**:
```typescript
// Category filter dropdown
const categories = await fetch('/api/v1/categories/root/active', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 5.4 Get Products by Category

**Purpose**: Filter prizes by category

```http
GET /api/v1/products/category/{categoryId}
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | UUID | Yes | Category identifier |

**Example Request**:
```http
GET /api/v1/products/category/category-uuid
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "productId": "product-uuid",
      "name": "Pikachu Holographic Card",
      "categoryName": "Trading Cards",
      "basePrice": 15.00,
      "imageUrl": "https://cdn.example.com/pikachu-card.jpg"
    }
  ]
}
```

---

## 6. Merchant Events (Promotions)

### 6.1 Browse Active Events

**Purpose**: View available promotions and rewards

```http
GET /api/v1/merchant-events
```

**Auth Required**: ✅ Yes

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventStatus` | string | No | `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `joinMode` | string | No | `MANUAL`, `AUTO` |
| `eventType` | string | No | `SPEND_THRESHOLD`, `DRAW_COUNT`, `SPIN_COUNT` |
| `merchantId` | UUID | No | Filter by merchant |
| `isActive` | boolean | No | Only active events (recommended: `true`) |
| `page` | integer | No | Page number (default: 0) |
| `size` | integer | No | Items per page (default: 20) |

**Example Request**:
```http
GET /api/v1/merchant-events?eventStatus=ACTIVE&isActive=true
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "eventId": "event-uuid",
      "eventName": "Christmas Special - Free Play",
      "description": "Get 1 free draw for every 3 draws purchased during the holiday season!",
      "merchantId": "merchant-uuid",
      "merchantName": "Lucky Toys Co.",
      "eventStatus": "ACTIVE",
      "joinMode": "AUTO",
      "eventType": "DRAW_COUNT",
      "startDate": "2025-12-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "targetValue": 3.0,
      "rewardType": "FREE_DRAW",
      "rewardValue": 1.0,
      "rewardDescription": "1 Free Draw",
      "maxRedemptions": 5,
      "currentParticipants": 1250,
      "eligibilityCriteria": {
        "minPurchaseAmount": null,
        "minDrawCount": 3,
        "eligibleMachineIds": [
          "machine-uuid-1",
          "machine-uuid-2"
        ],
        "eligibleProductCategoryIds": null,
        "requiresManualJoin": false
      },
      "bannerImageUrl": "https://cdn.example.com/event-christmas.jpg",
      "termsAndConditions": "Valid only at participating locations. Maximum 5 redemptions per user."
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

**Event Types**:
- `SPEND_THRESHOLD`: Based on total spending amount
- `DRAW_COUNT`: Based on number of plays
- `SPIN_COUNT`: Based on machine spins (alternative metric)

**Join Modes**:
- `AUTO`: User automatically enrolled (backend handles)
- `MANUAL`: User must explicitly join

**Frontend Usage**:
```typescript
// Promotions page
const events = await fetch('/api/v1/merchant-events?eventStatus=ACTIVE', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 6.2 Get Event Details

**Purpose**: View full event information

```http
GET /api/v1/merchant-events/{eventId}
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | UUID | Yes | Event identifier |

**Example Request**:
```http
GET /api/v1/merchant-events/event-uuid
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "eventId": "event-uuid",
    "eventName": "Christmas Special - Free Play",
    "description": "Detailed description with full terms...",
    "merchantId": "merchant-uuid",
    "merchantName": "Lucky Toys Co.",
    "eventStatus": "ACTIVE",
    "joinMode": "AUTO",
    "eventType": "DRAW_COUNT",
    "startDate": "2025-12-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "targetValue": 3.0,
    "rewardType": "FREE_DRAW",
    "rewardValue": 1.0,
    "rewardDescription": "1 Free Draw",
    "maxRedemptions": 5,
    "currentParticipants": 1250,
    "eligibilityCriteria": {
      "minPurchaseAmount": null,
      "minDrawCount": 3,
      "eligibleMachineIds": ["machine-uuid-1", "machine-uuid-2"],
      "eligibleProductCategoryIds": null
    },
    "bannerImageUrl": "https://cdn.example.com/event-christmas.jpg",
    "termsAndConditions": "Full T&C text..."
  }
}
```

---

### 6.3 Join Event (Manual Events Only)

**Purpose**: Manually opt-in to an event

```http
POST /api/v1/merchant-events/join
```

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "eventId": "event-uuid",
  "userId": "user-uuid"
}
```

**Example Request**:
```http
POST /api/v1/merchant-events/join
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "eventId": "event-uuid",
  "userId": "user-uuid"
}
```

**Response** (201 CREATED):
```json
{
  "success": true,
  "message": "Successfully joined event",
  "data": {
    "participationId": "participation-uuid",
    "eventId": "event-uuid",
    "eventName": "Christmas Special",
    "userId": "user-uuid",
    "status": "ACTIVE",
    "progress": 0.0,
    "targetValue": 3.0,
    "progressPercentage": 0.0,
    "isEligible": true,
    "canRedeem": false,
    "hasRedeemed": false,
    "redemptionCount": 0,
    "maxRedemptions": 5,
    "joinedAt": "2025-11-20T10:00:00Z"
  }
}
```

**Frontend Usage**:
```typescript
// Event detail page: "Join Event" button
const participation = await joinEvent({
  eventId: event.id,
  userId: currentUser.id
});
```

---

### 6.4 Get User's Event Participation

**Purpose**: Check progress in an event

```http
GET /api/v1/merchant-events/{eventId}/participation/{userId}
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | UUID | Yes | Event identifier |
| `userId` | string | Yes | User identifier |

**Example Request**:
```http
GET /api/v1/merchant-events/event-uuid/participation/user-uuid
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "participationId": "participation-uuid",
    "eventId": "event-uuid",
    "eventName": "Christmas Special",
    "userId": "user-uuid",
    "status": "ACTIVE",
    "progress": 2.0,
    "targetValue": 3.0,
    "progressPercentage": 66.67,
    "remainingToTarget": 1.0,
    "isEligible": true,
    "canRedeem": false,
    "hasRedeemed": false,
    "redemptionCount": 0,
    "maxRedemptions": 5,
    "remainingRedemptions": 5,
    "joinedAt": "2025-11-20T08:00:00Z",
    "lastUpdated": "2025-11-20T09:45:00Z",
    "nextMilestone": {
      "description": "1 more draw to unlock reward",
      "progressNeeded": 1.0
    }
  }
}
```

**Frontend Usage**:
```typescript
// Event progress widget on dashboard
const participation = await fetch(
  `/api/v1/merchant-events/${eventId}/participation/${userId}`,
  { headers: { Authorization: `Bearer ${token}` }}
);

// Show progress bar: progress / targetValue * 100%
// Enable "Claim Reward" button when canRedeem === true
```

---

### 6.5 Get All User Participations

**Purpose**: View all events user is participating in

```http
GET /api/v1/merchant-events/user/{userId}/participations
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier |

**Example Request**:
```http
GET /api/v1/merchant-events/user/user-uuid/participations
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "participationId": "participation-uuid-1",
      "eventId": "event-uuid-1",
      "eventName": "Christmas Special",
      "progress": 2.0,
      "targetValue": 3.0,
      "progressPercentage": 66.67,
      "canRedeem": false,
      "status": "ACTIVE"
    },
    {
      "participationId": "participation-uuid-2",
      "eventId": "event-uuid-2",
      "eventName": "New Year Bonus",
      "progress": 5.0,
      "targetValue": 5.0,
      "progressPercentage": 100.0,
      "canRedeem": true,
      "status": "ELIGIBLE_FOR_REDEMPTION"
    }
  ]
}
```

**Frontend Usage**:
```typescript
// My Events page
const participations = await fetch(
  `/api/v1/merchant-events/user/${userId}/participations`,
  { headers: { Authorization: `Bearer ${token}` }}
);
```

---

### 6.6 Redeem Event Reward

**Purpose**: Claim reward when target reached

```http
POST /api/v1/merchant-events/{eventId}/redeem/{userId}
```

**Auth Required**: ✅ Yes

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | UUID | Yes | Event identifier |
| `userId` | string | Yes | User identifier |

**Example Request**:
```http
POST /api/v1/merchant-events/event-uuid/redeem/user-uuid
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Reward redeemed successfully",
  "data": {
    "participationId": "participation-uuid",
    "eventId": "event-uuid",
    "eventName": "Christmas Special",
    "rewardType": "FREE_DRAW",
    "rewardValue": 1.0,
    "rewardDescription": "1 Free Draw",
    "hasRedeemed": true,
    "redeemedAt": "2025-11-20T11:00:00Z",
    "redemptionCount": 1,
    "maxRedemptions": 5,
    "remainingRedemptions": 4,
    "voucherCode": "FREE-DRAW-XMAS-2025-ABC123",
    "voucherExpiresAt": "2025-12-31T23:59:59Z"
  }
}
```

**Response** (400 BAD REQUEST) - Not eligible:
```json
{
  "success": false,
  "message": "Redemption not available",
  "errorCode": "NOT_ELIGIBLE",
  "data": {
    "reason": "Target not reached",
    "currentProgress": 2.0,
    "targetValue": 3.0,
    "remainingToTarget": 1.0
  }
}
```

**Frontend Usage**:
```typescript
// "Claim Reward" button click handler
const redemption = await fetch(
  `/api/v1/merchant-events/${eventId}/redeem/${userId}`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }
);

// Show success modal with voucher code
showSuccessModal(redemption.voucherCode);
```

---

## 7. Player History & Inventory

### 7.1 Get Payment History (TODO - Not Implemented)

**Purpose**: View past payment transactions

```http
GET /api/v1/payments/user/{userId}
```

**Auth Required**: ✅ Yes (Roles: `USER`, `ADMIN`)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by payment status |
| `page` | integer | No | Page number (default: 0) |
| `size` | integer | No | Items per page (default: 20) |

**Current Status**: ⚠️ **TODO** (Returns placeholder at PaymentController.java:167)

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": "Paginated payments - to be implemented"
}
```

**Workaround**: Use frontend local storage to cache payment records temporarily

---

## 8. Support & Utility

### 8.1 Get Active Tax Rates

**Purpose**: Calculate tax for price display

```http
GET /api/v1/tax-rates/active
```

**Auth Required**: ✅ Yes

**Example Request**:
```http
GET /api/v1/tax-rates/active
Authorization: Bearer eyJhbGc...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "taxRateId": "tax-uuid",
      "taxCode": "MY-SST",
      "taxName": "Malaysia Sales and Service Tax",
      "taxType": "SALES_TAX",
      "rate": 0.08,
      "jurisdiction": "Malaysia",
      "effectiveDate": "2024-01-01T00:00:00Z",
      "endDate": null,
      "isActive": true
    }
  ]
}
```

**Frontend Usage**:
```typescript
// Load once on app start, cache for session
const taxRates = await fetch('/api/v1/tax-rates/active', {
  headers: { Authorization: `Bearer ${token}` }
});

// Calculate tax on checkout
const calculateTax = (subtotal) => {
  const taxRate = taxRates[0].rate; // 0.08
  return subtotal * taxRate;
};
```

---

## 9. Error Codes Reference

### Authentication Errors
| Code | HTTP Status | Message | Action |
|------|-------------|---------|--------|
| `UNAUTHORIZED` | 401 | Authorization header required | Redirect to Unity login |
| `TOKEN_EXPIRED` | 401 | Token has expired | Request new token from Unity |
| `INVALID_TOKEN` | 401 | Invalid token | Redirect to Unity login |

### Payment Errors
| Code | HTTP Status | Message | Action |
|------|-------------|---------|--------|
| `PAYMENT_FAILED` | 400 | Payment processing failed | Show error, retry option |
| `INSUFFICIENT_FUNDS` | 400 | Insufficient balance | Prompt add payment method |
| `PAYMENT_EXPIRED` | 400 | Payment session expired | Create new payment |

### Event Errors
| Code | HTTP Status | Message | Action |
|------|-------------|---------|--------|
| `NOT_ELIGIBLE` | 400 | Not eligible for event | Show eligibility criteria |
| `ALREADY_REDEEMED` | 400 | Reward already claimed | Disable redeem button |
| `EVENT_EXPIRED` | 400 | Event has ended | Hide event from list |

### Resource Errors
| Code | HTTP Status | Message | Action |
|------|-------------|---------|--------|
| `NOT_FOUND` | 404 | Resource not found | Show 404 page |
| `MACHINE_OFFLINE` | 400 | Machine is offline | Disable play button |

---

## 10. Rate Limits & Performance

### Rate Limiting
- **Standard Endpoints**: 100 requests/minute per user
- **Payment Endpoints**: 10 requests/minute per user
- **QR Generation**: 5 requests/minute per user

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700476200
```

### Response Times (SLA)
- **Authentication**: < 200ms
- **Machine List**: < 500ms
- **Payment Creation**: < 1s
- **QR Generation**: < 300ms

### Polling Guidelines
- **Payment Status**: Poll every 2s, timeout after 30s
- **Session Status**: Poll every 2s, timeout after 2min
- **Machine Status**: Refresh every 30s

---

## 11. Development Workflow

### Step 1: Setup Environment

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8096/api/v1
VITE_USE_MOCK_AUTH=true
VITE_MOCK_TOKEN=eyJhbGc...
```

### Step 2: Mock Token for Development

```typescript
// Mock JWT for local development
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXV1aWQiLCJ1c2VySWQiOiJ1c2VyLXV1aWQiLCJ1c2VybmFtZSI6InBsYXllcjEyMyIsImVtYWlsIjoicGxheWVyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciJdLCJpc3MiOiJnYWNoYXBvbi1kZXYtYXV0aCIsImF1ZCI6ImdhY2hhcG9uLWJhY2tlbmQtZGV2IiwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE3MDA0NzU2MDB9';

// Use mock in development
const token = import.meta.env.DEV ? MOCK_TOKEN : urlParams.get('token');
```

### Step 3: API Client Setup

```typescript
// api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  }
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to Unity login
      window.location.href = 'unity://back-to-hub';
    }
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
};
```

---

## 12. Production Checklist

### Before Deployment

- [ ] Replace mock tokens with real Unity-provided tokens
- [ ] Update API base URL to production
- [ ] Test token validation with Friend A's auth service
- [ ] Verify Airwallex payment integration
- [ ] Test QR code encryption/decryption with machine backend
- [ ] Validate all error handling paths
- [ ] Test Unity WebView communication
- [ ] Verify back button behavior
- [ ] Test on actual iOS/Android devices
- [ ] Performance test with real network conditions

### Security Checklist

- [ ] Never log JWT tokens
- [ ] Always use HTTPS in production
- [ ] Validate all user inputs
- [ ] Handle token expiry gracefully
- [ ] Implement request retry with exponential backoff
- [ ] Sanitize user-generated content
- [ ] Implement CSRF protection if needed
- [ ] Validate payment amounts on backend

---

## 13. TypeScript Interfaces

```typescript
// types/api.ts

export interface Machine {
  machineId: string;
  name: string;
  serialNumber: string;
  machineType: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  pricePerDraw: number;
  currency: string;
  location: {
    merchantLocationId: string;
    name: string;
    address: string;
  };
  description?: string;
  imageUrl?: string;
  isOnline: boolean;
  lastHeartbeat: string;
}

export interface QRCode {
  code: string;
  expiresAt: string;
  ttlMinutes: number;
  userId: string;
}

export interface PaymentPreview {
  machineId: string;
  machineName: string;
  drawCount: number;
  basePrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalBeforeDiscount: number;
  currency: string;
  applicableEvents: EventDiscount[];
  hasActiveVoucher: boolean;
  voucherDiscount?: number;
  finalPrice: number;
}

export interface Payment {
  paymentId: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  drawCount: number;
  freeDrawsAwarded?: number;
  airwallexClientSecret: string;
  airwallexPaymentIntentId: string;
  machineId: string;
  userId: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  isFeatured: boolean;
  rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
  stockQuantity: number;
}

export interface Event {
  eventId: string;
  eventName: string;
  description: string;
  merchantId: string;
  merchantName: string;
  eventStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  joinMode: 'MANUAL' | 'AUTO';
  eventType: 'SPEND_THRESHOLD' | 'DRAW_COUNT' | 'SPIN_COUNT';
  startDate: string;
  endDate: string;
  targetValue: number;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
  maxRedemptions: number;
}

export interface EventParticipation {
  participationId: string;
  eventId: string;
  eventName: string;
  userId: string;
  status: string;
  progress: number;
  targetValue: number;
  progressPercentage: number;
  isEligible: boolean;
  canRedeem: boolean;
  hasRedeemed: boolean;
  redemptionCount: number;
  maxRedemptions: number;
  joinedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

---

## 14. Quick Reference

### Most Used Endpoints (Player Flow)

```typescript
// 1. Load machines on dashboard
GET /api/v1/machines?status=AVAILABLE

// 2. View machine details
GET /api/v1/machines/{machineId}

// 3. Check active events
GET /api/v1/merchant-events?eventStatus=ACTIVE

// 4. Preview payment
POST /api/v1/payments/preview

// 5. Create payment
POST /api/v1/payments

// 6. Generate QR code
POST /api/v1/user-activity/qr-codes/generate

// 7. Poll payment status
GET /api/v1/payments/{paymentId}

// 8. Check event progress
GET /api/v1/merchant-events/{eventId}/participation/{userId}

// 9. Redeem reward
POST /api/v1/merchant-events/{eventId}/redeem/{userId}
```

---

## 9. TypeScript API Client

### 9.1 Core API Client

```typescript
// src/lib/api/client.ts

interface ApiConfig {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
  timeout?: number;
}

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.config.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(
        `${this.config.baseUrl}${endpoint}`,
        {
          ...options,
          headers,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 'TIMEOUT');
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    if (response.status === 401) {
      this.config.onUnauthorized?.();
      throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        `HTTP ${response.status}`,
        'HTTP_ERROR',
        response.status
      );
    }

    throw new ApiError(
      errorData.message || 'Request failed',
      errorData.errorCode || 'API_ERROR',
      response.status,
      errorData
    );
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const createApiClient = (config: ApiConfig) => new ApiClient(config);
export { ApiError };
export type { ApiConfig };
```

### 9.2 Machine Service

```typescript
// src/lib/api/services/machine.service.ts

import type { ApiClient } from '../client';
import type { Machine, PaginatedResponse } from '../types';

export class MachineService {
  constructor(private client: ApiClient) {}

  /**
   * Get all available machines
   */
  async listMachines(params?: {
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    search?: string;
    merchantLocationId?: string;
    page?: number;
    size?: number;
    sort?: 'name' | 'serialNumber' | 'createdAt';
    order?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Machine>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = `/machines${query ? `?${query}` : ''}`;

    const response = await this.client.get<PaginatedResponse<Machine>>(endpoint);
    return response.data;
  }

  /**
   * Get machine details by ID
   */
  async getMachine(machineId: string): Promise<Machine> {
    const response = await this.client.get<Machine>(`/machines/${machineId}`);
    return response.data;
  }

  /**
   * Get available machines near user (convenience method)
   */
  async getAvailableMachines(limit = 10): Promise<Machine[]> {
    const result = await this.listMachines({
      status: 'AVAILABLE',
      page: 0,
      size: limit,
      sort: 'name',
      order: 'ASC'
    });
    return result.content;
  }
}
```

### 9.3 QR Code Service

```typescript
// src/lib/api/services/qrcode.service.ts

import type { ApiClient } from '../client';
import type { QRCode, QRCodeValidation } from '../types';

export class QRCodeService {
  constructor(private client: ApiClient) {}

  /**
   * Generate QR code for machine play
   */
  async generateQRCode(ttlMinutes: number = 2): Promise<QRCode> {
    const response = await this.client.post<QRCode>(
      '/user-activity/qr-codes/generate',
      { ttlMinutes }
    );
    return response.data;
  }

  /**
   * Validate QR code (typically called by machine backend)
   */
  async validateQRCode(code: string): Promise<QRCodeValidation> {
    const response = await this.client.post<QRCodeValidation>(
      '/user-activity/qr-codes/validate',
      { code }
    );
    return response.data;
  }
}
```

### 9.4 Payment Service

```typescript
// src/lib/api/services/payment.service.ts

import type { ApiClient } from '../client';
import type { PaymentPreview, Payment, PaymentCreateRequest } from '../types';

export class PaymentService {
  constructor(private client: ApiClient) {}

  /**
   * Preview payment before purchase
   */
  async previewPayment(request: {
    machineId: string;
    drawCount: number;
    userId?: string;
  }): Promise<PaymentPreview> {
    const response = await this.client.post<PaymentPreview>(
      '/payments/preview',
      request
    );
    return response.data;
  }

  /**
   * Create payment intent
   */
  async createPayment(request: PaymentCreateRequest): Promise<Payment> {
    const response = await this.client.post<Payment>('/payments', request);
    return response.data;
  }

  /**
   * Get payment status
   */
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await this.client.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const response = await this.client.post<Payment>(
      `/payments/${paymentId}/cancel`
    );
    return response.data;
  }

  /**
   * Poll payment status until completed or timeout
   */
  async pollPaymentStatus(
    paymentId: string,
    options: {
      interval?: number;
      timeout?: number;
      onUpdate?: (payment: Payment) => void;
    } = {}
  ): Promise<Payment> {
    const { interval = 2000, timeout = 30000, onUpdate } = options;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const payment = await this.getPayment(paymentId);
          onUpdate?.(payment);

          if (payment.status === 'SUCCEEDED' || payment.status === 'FAILED') {
            resolve(payment);
            return;
          }

          if (Date.now() - startTime > timeout) {
            reject(new Error('Payment status polling timeout'));
            return;
          }

          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}
```

### 9.5 Product Service

```typescript
// src/lib/api/services/product.service.ts

import type { ApiClient } from '../client';
import type { Product, PaginatedResponse, Category } from '../types';

export class ProductService {
  constructor(private client: ApiClient) {}

  /**
   * Browse products with filters
   */
  async listProducts(params?: {
    categoryId?: string;
    merchantId?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
    isFeatured?: boolean;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;

    const response = await this.client.get<PaginatedResponse<Product>>(endpoint);
    return response.data;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await this.client.get<Product[]>('/products/featured');
    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    const response = await this.client.get<Product>(`/products/${productId}`);
    return response.data;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await this.client.get<Product[]>(
      `/products/category/${categoryId}`
    );
    return response.data;
  }

  /**
   * Get active categories
   */
  async getActiveCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>(
      '/categories/root/active'
    );
    return response.data;
  }
}
```

### 9.6 Event Service

```typescript
// src/lib/api/services/event.service.ts

import type { ApiClient } from '../client';
import type { Event, EventParticipation, PaginatedResponse } from '../types';

export class EventService {
  constructor(private client: ApiClient) {}

  /**
   * Browse active events
   */
  async listEvents(params?: {
    eventStatus?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    joinMode?: 'MANUAL' | 'AUTO';
    eventType?: 'SPEND_THRESHOLD' | 'DRAW_COUNT' | 'SPIN_COUNT';
    merchantId?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Event>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = `/merchant-events${query ? `?${query}` : ''}`;

    const response = await this.client.get<PaginatedResponse<Event>>(endpoint);
    return response.data;
  }

  /**
   * Get event details
   */
  async getEvent(eventId: string): Promise<Event> {
    const response = await this.client.get<Event>(
      `/merchant-events/${eventId}`
    );
    return response.data;
  }

  /**
   * Join manual event
   */
  async joinEvent(eventId: string, userId: string): Promise<EventParticipation> {
    const response = await this.client.post<EventParticipation>(
      '/merchant-events/join',
      { eventId, userId }
    );
    return response.data;
  }

  /**
   * Get user's participation in event
   */
  async getParticipation(
    eventId: string,
    userId: string
  ): Promise<EventParticipation> {
    const response = await this.client.get<EventParticipation>(
      `/merchant-events/${eventId}/participation/${userId}`
    );
    return response.data;
  }

  /**
   * Get all user participations
   */
  async getUserParticipations(userId: string): Promise<EventParticipation[]> {
    const response = await this.client.get<EventParticipation[]>(
      `/merchant-events/user/${userId}/participations`
    );
    return response.data;
  }

  /**
   * Redeem event reward
   */
  async redeemReward(
    eventId: string,
    userId: string
  ): Promise<EventParticipation> {
    const response = await this.client.post<EventParticipation>(
      `/merchant-events/${eventId}/redeem/${userId}`
    );
    return response.data;
  }

  /**
   * Get active events for user (convenience method)
   */
  async getActiveEventsForUser(): Promise<Event[]> {
    const result = await this.listEvents({
      eventStatus: 'ACTIVE',
      isActive: true,
      page: 0,
      size: 50
    });
    return result.content;
  }
}
```

### 9.7 Main API Export

```typescript
// src/lib/api/index.ts

import { createApiClient } from './client';
import { MachineService } from './services/machine.service';
import { QRCodeService } from './services/qrcode.service';
import { PaymentService } from './services/payment.service';
import { ProductService } from './services/product.service';
import { EventService } from './services/event.service';

export class GachaponAPI {
  public machines: MachineService;
  public qrCodes: QRCodeService;
  public payments: PaymentService;
  public products: ProductService;
  public events: EventService;

  constructor(config: {
    baseUrl: string;
    getToken: () => string | null;
    onUnauthorized?: () => void;
  }) {
    const client = createApiClient(config);

    this.machines = new MachineService(client);
    this.qrCodes = new QRCodeService(client);
    this.payments = new PaymentService(client);
    this.products = new ProductService(client);
    this.events = new EventService(client);
  }
}

// Export types
export * from './types';
export { ApiError } from './client';
```

### 9.8 SvelteKit Integration

```typescript
// src/lib/api/svelte.ts

import { writable } from 'svelte/store';
import { GachaponAPI } from './index';
import { browser } from '$app/environment';

// Token store
export const tokenStore = writable<string | null>(null);

// API instance
let apiInstance: GachaponAPI | null = null;

export function initializeAPI(config: {
  baseUrl: string;
  onUnauthorized?: () => void;
}) {
  if (!browser) return null;

  if (!apiInstance) {
    apiInstance = new GachaponAPI({
      ...config,
      getToken: () => {
        let token: string | null = null;
        tokenStore.subscribe(value => token = value)();
        return token;
      }
    });
  }

  return apiInstance;
}

export function getAPI(): GachaponAPI {
  if (!apiInstance) {
    throw new Error('API not initialized. Call initializeAPI first.');
  }
  return apiInstance;
}

// Convenience hook for components
export function useAPI() {
  return getAPI();
}
```

### 9.9 Usage Example

```typescript
// src/routes/+layout.ts (SvelteKit)

import { initializeAPI, tokenStore } from '$lib/api/svelte';
import { browser } from '$app/environment';

export const load = async ({ url }) => {
  if (browser) {
    // Get token from Unity WebView URL
    const token = url.searchParams.get('token');

    if (token) {
      tokenStore.set(token);
    }

    // Initialize API
    initializeAPI({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      onUnauthorized: () => {
        // Redirect back to Unity Hub
        window.location.href = 'unity://back-to-hub';
      }
    });
  }
};
```

```svelte
<!-- src/routes/machines/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { useAPI } from '$lib/api/svelte';
  import type { Machine } from '$lib/api/types';

  const api = useAPI();

  let machines: Machine[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      machines = await api.machines.getAvailableMachines(10);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load machines';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading machines...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <div class="machines-grid">
    {#each machines as machine}
      <div class="machine-card">
        <h3>{machine.name}</h3>
        <p>{machine.location.name}</p>
        <span class="price">RM {machine.pricePerDraw}</span>
      </div>
    {/each}
  </div>
{/if}
```

---

## 10. Mock Service Implementation

### 10.1 Mock Data Generator

```typescript
// src/lib/api/mock/data.ts

import type { Machine, Product, Event, Payment, QRCode } from '../types';

export class MockDataGenerator {
  /**
   * Generate mock machines
   */
  static machines(count: number = 5): Machine[] {
    return Array.from({ length: count }, (_, i) => ({
      machineId: `machine-uuid-${i + 1}`,
      name: `Lucky Gachapon #${i + 1}`,
      serialNumber: `GAC-${String(i + 1).padStart(3, '0')}`,
      machineType: 'STANDARD',
      status: i === 0 ? 'AVAILABLE' : 'AVAILABLE',
      pricePerDraw: 5.0,
      currency: 'MYR',
      location: {
        merchantLocationId: `location-uuid-${i + 1}`,
        name: ['Pavilion KL', 'KLCC', 'Mid Valley', 'Sunway Pyramid'][i % 4],
        address: '168, Jalan Bukit Bintang, Kuala Lumpur',
        city: 'Kuala Lumpur',
        state: 'Federal Territory',
        country: 'Malaysia',
        postalCode: '55100'
      },
      description: 'Pokemon themed capsules with rare collectibles',
      imageUrl: `https://picsum.photos/400/300?random=${i}`,
      featuredPrizes: this.products(3),
      isOnline: true,
      lastHeartbeat: new Date().toISOString(),
      owner: {
        ownerType: 'MERCHANT',
        ownerId: 'merchant-uuid',
        ownerName: 'Lucky Toys Co.'
      }
    }));
  }

  /**
   * Generate mock products
   */
  static products(count: number = 10): Product[] {
    const names = [
      'Pikachu Holographic Card',
      'Charizard Keychain',
      'Bulbasaur Figurine',
      'Squirtle Plush',
      'Mewtwo Trading Card',
      'Eevee Sticker Set',
      'Jigglypuff Badge',
      'Snorlax Cushion',
      'Gengar Poster',
      'Dragonite Model'
    ];

    const rarities = ['COMMON', 'COMMON', 'RARE', 'RARE', 'LEGENDARY'];

    return Array.from({ length: count }, (_, i) => ({
      productId: `product-uuid-${i + 1}`,
      name: names[i % names.length],
      description: `Collectible ${names[i % names.length].toLowerCase()}`,
      sku: `PKM-${String(i + 1).padStart(3, '0')}`,
      basePrice: [5, 10, 15, 20, 25][i % 5],
      currency: 'MYR',
      categoryId: 'category-uuid-1',
      categoryName: ['Trading Cards', 'Keychains', 'Figurines'][i % 3],
      merchantId: 'merchant-uuid',
      merchantName: 'Lucky Toys Co.',
      imageUrl: `https://picsum.photos/300/300?random=${i + 100}`,
      thumbnailUrl: `https://picsum.photos/150/150?random=${i + 100}`,
      status: 'ACTIVE',
      isFeatured: i < 3,
      rarity: rarities[i % rarities.length],
      stockQuantity: Math.floor(Math.random() * 100),
      isLowStock: false,
      tags: ['pokemon', 'collectible'],
      dimensions: { width: 6.3, height: 8.8, unit: 'cm' },
      weight: { value: 5.0, unit: 'g' }
    }));
  }

  /**
   * Generate mock events
   */
  static events(count: number = 3): Event[] {
    return Array.from({ length: count }, (_, i) => ({
      eventId: `event-uuid-${i + 1}`,
      eventName: [
        'Christmas Special - Free Play',
        'New Year Bonus',
        'Lucky Draw Weekend'
      ][i],
      description: 'Get 1 free draw for every 3 draws purchased!',
      merchantId: 'merchant-uuid',
      merchantName: 'Lucky Toys Co.',
      eventStatus: 'ACTIVE',
      joinMode: i === 0 ? 'AUTO' : 'MANUAL',
      eventType: 'DRAW_COUNT',
      startDate: new Date('2025-12-01').toISOString(),
      endDate: new Date('2025-12-31').toISOString(),
      targetValue: 3.0,
      rewardType: 'FREE_DRAW',
      rewardValue: 1.0,
      rewardDescription: '1 Free Draw',
      maxRedemptions: 5,
      currentParticipants: 1250,
      bannerImageUrl: `https://picsum.photos/800/400?random=${i + 200}`,
      termsAndConditions: 'Valid only at participating locations.'
    }));
  }

  /**
   * Generate mock payment
   */
  static payment(overrides?: Partial<Payment>): Payment {
    return {
      paymentId: 'payment-uuid',
      status: 'PENDING',
      amount: 14.20,
      currency: 'MYR',
      drawCount: 3,
      freeDrawsAwarded: 1,
      totalDrawsGranted: 4,
      airwallexClientSecret: 'mock-client-secret',
      airwallexPaymentIntentId: 'int_mock_123',
      machineId: 'machine-uuid-1',
      userId: 'user-uuid',
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate mock QR code
   */
  static qrCode(): QRCode {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    return {
      code: 'MOCK_AES_ENCRYPTED_QR_CODE_BASE64',
      expiresAt: expiresAt.toISOString(),
      ttlMinutes: 2,
      userId: 'user-uuid'
    };
  }
}
```

### 10.2 Mock API Client

```typescript
// src/lib/api/mock/client.ts

import { MockDataGenerator } from './data';
import type {
  Machine, Product, Event, Payment, QRCode,
  PaginatedResponse, ApiResponse
} from '../types';

/**
 * Mock API client for development without backend
 */
export class MockAPIClient {
  private delay = 500; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  private createResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      message: 'Success',
      data,
      errorCode: null
    };
  }

  private createPaginatedResponse<T>(
    items: T[],
    page: number = 0,
    size: number = 20
  ): PaginatedResponse<T> {
    const start = page * size;
    const end = start + size;
    const content = items.slice(start, end);

    return {
      content,
      page,
      size,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
      first: page === 0,
      last: end >= items.length
    };
  }

  // Machine endpoints
  async getMachines(params?: any): Promise<ApiResponse<PaginatedResponse<Machine>>> {
    await this.simulateDelay();
    const machines = MockDataGenerator.machines(10);
    const filtered = params?.status
      ? machines.filter(m => m.status === params.status)
      : machines;

    return this.createResponse(
      this.createPaginatedResponse(filtered, params?.page, params?.size)
    );
  }

  async getMachine(id: string): Promise<ApiResponse<Machine>> {
    await this.simulateDelay();
    const machine = MockDataGenerator.machines(1)[0];
    return this.createResponse({ ...machine, machineId: id });
  }

  // QR Code endpoints
  async generateQRCode(ttlMinutes: number): Promise<ApiResponse<QRCode>> {
    await this.simulateDelay();
    return this.createResponse(MockDataGenerator.qrCode());
  }

  // Payment endpoints
  async previewPayment(request: any): Promise<ApiResponse<any>> {
    await this.simulateDelay();
    return this.createResponse({
      machineId: request.machineId,
      machineName: 'Lucky Gachapon #1',
      drawCount: request.drawCount,
      basePrice: 5.0,
      subtotal: 5.0 * request.drawCount,
      taxRate: 0.08,
      taxAmount: 5.0 * request.drawCount * 0.08,
      totalBeforeDiscount: 5.0 * request.drawCount * 1.08,
      currency: 'MYR',
      applicableEvents: [],
      finalPrice: 5.0 * request.drawCount * 1.08,
      breakdown: {
        basePrice: `RM 5.00 × ${request.drawCount} draws`,
        subtotal: `RM ${(5.0 * request.drawCount).toFixed(2)}`,
        tax: `RM ${(5.0 * request.drawCount * 0.08).toFixed(2)} (8%)`,
        total: `RM ${(5.0 * request.drawCount * 1.08).toFixed(2)}`
      }
    });
  }

  async createPayment(request: any): Promise<ApiResponse<Payment>> {
    await this.simulateDelay();
    return this.createResponse(
      MockDataGenerator.payment({
        machineId: request.machineId,
        drawCount: request.drawCount
      })
    );
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    await this.simulateDelay();
    // Simulate payment completion after 3 seconds
    const isCompleted = Math.random() > 0.3;
    return this.createResponse(
      MockDataGenerator.payment({
        paymentId: id,
        status: isCompleted ? 'SUCCEEDED' : 'PENDING'
      })
    );
  }

  // Product endpoints
  async getProducts(params?: any): Promise<ApiResponse<PaginatedResponse<Product>>> {
    await this.simulateDelay();
    const products = MockDataGenerator.products(20);
    return this.createResponse(
      this.createPaginatedResponse(products, params?.page, params?.size)
    );
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    await this.simulateDelay();
    const products = MockDataGenerator.products(5);
    return this.createResponse(products.filter(p => p.isFeatured));
  }

  // Event endpoints
  async getEvents(params?: any): Promise<ApiResponse<PaginatedResponse<Event>>> {
    await this.simulateDelay();
    const events = MockDataGenerator.events(5);
    return this.createResponse(
      this.createPaginatedResponse(events, params?.page, params?.size)
    );
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    await this.simulateDelay();
    const event = MockDataGenerator.events(1)[0];
    return this.createResponse({ ...event, eventId: id });
  }

  async joinEvent(request: any): Promise<ApiResponse<any>> {
    await this.simulateDelay();
    return this.createResponse({
      participationId: 'participation-uuid',
      eventId: request.eventId,
      userId: request.userId,
      status: 'ACTIVE',
      progress: 0,
      targetValue: 3,
      progressPercentage: 0,
      isEligible: true,
      canRedeem: false,
      hasRedeemed: false
    });
  }

  async getParticipation(eventId: string, userId: string): Promise<ApiResponse<any>> {
    await this.simulateDelay();
    const progress = Math.floor(Math.random() * 4);
    return this.createResponse({
      participationId: 'participation-uuid',
      eventId,
      userId,
      status: 'ACTIVE',
      progress,
      targetValue: 3,
      progressPercentage: (progress / 3) * 100,
      isEligible: true,
      canRedeem: progress >= 3,
      hasRedeemed: false
    });
  }
}

// Export singleton
export const mockAPI = new MockAPIClient();
```

### 10.3 Development Mode Toggle

```typescript
// src/lib/api/config.ts

import { browser } from '$app/environment';
import { GachaponAPI } from './index';
import { mockAPI } from './mock/client';

export function createAPI() {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';

  if (useMock) {
    console.log('🎭 Using Mock API');
    return mockAPI;
  }

  return new GachaponAPI({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8096/api/v1',
    getToken: () => {
      if (!browser) return null;

      // Try URL parameter first (from Unity)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) return urlToken;

      // Try localStorage
      return localStorage.getItem('gachapon_token');
    },
    onUnauthorized: () => {
      if (browser) {
        // Redirect to Unity Hub
        window.location.href = 'unity://back-to-hub';
      }
    }
  });
}
```

### 10.4 Environment Configuration

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8096/api/v1
VITE_USE_MOCK=true
VITE_MOCK_DELAY=500

# .env.production
VITE_API_BASE_URL=https://api.gachapon.com/api/v1
VITE_USE_MOCK=false
```

### 10.5 Complete Usage Example

```typescript
// src/routes/play/[machineId]/+page.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { createAPI } from '$lib/api/config';

  const api = createAPI();
  const machineId = $page.params.machineId;

  let machine = null;
  let qrCode = null;
  let payment = null;
  let loading = true;

  async function startPlay() {
    try {
      // 1. Load machine details
      machine = await api.getMachine(machineId);

      // 2. Preview payment
      const preview = await api.previewPayment({
        machineId,
        drawCount: 1
      });

      // 3. Confirm and create payment
      payment = await api.createPayment({
        machineId,
        drawCount: 1
      });

      // 4. Poll payment status
      const confirmedPayment = await api.payments.pollPaymentStatus(
        payment.paymentId,
        {
          onUpdate: (p) => {
            console.log('Payment status:', p.status);
          }
        }
      );

      // 5. Generate QR code
      if (confirmedPayment.status === 'SUCCEEDED') {
        qrCode = await api.generateQRCode(2);
      }
    } catch (error) {
      console.error('Play flow error:', error);
    } finally {
      loading = false;
    }
  }

  onMount(startPlay);
</script>

{#if loading}
  <div class="loading">Preparing your play...</div>
{:else if qrCode}
  <div class="qr-display">
    <h2>Scan at Machine</h2>
    <img src={`data:image/png;base64,${qrCode.code}`} alt="QR Code" />
    <p>Expires in 2 minutes</p>
  </div>
{/if}
```

---

## Support & Questions

**Backend Developer (Friend)**: [Contact for backend issues]
**Auth Service (Friend A)**: [Contact for token/SSO issues]
**Unity Team**: [Contact for WebView integration]

**API Issues**: Check backend logs at `src/main/java/com/omniii/`
**Auth Issues**: Verify token structure matches SecurityContext.java expectations

---

**Last Updated**: 2025-11-20
**API Version**: v1
**Backend Framework**: Quarkus 3.25.1 + Java 21
