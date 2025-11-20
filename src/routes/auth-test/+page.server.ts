import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectPath = url.searchParams.get('redirect');

	// If already authenticated and redirect parameter exists, go there directly
	if (locals.user && redirectPath) {
		throw redirect(302, redirectPath);
	}

	return {
		user: locals.user,
		session: locals.session,
		tokenFromUrl: url.searchParams.get('token'),
		redirectAfterAuth: redirectPath || '/dashboard'
	};
};
