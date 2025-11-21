<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin, Sparkles, QrCode } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';
	import { getRarityColor, getRarityText } from '$lib/mocks/services/play';

	let { data } = $props();

	function goToDashboard() {
		goto('/dashboard');
	}
</script>

<div class="min-h-screen bg-gray-50 pb-32">
	<NavigationHeader title={data.machine.name} showBack={true} />

	<!-- Machine Image -->
	<div class="relative aspect-video bg-gray-200">
		<img
			data-testid="machine-image"
			src={data.machine.imageUrl}
			alt={data.machine.name}
			class="h-full w-full object-cover"
		/>
		<!-- Gradient Overlay -->
		<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
	</div>

	<div class="space-y-6 p-6">
		<!-- Machine Info -->
		<div>
			<h1 class="mb-2 text-2xl font-bold text-gray-900" data-testid="machine-title">
				{data.machine.name}
			</h1>
			<div class="mb-3 flex items-center text-gray-600">
				<MapPin class="mr-1.5 h-5 w-5 flex-shrink-0" />
				<span class="text-sm" data-testid="machine-location">{data.machine.location}</span>
			</div>
			<p class="text-gray-700" data-testid="machine-description">{data.machine.description}</p>
		</div>

		<!-- Price -->
		<div class="rounded-xl border border-purple-200 bg-purple-50 p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="mb-1 text-sm text-gray-600">Price per play</p>
					<p class="text-3xl font-bold text-purple-600" data-testid="machine-price">
						{formatPrice(data.machine.pricePerPlay)}
					</p>
				</div>
				<Sparkles class="h-12 w-12 text-purple-400" />
			</div>
		</div>

		<!-- Featured Prizes -->
		<div data-testid="prizes-section">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Featured Prizes</h2>
			<div class="grid grid-cols-2 gap-4" data-testid="prize-list">
				{#each data.machine.featuredPrizes as prize (prize.id)}
					<div
						class="overflow-hidden rounded-xl border border-gray-200 bg-white"
						data-testid="prize-item-{prize.id}"
					>
						<!-- Prize Image -->
						<div class="aspect-square bg-gray-100">
							<img src={prize.imageUrl} alt={prize.name} class="h-full w-full object-cover" />
						</div>
						<!-- Prize Info -->
						<div class="p-3">
							<p class="mb-1 line-clamp-1 text-sm font-semibold text-gray-900">
								{prize.name}
							</p>
							<p class="mb-2 line-clamp-2 text-xs text-gray-600">
								{prize.description}
							</p>
							<!-- Rarity Badge -->
							<span
								class="inline-flex rounded px-2 py-1 text-xs font-medium {getRarityColor(
									prize.rarity
								)}"
								data-testid="prize-rarity"
							>
								{getRarityText(prize.rarity)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- How to Play -->
		<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
			<h3 class="mb-2 font-semibold text-blue-900">How to Play</h3>
			<ol class="space-y-2 text-sm text-blue-800">
				<li class="flex items-start">
					<span class="mr-2 font-bold">1.</span>
					<span>Go to Dashboard and show your QR code</span>
				</li>
				<li class="flex items-start">
					<span class="mr-2 font-bold">2.</span>
					<span>Let the machine scan your QR code</span>
				</li>
				<li class="flex items-start">
					<span class="mr-2 font-bold">3.</span>
					<span>Complete payment on your phone</span>
				</li>
				<li class="flex items-start">
					<span class="mr-2 font-bold">4.</span>
					<span>Turn the handle and collect your prize!</span>
				</li>
			</ol>
		</div>
	</div>

	<!-- Fixed Bottom CTA -->
	<div
		class="safe-bottom fixed right-0 bottom-0 left-0 z-[60] border-t border-gray-200 bg-white p-4"
	>
		{#if data.machine.status === 'AVAILABLE'}
			<button
				type="button"
				data-testid="scan-qr-button"
				onclick={goToDashboard}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-purple-700 active:bg-purple-800"
			>
				<QrCode class="h-5 w-5" />
				<span>Scan QR to Play - {formatPrice(data.machine.pricePerPlay)}</span>
			</button>
		{:else if data.machine.status === 'MAINTENANCE'}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-xl bg-gray-300 py-4 font-semibold text-gray-600"
			>
				Under Maintenance
			</button>
		{:else if data.machine.status === 'IN_USE'}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-xl bg-yellow-100 py-4 font-semibold text-yellow-800"
			>
				Currently in Use - Please Wait
			</button>
		{:else}
			<button
				type="button"
				disabled
				class="w-full cursor-not-allowed rounded-xl bg-gray-300 py-4 font-semibold text-gray-600"
			>
				Not Available
			</button>
		{/if}
	</div>
</div>
