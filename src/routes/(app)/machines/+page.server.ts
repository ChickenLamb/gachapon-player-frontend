import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMachines } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/');
	}

	// Load all machines
	const allMachines = getAllMachines();

	// Filter to show only AVAILABLE machines as per user requirement
	const machines = allMachines.filter((machine) => machine.status === 'AVAILABLE');

	return {
		user: locals.user,
		machines
	};
};
