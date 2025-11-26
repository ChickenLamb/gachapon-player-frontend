<script lang="ts">
	import { goto } from '$app/navigation';
	import { CreditCard, LoaderCircle, Minus, Plus } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import LoadingSpinner from '$lib/components/base/LoadingSpinner.svelte';
	import { createPaymentPreview, createPayment, formatPrice } from '$lib/mocks/services/payment';
	import type { PaymentPreview } from '$lib/types';

	let { data } = $props();

	let paymentPreview = $state<PaymentPreview | null>(null);
	let isLoadingPreview = $state(true);
	let isProcessing = $state(false);
	let error = $state<string | null>(null);
	let quantity = $state(1);

	// Derived values for inventory
	const inventoryCount = $derived(data.machine.inventoryCount);
	const isOutOfStock = $derived(inventoryCount === 0);

	// Load payment preview - react to quantity changes
	$effect(() => {
		if (!isOutOfStock) {
			loadPaymentPreview(quantity);
		} else {
			isLoadingPreview = false;
		}
	});

	async function loadPaymentPreview(qty: number) {
		try {
			isLoadingPreview = true;
			// TODO: Check for applicable events
			paymentPreview = await createPaymentPreview(data.machine.id, data.machine.pricePerPlay, qty);
		} catch {
			error = 'Failed to load payment details';
		} finally {
			isLoadingPreview = false;
		}
	}

	async function handlePayment() {
		if (!paymentPreview || isProcessing || isOutOfStock) return;

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

	function decreaseQuantity() {
		if (quantity > 1) quantity--;
	}

	function increaseQuantity() {
		if (quantity < inventoryCount) quantity++;
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
					<!-- Inventory Status -->
					{#if isOutOfStock}
						<p class="mt-1 text-sm font-medium text-red-600">Out of stock</p>
					{:else}
						<p class="mt-1 text-sm text-gray-500">{inventoryCount} available</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Quantity Selector (only show if in stock) -->
		{#if !isOutOfStock}
			<div class="rounded-xl border border-gray-200 bg-white p-4">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-semibold text-gray-900">Quantity</h3>
						<p class="text-sm text-gray-500">{inventoryCount} available</p>
					</div>

					<div class="flex items-center gap-3">
						<button
							type="button"
							onclick={decreaseQuantity}
							disabled={quantity <= 1}
							class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Decrease quantity"
						>
							<Minus class="h-5 w-5" />
						</button>

						<span class="w-8 text-center text-lg font-semibold text-gray-900">
							{quantity}
						</span>

						<button
							type="button"
							onclick={increaseQuantity}
							disabled={quantity >= inventoryCount}
							class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Increase quantity"
						>
							<Plus class="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Payment Preview -->
		{#if isOutOfStock}
			<!-- Out of stock message -->
			<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<p class="font-semibold text-red-800">This machine is currently out of stock</p>
				<p class="mt-1 text-sm text-red-600">Please try another machine or check back later.</p>
			</div>
		{:else if isLoadingPreview}
			<div class="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
				<LoadingSpinner size="md" />
			</div>
		{:else if paymentPreview}
			<div class="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
				<h3 class="mb-3 font-semibold text-gray-900">Payment Summary</h3>

				<!-- Subtotal with quantity -->
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">
						{quantity}x Play @ {formatPrice(data.machine.pricePerPlay)}
					</span>
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

		<!-- Payment Method (Mock) - only show if in stock -->
		{#if !isOutOfStock}
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
		{/if}

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
			disabled={isProcessing || isLoadingPreview || !paymentPreview || isOutOfStock}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 font-semibold text-white shadow-lg transition-colors hover:bg-navy/90 active:bg-navy disabled:cursor-not-allowed disabled:bg-gray-300"
		>
			{#if isOutOfStock}
				<span>Out of Stock</span>
			{:else if isProcessing}
				<LoaderCircle class="h-5 w-5 animate-spin" />
				<span data-testid="payment-processing">Processing...</span>
			{:else if paymentPreview}
				<span>Pay {formatPrice(paymentPreview.total)}</span>
			{:else}
				<span>Loading...</span>
			{/if}
		</button>
		{#if !isOutOfStock}
			<p class="mt-2 text-center text-xs text-gray-500">Secure mock payment for development</p>
		{/if}
	</div>
</div>
