import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMachines } from '$lib/mocks/data/machines';
import { getActiveEvents } from '$lib/mocks/data/events';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Check if token is provided in URL (Unity WebView entry point)
	const token = url.searchParams.get('token');

	if (token) {
		// Token provided but not authenticated yet - validate token via auth-test
		throw redirect(302, `/auth-test?token=${token}&redirect=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Require authentication
	if (!locals.user) {
		// No token and not authenticated - redirect to landing page
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
