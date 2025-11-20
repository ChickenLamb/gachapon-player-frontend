import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createDB } from '$lib/server/db';
import { createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

const handleDatabase: Handle = async ({ event, resolve }) => {
	event.locals.db = createDB(event.platform!.env.DB);
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	// Create Better Auth instance with DB from event.locals
	const auth = createAuth(event.locals.db);

	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Populate event.locals with session data
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	} else {
		event.locals.session = null;
		event.locals.user = null;
	}

	// Handle Better Auth routes (/api/auth/*)
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleDatabase, handleParaglide, handleAuth);
