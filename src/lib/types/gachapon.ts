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

export type MachineStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OFFLINE';

export interface Machine {
	id: string;
	name: string;
	location: string;
	status: MachineStatus;
	pricePerPlay: number; // In cents (e.g., 500 = RM 5.00)
	featuredPrizes: Prize[];
	imageUrl?: string;
	description?: string;
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
// PAYMENT
// ============================================

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface PaymentPreview {
	subtotal: number; // In cents
	tax: number; // In cents
	discount: number; // In cents
	total: number; // In cents
	appliedEventId?: string;
}

export interface Payment {
	id: string;
	machineId: string;
	userId: string;
	amount: number; // In cents
	status: PaymentStatus;
	transactionId?: string;
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
// EVENT / PROMOTION
// ============================================

export type EventType = 'DISCOUNT' | 'FREE_PLAY' | 'BONUS_PRIZE';
export type EventJoinMode = 'AUTO' | 'MANUAL';

export interface MerchantEvent {
	id: string;
	name: string;
	description: string;
	type: EventType;
	joinMode: EventJoinMode;
	startDate: Date;
	endDate: Date;
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
	prize: Prize;
	wonAt: Date;
	status: InventoryItemStatus;
	collectionQRCode?: string;
	claimedAt?: Date;
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
