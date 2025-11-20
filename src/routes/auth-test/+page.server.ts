import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tokenParam = url.searchParams.get('token');
	const redirectPath = url.searchParams.get('redirect');

	// If token was provided in URL and authentication succeeded, redirect immediately
	if (tokenParam && locals.user) {
		throw redirect(302, redirectPath || '/dashboard');
	}

	// If already authenticated and redirect parameter exists, go there directly
	if (locals.user && redirectPath) {
		throw redirect(302, redirectPath);
	}

	return {
		user: locals.user,
		session: locals.session,
		tokenFromUrl: tokenParam,
		redirectAfterAuth: redirectPath || '/dashboard'
	};
};
