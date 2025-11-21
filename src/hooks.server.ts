import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { createDB } from '$lib/server/db';
import { USE_MOCK_AUTH, extractTokenFromUrl, createMockSession } from '$lib/server/auth-mock';

const handleDatabase: Handle = async ({ event, resolve }) => {
	// Skip database initialization if platform bindings not available (Docker dev mode)
	if (event.platform?.env?.DB) {
		event.locals.db = createDB(event.platform.env.DB);
	}
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
	const tokenFromUrl = extractTokenFromUrl(url);

	// Priority 1: Token in URL (initial auth from Unity WebView)
	if (tokenFromUrl) {
		if (USE_MOCK_AUTH) {
			// Development: Use mock token validator
			const session = createMockSession(tokenFromUrl);
			if (session) {
				// Store session in httpOnly cookie for subsequent requests
				event.cookies.set('session_token', tokenFromUrl, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 // 24 hours
				});

				event.locals.session = session;
				event.locals.user = session.user;
			} else {
				event.locals.session = null;
				event.locals.user = null;
			}
		} else {
			// Production: Use real JWT validation (TODO: implement when backend ready)
			// const session = await validateRealJWT(tokenFromUrl, event.locals.db);
			// if (session) {
			//   event.cookies.set('session_token', tokenFromUrl, { ... });
			//   event.locals.session = session;
			//   event.locals.user = session.user;
			// }
			event.locals.session = null;
			event.locals.user = null;
		}
	} else {
		// Priority 2: Check for existing session cookie
		const sessionToken = event.cookies.get('session_token');

		if (sessionToken) {
			if (USE_MOCK_AUTH) {
				// Validate session token from cookie
				const session = createMockSession(sessionToken);
				if (session) {
					event.locals.session = session;
					event.locals.user = session.user;
				} else {
					// Invalid session - clear cookie
					event.cookies.delete('session_token', { path: '/' });
					event.locals.session = null;
					event.locals.user = null;
				}
			} else {
				// Production: Validate real JWT from cookie
				// const session = await validateRealJWT(sessionToken, event.locals.db);
				// event.locals.session = session;
				// event.locals.user = session?.user || null;
				event.locals.session = null;
				event.locals.user = null;
			}
		} else {
			// No token in URL and no session cookie
			event.locals.session = null;
			event.locals.user = null;
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleDatabase, handleParaglide, handleAuth);
