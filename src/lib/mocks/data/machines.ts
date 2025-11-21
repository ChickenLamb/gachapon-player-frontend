// Mock machine and prize data for development
import type { Machine, Prize, MachineStatus, PrizeType, PrizeStatus } from '$lib/types';
import { getActiveEventsForMachine } from './events';

// Item images from static assets
const itemImages = [
	'/item-01.svg',
	'/item-02.svg',
	'/item-03.svg',
	'/item-04.svg',
	'/item-05.svg',
	'/item-06.svg',
	'/item-07.svg'
];

// Helper to get item image by index (cycles through available images)
function getItemImage(index: number): string {
	return itemImages[index % itemImages.length];
}

// Mock prizes
export const mockPrizes: Record<string, Prize> = {
	prize_001: {
		id: 'prize_001',
		name: 'Limited Edition Plushie',
		description: 'Rare collectible plushie - Series 1',
		imageUrl: getItemImage(0),
		type: 'PHYSICAL' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'LEGENDARY'
	},
	prize_002: {
		id: 'prize_002',
		name: 'Coffee Shop Voucher',
		description: 'RM 20 voucher for participating cafes',
		imageUrl: getItemImage(1),
		type: 'EVOUCHER' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'COMMON'
	},
	prize_003: {
		id: 'prize_003',
		name: 'Free Play Token',
		description: 'One free play on any machine',
		imageUrl: getItemImage(2),
		type: 'FREE_PLAY' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'RARE'
	},
	prize_004: {
		id: 'prize_004',
		name: 'Anime Keychain',
		description: 'Popular anime character keychain',
		imageUrl: getItemImage(3),
		type: 'PHYSICAL' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'COMMON'
	},
	prize_005: {
		id: 'prize_005',
		name: 'Restaurant Voucher',
		description: 'RM 50 dining voucher',
		imageUrl: getItemImage(4),
		type: 'EVOUCHER' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'RARE'
	},
	prize_006: {
		id: 'prize_006',
		name: 'Mystery Figure',
		description: 'Blind box collectible figure',
		imageUrl: getItemImage(5),
		type: 'PHYSICAL' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'LEGENDARY'
	},
	prize_007: {
		id: 'prize_007',
		name: 'Sticker Pack',
		description: 'Cute character sticker collection',
		imageUrl: getItemImage(6),
		type: 'PHYSICAL' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'COMMON'
	},
	prize_008: {
		id: 'prize_008',
		name: 'Game Store Credit',
		description: 'RM 30 credit for game purchases',
		imageUrl: getItemImage(0),
		type: 'EVOUCHER' as PrizeType,
		status: 'ACTIVE' as PrizeStatus,
		rarity: 'RARE'
	}
};

// Machine image from static assets
const machineImage = '/machine.svg';

// Mock machines
export const mockMachines: Record<string, Machine> = {
	machine_001: {
		id: 'machine_001',
		name: 'Anime Paradise',
		location: 'Pavilion KL - Ground Floor',
		status: 'AVAILABLE' as MachineStatus,
		pricePerPlay: 500, // RM 5.00
		featuredPrizes: [mockPrizes.prize_001, mockPrizes.prize_003, mockPrizes.prize_006],
		imageUrl: machineImage,
		description:
			'Premium anime collectibles and limited edition merchandise. High chance of rare items!'
	},
	machine_002: {
		id: 'machine_002',
		name: 'Foodie Rewards',
		location: 'KLCC - Suria Mall Level 2',
		status: 'AVAILABLE' as MachineStatus,
		pricePerPlay: 300, // RM 3.00
		featuredPrizes: [mockPrizes.prize_002, mockPrizes.prize_005],
		imageUrl: machineImage,
		description: 'Win dining vouchers and food discounts from popular restaurants!'
	},
	machine_003: {
		id: 'machine_003',
		name: 'Gaming Zone',
		location: 'Mid Valley Megamall - LG Floor',
		status: 'AVAILABLE' as MachineStatus,
		pricePerPlay: 400, // RM 4.00
		featuredPrizes: [mockPrizes.prize_003, mockPrizes.prize_008, mockPrizes.prize_004],
		imageUrl: machineImage,
		description: 'Game credits, free plays, and gaming merchandise!'
	},
	machine_004: {
		id: 'machine_004',
		name: 'Cute Collection',
		location: '1 Utama - New Wing Level 3',
		status: 'IN_USE' as MachineStatus,
		pricePerPlay: 350, // RM 3.50
		featuredPrizes: [mockPrizes.prize_004, mockPrizes.prize_007],
		imageUrl: machineImage,
		description: 'Adorable keychains, stickers, and kawaii accessories!'
	},
	machine_005: {
		id: 'machine_005',
		name: 'Premium Prizes',
		location: 'Sunway Pyramid - Blue Concourse',
		status: 'MAINTENANCE' as MachineStatus,
		pricePerPlay: 1000, // RM 10.00
		featuredPrizes: [mockPrizes.prize_001, mockPrizes.prize_006],
		imageUrl: machineImage,
		description: 'Exclusive high-value prizes and limited editions. Currently under maintenance.'
	},
	machine_006: {
		id: 'machine_006',
		name: 'Mystery Box',
		location: 'The Gardens Mall - Ground Floor',
		status: 'AVAILABLE' as MachineStatus,
		pricePerPlay: 600, // RM 6.00
		featuredPrizes: [mockPrizes.prize_006, mockPrizes.prize_001, mockPrizes.prize_003],
		imageUrl: machineImage,
		description: 'Surprise prizes every time! Blind boxes and mystery items.'
	}
};

// Helper: Get all machines as array (with active events populated)
export function getAllMachines(): Machine[] {
	return Object.values(mockMachines).map((machine) => ({
		...machine,
		activeEvents: getActiveEventsForMachine(machine.id)
	}));
}

// Helper: Get available machines only
export function getAvailableMachines(): Machine[] {
	return getAllMachines().filter((m) => m.status === 'AVAILABLE');
}

// Helper: Get machine by ID
export function getMachineById(id: string): Machine | null {
	return mockMachines[id] || null;
}

// Helper: Get all prizes as array
export function getAllPrizes(): Prize[] {
	return Object.values(mockPrizes);
}

// Helper: Get prize by ID
export function getPrizeById(id: string): Prize | null {
	return mockPrizes[id] || null;
}
