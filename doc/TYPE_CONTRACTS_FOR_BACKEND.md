# 📋 Type Contracts for Backend Integration

**Document Purpose**: TypeScript type definitions for Friend B (Backend Team) to implement API contracts

**Frontend Stack**: SvelteKit 5 + TypeScript
**Backend Stack**: Quarkus + Java + PostgreSQL
**Generated**: November 2025

---

## Table of Contents

1. [Core Domain Models](#1-core-domain-models)
2. [Authentication & User](#2-authentication--user)
3. [Machine Management](#3-machine-management)
4. [Payment Processing](#4-payment-processing)
5. [QR Code & Prize Dispensing](#5-qr-code--prize-dispensing)
6. [Inventory & History](#6-inventory--history)
7. [Events & Promotions](#7-events--promotions)
8. [API Response Patterns](#8-api-response-patterns)
9. [Mock Implementation Reference](#9-mock-implementation-reference)

---

## 1. Core Domain Models

### Machine

```typescript
export interface Machine {
	id: string; // UUID
	name: string; // e.g., "Pokémon Mystery Collection"
	location: string; // Physical location or store name
	pricePerPlay: number; // Price in cents (e.g., 500 = RM 5.00)
	imageUrl: string; // URL to machine image
	status: MachineStatus;
	featuredPrizes: Prize[]; // Top 3-5 prizes for display
	lastUpdated?: Date;
}

export type MachineStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OFFLINE';
```

### Prize

```typescript
export interface Prize {
	id: string; // UUID
	name: string; // e.g., "Pikachu Plush - Rare Edition"
	imageUrl: string; // URL to prize image
	rarity?: 'COMMON' | 'RARE' | 'LEGENDARY' | 'LIMITED'; // Optional classification
	description?: string; // Optional detailed description
}
```

---

## 2. Authentication & User

### User

```typescript
export interface User {
	id: string; // UUID from SSO (Friend A's Auth Service)
	email: string;
	name: string;
	avatarUrl?: string; // Optional profile picture
	phone?: string; // Optional phone number
	createdAt: Date;
}
```

### Authentication Flow

**JWT Token Structure** (provided by Friend A, validated by Friend B):

```typescript
interface JWTPayload {
	sub: string; // User ID
	email: string;
	name: string;
	iat: number; // Issued at (Unix timestamp)
	exp: number; // Expiration (Unix timestamp)
}
```

**Backend Endpoints** (Friend B to implement):

- `POST /api/v1/Auth/validate` - Validate JWT from Friend A
- Response: `{ valid: boolean, user?: User }`

---

## 3. Machine Management

### GET /api/v1/machines

**Response**:

```typescript
{
  machines: Machine[];
  total: number;
  updatedAt: Date;
}
```

### GET /api/v1/machines/:id

**Response**:

```typescript
{
	machine: Machine;
}
```

**Error Responses**:

- `404` - Machine not found
- `500` - Server error

---

## 4. Payment Processing

### Payment

```typescript
export interface Payment {
	id: string; // UUID
	userId: string; // User who made payment
	machineId: string; // Machine being played
	amount: number; // Amount in cents
	currency: string; // e.g., "MYR"
	status: PaymentStatus;
	paymentMethod?: string; // e.g., "credit_card", "e_wallet"
	createdAt: Date;
	completedAt?: Date;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
```

### Payment Preview

```typescript
export interface PaymentPreview {
	machineId: string;
	machineName: string;
	pricePerPlay: number; // Base price
	tax: number; // Tax amount (if applicable)
	total: number; // Total amount to pay
	currency: string;
}
```

### POST /api/v1/payments/preview

**Request**:

```typescript
{
	machineId: string;
	userId: string;
}
```

**Response**:

```typescript
{
	preview: PaymentPreview;
}
```

### POST /api/v1/payments

**Request**:

```typescript
{
	userId: string;
	machineId: string;
	paymentMethod: string; // e.g., "credit_card", "e_wallet"
}
```

**Response**:

```typescript
{
  payment: Payment;
  qrCodeId?: string; // Only if payment successful
}
```

**Important Flow**:

1. Frontend calls `/api/v1/payments` with user and machine ID
2. Backend processes payment **asynchronously**
3. Backend returns payment object with `status: "PROCESSING"`
4. Frontend **polls** `/api/v1/payments/:id` every 2 seconds
5. When status becomes `"SUCCESS"`, backend also returns `qrCodeId`
6. Frontend redirects to QR page with `qrCodeId`

### GET /api/v1/payments/:id

**Response**:

```typescript
{
  payment: Payment;
  qrCodeId?: string; // Only if status is SUCCESS
}
```

---

## 5. QR Code & Prize Dispensing

### QRCode

```typescript
export interface QRCode {
	id: string; // UUID
	userId: string;
	machineId: string;
	paymentId: string;
	code: string; // Base64 encoded QR code data (AES-256-GCM encrypted JSON)
	expiresAt: Date; // 2 minutes from creation (PRD requirement)
	createdAt: Date;
	used: boolean;
}
```

### QR Code Data Format (Before Encryption)

```typescript
interface QRPayload {
	qrId: string;
	userId: string;
	machineId: string;
	paymentId: string;
	timestamp: number; // Unix timestamp
}
```

**Encryption**: AES-256-GCM → Base64 encoding

### POST /api/v1/qr-codes

**Request**:

```typescript
{
	userId: string;
	machineId: string;
	paymentId: string;
}
```

**Response**:

```typescript
{
	qrCode: QRCode;
}
```

### GET /api/v1/qr-codes/:id

**Response**:

```typescript
{
	qrCode: QRCode;
}
```

### Prize Result (After Machine Scan)

```typescript
export interface PrizeResult {
	id: string; // UUID
	userId: string;
	machineId: string;
	qrCodeId: string;
	prize: Prize;
	wonAt: Date;
}
```

### WebSocket: Prize Dispensing Notification

**WebSocket Endpoint**: `wss://api.example.com/ws/prize-events`

**Message Format**:

```typescript
{
	type: 'PRIZE_DISPENSED';
	qrCodeId: string;
	prizeResult: PrizeResult;
}
```

---

## 6. Inventory & History

### InventoryItem

```typescript
export interface InventoryItem {
	id: string; // UUID
	userId: string;
	machineId: string;
	machineName: string;
	machineImageUrl: string;
	machine?: Machine; // Optional expanded machine data
	prize: Prize;
	prizeImageUrl: string; // Convenience field (same as prize.imageUrl)
	wonAt: Date; // When the prize was won
	pricePerPlay: number; // How much was paid for this play
}
```

### GET /api/v1/inventory

**Query Parameters**:

- `userId: string` (required)
- `limit?: number` (default: 50)
- `offset?: number` (default: 0)

**Response**:

```typescript
{
  inventory: InventoryItem[];
  total: number;
}
```

### GET /api/v1/inventory/:id

**Response**:

```typescript
{
	item: InventoryItem;
}
```

---

## 7. Events & Promotions

### MerchantEvent

```typescript
export interface MerchantEvent {
	id: string; // UUID
	merchantId: string; // Merchant who created this event
	name: string; // e.g., "Summer Carnival 2025"
	description: string;
	type: EventType;
	joinMode: EventJoinMode;
	startDate: Date;
	endDate: Date;
	machineIds?: string[]; // Optional: specific machines for this event
	progress?: number; // Optional: user's progress (0-100)
	reward?: string; // Optional: reward description
}

export type EventType = 'DISCOUNT' | 'FREE_PLAY' | 'BONUS_PRIZE' | 'SPECIAL_CAMPAIGN';

export type EventJoinMode = 'AUTO' | 'MANUAL';
```

### GET /api/v1/events

**Query Parameters**:

- `userId: string` (required)
- `active?: boolean` (default: true) - Only return active events

**Response**:

```typescript
{
  events: MerchantEvent[];
  total: number;
}
```

### GET /api/v1/events/:id

**Response**:

```typescript
{
	event: MerchantEvent;
}
```

---

## 8. API Response Patterns

### Success Response Wrapper

```typescript
interface ApiSuccess<T> {
	success: true;
	data: T;
	timestamp: Date;
}
```

### Error Response

```typescript
interface ApiError {
	success: false;
	error: {
		code: string; // e.g., "MACHINE_NOT_FOUND", "PAYMENT_FAILED"
		message: string; // Human-readable error message
		details?: Record<string, unknown>; // Optional additional context
	};
	timestamp: Date;
}
```

### Common Error Codes

| Code                    | HTTP Status | Description                            |
| ----------------------- | ----------- | -------------------------------------- |
| `UNAUTHORIZED`          | 401         | Invalid or expired JWT token           |
| `FORBIDDEN`             | 403         | User lacks permission                  |
| `MACHINE_NOT_FOUND`     | 404         | Machine ID doesn't exist               |
| `MACHINE_UNAVAILABLE`   | 409         | Machine is in use or under maintenance |
| `PAYMENT_FAILED`        | 402         | Payment processing failed              |
| `QR_EXPIRED`            | 410         | QR code has expired                    |
| `QR_ALREADY_USED`       | 409         | QR code already scanned                |
| `INSUFFICIENT_BALANCE`  | 402         | User wallet has insufficient funds     |
| `INVALID_REQUEST`       | 400         | Malformed request body                 |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server error                |

---

## 9. Mock Implementation Reference

### Current Mock Services (Frontend)

The frontend currently implements mocks for offline development:

**Files**:

- `src/lib/mocks/services/payment.ts` - Payment processing mock
- `src/lib/mocks/services/qr.ts` - QR code generation mock
- `src/lib/mocks/data.ts` - Sample machine, prize, inventory data

**Mock Behavior**:

```typescript
// Payment mock - always succeeds after 2 seconds
export async function createPayment(...): Promise<Payment> {
  const payment: Payment = {
    status: 'PROCESSING',
    ...
  };

  setTimeout(() => {
    payment.status = 'SUCCESS';
    payment.completedAt = new Date();
  }, 2000);

  return payment;
}

// QR code mock - generates base64 encoded JSON (NOT encrypted yet)
export async function generateQRCode(...): Promise<QRCode> {
  const qrData = { qrId, userId, machineId, paymentId, timestamp };
  const qrCodeData = btoa(JSON.stringify(qrData)); // NOT AES encrypted

  return {
    code: qrCodeData,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min (should be 2 min)
    used: false,
    ...
  };
}
```

**⚠️ Known Mock Gaps** (Backend needs to implement properly):

1. ❌ No AES-256-GCM encryption on QR codes
2. ❌ QR expiry is 5 minutes (should be 2 minutes per PRD)
3. ❌ No payment status polling mechanism
4. ❌ No WebSocket for prize notifications
5. ❌ No real payment gateway integration

---

## 10. Integration Checklist for Friend B

### Phase 1: Core API Endpoints

- [ ] `POST /api/v1/Auth/validate` - JWT validation
- [ ] `GET /api/v1/machines` - Machine listing
- [ ] `GET /api/v1/machines/:id` - Machine details
- [ ] `POST /api/v1/payments/preview` - Payment preview
- [ ] `POST /api/v1/payments` - Create payment (async)
- [ ] `GET /api/v1/payments/:id` - Payment status polling

### Phase 2: QR & Prize Dispensing

- [ ] `POST /api/v1/qr-codes` - Generate QR with AES encryption
- [ ] `GET /api/v1/qr-codes/:id` - QR code retrieval
- [ ] WebSocket `/ws/prize-events` - Real-time prize notifications

### Phase 3: User Features

- [ ] `GET /api/v1/inventory` - User inventory
- [ ] `GET /api/v1/inventory/:id` - Inventory item details
- [ ] `GET /api/v1/events` - Events/promotions listing
- [ ] `GET /api/v1/events/:id` - Event details

### Phase 4: Security & Production

- [ ] AES-256-GCM encryption for QR codes
- [ ] 2-minute QR expiry enforcement
- [ ] Payment gateway integration (Stripe, PayPal, etc.)
- [ ] Rate limiting and DDoS protection
- [ ] Exponential backoff for polling
- [ ] WebSocket connection management

---

## 11. Example Request/Response Flows

### Flow 1: Complete Play Journey

```
1. GET /api/v1/machines
   → Returns list of available machines

2. POST /api/v1/payments/preview
   Body: { machineId: "uuid", userId: "uuid" }
   → Returns { preview: { total: 500, ... } }

3. POST /api/v1/payments
   Body: { machineId: "uuid", userId: "uuid", paymentMethod: "credit_card" }
   → Returns { payment: { id: "uuid", status: "PROCESSING" } }

4. Poll GET /api/v1/payments/:id every 2 seconds
   → Eventually returns { payment: { status: "SUCCESS", ... }, qrCodeId: "uuid" }

5. GET /api/v1/qr-codes/:qrId
   → Returns { qrCode: { code: "encrypted_base64_string", expiresAt: "..." } }

6. WebSocket receives PRIZE_DISPENSED event
   → { type: "PRIZE_DISPENSED", prizeResult: { ... } }

7. GET /api/v1/inventory
   → Returns updated inventory with new prize
```

### Flow 2: View Inventory

```
1. GET /api/v1/inventory?userId=uuid&limit=20&offset=0
   → Returns { inventory: [...], total: 42 }

2. GET /api/v1/inventory/:itemId
   → Returns { item: { prize: {...}, machine: {...}, wonAt: "..." } }
```

---

## 12. Type Mapping for Java Backend

### Suggested Java Entities

```java
@Entity
@Table(name = "machines")
public class Machine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Integer pricePerPlay; // Store in cents

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private MachineStatus status;

    @OneToMany(mappedBy = "machine")
    private List<Prize> featuredPrizes;

    private LocalDateTime lastUpdated;
}

public enum MachineStatus {
    AVAILABLE, IN_USE, MAINTENANCE, OFFLINE
}

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID machineId;

    @Column(nullable = false)
    private Integer amount; // In cents

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String paymentMethod;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

public enum PaymentStatus {
    PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED
}

@Entity
@Table(name = "qr_codes")
public class QRCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID machineId;

    @Column(nullable = false)
    private UUID paymentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code; // Base64 encoded encrypted data

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean used = false;
}
```

---

## 13. Notes for Backend Team

### Critical Requirements

1. **QR Code Security**: MUST use AES-256-GCM encryption before Base64 encoding
2. **QR Expiry**: MUST be exactly 2 minutes (not 5 minutes like current mock)
3. **Payment Polling**: Frontend will poll every 2 seconds for up to 30 seconds
4. **WebSocket**: Real-time prize notification is critical for UX

### Performance Considerations

- Machine list should return in <500ms (frequently accessed)
- Payment creation should return immediately with PROCESSING status
- QR generation should complete in <1 second
- Inventory queries should support pagination (limit 50 per page)

### Testing Recommendations

- Provide Postman collection with all endpoints
- Include sample JWT tokens from Friend A for testing
- Test QR expiry edge cases (2-minute window)
- Test payment timeout scenarios (>30 seconds)

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Contact**: Frontend Team
**Related Docs**: `PLAYER_API_DOCUMENTATION.md`, `PRD.md`
