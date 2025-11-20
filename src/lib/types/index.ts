/**
 * Business Logic Types
 *
 * This file contains type definitions for your application's business logic,
 * domain models, and shared types across components.
 *
 * IMPORTANT: What goes where?
 *
 * ✅ app.d.ts = ONLY SvelteKit App namespace types
 *    - App.Locals (event.locals data like user, db)
 *    - App.PageData (page data from load functions)
 *    - App.Error (custom error shapes)
 *    - App.Platform (Cloudflare bindings)
 *
 * ✅ $lib/types (THIS FILE) = All other types
 *    - Domain models (User, Post, Product)
 *    - API response/request shapes
 *    - Component prop types
 *    - Utility types
 *    - Enums and constants
 *
 * 📖 For data flow understanding, see: DATAFLOW.md
 */

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Extended user type with application-specific fields
 * Base fields come from Better Auth, extend with your custom fields
 */
export interface User {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	// Add your custom fields below:
	// role?: 'admin' | 'user';
	// bio?: string;
	// preferences?: UserPreferences;
}

/**
 * User profile data for display and updates
 */
export interface UserProfile {
	name: string;
	email: string;
	image?: string;
	// Add custom profile fields
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Standard API response wrapper
 * Use this for consistent API responses across endpoints
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
	page: number;
	limit: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

// ============================================================================
// LOADING & STATUS TYPES
// ============================================================================

/**
 * Loading state for async operations
 * Use this in components to track operation status
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form submission status
 * Useful for tracking form submission states
 */
export interface FormStatus {
	state: LoadingState;
	message?: string;
	errors?: Record<string, string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
	[P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T that have values of type V
 */
export type KeysOfType<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// ============================================================================
// GACHAPON DOMAIN TYPES
// ============================================================================

/**
 * Re-export all Gachapon-specific types
 * See gachapon.ts for detailed type definitions
 */
export * from './gachapon';

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is an API error response
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiResponse<T> & {
	success: false;
	error: string;
} {
	return !response.success && typeof response.error === 'string';
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}
