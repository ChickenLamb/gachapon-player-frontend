// Gachapon-specific types for the player frontend

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface GachaponUser {
	id: string;
	username: string;
	roles: string[];
	// Unity integration fields
	unityUserId?: string;
	organizationId?: string;
}

export interface GachaponSession {
	token: string;
	expiresAt: Date;
	user: GachaponUser;
}

// ============================================
// MACHINE
// ============================================

export type MachineStatus =
	| 'AVAILABLE'
	| 'RENTED'
	| 'MAINTENANCE'
	| 'OUT_OF_SERVICE'
	| 'IN_TRANSIT'
	| 'STORED'
	| 'INSTALLING'
	| 'RETIRED';

export type OwnerType = 'PLATFORM' | 'MERCHANT' | 'FRANCHISE' | 'VENDOR';

export interface Machine {
	id: string;
	name: string;
	serialNumber: string;
	location: string;
	status: MachineStatus;
	drawCost: string; // BigDecimal string (e.g., "5.00" = RM 5.00)
	featuredPrizes: Prize[];
	activeEvents?: MerchantEvent[]; // Machine-specific events
	imageUrl?: string;
	description?: string;
	inventoryCount: number; // Available stock for purchase
	ownerId: string;
	ownerType: OwnerType;
}

// ============================================
// PRIZE
// ============================================

export type PrizeType = 'PHYSICAL' | 'EVOUCHER' | 'FREE_PLAY';
export type PrizeStatus = 'ACTIVE' | 'DISCONTINUED';

export interface Prize {
	id: string;
	name: string;
	description: string;
	imageUrl?: string;
	type: PrizeType;
	status: PrizeStatus;
	rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
	category?: string;
	merchant?: {
		name: string;
		address: string;
	};
}

// ============================================
// EVENT / PROMOTION (types needed by Payment)
// ============================================

export type EventRewardType = 'EXTRA_SPIN' | 'VOUCHER';
export type EventJoinMode = 'AUTO_JOIN' | 'MANUAL_JOIN';
export type EventStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// ============================================
// EVENT PROGRESS (for payment preview)
// ============================================

export interface EventProgressInfo {
	currentSpend: string; // BigDecimal
	targetSpend: string; // BigDecimal
	currentDraws: number;
	targetDraws: number;
	currentSpins: number;
	targetSpins: number;
	spendProgress: number; // 0-100%
	drawProgress: number; // 0-100%
	spinProgress: number; // 0-100%
}

// ============================================
// PAYMENT
// ============================================

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

export type PaymentMethod = 'CARD' | 'EWALLET' | 'ONLINE_BANKING' | 'WECHAT_PAY' | 'ALIPAY';

export interface ApplicableEventInfo {
	eventId: string;
	eventTitle: string;
	rewardType: EventRewardType;
	rewardDescription: string;
	currentProgress: EventProgressInfo;
	willComplete: boolean;
	isAlreadyCompleted: boolean;
}

export interface EarnedRewardInfo {
	eventId: string;
	eventTitle: string;
	rewardType: EventRewardType;
	rewardValue: string; // BigDecimal
	message: string; // Required by API spec
	creditsEarned?: number; // Frontend convenience field
	voucherCode?: string; // Frontend convenience field
}

export interface PaymentPreview {
	machineId: string;
	machineName: string;
	drawCount: number;
	pricePerDraw: string; // BigDecimal
	subtotal: string; // BigDecimal
	applicableEvents: ApplicableEventInfo[];
	totalAmount: string; // BigDecimal
	currency: string;
}

export interface Payment {
	id: string;
	machineId: string;
	userId: string;
	amount: string; // BigDecimal
	currency: string;
	status: PaymentStatus;
	paymentIntentId?: string;
	clientSecret?: string;
	expiresAt?: string;
	earnedRewards?: EarnedRewardInfo[];
	createdAt: Date;
	completedAt?: Date;
}

// ============================================
// QR CODE
// ============================================

export interface QRCode {
	id: string;
	userId: string;
	machineId: string;
	paymentId: string;
	code: string; // Base64 encoded QR code data
	expiresAt: Date;
	createdAt: Date;
	used: boolean;
}

// ============================================
// EVENT / PROMOTION (interface)
// ============================================

export interface MerchantEvent {
	id: string;
	title: string; // API spec uses 'title' not 'name'
	description: string;
	rewardType: EventRewardType;
	joinMode: EventJoinMode;
	status: EventStatus;
	startDate: Date;
	endDate: Date;
	machineIds?: string[]; // Machine IDs this event applies to (empty/null = global event)
	minimumDrawCount?: number; // Minimum draws to qualify
	minimumPurchaseSpin?: number; // Minimum purchase spins required
	rewardValue: string; // BigDecimal - extra spins count or voucher value
	progress?: number; // 0-100 percentage
	requirements?: string[];
	rewards?: string[];
}

// ============================================
// INVENTORY
// ============================================

export type InventoryItemStatus = 'UNCLAIMED' | 'CLAIMED' | 'COLLECTED';

export interface InventoryItem {
	id: string;
	userId: string;
	machineId: string;
	machineName: string;
	machineImageUrl?: string;
	pricePerDraw: string; // BigDecimal (e.g., "5.00" = RM 5.00)
	wonAt: Date;
	status: InventoryItemStatus;
	collectionQRCode?: string;
	claimedAt?: Date;
}

// ============================================
// DRAW CREDITS
// ============================================

export type CreditSourceType = 'PAYMENT' | 'EVENT_REWARD' | 'ADMIN_GRANT' | 'REFUND';

export interface DrawCredit {
	id: string;
	machineId: string;
	userId: string;
	creditsRemaining: number;
	sourceType: CreditSourceType;
	sourceId: string; // paymentId, eventId, etc.
	expiresAt?: Date;
	createdAt: Date;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
	};
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

// ============================================
// UI STATE
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ToastNotification {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number; // In milliseconds
}

// ============================================
// UNITY WEBVIEW
// ============================================

export interface UnityMessage {
	type: 'ready' | 'auth_failed' | 'navigate_back' | 'open_external';
	payload?: unknown;
}

export interface UnityWebViewParams {
	token?: string;
	section?: 'dashboard' | 'prize' | 'inventory' | 'events';
	organizationId?: string;
}
