// Mock JWT token validator for development
// When backend is ready, replace with real JWT validation

import type { GachaponUser, GachaponSession } from '$lib/types';
import { mockUsers, mockTokens } from '$lib/mocks/data/users';

/**
 * Validates mock JWT token and returns user data
 * @param token - JWT token from Unity WebView URL
 * @returns User data or null if invalid
 */
export function validateMockToken(token: string): GachaponUser | null {
	// Check if token exists in our mock mapping
	const userId = mockTokens[token];
	if (!userId) {
		return null;
	}

	// Return corresponding mock user
	return mockUsers[userId] || null;
}

/**
 * Creates a mock session from token
 * @param token - JWT token
 * @returns Session data or null if invalid token
 */
export function createMockSession(token: string): GachaponSession | null {
	const user = validateMockToken(token);
	if (!user) {
		return null;
	}

	return {
		token,
		expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		user
	};
}

/**
 * Extracts token from URL search params
 * Unity WebView passes token as: ?token=xxx
 * @param url - Request URL
 * @returns Token string or null
 */
export function extractTokenFromUrl(url: URL): string | null {
	return url.searchParams.get('token');
}

/**
 * Check if we're in development mode using mock auth
 * When backend is ready, set this to false or use env variable
 */
export const USE_MOCK_AUTH = true;

/**
 * TODO: Real JWT validation (implement when backend is ready)
 *
 * import jwt from 'jsonwebtoken';
 *
 * export async function validateRealToken(token: string): Promise<GachaponUser | null> {
 *   try {
 *     const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *     // Validate and return user from decoded payload
 *     return {
 *       id: decoded.sub,
 *       username: decoded.username,
 *       roles: decoded.roles,
 *       unityUserId: decoded.unityUserId,
 *       organizationId: decoded.organizationId
 *     };
 *   } catch (error) {
 *     console.error('JWT validation failed:', error);
 *     return null;
 *   }
 * }
 */
