// API-specific types aligned with backend spec
// These types represent the exact structure of API requests/responses and WebSocket messages

import type {
	PaymentStatus,
	PaymentMethod,
	EarnedRewardInfo,
	ApplicableEventInfo
} from './gachapon';

// ============================================
// BASE API RESPONSE WRAPPER
// ============================================

export interface ErrorDetail {
	code: string;
	message: string;
	details?: Record<string, unknown>;
}

export interface BaseResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	traceId?: string;
	timestamp: string;
	error?: ErrorDetail;
}

// ============================================
// WEBSOCKET PROTOCOL
// ============================================

export type WebSocketDomain = 'payment' | 'qr_code' | 'system';

export type WebSocketMessageType =
	| 'PING'
	| 'PONG'
	| 'ERROR'
	| 'QR_CODE_GENERATED'
	| 'QR_CODE_SCANNED'
	| 'REDIRECT_TO_PAYMENT'
	| 'PAYMENT_STATUS_UPDATE'
	| 'PAYMENT_COMPLETED'
	| 'PAYMENT_FAILED';

export interface HubMessage<T = unknown> {
	domain?: WebSocketDomain;
	type: WebSocketMessageType;
	data?: T;
	timestamp: string;
}

// ============================================
// QR CODE WEBSOCKET MESSAGES
// ============================================

export interface QRCodeGeneratedData {
	code: string;
	expiresAt: string;
	sessionId: string;
}

export interface QRCodeScannedData {
	machineId: string;
	machineName: string;
	machineSerialNumber: string;
	scannedAt: string;
}

export interface PaymentRedirectNotification {
	machineId: string;
	machineName: string;
	machineSerialNumber: string;
	pricePerDraw: string; // BigDecimal
	userId: string;
	sessionToken: string;
	timestamp: string;
}

// ============================================
// PAYMENT STATUS WEBSOCKET MESSAGES
// ============================================

export interface PaymentStatusUpdateData {
	paymentId: string;
	status: PaymentStatus;
	message?: string;
	timestamp: string;
}

export interface PaymentCompletedData {
	paymentId: string;
	creditsAdded: number;
	machineId: string;
	earnedRewards: EarnedRewardInfo[];
	timestamp: string;
}

export interface PaymentFailedData {
	paymentId: string;
	errorCode: string;
	errorMessage: string;
	timestamp: string;
}

// ============================================
// PAYMENT API REQUESTS
// ============================================

export interface PaymentPreviewRequest {
	machineId: string;
	drawCount: number;
}

export interface PaymentCreateRequest {
	machineId: string;
	drawCount: number;
	paymentMethod?: PaymentMethod;
	returnUrl?: string;
}

export interface PaymentConfirmRequest {
	paymentId: string;
	paymentMethodId?: string;
}

// ============================================
// PAYMENT API RESPONSES
// ============================================

export interface PaymentPreviewResponse {
	machineId: string;
	machineName: string;
	drawCount: number;
	pricePerDraw: string; // BigDecimal
	subtotal: string; // BigDecimal
	applicableEvents: ApplicableEventInfo[];
	totalAmount: string; // BigDecimal
	currency: string;
}

export interface PaymentCreateResponse {
	paymentId: string;
	clientSecret: string;
	paymentIntentId: string;
	amount: string; // BigDecimal
	currency: string;
	status: PaymentStatus;
	expiresAt: string;
	earnedRewards: EarnedRewardInfo[];
}

export interface PaymentStatusResponse {
	paymentId: string;
	status: PaymentStatus;
	amount: string; // BigDecimal
	currency: string;
	creditsAdded?: number;
	earnedRewards?: EarnedRewardInfo[];
	errorMessage?: string;
}

// ============================================
// DRAW API
// ============================================

export interface DrawRequest {
	machineId: string;
	creditId?: string; // Specific credit to use
}

export interface DrawResponse {
	drawId: string;
	prizeId: string;
	prizeName: string;
	prizeType: string;
	prizeImageUrl?: string;
	creditsRemaining: number;
	timestamp: string;
}

// ============================================
// MACHINE API
// ============================================

export interface MachineListRequest {
	page?: number;
	pageSize?: number;
	status?: string;
	location?: string;
}

export interface MachineDetailRequest {
	machineId: string;
}

// ============================================
// CREDITS API
// ============================================

export interface CreditsBalanceResponse {
	machineId: string;
	totalCredits: number;
	credits: CreditDetail[];
}

export interface CreditDetail {
	creditId: string;
	creditsRemaining: number;
	sourceType: string;
	expiresAt?: string;
	createdAt: string;
}

// ============================================
// AIRWALLEX INTEGRATION
// ============================================

export interface AirwallexConfig {
	env: 'staging' | 'production';
	clientId: string;
}

export interface AirwallexPaymentIntent {
	id: string;
	clientSecret: string;
	amount: string;
	currency: string;
	status: string;
}
