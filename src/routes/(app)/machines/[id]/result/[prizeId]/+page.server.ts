import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMachineById, getPrizeById } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	// Get machine and prize
	const machine = getMachineById(params.id);
	const prize = getPrizeById(params.prizeId);

	if (!machine) {
		throw error(404, 'Machine not found');
	}

	if (!prize) {
		throw error(404, 'Prize not found');
	}

	return {
		user: locals.user,
		machine,
		prize
	};
};
