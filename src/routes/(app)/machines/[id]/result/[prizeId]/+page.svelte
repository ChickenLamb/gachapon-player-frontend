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
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800">
	<!-- Celebration Animation Container -->
	<div class="relative min-h-screen flex flex-col">
		<!-- Confetti-like decoration (mock) -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute top-10 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-bounce"></div>
			<div class="absolute top-20 right-1/4 w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-100"></div>
			<div class="absolute top-32 left-1/3 w-2.5 h-2.5 bg-blue-300 rounded-full animate-bounce delay-200"></div>
		</div>

		<!-- Content -->
		<div class="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
			<!-- Celebration Icon -->
			<div class="mb-6 animate-bounce">
				<div class="bg-white rounded-full p-6 shadow-2xl">
					<Sparkles class="w-16 h-16 text-purple-600" />
				</div>
			</div>

			<!-- Congratulations Message -->
			<h1 class="text-3xl font-bold text-white mb-2">Congratulations!</h1>
			<p class="text-purple-100 mb-8">You won an amazing prize!</p>

			<!-- Prize Card -->
			<div class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full mb-8">
				<!-- Prize Image -->
				<div class="aspect-square bg-gray-100 relative">
					<img
						src={data.prize.imageUrl}
						alt={data.prize.name}
						class="w-full h-full object-cover"
					/>
					<!-- Rarity Badge -->
					<div class="absolute top-4 right-4">
						<span class="inline-flex text-sm font-bold px-3 py-1.5 rounded-full shadow-lg {getRarityColor(data.prize.rarity)}">
							{getRarityText(data.prize.rarity)}
						</span>
					</div>
				</div>

				<!-- Prize Info -->
				<div class="p-6">
					<div class="flex items-center justify-center gap-2 mb-3">
						<PrizeIcon class="w-5 h-5 text-purple-600" />
						<span class="text-xs font-medium text-purple-600 uppercase">
							{data.prize.type.replace('_', ' ')}
						</span>
					</div>

					<h2 class="text-2xl font-bold text-gray-900 mb-2">
						{data.prize.name}
					</h2>

					<p class="text-gray-600 mb-6">
						{data.prize.description}
					</p>

					<!-- Collection Info -->
					{#if data.prize.type === 'PHYSICAL'}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p class="text-sm font-semibold text-blue-900 mb-1">
								How to Collect
							</p>
							<p class="text-xs text-blue-700">
								Collect your prize at the machine location: {data.machine.location}
							</p>
						</div>
					{:else if data.prize.type === 'EVOUCHER'}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<p class="text-sm font-semibold text-green-900 mb-1">
								Digital Voucher
							</p>
							<p class="text-xs text-green-700">
								Check your inventory to view and use your e-voucher
							</p>
						</div>
					{:else if data.prize.type === 'FREE_PLAY'}
						<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
							<p class="text-sm font-semibold text-purple-900 mb-1">
								Free Play Added
							</p>
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
					onclick={handlePlayAgain}
					class="w-full bg-white text-purple-600 font-semibold py-4 rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
				>
					Play Again
				</button>

				<button
					type="button"
					onclick={handleBackToDashboard}
					class="w-full bg-purple-500/20 text-white font-medium py-3 rounded-xl hover:bg-purple-500/30 transition-colors backdrop-blur-sm"
				>
					Back to Dashboard
				</button>
			</div>
		</div>

		<!-- Footer Note -->
		<div class="p-6 text-center">
			<p class="text-purple-200 text-sm">
				Prize added to your inventory
			</p>
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
