import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createDB } from '$lib/server/db';
import {
	USE_MOCK_AUTH,
	extractTokenFromUrl,
	createMockSession
} from '$lib/server/auth-mock';

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
	// Extract JWT token from Unity WebView URL (?token=xxx)
	const url = new URL(event.request.url);
	const token = extractTokenFromUrl(url);

	if (token) {
		if (USE_MOCK_AUTH) {
			// Development: Use mock token validator
			const session = createMockSession(token);
			if (session) {
				event.locals.session = session;
				event.locals.user = session.user;
			} else {
				event.locals.session = null;
				event.locals.user = null;
			}
		} else {
			// Production: Use real JWT validation (TODO: implement when backend ready)
			// const session = await validateRealJWT(token, event.locals.db);
			// event.locals.session = session;
			// event.locals.user = session?.user || null;
			event.locals.session = null;
			event.locals.user = null;
		}
	} else {
		// No token provided
		event.locals.session = null;
		event.locals.user = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleDatabase, handleParaglide, handleAuth);
