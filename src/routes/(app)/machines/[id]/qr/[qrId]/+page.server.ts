import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMachineById } from '$lib/mocks/data/machines';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth-test?token=dev_player_token');
	}

	// Get machine
	const machine = getMachineById(params.id);

	if (!machine) {
		throw error(404, 'Machine not found');
	}

	// Mock QR code data (in production, fetch from backend)
	const qrCode = {
		id: params.qrId,
		userId: locals.user.id,
		machineId: params.id,
		paymentId: `payment_mock_${params.qrId}`,
		code: btoa(
			JSON.stringify({
				qrId: params.qrId,
				userId: locals.user.id,
				machineId: params.id,
				timestamp: Date.now()
			})
		),
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
		createdAt: new Date(),
		used: false
	};

	return {
		user: locals.user,
		machine,
		qrCode
	};
};
