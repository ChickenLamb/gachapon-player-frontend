<script lang="ts">
	import { goto } from '$app/navigation';
	import { Sparkles, Package, Gift, Ticket } from 'lucide-svelte';
	import { getRarityColor, getRarityText } from '$lib/mocks/services/play';

	let { data } = $props();

	function getPrizeTypeIcon(type: string) {
		switch (type) {
			case 'PHYSICAL':
				return Package;
			case 'EVOUCHER':
				return Ticket;
			case 'FREE_PLAY':
				return Gift;
			default:
				return Package;
		}
	}

	// Get icon component for current prize type
	let PrizeIcon = $derived(getPrizeTypeIcon(data.prize.type));

	function handleBackToDashboard() {
		goto('/dashboard');
	}

	function handlePlayAgain() {
		goto(`/machines/${data.machine.id}`);
	}

	function handleViewInventory() {
		goto('/inventory');
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800">
	<!-- Celebration Animation Container -->
	<div class="relative flex min-h-screen flex-col">
		<!-- Confetti-like decoration (mock) -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<div class="absolute top-10 left-1/4 h-3 w-3 animate-bounce rounded-full bg-yellow-300"></div>
			<div
				class="absolute top-20 right-1/4 h-2 w-2 animate-bounce rounded-full bg-pink-300 delay-100"
			></div>
			<div
				class="absolute top-32 left-1/3 h-2.5 w-2.5 animate-bounce rounded-full bg-blue-300 delay-200"
			></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
			<!-- Celebration Icon -->
			<div class="mb-6 animate-bounce">
				<div class="rounded-full bg-white p-6 shadow-2xl">
					<Sparkles class="h-16 w-16 text-purple-600" />
				</div>
			</div>

			<!-- Congratulations Message -->
			<h1 class="mb-2 text-3xl font-bold text-white">Congratulations!</h1>
			<p class="mb-8 text-purple-100">You won an amazing prize!</p>

			<!-- Prize Card -->
			<div class="mb-8 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
				<!-- Prize Image -->
				<div class="relative aspect-square bg-gray-100">
					<img
						data-testid="prize-image"
						src={data.prize.imageUrl}
						alt={data.prize.name}
						class="h-full w-full object-cover"
					/>
					<!-- Rarity Badge -->
					<div class="absolute top-4 right-4">
						<span
							class="inline-flex rounded-full px-3 py-1.5 text-sm font-bold shadow-lg {getRarityColor(
								data.prize.rarity
							)}"
							data-testid="prize-rarity"
						>
							{getRarityText(data.prize.rarity)}
						</span>
					</div>
				</div>

				<!-- Prize Info -->
				<div class="p-6">
					<div class="mb-3 flex items-center justify-center gap-2">
						<PrizeIcon class="h-5 w-5 text-purple-600" />
						<span class="text-xs font-medium text-purple-600 uppercase">
							{data.prize.type.replace('_', ' ')}
						</span>
					</div>

					<h2 class="mb-2 text-2xl font-bold text-gray-900" data-testid="prize-name">
						{data.prize.name}
					</h2>

					<p class="mb-6 text-gray-600" data-testid="prize-description">
						{data.prize.description}
					</p>

					<!-- Collection Info -->
					{#if data.prize.type === 'PHYSICAL'}
						<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
							<p class="mb-1 text-sm font-semibold text-blue-900">How to Collect</p>
							<p class="text-xs text-blue-700">
								Collect your prize at the machine location: {data.machine.location}
							</p>
						</div>
					{:else if data.prize.type === 'EVOUCHER'}
						<div class="rounded-lg border border-green-200 bg-green-50 p-4">
							<p class="mb-1 text-sm font-semibold text-green-900">Digital Voucher</p>
							<p class="text-xs text-green-700">
								Check your inventory to view and use your e-voucher
							</p>
						</div>
					{:else if data.prize.type === 'FREE_PLAY'}
						<div class="rounded-lg border border-purple-200 bg-purple-50 p-4">
							<p class="mb-1 text-sm font-semibold text-purple-900">Free Play Added</p>
							<p class="text-xs text-purple-700">
								Your free play token has been added to your account
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="w-full max-w-sm space-y-3">
				<button
					type="button"
					data-testid="view-inventory-button"
					onclick={handleViewInventory}
					class="w-full rounded-xl bg-white py-4 font-semibold text-purple-600 shadow-lg transition-colors hover:bg-purple-50"
				>
					View in Inventory
				</button>

				<button
					type="button"
					data-testid="play-again-button"
					onclick={handlePlayAgain}
					class="w-full rounded-xl bg-purple-500/20 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-purple-500/30"
				>
					Play Again
				</button>

				<button
					type="button"
					data-testid="return-to-dashboard-button"
					onclick={handleBackToDashboard}
					class="w-full rounded-xl bg-purple-500/20 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-purple-500/30"
				>
					Back to Dashboard
				</button>
			</div>
		</div>

		<!-- Footer Note -->
		<div class="p-6 text-center">
			<p class="text-sm text-purple-200">Prize added to your inventory</p>
		</div>
	</div>
</div>

<style>
	.delay-100 {
		animation-delay: 100ms;
	}
	.delay-200 {
		animation-delay: 200ms;
	}
</style>
