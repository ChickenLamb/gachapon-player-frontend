import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllEvents } from '$lib/mocks/data/events';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	const events = getAllEvents();

	return {
		user: locals.user,
		events
	};
};
