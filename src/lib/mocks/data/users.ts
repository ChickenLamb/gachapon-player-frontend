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
	}
};

// Mock JWT tokens → user mapping
export const mockTokens: Record<string, string> = {
	// Format: token → userId
	dev_player_token: 'player_456',
	dev_test_token: 'player_789'
};
