import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMachineById } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	// Get machine
	const machine = getMachineById(params.id);

	if (!machine) {
		throw error(404, 'Machine not found');
	}

	if (machine.status !== 'AVAILABLE') {
		throw error(400, 'Machine is not available');
	}

	return {
		user: locals.user,
		machine
	};
};
