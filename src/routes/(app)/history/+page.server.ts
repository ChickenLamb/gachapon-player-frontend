import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getInventoryForUser } from '$lib/mocks/data/inventory';
import { getMachineById } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	const inventory = getInventoryForUser(locals.user.id);

	// Enrich inventory items with full machine data
	const enrichedInventory = inventory.map((item) => {
		const machine = getMachineById(item.machineId);
		return {
			...item,
			machine
		};
	});

	return {
		user: locals.user,
		inventory: enrichedInventory
	};
};
