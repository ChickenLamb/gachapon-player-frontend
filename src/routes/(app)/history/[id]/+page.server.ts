import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getInventoryItemById } from '$lib/mocks/data/inventory';
import { getMachineById } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	const item = getInventoryItemById(params.id);

	if (!item) {
		throw error(404, 'Inventory item not found');
	}

	// Verify item belongs to current user
	if (item.userId !== locals.user.id) {
		throw error(403, 'Access denied');
	}

	// Get full machine details for additional info
	const machine = getMachineById(item.machineId);

	return {
		user: locals.user,
		item,
		machine
	};
};
