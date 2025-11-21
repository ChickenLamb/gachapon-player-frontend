import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMachines } from '$lib/mocks/data/machines';
import { getActiveEvents } from '$lib/mocks/data/events';
import { getInventoryForUser } from '$lib/mocks/data/inventory';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	// Note: hooks.server.ts handles token validation and sets locals.user
	if (!locals.user) {
		// Not authenticated - redirect to landing page
		throw redirect(302, '/');
	}

	// Load machines, events, and inventory
	const machines = getAllMachines();
	const activeEvents = getActiveEvents();
	const inventory = getInventoryForUser(locals.user.id);

	return {
		user: locals.user,
		machines,
		activeEvents,
		inventory
	};
};
