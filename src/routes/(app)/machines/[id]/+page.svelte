<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin, Sparkles } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';
	import { getRarityColor, getRarityText } from '$lib/mocks/services/play';

	let { data } = $props();

	function handlePlayNow() {
		if (data.machine.status !== 'AVAILABLE') {
			return;
		}
		goto(`/machines/${data.machine.id}/payment`);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title={data.machine.name} showBack={true} />

	<!-- Machine Image -->
	<div class="relative aspect-video bg-gray-200">
		<img
			src={data.machine.imageUrl}
			alt={data.machine.name}
			class="w-full h-full object-cover"
		/>
		<!-- Gradient Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"
		></div>
	</div>

	<div class="p-6 space-y-6">
		<!-- Machine Info -->
		<div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">{data.machine.name}</h1>
			<div class="flex items-center text-gray-600 mb-3">
				<MapPin class="w-5 h-5 mr-1.5 flex-shrink-0" />
				<span class="text-sm">{data.machine.location}</span>
			</div>
			<p class="text-gray-700">{data.machine.description}</p>
		</div>

		<!-- Price -->
		<div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 mb-1">Price per play</p>
					<p class="text-3xl font-bold text-purple-600">
						{formatPrice(data.machine.pricePerPlay)}
					</p>
				</div>
				<Sparkles class="w-12 h-12 text-purple-400" />
			</div>
		</div>

		<!-- Featured Prizes -->
		<div>
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Featured Prizes</h2>
			<div class="grid grid-cols-2 gap-4">
				{#each data.machine.featuredPrizes as prize (prize.id)}
					<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
						<!-- Prize Image -->
						<div class="aspect-square bg-gray-100">
							<img
								src={prize.imageUrl}
								alt={prize.name}
								class="w-full h-full object-cover"
							/>
						</div>
						<!-- Prize Info -->
						<div class="p-3">
							<p class="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
								{prize.name}
							</p>
							<p class="text-xs text-gray-600 mb-2 line-clamp-2">
								{prize.description}
							</p>
							<!-- Rarity Badge -->
							<span class="inline-flex text-xs font-medium px-2 py-1 rounded {getRarityColor(prize.rarity)}">
								{getRarityText(prize.rarity)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- How to Play -->
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
			<h3 class="font-semibold text-blue-900 mb-2">How to Play</h3>
			<ol class="space-y-2 text-sm text-blue-800">
				<li class="flex items-start">
					<span class="font-bold mr-2">1.</span>
					<span>Tap "Play Now" and complete payment</span>
				</li>
				<li class="flex items-start">
					<span class="font-bold mr-2">2.</span>
					<span>Show the QR code at the machine</span>
				</li>
				<li class="flex items-start">
					<span class="font-bold mr-2">3.</span>
					<span>Scan the QR code on the machine</span>
				</li>
				<li class="flex items-start">
					<span class="font-bold mr-2">4.</span>
					<span>Collect your prize!</span>
				</li>
			</ol>
		</div>
	</div>

	<!-- Fixed Bottom CTA -->
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
		{#if data.machine.status === 'AVAILABLE'}
			<button
				type="button"
				onclick={handlePlayNow}
				class="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-lg"
			>
				Play Now - {formatPrice(data.machine.pricePerPlay)}
			</button>
		{:else if data.machine.status === 'MAINTENANCE'}
			<button
				type="button"
				disabled
				class="w-full bg-gray-300 text-gray-600 font-semibold py-4 rounded-xl cursor-not-allowed"
			>
				Under Maintenance
			</button>
		{:else if data.machine.status === 'IN_USE'}
			<button
				type="button"
				disabled
				class="w-full bg-yellow-100 text-yellow-800 font-semibold py-4 rounded-xl cursor-not-allowed"
			>
				Currently in Use - Please Wait
			</button>
		{:else}
			<button
				type="button"
				disabled
				class="w-full bg-gray-300 text-gray-600 font-semibold py-4 rounded-xl cursor-not-allowed"
			>
				Not Available
			</button>
		{/if}
	</div>
</div>
