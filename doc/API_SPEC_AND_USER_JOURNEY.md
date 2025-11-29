# Gachapon Backend API Specification & User Journey

> **Generated**: 2025-11-28
> **Branch**: feature/payment-qr-redirect
> **Purpose**: Frontend TypeScript definitions for Player App, Admin Dashboard, and Merchant Portal

---

## Table of Contents

1. [User Journey Flow](#user-journey-flow)
2. [WebSocket Communication](#websocket-communication)
3. [Common Types](#common-types)
4. [API Endpoints by Domain](#api-endpoints-by-domain)
   - [Payment Domain](#1-payment-domain)
   - [User Activity Domain](#2-user-activity-domain)
   - [Draw Credit Domain](#3-draw-credit-domain)
   - [Machine Domain](#4-machine-domain)
   - [Product Domain](#5-product-domain)
   - [Category Domain](#6-category-domain)
   - [Tax Rate Domain](#7-tax-rate-domain)
   - [Inventory Location Domain](#8-inventory-location-domain)
   - [Inventory Movement Domain](#9-inventory-movement-domain)
   - [Merchant Event Domain](#10-merchant-event-domain)
   - [Reports Domain](#11-reports-domain)
5. [TypeScript Type Definitions](#typescript-type-definitions)

---

## User Journey Flow

### Flow B: Machine-First (Primary User Journey)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GACHAPON USER JOURNEY                                  │
│                        (Machine-First / Flow B)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 1    │     │   PHASE 2    │     │   PHASE 3    │     │   PHASE 4    │
│  DISCOVERY   │────▶│  CONNECTION  │────▶│   PAYMENT    │────▶│   DISPENSE   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

PHASE 1: DISCOVERY
──────────────────
1. Player approaches Gachapon machine
2. Player scans machine's QR code with phone camera
3. QR code contains machine ID and redirect URL
4. Player app opens with machine context

PHASE 2: CONNECTION
────────────────────
5. Player app connects to WebSocket: ws://host/ws/hub?token={jwt}
6. Player displays their personal QR code on phone screen
7. Machine's camera scans player's QR code
8. Machine sends scanned data to backend via MQTT
9. Backend validates QR → sends REDIRECT_TO_PAYMENT notification via WebSocket
10. Player frontend receives notification and redirects to payment page

PHASE 3: PAYMENT
────────────────
11. Frontend calls GET /api/v1/payments/preview (see pricing, events, discounts)
12. Frontend calls POST /api/v1/payments (creates Airwallex payment intent)
13. Player completes payment via Airwallex SDK (card, e-wallet, etc.)
14. Airwallex webhook POST /api/v1/webhooks/airwallex confirms payment

PHASE 4: DISPENSE (AUTOMATIC)
─────────────────────────────
15. On payment success → backend auto-triggers dispense via MQTT to machine
16. Machine gate opens automatically
17. Player physically spins the Gachapon machine
18. Prize is dispensed
19. Draw credits are recorded for event participation tracking

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SEQUENCE DIAGRAM                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

Player          App            WebSocket        Backend         Machine         MQTT
  │              │                │                │               │              │
  │──scan QR────▶│                │                │               │              │
  │              │──connect───────▶│               │               │              │
  │              │◀──CONNECTED─────│               │               │              │
  │              │──show QR───────▶│               │               │              │
  │              │                 │               │◀──scan data───│◀─────────────│
  │              │                 │◀─REDIRECT_TO_PAYMENT──────────│              │
  │              │◀────────────────│               │               │              │
  │              │──GET /preview───────────────────▶               │              │
  │              │◀────────────────────────────────│               │              │
  │              │──POST /payments─────────────────▶               │              │
  │              │◀────────────────────────────────│               │              │
  │──pay────────▶│ (Airwallex)    │               │               │              │
  │              │                 │──webhook──────▶               │              │
  │              │                 │               │──dispense─────────────────────▶
  │              │                 │               │               │◀─────────────│
  │◀─spin───────────────────────────────────────────────────────────│              │
  │              │                 │               │               │              │
```

### Role-Based Access

| Role         | Scope             | Capabilities                                                                         |
| ------------ | ----------------- | ------------------------------------------------------------------------------------ |
| **Player**   | Own data only     | View payments, use credits, participate in events                                    |
| **Merchant** | Own machines/data | Manage own machines, view own reports, trigger dispense on own machines              |
| **Admin**    | All data          | Full access to all machines, reports, configuration, trigger dispense on any machine |

---

## WebSocket Communication

### Connection

**Endpoint**: `ws://host:port/ws/hub?token={jwt_token}`

### Message Format (HubMessage)

```typescript
interface HubMessage {
	domain?: string; // e.g., "qr_code", "payment", "machine"
	type: string; // e.g., "PING", "REDIRECT_TO_PAYMENT"
	data?: any; // Payload depends on message type
	timestamp: string; // ISO-8601 format
}
```

### System Message Types

| Type                  | Direction       | Description                                        |
| --------------------- | --------------- | -------------------------------------------------- |
| `PING`                | Server → Client | Heartbeat check                                    |
| `PONG`                | Client → Server | Heartbeat response                                 |
| `CONNECTED`           | Server → Client | Connection established, includes available domains |
| `CONNECTION_REPLACED` | Server → Client | Another tab/device connected                       |
| `ERROR`               | Server → Client | Error notification                                 |
| `NOTIFICATION`        | Server → Client | Push notification wrapper                          |

### Domain Message Types

**Domain: `payment`**

| Type                  | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `REDIRECT_TO_PAYMENT` | Notifies player to proceed to payment page after machine scans their QR |

**Domain: `qr_code`**

| Type                | Description                      |
| ------------------- | -------------------------------- |
| `VALIDATED`         | QR code was validated by machine |
| `GENERATE_REQUEST`  | Request to generate new QR       |
| `GENERATE_RESPONSE` | Generated QR code data           |

### WebSocket Connection Flow

```typescript
// 1. Connect with JWT token
const ws = new WebSocket(`ws://host/ws/hub?token=${jwtToken}`);

// 2. Handle messages
ws.onmessage = (event) => {
	const message: HubMessage = JSON.parse(event.data);

	switch (message.type) {
		case 'CONNECTED':
			console.log('Connected, domains:', message.data.availableDomains);
			break;
		case 'PING':
			ws.send(JSON.stringify({ type: 'PONG' }));
			break;
		case 'NOTIFICATION':
			if (message.data.type === 'REDIRECT_TO_PAYMENT') {
				// Redirect to payment page with machine info
				const notification = message.data.data as PaymentRedirectNotification;
				router.push(`/payment/${notification.machineId}`);
			}
			break;
	}
};
```

---

## Common Types

### Base Response Wrapper

All API responses are wrapped in `BaseResponse<T>`:

```typescript
interface BaseResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	traceId?: string;
	timestamp: string; // ISO-8601
	error?: ErrorDetail;
}

interface ErrorDetail {
	code?: string;
	message?: string;
	path?: string;
	status?: number;
	fieldErrors?: FieldError[];
	metadata?: Record<string, any>;
}

interface FieldError {
	field: string;
	message: string;
	rejectedValue?: any;
}
```

### Pagination

```typescript
interface PageResponse<T> {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	first: boolean;
	last: boolean;
	hasNext: boolean;
	hasPrevious: boolean;
}
```

### Common Types

```typescript
// UUID type (string in TypeScript)
type UUID = string;

// ISO-8601 timestamp (string in TypeScript)
type Instant = string;

// Decimal values (string for precision)
type BigDecimal = string;
```

---

## API Endpoints by Domain

---

### 1. Payment Domain

**Base Path**: `/api/v1/payments`

**Business Logic**: Handles payment lifecycle via Airwallex payment gateway. Supports multiple payment methods (card, e-wallet, online banking, WeChat Pay, Alipay). Integrates with merchant events for bonus rewards.

#### Endpoints

| Method | Path                   | Description                                                | Auth           |
| ------ | ---------------------- | ---------------------------------------------------------- | -------------- |
| `GET`  | `/preview`             | Preview payment with pricing, applicable events, discounts | Player         |
| `POST` | `/`                    | Create payment intent with Airwallex                       | Player         |
| `GET`  | `/{paymentId}`         | Get payment details                                        | Player/Admin   |
| `POST` | `/{paymentId}/cancel`  | Cancel pending payment                                     | Player/Admin   |
| `GET`  | `/user/{userId}`       | Get user's payment history                                 | Player/Admin   |
| `GET`  | `/machine/{machineId}` | Get machine's payment history                              | Merchant/Admin |

#### DTOs

```typescript
// GET /api/v1/payments/preview
interface PaymentPreviewRequest {
	machineId: UUID;
	drawCount: number;
}

interface PaymentPreviewResponse {
	machineId: UUID;
	machineName: string;
	drawCount: number;
	pricePerDraw: BigDecimal;
	subtotal: BigDecimal;
	applicableEvents: ApplicableEventInfo[];
	totalAmount: BigDecimal;
	currency: string;
}

interface ApplicableEventInfo {
	eventId: UUID;
	eventTitle: string;
	rewardType: EventRewardType; // "EXTRA_SPIN" | "VOUCHER"
	rewardDescription: string;
	currentProgress: EventProgressInfo;
	willComplete: boolean;
	isAlreadyCompleted: boolean;
}

interface EventProgressInfo {
	currentSpend: BigDecimal;
	targetSpend: BigDecimal;
	currentDraws: number;
	targetDraws: number;
	currentSpins: number;
	targetSpins: number;
	spendProgress: number; // 0-100%
	drawProgress: number; // 0-100%
	spinProgress: number; // 0-100%
}

// POST /api/v1/payments
interface PaymentCreateRequest {
	machineId: UUID;
	drawCount: number;
	paymentMethod?: PaymentMethod;
	returnUrl?: string;
}

type PaymentMethod = 'CARD' | 'EWALLET' | 'ONLINE_BANKING' | 'WECHAT_PAY' | 'ALIPAY';

interface PaymentCreateResponse {
	paymentId: UUID;
	clientSecret: string; // Airwallex client secret for SDK
	paymentIntentId: string; // Airwallex payment intent ID
	amount: BigDecimal;
	currency: string;
	status: PaymentStatus;
	expiresAt: Instant;
	earnedRewards: EarnedRewardInfo[];
}

interface EarnedRewardInfo {
	eventId: UUID;
	eventTitle: string;
	rewardType: EventRewardType;
	rewardValue: string;
	message: string;
}

// GET /api/v1/payments/{paymentId}
interface PaymentResponse {
	id: UUID;
	userId: string;
	machineId: UUID;
	machineName: string;
	merchantId: string;
	drawCount: number;
	amount: BigDecimal;
	currency: string;
	status: PaymentStatus;
	paymentMethod: PaymentMethod;
	paymentIntentId: string;
	failureReason?: string;
	createdAt: Instant;
	updatedAt: Instant;
	completedAt?: Instant;
}

type PaymentStatus =
	| 'CREATED'
	| 'REQUIRES_PAYMENT_METHOD'
	| 'REQUIRES_CUSTOMER_ACTION'
	| 'REQUIRES_CAPTURE'
	| 'PROCESSING'
	| 'SUCCEEDED'
	| 'CANCELLED'
	| 'FAILED'
	| 'REFUNDED';
```

---

### 2. User Activity Domain

**Base Path**: `/api/v1/user-activity`

**Business Logic**: Manages QR code generation/validation and dispense operations. QR codes are time-limited tokens for machine-to-player pairing.

#### Endpoints

| Method | Path                   | Description                                  | Auth           |
| ------ | ---------------------- | -------------------------------------------- | -------------- |
| `POST` | `/qr-code/generate`    | Generate player QR code for machine scanning | Player         |
| `POST` | `/qr-code/validate`    | Validate scanned QR code (called by machine) | Machine/System |
| `POST` | `/dispense`            | Trigger dispense using draw credits          | Player         |
| `POST` | `/admin/dispense`      | Admin/Merchant manual dispense trigger       | Admin/Merchant |
| `POST` | `/payment-qr/generate` | Generate QR for payment flow                 | Player         |

#### DTOs

```typescript
// POST /api/v1/user-activity/qr-code/generate
interface QrCodeGenerateRequest {
	ttlMinutes?: number; // Default: 15 minutes
}

interface QrCodeGenerateResponse {
	qrCode: string; // The QR code value to display
	expiresAt: Instant;
	ttlSeconds: number;
}

// POST /api/v1/user-activity/qr-code/validate (Machine → Backend)
interface QrCodeValidateRequest {
	qrCode: string;
	machineId: UUID;
}

interface QrCodeValidateResponse {
	valid: boolean;
	userId?: string;
	machineId?: UUID;
	message?: string;
}

// POST /api/v1/user-activity/dispense
interface DispenseRequest {
	machineId: UUID;
	drawCount: number; // How many draws to perform
}

interface DispenseResponse {
	success: boolean;
	machineId: UUID;
	drawCount: number;
	remainingCredits: number;
	message?: string;
	transactionId?: UUID;
}

// POST /api/v1/user-activity/admin/dispense
interface AdminDispenseRequest {
	machineId: UUID;
	drawCount: number;
	userId?: string; // Optional: assign to specific user
	reason?: string; // Audit reason
}

// WebSocket Notification (Server → Player)
interface PaymentRedirectNotification {
	machineId: UUID;
	machineName: string;
	machineSerialNumber: string;
	pricePerDraw: BigDecimal;
	userId: string;
	sessionToken: string;
	timestamp: Instant;
}

// WebSocket Message Types
type MessageType =
	| 'PING'
	| 'PONG'
	| 'CONNECTION_REPLACED'
	| 'HEARTBEAT_ACK'
	| 'ERROR'
	| 'NOTIFICATION';
```

---

### 3. Draw Credit Domain

**Base Path**: `/api/v1/draw-credits`

**Business Logic**: Manages user's draw credits (purchased spins). Credits are tied to specific machines and have expiration. Used to dispense without re-payment.

#### Endpoints

| Method | Path                                 | Description                             | Auth         |
| ------ | ------------------------------------ | --------------------------------------- | ------------ |
| `GET`  | `/user/{userId}`                     | Get user's all draw credits             | Player/Admin |
| `GET`  | `/user/{userId}/machine/{machineId}` | Get user's credits for specific machine | Player/Admin |
| `GET`  | `/user/{userId}/summary`             | Get summary of available credits        | Player       |

#### DTOs

```typescript
// GET /api/v1/draw-credits/user/{userId}
interface DrawCreditResponse {
	id: UUID;
	userId: string;
	machineId: UUID;
	machineName: string;
	creditCount: number;
	usedCount: number;
	remainingCount: number;
	expiresAt?: Instant;
	isExpired: boolean;
	sourceType: CreditSourceType;
	sourceReference?: string;
	createdAt: Instant;
}

type CreditSourceType =
	| 'PAYMENT' // Purchased via payment
	| 'EVENT_REWARD' // Earned from event completion
	| 'ADMIN_GRANT' // Manually granted by admin
	| 'REFUND'; // Refunded from failed dispense

// GET /api/v1/draw-credits/user/{userId}/summary
interface UserCreditsResponse {
	userId: string;
	totalCredits: number;
	totalUsed: number;
	totalRemaining: number;
	creditsByMachine: MachineCredits[];
}

interface MachineCredits {
	machineId: UUID;
	machineName: string;
	availableCredits: number;
	expiringCredits: number;
	nearestExpiry?: Instant;
}
```

---

### 4. Machine Domain

**Base Path**: `/api/v1/machines`

**Business Logic**: Core machine management. Machines are owned by platform, merchants, franchises, or vendors. Includes device configuration, power schedules, and operational status.

#### Endpoints

| Method   | Path                      | Description                       | Auth           |
| -------- | ------------------------- | --------------------------------- | -------------- |
| `GET`    | `/`                       | Search/list machines with filters | Admin/Merchant |
| `GET`    | `/{machineId}`            | Get machine details               | Admin/Merchant |
| `POST`   | `/`                       | Create new machine                | Admin          |
| `PUT`    | `/{machineId}`            | Update machine                    | Admin/Merchant |
| `DELETE` | `/{machineId}`            | Soft delete machine               | Admin          |
| `POST`   | `/{machineId}/activate`   | Activate machine                  | Admin/Merchant |
| `POST`   | `/{machineId}/deactivate` | Deactivate machine                | Admin/Merchant |
| `GET`    | `/merchant/{merchantId}`  | Get merchant's machines           | Merchant/Admin |

#### DTOs

```typescript
interface MachineResponse {
	id: UUID;
	name: string;
	serialNumber: string;
	description?: string;

	// Owner Information
	ownerId: string;
	ownerType: OwnerType;

	// Location Information
	merchantLocationId?: UUID;
	address?: Address;

	// Machine Specifications
	machineType: MachineType;
	capacity: number;
	drawCost: BigDecimal;

	// Operational Information
	status: MachineStatus;
	installationDate?: Instant;
	lastMaintenanceDate?: Instant;
	nextMaintenanceDue?: Instant;

	// Computed Fields
	needsMaintenance: boolean;
	isAvailableForRental: boolean;

	// Device Configuration
	config?: MachineConfigDto;
	powerSchedule?: PowerScheduleDto;
	lampConfig?: LampConfigDto;
	gameConfig?: GameConfigDto;

	// Audit Information
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

type OwnerType = 'PLATFORM' | 'MERCHANT' | 'FRANCHISE' | 'VENDOR';

type MachineType =
	| 'STANDARD_SINGLE'
	| 'MULTI_TIER'
	| 'DIGITAL'
	| 'MINI'
	| 'FLOOR_STANDING'
	| 'WALL_MOUNTED'
	| 'CUSTOM_BRANDED'
	| 'PREMIUM';

type MachineStatus =
	| 'AVAILABLE'
	| 'RENTED'
	| 'MAINTENANCE'
	| 'OUT_OF_SERVICE'
	| 'IN_TRANSIT'
	| 'STORED'
	| 'INSTALLING'
	| 'RETIRED';

interface Address {
	addressLine1?: string;
	addressLine2?: string;
	addressLine3?: string;
	city?: string;
	stateProvince?: string;
	country?: string;
	postalCode?: string;
	latitude?: BigDecimal;
	longitude?: BigDecimal;
}

interface MachineConfigDto {
	goodsLength?: number; // Stock quantity
	useLength?: number; // Number of channels (default: 1)
	samePrice?: boolean; // All items same price (default: true)
	buyMode?: BuyMode; // "BUY" or "GAME"
	forceSync?: boolean;
	gamePlace?: number;
	gameMode?: number;
	extendConfig?: string; // JSON extended config
}

type BuyMode = 'BUY' | 'GAME';

interface GameConfigDto {
	winningMode?: string; // "fixed" default
	probability?: number; // 0-100, default 100 (always win)
	adMode?: AdMode;
}

type AdMode = 'NONE' | 'IMAGE' | 'VIDEO';
```

---

### 5. Product Domain

**Base Path**: `/api/v1/products`

**Business Logic**: Product catalog management. Products belong to merchants and categories. Supports stock tracking, tax calculation, and featured products.

#### Endpoints

| Method   | Path                        | Description                  | Auth           |
| -------- | --------------------------- | ---------------------------- | -------------- |
| `GET`    | `/`                         | Search products with filters | Admin/Merchant |
| `GET`    | `/{productId}`              | Get product by ID            | Admin/Merchant |
| `GET`    | `/sku/{sku}`                | Get product by SKU           | Admin/Merchant |
| `POST`   | `/`                         | Create product               | Admin/Merchant |
| `PUT`    | `/{productId}`              | Update product               | Admin/Merchant |
| `DELETE` | `/{productId}`              | Soft delete product          | Admin/Merchant |
| `GET`    | `/merchant/{merchantId}`    | Get merchant's products      | Merchant/Admin |
| `GET`    | `/category/{categoryId}`    | Get products by category     | All            |
| `GET`    | `/low-stock`                | Get low stock products       | Admin/Merchant |
| `GET`    | `/out-of-stock`             | Get out of stock products    | Admin/Merchant |
| `GET`    | `/featured`                 | Get featured products        | All            |
| `POST`   | `/{productId}/stock/add`    | Add stock                    | Admin/Merchant |
| `POST`   | `/{productId}/stock/reduce` | Reduce stock                 | Admin/Merchant |
| `POST`   | `/{productId}/activate`     | Activate product             | Admin/Merchant |
| `POST`   | `/{productId}/deactivate`   | Deactivate product           | Admin/Merchant |
| `POST`   | `/{productId}/discontinue`  | Discontinue product          | Admin/Merchant |
| `POST`   | `/{productId}/featured`     | Mark as featured             | Admin/Merchant |
| `DELETE` | `/{productId}/featured`     | Unmark as featured           | Admin/Merchant |
| `GET`    | `/{productId}/audit-logs`   | Get audit history            | Admin/Merchant |

#### DTOs

```typescript
interface ProductResponse {
	id: UUID;
	sku: string;
	productName: string;
	description?: string;
	categoryId: UUID;
	categoryName: string;
	categoryFullPath: string;
	merchantId: string;
	price: BigDecimal;
	cost?: BigDecimal;
	stockQuantity: number;
	minStockLevel: number;
	maxStockLevel?: number;
	status: ProductStatus;
	imageUrl?: string;
	barcode?: string;
	unitOfMeasure?: string;
	weight?: BigDecimal;
	weightUnit?: string;
	isFeatured: boolean;
	isTaxable: boolean;
	currentTaxMappings?: ProductTaxMappingResponse[];
	currentTaxAmount?: BigDecimal;
	totalPrice?: BigDecimal; // price + tax
	profitMargin?: BigDecimal;
	isAvailable: boolean;
	isLowStock: boolean;
	isOutOfStock: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

interface ProductCreateRequest {
	sku: string; // Required, max 50 chars
	productName: string; // Required, max 200 chars
	description?: string; // Max 1000 chars
	categoryId: UUID; // Required
	merchantId: string; // Required
	price: BigDecimal; // Required, >= 0
	cost?: BigDecimal; // Optional, >= 0
	stockQuantity: number; // Required, >= 0
	minStockLevel?: number; // Default: 0
	maxStockLevel?: number;
	status?: ProductStatus; // Default: ACTIVE
	imageUrl?: string;
	barcode?: string;
	unitOfMeasure?: string;
	weight?: BigDecimal;
	weightUnit?: string;
	isFeatured?: boolean; // Default: false
	isTaxable?: boolean; // Default: true
}

interface ProductQueryRequest {
	// Pagination
	page?: number; // Default: 0
	size?: number; // Default: 20

	// Filters
	categoryId?: UUID;
	merchantId?: string;
	status?: ProductStatus;
	isFeatured?: boolean;
	isLowStock?: boolean;
	isOutOfStock?: boolean;
	search?: string; // Search by name, SKU, description

	// Sorting
	sortBy?: string; // e.g., "productName", "price", "createdAt"
	sortOrder?: 'ASC' | 'DESC';
}

interface ProductTaxMappingResponse {
	taxRateId: UUID;
	taxCode: string;
	taxName: string;
	taxType: TaxType;
	rate: BigDecimal;
	calculatedAmount: BigDecimal;
}
```

---

### 6. Category Domain

**Base Path**: `/api/v1/categories`

**Business Logic**: Hierarchical product categories. Categories can have parent-child relationships for nested organization.

#### Endpoints

| Method   | Path                        | Description                     | Auth           |
| -------- | --------------------------- | ------------------------------- | -------------- |
| `GET`    | `/`                         | Get all categories (paginated)  | All            |
| `GET`    | `/{categoryId}`             | Get category by ID              | All            |
| `GET`    | `/root`                     | Get root categories (no parent) | All            |
| `GET`    | `/root/active`              | Get active root categories      | All            |
| `GET`    | `/{parentId}/subcategories` | Get subcategories               | All            |
| `GET`    | `/search`                   | Search categories               | All            |
| `POST`   | `/`                         | Create category                 | Admin/Merchant |
| `PUT`    | `/{categoryId}`             | Update category                 | Admin/Merchant |
| `DELETE` | `/{categoryId}`             | Soft delete category            | Admin          |
| `POST`   | `/{categoryId}/activate`    | Activate category               | Admin/Merchant |
| `POST`   | `/{categoryId}/deactivate`  | Deactivate category             | Admin/Merchant |

#### DTOs

```typescript
interface CategoryResponse {
	id: UUID;
	categoryName: string;
	description?: string;
	parentCategoryId?: UUID;
	parentCategoryName?: string;
	subCategories: CategoryResponse[];
	isActive: boolean;
	imageUrl?: string;
	sortOrder: number;
	fullPath: string; // e.g., "Electronics > Gaming > Consoles"
	level: number; // 0 = root, 1 = child, etc.
	isRootCategory: boolean;
	hasSubCategories: boolean;
	productCount: number;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

interface CategoryCreateRequest {
	categoryName: string; // Required
	description?: string;
	parentCategoryId?: UUID; // Null for root category
	imageUrl?: string;
	sortOrder?: number; // Default: 0
}

interface CategoryUpdateRequest {
	categoryId: UUID;
	categoryName?: string;
	description?: string;
	parentCategoryId?: UUID;
	imageUrl?: string;
	sortOrder?: number;
}
```

---

### 7. Tax Rate Domain

**Base Path**: `/api/v1/tax-rates`

**Business Logic**: Manages tax rates with temporal support (effective dates). Supports multiple tax types (VAT, GST, Sales Tax, etc.) and jurisdictions.

#### Endpoints

| Method   | Path                                  | Description                      | Auth           |
| -------- | ------------------------------------- | -------------------------------- | -------------- |
| `GET`    | `/`                                   | Get all tax rates (paginated)    | Admin          |
| `GET`    | `/{taxRateId}`                        | Get tax rate by ID               | Admin          |
| `GET`    | `/code/{taxCode}`                     | Get tax rate by code             | Admin          |
| `GET`    | `/active`                             | Get currently active tax rates   | Admin/Merchant |
| `GET`    | `/active-at/{date}`                   | Get tax rates active at date     | Admin          |
| `GET`    | `/active/type/{taxType}`              | Get active rates by type         | Admin          |
| `GET`    | `/active/jurisdiction/{jurisdiction}` | Get active rates by jurisdiction | Admin          |
| `GET`    | `/search`                             | Search tax rates                 | Admin          |
| `POST`   | `/`                                   | Create tax rate                  | Admin          |
| `PUT`    | `/`                                   | Update tax rate                  | Admin          |
| `POST`   | `/{taxRateId}/activate`               | Activate tax rate                | Admin          |
| `POST`   | `/{taxRateId}/deactivate`             | Deactivate tax rate              | Admin          |
| `POST`   | `/{taxRateId}/end`                    | End tax rate at date             | Admin          |
| `DELETE` | `/{taxRateId}`                        | Soft delete tax rate             | Admin          |

#### DTOs

```typescript
interface TaxRateResponse {
	id: UUID;
	taxCode: string;
	taxName: string;
	description?: string;
	taxType: TaxType;
	rate: BigDecimal; // Percentage (e.g., 6.00 for 6%)
	jurisdiction: string; // e.g., "MY", "SG", "US-CA"
	effectiveFrom: Instant;
	effectiveTo?: Instant; // Null = no end date
	isActive: boolean;
	isCurrentlyEffective: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

type TaxType =
	| 'VAT'
	| 'GST'
	| 'SALES_TAX'
	| 'EXCISE'
	| 'CUSTOMS'
	| 'LUXURY'
	| 'ENVIRONMENTAL'
	| 'SERVICE_TAX'
	| 'WITHHOLDING'
	| 'OTHER';

interface TaxRateCreateRequest {
	taxCode: string; // Required, unique
	taxName: string; // Required
	description?: string;
	taxType: TaxType; // Required
	rate: BigDecimal; // Required, 0-100
	jurisdiction: string; // Required
	effectiveFrom: Instant; // Required
	effectiveTo?: Instant;
}

interface TaxRateUpdateRequest {
	taxRateId: UUID;
	taxCode?: string;
	taxName?: string;
	description?: string;
	taxType?: TaxType;
	rate?: BigDecimal;
	jurisdiction?: string;
	effectiveFrom?: Instant;
	effectiveTo?: Instant;
}
```

---

### 8. Inventory Location Domain

**Base Path**: `/api/v1/inventory/locations`

**Business Logic**: Warehouse inventory tracking. Tracks stock levels at warehouse locations with reservation support for events.

#### Endpoints

| Method | Path                           | Description                   | Auth           |
| ------ | ------------------------------ | ----------------------------- | -------------- |
| `GET`  | `/`                            | Search inventory locations    | Admin/Merchant |
| `GET`  | `/{locationId}`                | Get location by ID            | Admin/Merchant |
| `GET`  | `/product/{productId}`         | Get locations for product     | Admin/Merchant |
| `GET`  | `/product/{productId}/summary` | Get product inventory summary | Admin/Merchant |
| `GET`  | `/alerts/low-stock`            | Get low stock locations       | Admin/Merchant |
| `POST` | `/`                            | Create inventory location     | Admin          |
| `POST` | `/reserve`                     | Reserve stock for events      | Admin/Merchant |
| `POST` | `/{locationId}/release`        | Release reservation           | Admin/Merchant |
| `POST` | `/{locationId}/fulfill`        | Fulfill reservation           | Admin/Merchant |
| `PUT`  | `/{locationId}/activate`       | Activate location             | Admin          |
| `PUT`  | `/{locationId}/deactivate`     | Deactivate location           | Admin          |

#### DTOs

```typescript
interface InventoryLocationResponse {
	id: UUID;
	productId: UUID;
	productName: string;
	productSku: string;
	locationType: LocationType;
	locationReference: string; // Warehouse code/name
	locationName: string;
	quantity: number;
	reservedQuantity: number;
	availableQuantity: number; // quantity - reservedQuantity
	minStockLevel: number;
	isActive: boolean;
	isLowStock: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

type LocationType = 'WAREHOUSE';

interface InventoryLocationCreateRequest {
	productId: UUID; // Required
	locationReference: string; // Required, warehouse code
	locationName: string; // Required
	quantity: number; // Required, >= 0
	minStockLevel?: number; // Default: 0
}

interface InventoryReservationRequest {
	locationId: UUID; // Required
	quantity: number; // Required, > 0
	eventId?: UUID; // Optional, for event-based reservation
	reason?: string;
}

interface InventorySummaryResponse {
	productId: UUID;
	productName: string;
	productSku: string;
	totalQuantity: number;
	totalReserved: number;
	totalAvailable: number;
	locationCount: number;
	lowStockLocationCount: number;
	locations: InventoryLocationResponse[];
}

interface InventoryLocationSearchRequest {
	// Pagination
	page?: number;
	size?: number;

	// Filters
	productId?: UUID;
	productName?: string; // Partial match
	sku?: string; // Partial match
	locationReference?: string;
	locationName?: string; // Partial match
	isActive?: boolean;
	isLowStock?: boolean;
	hasReservations?: boolean;
	search?: string; // Full-text search

	// Sorting
	sort?: string; // "locationName", "quantity", "availableQuantity", "createdAt"
	order?: 'ASC' | 'DESC';
}
```

---

### 9. Inventory Movement Domain

**Base Path**: `/api/v1/inventory/movements`

**Business Logic**: Tracks all stock movements - receiving from suppliers, transfers to machines, and adjustments. Provides audit trail for inventory changes.

#### Endpoints

| Method | Path                   | Description                        | Auth           |
| ------ | ---------------------- | ---------------------------------- | -------------- |
| `GET`  | `/`                    | Search movements with filters      | Admin/Merchant |
| `GET`  | `/{movementId}`        | Get movement by ID                 | Admin/Merchant |
| `GET`  | `/product/{productId}` | Get movements for product          | Admin/Merchant |
| `GET`  | `/recent`              | Get recent movements (last N days) | Admin/Merchant |
| `POST` | `/receive`             | Receive stock from supplier        | Admin/Merchant |
| `POST` | `/transfer`            | Transfer stock to machine          | Admin/Merchant |
| `POST` | `/adjust`              | Adjust inventory (corrections)     | Admin/Merchant |

#### DTOs

```typescript
interface InventoryMovementResponse {
	id: UUID;
	productId: UUID;
	productName: string;
	productSku: string;
	movementType: MovementType;
	sourceLocationId?: UUID;
	sourceLocationName?: string;
	destinationReference?: string; // Machine ID for transfers
	quantity: number;
	reason?: string;
	notes?: string;
	movementDate: Instant;
	createdAt: Instant;
	createdBy: string;
}

type MovementType =
	| 'RECEIVE' // From supplier to warehouse
	| 'TRANSFER' // From warehouse to machine
	| 'ADJUST'; // Manual corrections

interface InventoryReceiveRequest {
	productId: UUID; // Required
	locationId: UUID; // Required, destination warehouse
	quantity: number; // Required, > 0
	supplierReference?: string;
	notes?: string;
}

interface InventoryTransferRequest {
	productId: UUID; // Required
	sourceLocationId: UUID; // Required, from warehouse
	destinationMachineId: UUID; // Required, to machine
	quantity: number; // Required, > 0
	notes?: string;
}

interface InventoryAdjustRequest {
	locationId: UUID; // Required
	productId: UUID; // Required
	adjustmentQuantity: number; // Required, can be negative
	reason: string; // Required
	notes?: string;
}

interface InventoryMovementSearchRequest {
	// Pagination
	page?: number;
	size?: number;

	// Filters
	productId?: UUID;
	productName?: string;
	sku?: string;
	movementType?: MovementType;
	sourceLocationId?: UUID;
	destinationReference?: string;
	startDate?: Instant;
	endDate?: Instant;

	// Sorting
	sort?: string; // "movementDate", "quantity", "createdAt", "movementType"
	order?: 'ASC' | 'DESC';
}
```

---

### 10. Merchant Event Domain

**Base Path**: `/api/v1/merchant-events`

**Business Logic**: Promotional events created by merchants. Users can participate by meeting spend/draw criteria to earn rewards (extra spins or vouchers). Supports auto-join and manual-join modes.

#### Endpoints

| Method   | Path                                | Description                         | Auth           |
| -------- | ----------------------------------- | ----------------------------------- | -------------- |
| `GET`    | `/`                                 | Search events with filters          | All            |
| `GET`    | `/{id}`                             | Get event by ID                     | All            |
| `POST`   | `/`                                 | Create event                        | Merchant/Admin |
| `PUT`    | `/{id}`                             | Update event                        | Merchant/Admin |
| `DELETE` | `/{id}`                             | Soft delete event                   | Merchant/Admin |
| `POST`   | `/join`                             | Join manual event                   | Player         |
| `POST`   | `/auto-enroll/{userId}`             | Auto-enroll user in eligible events | System         |
| `POST`   | `/{eventId}/progress/{userId}`      | Update participation progress       | System         |
| `POST`   | `/{eventId}/redeem/{userId}`        | Redeem earned reward                | Player         |
| `GET`    | `/{eventId}/participation/{userId}` | Get user's participation            | Player/Admin   |
| `GET`    | `/user/{userId}/participations`     | Get all user participations         | Player/Admin   |

#### DTOs

```typescript
interface EventResponse {
	id: UUID;
	title: string;
	description?: string;
	merchantId: string;
	startDate: Instant;
	endDate: Instant;
	status: EventStatus;
	joinMode: EventJoinMode;

	// Eligibility Criteria (at least one)
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;

	// Reward Configuration
	rewardType: EventRewardType;
	extraSpinCount?: number; // For EXTRA_SPIN rewards
	voucherCode?: string; // For VOUCHER rewards
	voucherApiEndpoint?: string;

	// Participation Stats
	maxParticipants?: number;
	currentParticipants: number;
	eligibleCount: number;
	redeemedCount: number;

	termsAndConditions?: string;
	imageUrl?: string;
	allowedMachineIds: UUID[]; // Empty = all merchant machines

	// Status Flags
	isActive: boolean;
	canAcceptNewParticipants: boolean;
	hasReachedMaxParticipants: boolean;

	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

type EventStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
type EventJoinMode = 'AUTO_JOIN' | 'MANUAL_JOIN';
type EventRewardType = 'EXTRA_SPIN' | 'VOUCHER';

interface EventCreateRequest {
	title: string; // Required, max 200 chars
	description?: string; // Max 1000 chars
	merchantId: string; // Required
	startDate: Instant; // Required
	endDate: Instant; // Required
	status?: EventStatus; // Default: DRAFT
	joinMode?: EventJoinMode; // Default: AUTO_JOIN

	// Eligibility (at least one required)
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;

	// Reward (required)
	rewardType: EventRewardType;
	extraSpinCount?: number; // Required if EXTRA_SPIN
	voucherCode?: string; // Required if VOUCHER (one of code or endpoint)
	voucherApiEndpoint?: string;
	voucherApiConfig?: string;

	maxParticipants?: number;
	termsAndConditions?: string;
	imageUrl?: string;
	allowedMachineIds?: UUID[];
}

interface EventJoinRequest {
	eventId: UUID; // Required
	userId: string; // Required
}

interface ParticipationResponse {
	id: UUID;
	eventId: UUID;
	userId: string;

	// Event Details
	eventTitle: string;
	eventDescription?: string;
	eventStartDate: Instant;
	eventEndDate: Instant;

	// Progress Tracking
	currentSpend: BigDecimal;
	currentDrawCount: number;
	currentPurchaseSpin: number;

	// Target Criteria
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;

	// Eligibility Status
	isEligible: boolean;
	eligibleAt?: Instant;

	// Reward Status
	isRewardRedeemed: boolean;
	redeemedAt?: Instant;
	rewardReference?: string;

	// Join Information
	joinedAt: Instant;
	joinMethod: string;

	// Progress Percentages (0-100)
	spendProgress: number;
	drawProgress: number;
	purchaseSpinProgress: number;

	canRedeemReward: boolean;

	createdAt: Instant;
	updatedAt: Instant;
}

interface EventSearchRequest {
	// Pagination
	page?: number;
	size?: number;

	// Filters
	merchantId?: string;
	status?: EventStatus;
	joinMode?: EventJoinMode;
	rewardType?: EventRewardType;
	isActive?: boolean;
	startDateFrom?: Instant;
	startDateTo?: Instant;
	search?: string;

	// Sorting
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}
```

---

### 11. Reports Domain

**Base Path**: `/api/v1/reports`

**Business Logic**: Analytics and reporting for business intelligence. Includes revenue, machine performance, inventory, and event reports. Supports scheduled report generation.

#### 11.1 Revenue Reports

**Path**: `/api/v1/reports/revenues`

| Method | Path       | Description                        | Auth           |
| ------ | ---------- | ---------------------------------- | -------------- |
| `GET`  | `/summary` | Generate revenue summary report    | Admin/Merchant |
| `GET`  | `/total`   | Quick total revenue for dashboards | Admin/Merchant |

```typescript
interface RevenueSummaryRequest {
	dateRangeStart: Instant; // Required
	dateRangeEnd: Instant; // Required
	merchantId?: string; // Filter by merchant
	machineId?: UUID; // Filter by machine
	paymentMethod?: PaymentMethod;
}

interface RevenueSummaryResponse {
	generatedAt: Instant;
	periodStart: Instant;
	periodEnd: Instant;

	// Core Metrics
	totalRevenue: BigDecimal;
	transactionCount: number;
	avgTransactionValue: BigDecimal;
	minTransactionAmount: BigDecimal;
	maxTransactionAmount: BigDecimal;
	totalDrawCount: number;
	avgDrawCount: number;

	// Breakdowns
	revenueByMethod: RevenueByMethod[];
	revenueByMerchant: RevenueByMerchant[];

	// Additional Metrics
	uniqueUserCount: number;
	uniqueMachineCount: number;
	uniqueMerchantCount: number;
	failedPaymentRate: number;
}

interface RevenueByMethod {
	paymentMethod: PaymentMethod;
	revenue: BigDecimal;
	transactionCount: number;
	percentage: number;
}

interface RevenueByMerchant {
	merchantId: string;
	merchantName: string;
	revenue: BigDecimal;
	transactionCount: number;
	percentage: number;
}

interface TotalRevenueResponse {
	totalRevenue: BigDecimal;
	periodStart: Instant;
	periodEnd: Instant;
}
```

#### 11.2 Machine Reports

**Path**: `/api/v1/reports/machines`

| Method | Path                   | Description                                | Auth           |
| ------ | ---------------------- | ------------------------------------------ | -------------- |
| `GET`  | `/performance`         | Get machine performance report (paginated) | Admin/Merchant |
| `GET`  | `/performance-summary` | Get aggregated machine metrics             | Admin/Merchant |

```typescript
interface MachinePerformanceRequest {
	// Pagination
	page?: number;
	size?: number;

	// Filters
	dateRangeStart?: Instant;
	dateRangeEnd?: Instant;
	merchantId?: string;
	machineId?: UUID;
	machineType?: MachineType;
	isOperational?: boolean;

	// Sorting
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

interface MachinePerformanceResponse {
	machineId: UUID;
	machineCode: string;
	machineName: string;
	machineType: string;
	isOperational: boolean;

	// Location
	locationId?: UUID;
	locationName?: string;
	locationAddress?: string;

	// Merchant
	merchantId?: UUID;
	merchantName?: string;

	// Performance Metrics
	totalPlays: number;
	successfulPlays: number;
	failedPlays: number;
	successRate: number; // 0-100%
	errorRate: number; // 0-100%

	// Revenue Metrics
	totalRevenue: BigDecimal;
	averageRevenuePerPlay: BigDecimal;
	revenuePerDay: BigDecimal;

	// Operational Metrics
	totalDowntimeHours: number;
	uptimePercentage: number;
	lastMaintenanceDate?: Instant;
	daysSinceLastMaintenance: number;

	// Alert Flags
	needsMaintenance: boolean;
	isLowPerformance: boolean;
	hasHighErrorRate: boolean;

	periodStart: Instant;
	periodEnd: Instant;
	lastUpdated: Instant;
}

interface MachinePerformanceAggregatedResponse {
	periodStart: Instant;
	periodEnd: Instant;
	totalMachines: number;
	operationalMachines: number;

	// Aggregate Metrics
	totalPlays: number;
	totalRevenue: BigDecimal;
	avgRevenuePerMachine: BigDecimal;
	avgSuccessRate: number;
	avgUptimePercentage: number;

	// Alerts
	machinesNeedingMaintenance: number;
	lowPerformanceMachines: number;
	highErrorRateMachines: number;

	// Top Performers
	topRevenueGenerators: MachinePerformanceResponse[];
	lowestPerformers: MachinePerformanceResponse[];
}
```

#### 11.3 Inventory Reports

**Path**: `/api/v1/reports/inventories`

| Method | Path             | Description                        | Auth           |
| ------ | ---------------- | ---------------------------------- | -------------- |
| `GET`  | `/stock-levels`  | Get stock level report (paginated) | Admin/Merchant |
| `GET`  | `/stock-summary` | Get aggregated stock metrics       | Admin/Merchant |

```typescript
interface StockLevelRequest {
	// Pagination
	page?: number;
	size?: number;

	// Filters
	productId?: UUID;
	categoryId?: UUID;
	merchantId?: string;
	locationReference?: string;
	isLowStock?: boolean;
	isOutOfStock?: boolean;

	// Sorting
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

interface StockLevelResponse {
	productId: UUID;
	productName: string;
	productSku: string;
	categoryName: string;

	locationId: UUID;
	locationName: string;
	locationReference: string;

	quantity: number;
	reservedQuantity: number;
	availableQuantity: number;
	minStockLevel: number;

	isLowStock: boolean;
	isOutOfStock: boolean;

	unitCost?: BigDecimal;
	totalValue?: BigDecimal;

	lastUpdated: Instant;
}

interface StockLevelSummaryResponse {
	totalProducts: number;
	totalLocations: number;
	totalQuantity: number;
	totalReserved: number;
	totalAvailable: number;
	totalValue: BigDecimal;

	lowStockProducts: number;
	outOfStockProducts: number;
	lowStockPercentage: number;

	categorySummary: CategoryStockSummary[];
}

interface CategoryStockSummary {
	categoryId: UUID;
	categoryName: string;
	productCount: number;
	totalQuantity: number;
	totalValue: BigDecimal;
	lowStockCount: number;
}
```

#### 11.4 Event Reports

**Path**: `/api/v1/reports/events`

| Method | Path                                 | Description                      | Auth           |
| ------ | ------------------------------------ | -------------------------------- | -------------- |
| `GET`  | `/performance/{eventId}`             | Get single event performance     | Merchant/Admin |
| `POST` | `/performance/aggregated`            | Get aggregated event performance | Merchant/Admin |
| `GET`  | `/performance/merchant/{merchantId}` | Get merchant's event performance | Merchant/Admin |

```typescript
interface EventPerformanceRequest {
	eventId?: UUID; // For single event
	merchantId?: string; // Filter by merchant
	eventStatus?: EventStatus;
	joinMode?: EventJoinMode;
	activeOnly?: boolean;
	startDateFrom?: Instant;
	startDateTo?: Instant;
}

interface EventPerformanceResponse {
	eventId: UUID;
	eventTitle: string;
	merchantId: string;
	merchantName?: string;
	status: EventStatus;
	joinMode: EventJoinMode;
	rewardType: EventRewardType;

	// Participation Metrics
	totalParticipants: number;
	eligibleParticipants: number;
	redeemedRewards: number;

	// Rates
	eligibilityRate: number; // % of participants who became eligible
	redemptionRate: number; // % of eligible who redeemed
	completionRate: number; // % of participants who completed

	// Revenue Impact
	totalRevenue: BigDecimal;
	avgRevenuePerParticipant: BigDecimal;

	// Time Metrics
	avgTimeToEligibility?: number; // Average days
	avgTimeToRedemption?: number;

	periodStart: Instant;
	periodEnd: Instant;
}

interface AggregatedEventPerformance {
	periodStart: Instant;
	periodEnd: Instant;
	totalEvents: number;
	activeEvents: number;

	// Aggregate Metrics
	totalParticipants: number;
	totalEligible: number;
	totalRedeemed: number;
	totalRevenue: BigDecimal;

	// Averages
	avgParticipantsPerEvent: number;
	avgEligibilityRate: number;
	avgRedemptionRate: number;

	// Top Performers
	topEvents: EventPerformanceResponse[];
}
```

#### 11.5 Report Scheduling

**Path**: `/api/v1/reports/schedules`

| Method   | Path                           | Description                | Auth  |
| -------- | ------------------------------ | -------------------------- | ----- |
| `GET`    | `/definitions`                 | Get all report definitions | Admin |
| `GET`    | `/definitions/scheduled`       | Get scheduled reports only | Admin |
| `GET`    | `/definitions/{id}`            | Get report definition      | Admin |
| `POST`   | `/definitions`                 | Create report definition   | Admin |
| `PUT`    | `/definitions/{id}`            | Update report definition   | Admin |
| `DELETE` | `/definitions/{id}`            | Delete report definition   | Admin |
| `PUT`    | `/definitions/{id}/toggle`     | Enable/disable report      | Admin |
| `POST`   | `/definitions/{id}/execute`    | Manual execution           | Admin |
| `GET`    | `/definitions/{id}/executions` | Get execution history      | Admin |
| `GET`    | `/stats`                       | Get scheduler statistics   | Admin |

```typescript
interface ReportDefinition {
	id: UUID;
	reportName: string;
	description?: string;
	reportType: ReportType;
	outputFormat: OutputFormat;
	parameters?: string; // JSON parameters
	scheduleCron?: string; // Cron expression
	isScheduled: boolean;
	isActive: boolean;
	notificationEmails?: string[];
	retentionDays: number;
	createdAt: Instant;
	updatedAt: Instant;
}

type ReportType = 'REVENUE' | 'MACHINE' | 'INVENTORY' | 'EVENT';
type OutputFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

interface ReportExecution {
	id: UUID;
	reportDefinitionId: UUID;
	status: ExecutionStatus;
	startedAt: Instant;
	completedAt?: Instant;
	outputPath?: string;
	errorMessage?: string;
	triggeredBy: string;
}

type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface SchedulerStats {
	totalDefinitions: number;
	activeDefinitions: number;
	scheduledDefinitions: number;
	recentExecutions: number;
	failedExecutions: number;
}
```

---

## TypeScript Type Definitions

Complete type definitions file for frontend usage:

```typescript
// ============================================
// GACHAPON BACKEND - TYPESCRIPT DEFINITIONS
// Generated: 2025-11-28
// ============================================

// ==================== COMMON TYPES ====================

export type UUID = string;
export type Instant = string; // ISO-8601 format
export type BigDecimal = string;

// Base Response
export interface BaseResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	traceId?: string;
	timestamp: Instant;
	error?: ErrorDetail;
}

export interface ErrorDetail {
	code?: string;
	message?: string;
	path?: string;
	status?: number;
	fieldErrors?: FieldError[];
	metadata?: Record<string, unknown>;
}

export interface FieldError {
	field: string;
	message: string;
	rejectedValue?: unknown;
}

// Pagination
export interface PageResponse<T> {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	first: boolean;
	last: boolean;
	hasNext: boolean;
	hasPrevious: boolean;
}

// Address
export interface Address {
	addressLine1?: string;
	addressLine2?: string;
	addressLine3?: string;
	city?: string;
	stateProvince?: string;
	country?: string;
	postalCode?: string;
	latitude?: BigDecimal;
	longitude?: BigDecimal;
}

// ==================== ENUMS ====================

export type PaymentMethod = 'CARD' | 'EWALLET' | 'ONLINE_BANKING' | 'WECHAT_PAY' | 'ALIPAY';

export type PaymentStatus =
	| 'CREATED'
	| 'REQUIRES_PAYMENT_METHOD'
	| 'REQUIRES_CUSTOMER_ACTION'
	| 'REQUIRES_CAPTURE'
	| 'PROCESSING'
	| 'SUCCEEDED'
	| 'CANCELLED'
	| 'FAILED'
	| 'REFUNDED';

export type MachineStatus =
	| 'AVAILABLE'
	| 'RENTED'
	| 'MAINTENANCE'
	| 'OUT_OF_SERVICE'
	| 'IN_TRANSIT'
	| 'STORED'
	| 'INSTALLING'
	| 'RETIRED';

export type MachineType =
	| 'STANDARD_SINGLE'
	| 'MULTI_TIER'
	| 'DIGITAL'
	| 'MINI'
	| 'FLOOR_STANDING'
	| 'WALL_MOUNTED'
	| 'CUSTOM_BRANDED'
	| 'PREMIUM';

export type OwnerType = 'PLATFORM' | 'MERCHANT' | 'FRANCHISE' | 'VENDOR';

export type BuyMode = 'BUY' | 'GAME';

export type AdMode = 'NONE' | 'IMAGE' | 'VIDEO';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export type TaxType =
	| 'VAT'
	| 'GST'
	| 'SALES_TAX'
	| 'EXCISE'
	| 'CUSTOMS'
	| 'LUXURY'
	| 'ENVIRONMENTAL'
	| 'SERVICE_TAX'
	| 'WITHHOLDING'
	| 'OTHER';

export type LocationType = 'WAREHOUSE';

export type MovementType = 'RECEIVE' | 'TRANSFER' | 'ADJUST';

export type EventStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type EventJoinMode = 'AUTO_JOIN' | 'MANUAL_JOIN';

export type EventRewardType = 'EXTRA_SPIN' | 'VOUCHER';

export type CreditSourceType = 'PAYMENT' | 'EVENT_REWARD' | 'ADMIN_GRANT' | 'REFUND';

export type ReportType = 'REVENUE' | 'MACHINE' | 'INVENTORY' | 'EVENT';

export type OutputFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type MessageType =
	| 'PING'
	| 'PONG'
	| 'CONNECTION_REPLACED'
	| 'HEARTBEAT_ACK'
	| 'ERROR'
	| 'NOTIFICATION';

// ==================== WEBSOCKET ====================

export interface HubMessage {
	domain?: string;
	type: string;
	data?: unknown;
	timestamp: Instant;
}

export interface PaymentRedirectNotification {
	machineId: UUID;
	machineName: string;
	machineSerialNumber: string;
	pricePerDraw: BigDecimal;
	userId: string;
	sessionToken: string;
	timestamp: Instant;
}

// ==================== PAYMENT DOMAIN ====================

export interface PaymentPreviewRequest {
	machineId: UUID;
	drawCount: number;
}

export interface PaymentPreviewResponse {
	machineId: UUID;
	machineName: string;
	drawCount: number;
	pricePerDraw: BigDecimal;
	subtotal: BigDecimal;
	applicableEvents: ApplicableEventInfo[];
	totalAmount: BigDecimal;
	currency: string;
}

export interface ApplicableEventInfo {
	eventId: UUID;
	eventTitle: string;
	rewardType: EventRewardType;
	rewardDescription: string;
	currentProgress: EventProgressInfo;
	willComplete: boolean;
	isAlreadyCompleted: boolean;
}

export interface EventProgressInfo {
	currentSpend: BigDecimal;
	targetSpend: BigDecimal;
	currentDraws: number;
	targetDraws: number;
	currentSpins: number;
	targetSpins: number;
	spendProgress: number;
	drawProgress: number;
	spinProgress: number;
}

export interface PaymentCreateRequest {
	machineId: UUID;
	drawCount: number;
	paymentMethod?: PaymentMethod;
	returnUrl?: string;
}

export interface PaymentCreateResponse {
	paymentId: UUID;
	clientSecret: string;
	paymentIntentId: string;
	amount: BigDecimal;
	currency: string;
	status: PaymentStatus;
	expiresAt: Instant;
	earnedRewards: EarnedRewardInfo[];
}

export interface EarnedRewardInfo {
	eventId: UUID;
	eventTitle: string;
	rewardType: EventRewardType;
	rewardValue: string;
	message: string;
}

export interface PaymentResponse {
	id: UUID;
	userId: string;
	machineId: UUID;
	machineName: string;
	merchantId: string;
	drawCount: number;
	amount: BigDecimal;
	currency: string;
	status: PaymentStatus;
	paymentMethod: PaymentMethod;
	paymentIntentId: string;
	failureReason?: string;
	createdAt: Instant;
	updatedAt: Instant;
	completedAt?: Instant;
}

// ==================== USER ACTIVITY DOMAIN ====================

export interface QrCodeGenerateRequest {
	ttlMinutes?: number;
}

export interface QrCodeGenerateResponse {
	qrCode: string;
	expiresAt: Instant;
	ttlSeconds: number;
}

export interface QrCodeValidateRequest {
	qrCode: string;
	machineId: UUID;
}

export interface QrCodeValidateResponse {
	valid: boolean;
	userId?: string;
	machineId?: UUID;
	message?: string;
}

export interface DispenseRequest {
	machineId: UUID;
	drawCount: number;
}

export interface DispenseResponse {
	success: boolean;
	machineId: UUID;
	drawCount: number;
	remainingCredits: number;
	message?: string;
	transactionId?: UUID;
}

export interface AdminDispenseRequest {
	machineId: UUID;
	drawCount: number;
	userId?: string;
	reason?: string;
}

// ==================== DRAW CREDIT DOMAIN ====================

export interface DrawCreditResponse {
	id: UUID;
	userId: string;
	machineId: UUID;
	machineName: string;
	creditCount: number;
	usedCount: number;
	remainingCount: number;
	expiresAt?: Instant;
	isExpired: boolean;
	sourceType: CreditSourceType;
	sourceReference?: string;
	createdAt: Instant;
}

export interface UserCreditsResponse {
	userId: string;
	totalCredits: number;
	totalUsed: number;
	totalRemaining: number;
	creditsByMachine: MachineCredits[];
}

export interface MachineCredits {
	machineId: UUID;
	machineName: string;
	availableCredits: number;
	expiringCredits: number;
	nearestExpiry?: Instant;
}

// ==================== MACHINE DOMAIN ====================

export interface MachineResponse {
	id: UUID;
	name: string;
	serialNumber: string;
	description?: string;
	ownerId: string;
	ownerType: OwnerType;
	merchantLocationId?: UUID;
	address?: Address;
	machineType: MachineType;
	capacity: number;
	drawCost: BigDecimal;
	status: MachineStatus;
	installationDate?: Instant;
	lastMaintenanceDate?: Instant;
	nextMaintenanceDue?: Instant;
	needsMaintenance: boolean;
	isAvailableForRental: boolean;
	config?: MachineConfigDto;
	powerSchedule?: PowerScheduleDto;
	lampConfig?: LampConfigDto;
	gameConfig?: GameConfigDto;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface MachineConfigDto {
	goodsLength?: number;
	useLength?: number;
	samePrice?: boolean;
	buyMode?: BuyMode;
	forceSync?: boolean;
	gamePlace?: number;
	gameMode?: number;
	extendConfig?: string;
}

export interface PowerScheduleDto {
	// Power schedule configuration
	enabled?: boolean;
	schedules?: ScheduleEntry[];
}

export interface ScheduleEntry {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
}

export interface LampConfigDto {
	// Lamp configuration
	brightness?: number;
	color?: string;
	pattern?: string;
}

export interface GameConfigDto {
	winningMode?: string;
	probability?: number;
	adMode?: AdMode;
}

// ==================== PRODUCT DOMAIN ====================

export interface ProductResponse {
	id: UUID;
	sku: string;
	productName: string;
	description?: string;
	categoryId: UUID;
	categoryName: string;
	categoryFullPath: string;
	merchantId: string;
	price: BigDecimal;
	cost?: BigDecimal;
	stockQuantity: number;
	minStockLevel: number;
	maxStockLevel?: number;
	status: ProductStatus;
	imageUrl?: string;
	barcode?: string;
	unitOfMeasure?: string;
	weight?: BigDecimal;
	weightUnit?: string;
	isFeatured: boolean;
	isTaxable: boolean;
	currentTaxMappings?: ProductTaxMappingResponse[];
	currentTaxAmount?: BigDecimal;
	totalPrice?: BigDecimal;
	profitMargin?: BigDecimal;
	isAvailable: boolean;
	isLowStock: boolean;
	isOutOfStock: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface ProductTaxMappingResponse {
	taxRateId: UUID;
	taxCode: string;
	taxName: string;
	taxType: TaxType;
	rate: BigDecimal;
	calculatedAmount: BigDecimal;
}

export interface ProductCreateRequest {
	sku: string;
	productName: string;
	description?: string;
	categoryId: UUID;
	merchantId: string;
	price: BigDecimal;
	cost?: BigDecimal;
	stockQuantity: number;
	minStockLevel?: number;
	maxStockLevel?: number;
	status?: ProductStatus;
	imageUrl?: string;
	barcode?: string;
	unitOfMeasure?: string;
	weight?: BigDecimal;
	weightUnit?: string;
	isFeatured?: boolean;
	isTaxable?: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
	productId: UUID;
}

export interface ProductQueryRequest {
	page?: number;
	size?: number;
	categoryId?: UUID;
	merchantId?: string;
	status?: ProductStatus;
	isFeatured?: boolean;
	isLowStock?: boolean;
	isOutOfStock?: boolean;
	search?: string;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// ==================== CATEGORY DOMAIN ====================

export interface CategoryResponse {
	id: UUID;
	categoryName: string;
	description?: string;
	parentCategoryId?: UUID;
	parentCategoryName?: string;
	subCategories: CategoryResponse[];
	isActive: boolean;
	imageUrl?: string;
	sortOrder: number;
	fullPath: string;
	level: number;
	isRootCategory: boolean;
	hasSubCategories: boolean;
	productCount: number;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface CategoryCreateRequest {
	categoryName: string;
	description?: string;
	parentCategoryId?: UUID;
	imageUrl?: string;
	sortOrder?: number;
}

export interface CategoryUpdateRequest {
	categoryId: UUID;
	categoryName?: string;
	description?: string;
	parentCategoryId?: UUID;
	imageUrl?: string;
	sortOrder?: number;
}

// ==================== TAX RATE DOMAIN ====================

export interface TaxRateResponse {
	id: UUID;
	taxCode: string;
	taxName: string;
	description?: string;
	taxType: TaxType;
	rate: BigDecimal;
	jurisdiction: string;
	effectiveFrom: Instant;
	effectiveTo?: Instant;
	isActive: boolean;
	isCurrentlyEffective: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface TaxRateCreateRequest {
	taxCode: string;
	taxName: string;
	description?: string;
	taxType: TaxType;
	rate: BigDecimal;
	jurisdiction: string;
	effectiveFrom: Instant;
	effectiveTo?: Instant;
}

export interface TaxRateUpdateRequest {
	taxRateId: UUID;
	taxCode?: string;
	taxName?: string;
	description?: string;
	taxType?: TaxType;
	rate?: BigDecimal;
	jurisdiction?: string;
	effectiveFrom?: Instant;
	effectiveTo?: Instant;
}

// ==================== INVENTORY DOMAIN ====================

export interface InventoryLocationResponse {
	id: UUID;
	productId: UUID;
	productName: string;
	productSku: string;
	locationType: LocationType;
	locationReference: string;
	locationName: string;
	quantity: number;
	reservedQuantity: number;
	availableQuantity: number;
	minStockLevel: number;
	isActive: boolean;
	isLowStock: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface InventoryLocationCreateRequest {
	productId: UUID;
	locationReference: string;
	locationName: string;
	quantity: number;
	minStockLevel?: number;
}

export interface InventoryReservationRequest {
	locationId: UUID;
	quantity: number;
	eventId?: UUID;
	reason?: string;
}

export interface InventorySummaryResponse {
	productId: UUID;
	productName: string;
	productSku: string;
	totalQuantity: number;
	totalReserved: number;
	totalAvailable: number;
	locationCount: number;
	lowStockLocationCount: number;
	locations: InventoryLocationResponse[];
}

export interface InventoryLocationSearchRequest {
	page?: number;
	size?: number;
	productId?: UUID;
	productName?: string;
	sku?: string;
	locationReference?: string;
	locationName?: string;
	isActive?: boolean;
	isLowStock?: boolean;
	hasReservations?: boolean;
	search?: string;
	sort?: string;
	order?: 'ASC' | 'DESC';
}

export interface InventoryMovementResponse {
	id: UUID;
	productId: UUID;
	productName: string;
	productSku: string;
	movementType: MovementType;
	sourceLocationId?: UUID;
	sourceLocationName?: string;
	destinationReference?: string;
	quantity: number;
	reason?: string;
	notes?: string;
	movementDate: Instant;
	createdAt: Instant;
	createdBy: string;
}

export interface InventoryReceiveRequest {
	productId: UUID;
	locationId: UUID;
	quantity: number;
	supplierReference?: string;
	notes?: string;
}

export interface InventoryTransferRequest {
	productId: UUID;
	sourceLocationId: UUID;
	destinationMachineId: UUID;
	quantity: number;
	notes?: string;
}

export interface InventoryAdjustRequest {
	locationId: UUID;
	productId: UUID;
	adjustmentQuantity: number;
	reason: string;
	notes?: string;
}

export interface InventoryMovementSearchRequest {
	page?: number;
	size?: number;
	productId?: UUID;
	productName?: string;
	sku?: string;
	movementType?: MovementType;
	sourceLocationId?: UUID;
	destinationReference?: string;
	startDate?: Instant;
	endDate?: Instant;
	sort?: string;
	order?: 'ASC' | 'DESC';
}

// ==================== MERCHANT EVENT DOMAIN ====================

export interface EventResponse {
	id: UUID;
	title: string;
	description?: string;
	merchantId: string;
	startDate: Instant;
	endDate: Instant;
	status: EventStatus;
	joinMode: EventJoinMode;
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;
	rewardType: EventRewardType;
	extraSpinCount?: number;
	voucherCode?: string;
	voucherApiEndpoint?: string;
	maxParticipants?: number;
	currentParticipants: number;
	eligibleCount: number;
	redeemedCount: number;
	termsAndConditions?: string;
	imageUrl?: string;
	allowedMachineIds: UUID[];
	isActive: boolean;
	canAcceptNewParticipants: boolean;
	hasReachedMaxParticipants: boolean;
	createdAt: Instant;
	updatedAt: Instant;
	createdBy: string;
	updatedBy: string;
	version: number;
}

export interface EventCreateRequest {
	title: string;
	description?: string;
	merchantId: string;
	startDate: Instant;
	endDate: Instant;
	status?: EventStatus;
	joinMode?: EventJoinMode;
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;
	rewardType: EventRewardType;
	extraSpinCount?: number;
	voucherCode?: string;
	voucherApiEndpoint?: string;
	voucherApiConfig?: string;
	maxParticipants?: number;
	termsAndConditions?: string;
	imageUrl?: string;
	allowedMachineIds?: UUID[];
}

export interface EventUpdateRequest extends Partial<EventCreateRequest> {}

export interface EventJoinRequest {
	eventId: UUID;
	userId: string;
}

export interface ParticipationResponse {
	id: UUID;
	eventId: UUID;
	userId: string;
	eventTitle: string;
	eventDescription?: string;
	eventStartDate: Instant;
	eventEndDate: Instant;
	currentSpend: BigDecimal;
	currentDrawCount: number;
	currentPurchaseSpin: number;
	minimumSpend?: BigDecimal;
	minimumDrawCount?: number;
	minimumPurchaseSpin?: number;
	isEligible: boolean;
	eligibleAt?: Instant;
	isRewardRedeemed: boolean;
	redeemedAt?: Instant;
	rewardReference?: string;
	joinedAt: Instant;
	joinMethod: string;
	spendProgress: number;
	drawProgress: number;
	purchaseSpinProgress: number;
	canRedeemReward: boolean;
	createdAt: Instant;
	updatedAt: Instant;
}

export interface EventSearchRequest {
	page?: number;
	size?: number;
	merchantId?: string;
	status?: EventStatus;
	joinMode?: EventJoinMode;
	rewardType?: EventRewardType;
	isActive?: boolean;
	startDateFrom?: Instant;
	startDateTo?: Instant;
	search?: string;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// ==================== REPORTS DOMAIN ====================

export interface RevenueSummaryRequest {
	dateRangeStart: Instant;
	dateRangeEnd: Instant;
	merchantId?: string;
	machineId?: UUID;
	paymentMethod?: PaymentMethod;
}

export interface RevenueSummaryResponse {
	generatedAt: Instant;
	periodStart: Instant;
	periodEnd: Instant;
	totalRevenue: BigDecimal;
	transactionCount: number;
	avgTransactionValue: BigDecimal;
	minTransactionAmount: BigDecimal;
	maxTransactionAmount: BigDecimal;
	totalDrawCount: number;
	avgDrawCount: number;
	revenueByMethod: RevenueByMethod[];
	revenueByMerchant: RevenueByMerchant[];
	uniqueUserCount: number;
	uniqueMachineCount: number;
	uniqueMerchantCount: number;
	failedPaymentRate: number;
}

export interface RevenueByMethod {
	paymentMethod: PaymentMethod;
	revenue: BigDecimal;
	transactionCount: number;
	percentage: number;
}

export interface RevenueByMerchant {
	merchantId: string;
	merchantName: string;
	revenue: BigDecimal;
	transactionCount: number;
	percentage: number;
}

export interface TotalRevenueResponse {
	totalRevenue: BigDecimal;
	periodStart: Instant;
	periodEnd: Instant;
}

export interface MachinePerformanceRequest {
	page?: number;
	size?: number;
	dateRangeStart?: Instant;
	dateRangeEnd?: Instant;
	merchantId?: string;
	machineId?: UUID;
	machineType?: MachineType;
	isOperational?: boolean;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface MachinePerformanceResponse {
	machineId: UUID;
	machineCode: string;
	machineName: string;
	machineType: string;
	isOperational: boolean;
	locationId?: UUID;
	locationName?: string;
	locationAddress?: string;
	merchantId?: UUID;
	merchantName?: string;
	totalPlays: number;
	successfulPlays: number;
	failedPlays: number;
	successRate: number;
	errorRate: number;
	totalRevenue: BigDecimal;
	averageRevenuePerPlay: BigDecimal;
	revenuePerDay: BigDecimal;
	totalDowntimeHours: number;
	uptimePercentage: number;
	lastMaintenanceDate?: Instant;
	daysSinceLastMaintenance: number;
	needsMaintenance: boolean;
	isLowPerformance: boolean;
	hasHighErrorRate: boolean;
	periodStart: Instant;
	periodEnd: Instant;
	lastUpdated: Instant;
}

export interface MachinePerformanceAggregatedResponse {
	periodStart: Instant;
	periodEnd: Instant;
	totalMachines: number;
	operationalMachines: number;
	totalPlays: number;
	totalRevenue: BigDecimal;
	avgRevenuePerMachine: BigDecimal;
	avgSuccessRate: number;
	avgUptimePercentage: number;
	machinesNeedingMaintenance: number;
	lowPerformanceMachines: number;
	highErrorRateMachines: number;
	topRevenueGenerators: MachinePerformanceResponse[];
	lowestPerformers: MachinePerformanceResponse[];
}

export interface StockLevelRequest {
	page?: number;
	size?: number;
	productId?: UUID;
	categoryId?: UUID;
	merchantId?: string;
	locationReference?: string;
	isLowStock?: boolean;
	isOutOfStock?: boolean;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface StockLevelResponse {
	productId: UUID;
	productName: string;
	productSku: string;
	categoryName: string;
	locationId: UUID;
	locationName: string;
	locationReference: string;
	quantity: number;
	reservedQuantity: number;
	availableQuantity: number;
	minStockLevel: number;
	isLowStock: boolean;
	isOutOfStock: boolean;
	unitCost?: BigDecimal;
	totalValue?: BigDecimal;
	lastUpdated: Instant;
}

export interface StockLevelSummaryResponse {
	totalProducts: number;
	totalLocations: number;
	totalQuantity: number;
	totalReserved: number;
	totalAvailable: number;
	totalValue: BigDecimal;
	lowStockProducts: number;
	outOfStockProducts: number;
	lowStockPercentage: number;
	categorySummary: CategoryStockSummary[];
}

export interface CategoryStockSummary {
	categoryId: UUID;
	categoryName: string;
	productCount: number;
	totalQuantity: number;
	totalValue: BigDecimal;
	lowStockCount: number;
}

export interface EventPerformanceRequest {
	eventId?: UUID;
	merchantId?: string;
	eventStatus?: EventStatus;
	joinMode?: EventJoinMode;
	activeOnly?: boolean;
	startDateFrom?: Instant;
	startDateTo?: Instant;
}

export interface EventPerformanceResponse {
	eventId: UUID;
	eventTitle: string;
	merchantId: string;
	merchantName?: string;
	status: EventStatus;
	joinMode: EventJoinMode;
	rewardType: EventRewardType;
	totalParticipants: number;
	eligibleParticipants: number;
	redeemedRewards: number;
	eligibilityRate: number;
	redemptionRate: number;
	completionRate: number;
	totalRevenue: BigDecimal;
	avgRevenuePerParticipant: BigDecimal;
	avgTimeToEligibility?: number;
	avgTimeToRedemption?: number;
	periodStart: Instant;
	periodEnd: Instant;
}

export interface AggregatedEventPerformance {
	periodStart: Instant;
	periodEnd: Instant;
	totalEvents: number;
	activeEvents: number;
	totalParticipants: number;
	totalEligible: number;
	totalRedeemed: number;
	totalRevenue: BigDecimal;
	avgParticipantsPerEvent: number;
	avgEligibilityRate: number;
	avgRedemptionRate: number;
	topEvents: EventPerformanceResponse[];
}

export interface ReportDefinition {
	id: UUID;
	reportName: string;
	description?: string;
	reportType: ReportType;
	outputFormat: OutputFormat;
	parameters?: string;
	scheduleCron?: string;
	isScheduled: boolean;
	isActive: boolean;
	notificationEmails?: string[];
	retentionDays: number;
	createdAt: Instant;
	updatedAt: Instant;
}

export interface ReportExecution {
	id: UUID;
	reportDefinitionId: UUID;
	status: ExecutionStatus;
	startedAt: Instant;
	completedAt?: Instant;
	outputPath?: string;
	errorMessage?: string;
	triggeredBy: string;
}

export interface SchedulerStats {
	totalDefinitions: number;
	activeDefinitions: number;
	scheduledDefinitions: number;
	recentExecutions: number;
	failedExecutions: number;
}
```

---

## API Base URLs

| Environment | Base URL                                   |
| ----------- | ------------------------------------------ |
| Development | `http://localhost:8080`                    |
| Staging     | `https://api-staging.gachapon.example.com` |
| Production  | `https://api.gachapon.example.com`         |

## Authentication

All API endpoints (except webhooks) require JWT Bearer token authentication:

```
Authorization: Bearer <jwt_token>
```

JWT tokens are issued by Keycloak OIDC provider.

---

_Document generated for frontend development reference. Keep synchronized with backend changes._
