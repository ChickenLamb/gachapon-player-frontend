<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';

	let { data } = $props();

	function goToDashboard() {
		goto('/dashboard');
	}
</script>

<div class="min-h-screen bg-gray-100 pb-32 font-display">
	<NavigationHeader title="Gashapon products" showBack={true} />

	<!-- Hero Section with Machine Image -->
	<div class="bg-gradient-to-b from-accent-green/10 to-gray-100 px-4 pt-4">
		<div class="mx-auto flex justify-center">
			<img
				data-testid="machine-image"
				src={data.machine.imageUrl}
				alt={data.machine.name}
				class="h-48 w-auto object-contain"
			/>
		</div>
	</div>

	<div class="space-y-4 p-4">
		<!-- Machine Info Card -->
		<div class="rounded-2xl bg-white p-4 shadow-sm">
			<h1 class="mb-1 text-lg font-bold text-navy" data-testid="machine-title">
				{data.machine.name}
			</h1>
			<p class="mb-2 text-sm text-gray-500">Gachapon Limited Edition</p>
			<p class="mb-3 text-2xl font-bold text-navy" data-testid="machine-price">
				{formatPrice(data.machine.pricePerPlay)}
			</p>
			<div class="flex items-center text-sm text-accent-green">
				<MapPin class="mr-1 h-4 w-4 flex-shrink-0" />
				<span data-testid="machine-location">{data.machine.location}</span>
			</div>
		</div>

		<!-- Prize Gallery -->
		<div data-testid="prizes-section">
			<div class="grid grid-cols-3 gap-3" data-testid="prize-list">
				{#each data.machine.featuredPrizes as prize (prize.id)}
					<div
						class="overflow-hidden rounded-2xl bg-white shadow-sm"
						data-testid="prize-item-{prize.id}"
					>
						<div class="aspect-square bg-gray-50 p-2">
							<img src={prize.imageUrl} alt={prize.name} class="h-full w-full object-contain" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Fixed Bottom CTA -->
	<div
		class="safe-bottom fixed right-0 bottom-0 left-0 z-[60] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
	>
		{#if data.machine.status === 'AVAILABLE'}
			<button
				type="button"
				data-testid="scan-qr-button"
				onclick={goToDashboard}
				class="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-semibold text-white shadow-lg transition-colors hover:bg-navy-light active:bg-navy-dark"
			>
				<span>Connect to Gachapon</span>
			</button>
		{:else if data.machine.status === 'MAINTENANCE'}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-full bg-gray-300 py-4 font-semibold text-gray-600"
			>
				Under Maintenance
			</button>
		{:else if data.machine.status === 'IN_USE'}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-full bg-yellow-100 py-4 font-semibold text-yellow-800"
			>
				Currently in Use - Please Wait
			</button>
		{:else}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-full bg-gray-300 py-4 font-semibold text-gray-600"
			>
				Not Available
			</button>
		{/if}
	</div>
</div>
