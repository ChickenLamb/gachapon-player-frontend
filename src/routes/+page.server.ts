import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already authenticated, go to dashboard
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	// Not authenticated - show landing page
	return {
		user: null
	};
};
