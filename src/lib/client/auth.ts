import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: '' // Uses same origin by default
});

// Export commonly used methods for convenience
export const {
	signIn,
	signUp,
	signOut,
	useSession,
	updateUser,
	changePassword,
	forgetPassword,
	resetPassword
} = authClient;
