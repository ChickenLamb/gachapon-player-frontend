// Mock play service (prize drawing simulation)
import type { Prize } from '$lib/types';
import { getAllPrizes } from '$lib/mocks/data/machines';

/**
 * Simulate prize drawing based on rarity
 * Weighted random selection
 */
export async function drawPrize(_machineId: string): Promise<Prize> {
	// Simulate machine dispensing delay
	await new Promise((resolve) => setTimeout(resolve, 2000));
	// Note: machineId would be used in real implementation to get machine-specific prizes

	const allPrizes = getAllPrizes();

	// Rarity weights
	const rarityWeights = {
		COMMON: 60, // 60% chance
		RARE: 30, // 30% chance
		LEGENDARY: 10 // 10% chance
	};

	// Calculate total weight
	const totalWeight = allPrizes.reduce((sum, prize) => {
		return sum + (rarityWeights[prize.rarity || 'COMMON'] || 0);
	}, 0);

	// Random selection
	let random = Math.random() * totalWeight;

	for (const prize of allPrizes) {
		const weight = rarityWeights[prize.rarity || 'COMMON'] || 0;
		random -= weight;
		if (random <= 0) {
			return prize;
		}
	}

	// Fallback to random prize
	return allPrizes[Math.floor(Math.random() * allPrizes.length)];
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: 'COMMON' | 'RARE' | 'LEGENDARY' | undefined): string {
	switch (rarity) {
		case 'LEGENDARY':
			return 'text-yellow-600 bg-yellow-50';
		case 'RARE':
			return 'text-purple-600 bg-purple-50';
		case 'COMMON':
		default:
			return 'text-gray-600 bg-gray-50';
	}
}

/**
 * Get rarity display text
 */
export function getRarityText(rarity: 'COMMON' | 'RARE' | 'LEGENDARY' | undefined): string {
	return rarity || 'COMMON';
}
