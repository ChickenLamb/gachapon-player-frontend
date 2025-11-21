// Mock event/promotion data
import type { MerchantEvent, EventType, EventJoinMode } from '$lib/types';

export const mockEvents: Record<string, MerchantEvent> = {
	event_001: {
		id: 'event_001',
		name: 'Grand Opening Special',
		description: 'Play 3 times, get 1 free! Limited time offer for new machine launch.',
		type: 'FREE_PLAY' as EventType,
		joinMode: 'AUTO' as EventJoinMode,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-12-31'),
		machineIds: ['machine_001'], // Anime Paradise only
		progress: 67, // 2 out of 3 plays completed
		requirements: ['Play Anime Paradise 3 times'],
		rewards: ['1 free play token']
	},
	event_002: {
		id: 'event_002',
		name: 'Weekend Discount',
		description: '20% off all plays during weekends!',
		type: 'DISCOUNT' as EventType,
		joinMode: 'AUTO' as EventJoinMode,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-11-30'),
		machineIds: undefined, // Global event - all machines
		progress: undefined,
		requirements: ['Available Sat-Sun only'],
		rewards: ['20% discount on all machines']
	},
	event_003: {
		id: 'event_003',
		name: 'Legendary Hunt',
		description: 'Collect all 3 legendary prizes to unlock exclusive bonus!',
		type: 'BONUS_PRIZE' as EventType,
		joinMode: 'MANUAL' as EventJoinMode,
		startDate: new Date('2024-11-15'),
		endDate: new Date('2025-01-15'),
		machineIds: ['machine_001', 'machine_006'], // Anime Paradise and Mystery Box
		progress: 33, // 1 out of 3 collected
		requirements: [
			'Collect: Limited Edition Plushie',
			'Collect: Mystery Figure',
			'Collect: Golden Ticket'
		],
		rewards: ['Exclusive Super Rare Prize', 'RM 100 voucher']
	},
	event_004: {
		id: 'event_004',
		name: 'First Timer Bonus',
		description: 'New to Gachapon? Get 50% off your first play!',
		type: 'DISCOUNT' as EventType,
		joinMode: 'AUTO' as EventJoinMode,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2025-12-31'),
		machineIds: undefined, // Global event - all machines
		progress: 100, // Already used
		requirements: ['First play only'],
		rewards: ['50% off first play']
	},
	event_005: {
		id: 'event_005',
		name: 'Foodie Special',
		description: 'Get 30% off on dining vouchers!',
		type: 'DISCOUNT' as EventType,
		joinMode: 'AUTO' as EventJoinMode,
		startDate: new Date('2024-11-01'),
		endDate: new Date('2024-12-31'),
		machineIds: ['machine_002'], // Foodie Rewards only
		progress: undefined,
		requirements: ['Valid for Foodie Rewards machine'],
		rewards: ['30% off dining vouchers']
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
