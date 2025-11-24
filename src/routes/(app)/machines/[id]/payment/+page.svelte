<script lang="ts">
	import { goto } from '$app/navigation';
	import { CreditCard, LoaderCircle } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import LoadingSpinner from '$lib/components/base/LoadingSpinner.svelte';
	import { createPaymentPreview, createPayment, formatPrice } from '$lib/mocks/services/payment';
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
			paymentPreview = await createPaymentPreview(data.machine.id, data.machine.pricePerPlay);
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

			// 1. Create payment (machine receives via WS, unlocks dispenser)
			await createPayment(data.user.id, data.machine.id, paymentPreview.total);

			// 2. Redirect to dashboard with paid flag (shows spin reminder modal)
			goto('/dashboard?paid=true');
		} catch {
			error = 'Payment failed. Please try again.';
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title="Payment" showBack={true} />

	<div class="space-y-6 p-6 pb-32">
		<!-- Machine Summary -->
		<div class="rounded-xl border border-gray-200 bg-white p-4">
			<div class="flex gap-4">
				<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
					<img
						src={data.machine.imageUrl}
						alt={data.machine.name}
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="mb-1 font-semibold text-gray-900">{data.machine.name}</h2>
					<p class="truncate text-sm text-gray-600">{data.machine.location}</p>
				</div>
			</div>
		</div>

		<!-- Payment Preview -->
		{#if isLoadingPreview}
			<div class="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
				<LoadingSpinner size="md" />
			</div>
		{:else if paymentPreview}
			<div class="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
				<h3 class="mb-3 font-semibold text-gray-900">Payment Summary</h3>

				<!-- Subtotal -->
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Subtotal</span>
					<span class="text-gray-900" data-testid="payment-subtotal"
						>{formatPrice(paymentPreview.subtotal)}</span
					>
				</div>

				<!-- Tax -->
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Tax (6%)</span>
					<span class="text-gray-900" data-testid="payment-tax"
						>{formatPrice(paymentPreview.tax)}</span
					>
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
						<span class="text-2xl font-bold text-navy" data-testid="payment-total">
							{formatPrice(paymentPreview.total)}
						</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Payment Method (Mock) -->
		<div class="rounded-xl border border-gray-200 bg-white p-4">
			<h3 class="mb-3 font-semibold text-gray-900">Payment Method</h3>
			<div class="flex items-center gap-3 rounded-lg border-2 border-navy bg-gray-50 p-3">
				<CreditCard class="h-6 w-6 text-navy" />
				<div class="flex-1">
					<p class="font-medium text-gray-900">Mock Payment</p>
					<p class="text-xs text-gray-500">Development mode - instant approval</p>
				</div>
			</div>
			<p class="mt-3 text-xs text-gray-500">
				In production, this will use real payment gateway (Stripe, iPay88, etc.)
			</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{/if}
	</div>

	<!-- Fixed Bottom CTA -->
	<div
		class="safe-bottom fixed right-0 bottom-0 left-0 z-[60] border-t border-gray-200 bg-white p-4"
	>
		<button
			type="button"
			data-testid="confirm-payment-button"
			onclick={handlePayment}
			disabled={isProcessing || isLoadingPreview || !paymentPreview}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 font-semibold text-white shadow-lg transition-colors hover:bg-navy-light active:bg-navy disabled:cursor-not-allowed disabled:bg-gray-300"
		>
			{#if isProcessing}
				<LoaderCircle class="h-5 w-5 animate-spin" />
				<span data-testid="payment-processing">Processing...</span>
			{:else if paymentPreview}
				<span>Pay {formatPrice(paymentPreview.total)}</span>
			{:else}
				<span>Loading...</span>
			{/if}
		</button>
		<p class="mt-2 text-center text-xs text-gray-500">Secure mock payment for development</p>
	</div>
</div>
