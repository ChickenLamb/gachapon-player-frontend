import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEventById } from '$lib/mocks/data/events';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	const event = getEventById(params.id);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		user: locals.user,
		event
	};
};
