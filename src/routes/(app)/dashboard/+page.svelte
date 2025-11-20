<script lang="ts">
	import { MapPin, Sparkles, AlertCircle } from 'lucide-svelte';
	import HorizontalScroll from '$lib/components/HorizontalScroll.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import DiscountBadge from '$lib/components/DiscountBadge.svelte';
	import type { Machine, MerchantEvent } from '$lib/types';
	import { formatPrice } from '$lib/mocks/services/payment';

	let { data } = $props();

	// Mock reward progress data (will come from backend later)
	const rewardProgress = {
		current: 5,
		total: 10,
		label: 'One Extra Spin'
	};

	function getMachineStatusBadge(status: Machine['status']) {
		switch (status) {
			case 'AVAILABLE':
				return 'bg-green-100 text-green-800';
			case 'IN_USE':
				return 'bg-yellow-100 text-yellow-800';
			case 'MAINTENANCE':
				return 'bg-red-100 text-red-800';
			case 'OFFLINE':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getMachineStatusText(status: Machine['status']): string {
		switch (status) {
			case 'AVAILABLE':
				return 'Available';
			case 'IN_USE':
				return 'In Use';
			case 'MAINTENANCE':
				return 'Maintenance';
			case 'OFFLINE':
				return 'Offline';
			default:
				return 'Unknown';
		}
	}

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
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
		<div class="px-4 py-6">
			<h1 class="text-2xl font-bold">Gachapon</h1>
			<p class="mt-1 text-sm text-purple-100" data-testid="user-greeting">
				Welcome, {data.user.username}!
			</p>
		</div>
	</header>

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

		<!-- Available Machines Section -->
		<div data-testid="machines-section">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Available Machines</h2>

			<div class="space-y-4">
				{#each data.machines as machine (machine.id)}
					<a
						href="/machines/{machine.id}"
						data-sveltekit-preload-data
						data-testid="machine-card-{machine.id}"
						data-machine-id={machine.id}
						class="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
						class:opacity-60={machine.status !== 'AVAILABLE'}
					>
						<!-- Machine Image -->
						<div class="relative aspect-video bg-gray-200">
							<img
								src={machine.imageUrl}
								alt={machine.name}
								data-testid="machine-image"
								class="h-full w-full object-cover"
							/>
							<!-- Status Badge -->
							<div class="absolute top-3 right-3">
								<span
									data-testid="machine-status"
									class="rounded-full px-3 py-1 text-xs font-medium {getMachineStatusBadge(
										machine.status
									)}"
								>
									{getMachineStatusText(machine.status)}
								</span>
							</div>
						</div>

						<!-- Machine Info -->
						<div class="p-4">
							<h3 class="mb-1 text-lg font-semibold text-gray-900" data-testid="machine-name">
								{machine.name}
							</h3>

							<div class="mb-3 flex items-center text-sm text-gray-500">
								<MapPin class="mr-1 h-4 w-4 flex-shrink-0" />
								<span class="truncate">{machine.location}</span>
							</div>

							<p class="mb-4 line-clamp-2 text-sm text-gray-600">
								{machine.description}
							</p>

							<!-- Featured Prizes Preview -->
							<div class="mb-4 flex items-center gap-2" data-testid="featured-prizes">
								{#each machine.featuredPrizes.slice(0, 3) as prize (prize.id)}
									<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
										<img src={prize.imageUrl} alt={prize.name} class="h-full w-full object-cover" />
									</div>
								{/each}
								{#if machine.featuredPrizes.length > 3}
									<span class="text-xs text-gray-500">
										+{machine.featuredPrizes.length - 3} more
									</span>
								{/if}
							</div>

							<!-- Price -->
							<div class="flex items-center justify-between">
								<div>
									<p class="text-2xl font-bold text-purple-600" data-testid="machine-price">
										{formatPrice(machine.pricePerPlay)}
									</p>
									<p class="text-xs text-gray-500">per play</p>
								</div>

								{#if machine.status === 'AVAILABLE'}
									<div class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white">
										Play Now
									</div>
								{:else if machine.status === 'MAINTENANCE'}
									<div class="flex items-center gap-1 text-sm text-red-600">
										<AlertCircle class="h-4 w-4" />
										<span>Under Maintenance</span>
									</div>
								{:else if machine.status === 'IN_USE'}
									<div class="text-sm text-yellow-600">Currently in use</div>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

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
