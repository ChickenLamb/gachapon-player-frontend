import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getInventoryForUser } from '$lib/mocks/data/inventory';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	const inventory = getInventoryForUser(locals.user.id);

	return {
		user: locals.user,
		inventory
	};
};
