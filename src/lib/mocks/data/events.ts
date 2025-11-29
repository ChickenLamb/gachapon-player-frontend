// Mock event/promotion data
import type { MerchantEvent, EventRewardType, EventJoinMode, EventStatus } from '$lib/types';

export const mockEvents: Record<string, MerchantEvent> = {
	event_001: {
		id: 'event_001',
		title: 'Grand Opening Special',
		description: 'Play 3 times, get 1 free! Limited time offer for new machine launch.',
		rewardType: 'EXTRA_SPIN' as EventRewardType,
		joinMode: 'AUTO_JOIN' as EventJoinMode,
		status: 'ACTIVE' as EventStatus,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-12-31'),
		machineIds: ['machine_001'], // Anime Paradise only
		minimumDrawCount: 3,
		minimumPurchaseSpin: 3,
		rewardValue: '1', // 1 extra spin
		progress: 67, // 2 out of 3 plays completed
		requirements: ['Play Anime Paradise 3 times'],
		rewards: ['1 free play token']
	},
	event_002: {
		id: 'event_002',
		title: 'Weekend Bonus',
		description: 'Get extra spins during weekends!',
		rewardType: 'EXTRA_SPIN' as EventRewardType,
		joinMode: 'AUTO_JOIN' as EventJoinMode,
		status: 'ACTIVE' as EventStatus,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-11-30'),
		machineIds: undefined, // Global event - all machines
		minimumDrawCount: 5,
		minimumPurchaseSpin: 5,
		rewardValue: '2', // 2 extra spins
		progress: undefined,
		requirements: ['Available Sat-Sun only'],
		rewards: ['2 extra spins on all machines']
	},
	event_003: {
		id: 'event_003',
		title: 'Legendary Hunt',
		description: 'Collect prizes and earn voucher rewards!',
		rewardType: 'VOUCHER' as EventRewardType,
		joinMode: 'MANUAL_JOIN' as EventJoinMode,
		status: 'ACTIVE' as EventStatus,
		startDate: new Date('2024-11-15'),
		endDate: new Date('2025-01-15'),
		machineIds: ['machine_001', 'machine_006'], // Anime Paradise and Mystery Box
		minimumDrawCount: 10,
		minimumPurchaseSpin: 10,
		rewardValue: '100.00', // RM 100 voucher
		progress: 33, // 1 out of 3 collected
		requirements: [
			'Collect: Limited Edition Plushie',
			'Collect: Mystery Figure',
			'Collect: Golden Ticket'
		],
		rewards: ['Exclusive RM 100 voucher']
	},
	event_004: {
		id: 'event_004',
		title: 'First Timer Bonus',
		description: 'New to Gachapon? Get bonus spins on your first purchase!',
		rewardType: 'EXTRA_SPIN' as EventRewardType,
		joinMode: 'AUTO_JOIN' as EventJoinMode,
		status: 'ACTIVE' as EventStatus,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2025-12-31'),
		machineIds: undefined, // Global event - all machines
		minimumDrawCount: 1,
		minimumPurchaseSpin: 1,
		rewardValue: '1', // 1 extra spin
		progress: 100, // Already used
		requirements: ['First play only'],
		rewards: ['1 bonus spin on first purchase']
	},
	event_005: {
		id: 'event_005',
		title: 'Foodie Rewards',
		description: 'Play and earn food vouchers!',
		rewardType: 'VOUCHER' as EventRewardType,
		joinMode: 'AUTO_JOIN' as EventJoinMode,
		status: 'ACTIVE' as EventStatus,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-12-31'),
		machineIds: ['machine_002'], // Foodie Rewards only
		minimumDrawCount: 5,
		minimumPurchaseSpin: 5,
		rewardValue: '20.00', // RM 20 voucher
		progress: undefined,
		requirements: ['Valid for Foodie Rewards machine'],
		rewards: ['RM 20 dining voucher']
	}
};

// Helper: Get all events
export function getAllEvents(): MerchantEvent[] {
	return Object.values(mockEvents);
}

// Helper: Get active events
export function getActiveEvents(): MerchantEvent[] {
	const now = new Date();
	return getAllEvents().filter((e) => e.startDate <= now && e.endDate >= now);
}

// Helper: Get event by ID
export function getEventById(id: string): MerchantEvent | null {
	return mockEvents[id] || null;
}

// Helper: Get active events for a specific machine
export function getActiveEventsForMachine(machineId: string): MerchantEvent[] {
	const now = new Date();
	return getAllEvents().filter((event) => {
		// Check if event is active (within date range)
		const isActive = event.startDate <= now && event.endDate >= now;

		// Check if event applies to this machine
		// If machineIds is undefined or empty, it's a global event
		const appliesToMachine =
			!event.machineIds || event.machineIds.length === 0 || event.machineIds.includes(machineId);

		return isActive && appliesToMachine;
	});
}
