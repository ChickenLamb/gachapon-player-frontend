<script lang="ts">
	import { goto } from '$app/navigation';
	import { CreditCard, Loader2 } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import LoadingSpinner from '$lib/components/base/LoadingSpinner.svelte';
	import {
		createPaymentPreview,
		createPayment,
		formatPrice
	} from '$lib/mocks/services/payment';
	import { generateQRCode } from '$lib/mocks/services/qr';
	import type { PaymentPreview } from '$lib/types';

	let { data } = $props();

	let paymentPreview = $state<PaymentPreview | null>(null);
	let isLoadingPreview = $state(true);
	let isProcessing = $state(false);
	let error = $state<string | null>(null);

	// Load payment preview
	$effect(() => {
		loadPaymentPreview();
	});

	async function loadPaymentPreview() {
		try {
			isLoadingPreview = true;
			// TODO: Check for applicable events
			paymentPreview = await createPaymentPreview(
				data.machine.id,
				data.machine.pricePerPlay
			);
		} catch {
			error = 'Failed to load payment details';
		} finally {
			isLoadingPreview = false;
		}
	}

	async function handlePayment() {
		if (!paymentPreview || isProcessing) return;

		try {
			isProcessing = true;
			error = null;

			// 1. Create payment
			const payment = await createPayment(
				data.user.id,
				data.machine.id,
				paymentPreview.total
			);

			// 2. Generate QR code
			const qrCode = await generateQRCode(
				data.user.id,
				data.machine.id,
				payment.id
			);

			// 3. Navigate to QR display
			goto(`/machines/${data.machine.id}/qr/${qrCode.id}`);
		} catch {
			error = 'Payment failed. Please try again.';
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title="Payment" showBack={true} />

	<div class="p-6 space-y-6 pb-32">
		<!-- Machine Summary -->
		<div class="bg-white rounded-xl border border-gray-200 p-4">
			<div class="flex gap-4">
				<div class="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
					<img
						src={data.machine.imageUrl}
						alt={data.machine.name}
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="flex-1 min-w-0">
					<h2 class="font-semibold text-gray-900 mb-1">{data.machine.name}</h2>
					<p class="text-sm text-gray-600 truncate">{data.machine.location}</p>
				</div>
			</div>
		</div>

		<!-- Payment Preview -->
		{#if isLoadingPreview}
			<div class="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
				<LoadingSpinner size="md" />
			</div>
		{:else if paymentPreview}
			<div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
				<h3 class="font-semibold text-gray-900 mb-3">Payment Summary</h3>

				<!-- Subtotal -->
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Subtotal</span>
					<span class="text-gray-900">{formatPrice(paymentPreview.subtotal)}</span>
				</div>

				<!-- Tax -->
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Tax (6%)</span>
					<span class="text-gray-900">{formatPrice(paymentPreview.tax)}</span>
				</div>

				<!-- Discount -->
				{#if paymentPreview.discount > 0}
					<div class="flex justify-between text-sm">
						<span class="text-green-600">Discount</span>
						<span class="text-green-600">-{formatPrice(paymentPreview.discount)}</span>
					</div>
				{/if}

				<div class="border-t border-gray-200 pt-3">
					<div class="flex justify-between">
						<span class="font-semibold text-gray-900">Total</span>
						<span class="text-2xl font-bold text-purple-600">
							{formatPrice(paymentPreview.total)}
						</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Payment Method (Mock) -->
		<div class="bg-white rounded-xl border border-gray-200 p-4">
			<h3 class="font-semibold text-gray-900 mb-3">Payment Method</h3>
			<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-purple-600">
				<CreditCard class="w-6 h-6 text-purple-600" />
				<div class="flex-1">
					<p class="font-medium text-gray-900">Mock Payment</p>
					<p class="text-xs text-gray-500">Development mode - instant approval</p>
				</div>
			</div>
			<p class="text-xs text-gray-500 mt-3">
				In production, this will use real payment gateway (Stripe, iPay88, etc.)
			</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{/if}
	</div>

	<!-- Fixed Bottom CTA -->
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
		<button
			type="button"
			onclick={handlePayment}
			disabled={isProcessing || isLoadingPreview || !paymentPreview}
			class="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
		>
			{#if isProcessing}
				<Loader2 class="w-5 h-5 animate-spin" />
				<span>Processing...</span>
			{:else if paymentPreview}
				<span>Pay {formatPrice(paymentPreview.total)}</span>
			{:else}
				<span>Loading...</span>
			{/if}
		</button>
		<p class="text-center text-xs text-gray-500 mt-2">
			Secure mock payment for development
		</p>
	</div>
</div>
