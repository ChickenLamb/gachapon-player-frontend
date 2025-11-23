// Mock Friend A (Auth Service) - JWT validation and token generation
import type { GachaponUser, GachaponSession } from '$lib/types';

/**
 * Mock JWT payload structure
 * Simulates Friend A's SSO token payload
 */
export interface JWTPayload {
	sub: string; // User ID
	email: string;
	name: string;
	roles: string[];
	iat: number; // Issued at (Unix timestamp)
	exp: number; // Expiration (Unix timestamp)
	organizationId?: string;
}

/**
 * Mock JWT token validation response
 */
export interface AuthValidationResponse {
	valid: boolean;
	user?: GachaponUser;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * Mock user database for testing
 * In real app, Friend A maintains this data
 */
const MOCK_USERS: Record<string, GachaponUser> = {
	user_001: {
		id: 'user_001',
		username: 'demo.player@example.com',
		roles: ['player'],
		organizationId: 'org_001'
	},
	user_002: {
		id: 'user_002',
		username: 'vip.player@example.com',
		roles: ['player', 'vip'],
		organizationId: 'org_001'
	},
	user_admin: {
		id: 'user_admin',
		username: 'admin@example.com',
		roles: ['player', 'admin'],
		organizationId: 'org_001'
	}
};

/**
 * Generate mock JWT token
 * In production, Friend A's SSO service generates this
 */
export function generateMockJWT(userId: string): string {
	const user = MOCK_USERS[userId];
	if (!user) {
		throw new Error(`User ${userId} not found in mock database`);
	}

	const payload: JWTPayload = {
		sub: user.id,
		email: user.username,
		name: user.username.split('@')[0],
		roles: user.roles,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
		organizationId: user.organizationId
	};

	// Mock JWT: base64(header).base64(payload).signature
	// Real JWT would be signed with secret key
	const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const payloadBase64 = btoa(JSON.stringify(payload));
	const signature = btoa(`mock_signature_${userId}`);

	return `${header}.${payloadBase64}.${signature}`;
}

/**
 * Parse mock JWT token
 * Extracts payload from mock JWT structure
 */
function parseMockJWT(token: string): JWTPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		const payloadBase64 = parts[1];
		const payload = JSON.parse(atob(payloadBase64));
		return payload as JWTPayload;
	} catch {
		return null;
	}
}

/**
 * Validate JWT token
 * POST /api/v1/Auth/validate (Friend A's endpoint)
 *
 * In production, this calls Friend A's SSO service
 * Returns user data if token is valid
 */
export async function validateJWT(token: string): Promise<AuthValidationResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Parse token
	const payload = parseMockJWT(token);
	if (!payload) {
		return {
			valid: false,
			error: {
				code: 'INVALID_TOKEN',
				message: 'Token format is invalid'
			}
		};
	}

	// Check expiration
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp < now) {
		return {
			valid: false,
			error: {
				code: 'TOKEN_EXPIRED',
				message: 'Token has expired'
			}
		};
	}

	// Check if user exists
	const user = MOCK_USERS[payload.sub];
	if (!user) {
		return {
			valid: false,
			error: {
				code: 'USER_NOT_FOUND',
				message: 'User does not exist'
			}
		};
	}

	return {
		valid: true,
		user
	};
}

/**
 * Mock login flow
 * Simulates Friend A's SSO login process
 * Returns session with JWT token
 */
export async function mockLogin(userId: string): Promise<GachaponSession> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const user = MOCK_USERS[userId];
	if (!user) {
		throw new Error(`User ${userId} not found`);
	}

	const token = generateMockJWT(userId);
	const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

	return {
		token,
		expiresAt,
		user
	};
}

/**
 * Mock logout
 * In production, would invalidate token on Friend A's side
 */
export async function mockLogout(): Promise<void> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 200));
	// In real app, Friend A would invalidate the token
	// Token parameter would be used in production to identify session
}

/**
 * Refresh JWT token
 * In production, calls Friend A to get new token before expiry
 */
export async function refreshJWT(token: string): Promise<string | null> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 400));

	const payload = parseMockJWT(token);
	if (!payload) {
		return null;
	}

	// Check if token is still valid (not expired)
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp < now) {
		return null; // Cannot refresh expired token
	}

	// Generate new token with same user
	return generateMockJWT(payload.sub);
}

/**
 * Get available mock users for testing
 */
export function getMockUsers(): GachaponUser[] {
	return Object.values(MOCK_USERS);
}
