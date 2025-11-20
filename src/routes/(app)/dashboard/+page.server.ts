import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMachines } from '$lib/mocks/data/machines';
import { getActiveEvents } from '$lib/mocks/data/events';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	// Note: hooks.server.ts handles token validation and sets locals.user
	if (!locals.user) {
		// Not authenticated - redirect to landing page
		throw redirect(302, '/');
	}

	// Load machines and events
	const machines = getAllMachines();
	const activeEvents = getActiveEvents();

	return {
		user: locals.user,
		machines,
		activeEvents
	};
};
