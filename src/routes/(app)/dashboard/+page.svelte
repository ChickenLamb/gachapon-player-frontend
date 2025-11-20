<script lang="ts">
	import { MapPin, Sparkles, AlertCircle } from 'lucide-svelte';
	import type { Machine } from '$lib/types';
	import { formatPrice } from '$lib/mocks/services/payment';

	let { data } = $props();

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

	<!-- Active Events Banner -->
	{#if data.activeEvents.length > 0}
		<div class="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white">
			<div class="flex items-center gap-2">
				<Sparkles class="h-5 w-5 flex-shrink-0" />
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold">
						{data.activeEvents[0].name}
					</p>
					<p class="truncate text-xs text-amber-50">
						{data.activeEvents[0].description}
					</p>
				</div>
				<a
					href="/events"
					class="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-white/30"
				>
					View All
				</a>
			</div>
		</div>
	{/if}

	<!-- Machine List -->
	<div class="space-y-4 p-4" data-testid="machines-section">
		<h2 class="text-lg font-semibold text-gray-900">Available Machines</h2>

		{#each data.machines as machine (machine.id)}
			<a
				href="/machines/{machine.id}"
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
