<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import HorizontalScroll from '$lib/components/HorizontalScroll.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import DiscountBadge from '$lib/components/DiscountBadge.svelte';
	import type { MerchantEvent } from '$lib/types';

	let { data } = $props();

	// Mock reward progress data (will come from backend later)
	const rewardProgress = {
		current: 5,
		total: 10,
		label: 'One Extra Spin'
	};

	function getEventDiscountPercentage(event: MerchantEvent): number {
		if (event.type === 'DISCOUNT') {
			// Extract percentage from description (e.g., "20% off" -> 20)
			const match = event.description.match(/(\d+)%/);
			if (match) {
				return parseInt(match[1], 10);
			}
		}
		return 0;
	}
</script>

<div class="min-h-screen bg-gray-50 pb-20" data-testid="dashboard-content">
	<NavigationHeader title="Gachapon" showBack={true} />

	<div class="space-y-6 px-4 py-6">
		<!-- Reward Progress Section -->
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<ProgressBar
				current={rewardProgress.current}
				total={rewardProgress.total}
				label={rewardProgress.label}
				badgeText="+1"
				color="orange"
			/>
		</div>

		<!-- Current Events Section -->
		{#if data.activeEvents.length > 0}
			<div>
				<SectionHeader
					title="Current Event"
					viewAllHref="/events"
					badge={{ text: 'view all', color: '#7c3aed' }}
				/>

				<HorizontalScroll items={data.activeEvents} itemWidth="260px">
					{#snippet children(event)}
						{@const typedEvent = event as MerchantEvent}
						<a
							href="/events/{typedEvent.id}"
							data-sveltekit-preload-data
							class="block overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-4 text-white shadow-md transition-transform hover:scale-105"
						>
							<div class="mb-2 flex items-start justify-between">
								<div class="flex-1">
									<h3 class="mb-1 font-semibold">{typedEvent.name}</h3>
									<p class="text-xs text-purple-100">{typedEvent.description}</p>
								</div>
								{#if getEventDiscountPercentage(typedEvent) > 0}
									<DiscountBadge percentage={getEventDiscountPercentage(typedEvent)} size="sm" />
								{/if}
							</div>
							<div class="mt-3 text-xs text-purple-200">
								Valid until {new Date(typedEvent.endDate).toLocaleDateString()}
							</div>
						</a>
					{/snippet}
				</HorizontalScroll>
			</div>
		{/if}

		<!-- New Products Section (Featured Prizes) -->
		{#if data.machines.length > 0 && data.machines[0].featuredPrizes.length > 0}
			<div>
				<SectionHeader
					title="New product"
					viewAllHref="/machines"
					badge={{ text: 'view all', color: '#7c3aed' }}
				/>

				<HorizontalScroll items={data.machines[0].featuredPrizes.slice(0, 6)} itemWidth="160px">
					{#snippet children(prize)}
						{@const typedPrize = prize as import('$lib/types').Prize}
						<div
							class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="aspect-square bg-gray-100">
								<img
									src={typedPrize.imageUrl}
									alt={typedPrize.name}
									class="h-full w-full object-cover"
								/>
							</div>
							<div class="p-2">
								<p class="line-clamp-2 text-xs font-medium text-gray-900">{typedPrize.name}</p>
							</div>
						</div>
					{/snippet}
				</HorizontalScroll>
			</div>
		{/if}

		<!-- Scan for More Rewards Section (QR Teaser) -->
		<div class="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-6 text-center">
			<div class="mb-3 flex justify-center">
				<Sparkles class="h-12 w-12 text-purple-600" />
			</div>
			<h3 class="mb-2 font-semibold text-gray-900">Scan for more rewards</h3>
			<p class="mb-4 text-sm text-gray-600">
				Play on any machine to generate your QR code and earn extra rewards!
			</p>
			<a
				href="/machines"
				data-sveltekit-preload-data
				class="inline-block rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
			>
				Find a Machine
			</a>
		</div>
	</div>
</div>
