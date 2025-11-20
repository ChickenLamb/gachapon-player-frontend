// Mock user data for development
import type { GachaponUser } from '$lib/types';

export const mockUsers: Record<string, GachaponUser> = {
	// Regular player 1
	player_456: {
		id: 'player_456',
		username: 'demo_player',
		roles: ['player'],
		unityUserId: 'unity_player_001',
		organizationId: 'org_demo_001'
	},
	// Regular player 2
	player_789: {
		id: 'player_789',
		username: 'test_player',
		roles: ['player'],
		unityUserId: 'unity_player_002',
		organizationId: 'org_demo_002'
	},
	// Test users for E2E tests
	user_mock_alice: {
		id: 'user_mock_alice',
		username: 'Alice Chen',
		roles: ['player'],
		unityUserId: 'unity_alice',
		organizationId: 'org_test_001'
	},
	user_mock_bob: {
		id: 'user_mock_bob',
		username: 'Bob Wang',
		roles: ['player'],
		unityUserId: 'unity_bob',
		organizationId: 'org_test_002'
	},
	user_mock_charlie: {
		id: 'user_mock_charlie',
		username: 'Charlie Liu',
		roles: ['player'],
		unityUserId: 'unity_charlie',
		organizationId: 'org_test_003'
	}
};

// Mock JWT tokens → user mapping
export const mockTokens: Record<string, string> = {
	// Format: token → userId
	dev_player_token: 'player_456',
	dev_test_token: 'player_789',
	// E2E test tokens
	mock_token_alice: 'user_mock_alice',
	mock_token_bob: 'user_mock_bob',
	mock_token_charlie: 'user_mock_charlie'
};
