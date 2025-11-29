// Mock inventory data - uses actual machine data for realistic mock
import type { InventoryItem, InventoryItemStatus } from '$lib/types';
import { mockMachines } from './machines';

export const mockInventory: Record<string, InventoryItem> = {
	inv_001: {
		id: 'inv_001',
		userId: 'player_456',
		machineId: mockMachines.machine_001.id,
		machineName: mockMachines.machine_001.name,
		machineImageUrl: mockMachines.machine_001.imageUrl,
		pricePerDraw: mockMachines.machine_001.drawCost,
		wonAt: new Date('2024-11-15T10:30:00'),
		status: 'UNCLAIMED' as InventoryItemStatus,
		collectionQRCode: 'qr_collection_001'
	},
	inv_002: {
		id: 'inv_002',
		userId: 'player_456',
		machineId: mockMachines.machine_002.id,
		machineName: mockMachines.machine_002.name,
		machineImageUrl: mockMachines.machine_002.imageUrl,
		pricePerDraw: mockMachines.machine_002.drawCost,
		wonAt: new Date('2024-11-18T14:20:00'),
		status: 'CLAIMED' as InventoryItemStatus,
		claimedAt: new Date('2024-11-18T14:25:00')
	},
	inv_003: {
		id: 'inv_003',
		userId: 'player_456',
		machineId: mockMachines.machine_003.id,
		machineName: mockMachines.machine_003.name,
		machineImageUrl: mockMachines.machine_003.imageUrl,
		pricePerDraw: mockMachines.machine_003.drawCost,
		wonAt: new Date('2024-11-10T09:15:00'),
		status: 'COLLECTED' as InventoryItemStatus,
		claimedAt: new Date('2024-11-10T09:20:00')
	},
	inv_004: {
		id: 'inv_004',
		userId: 'player_456',
		machineId: mockMachines.machine_001.id,
		machineName: mockMachines.machine_001.name,
		machineImageUrl: mockMachines.machine_001.imageUrl,
		pricePerDraw: mockMachines.machine_001.drawCost,
		wonAt: new Date('2024-11-19T16:45:00'),
		status: 'UNCLAIMED' as InventoryItemStatus,
		collectionQRCode: 'qr_collection_004'
	},
	inv_005: {
		id: 'inv_005',
		userId: 'player_789',
		machineId: mockMachines.machine_002.id,
		machineName: mockMachines.machine_002.name,
		machineImageUrl: mockMachines.machine_002.imageUrl,
		pricePerDraw: mockMachines.machine_002.drawCost,
		wonAt: new Date('2024-11-17T11:30:00'),
		status: 'UNCLAIMED' as InventoryItemStatus,
		collectionQRCode: 'qr_collection_005'
	}
};

// Helper: Get inventory items for user
export function getInventoryForUser(userId: string): InventoryItem[] {
	return Object.values(mockInventory)
		.filter((item) => item.userId === userId)
		.sort((a, b) => b.wonAt.getTime() - a.wonAt.getTime()); // Most recent first
}

// Helper: Get inventory item by ID
export function getInventoryItemById(id: string): InventoryItem | null {
	return mockInventory[id] || null;
}

// Helper: Get unclaimed items count
export function getUnclaimedCount(userId: string): number {
	return getInventoryForUser(userId).filter((item) => item.status === 'UNCLAIMED').length;
}
