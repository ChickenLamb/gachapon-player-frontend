<script lang="ts">
	import { MapPin, Sparkles, AlertCircle } from 'lucide-svelte';
	import type { Machine, MerchantEvent } from '$lib/types';
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

<div class="min-h-screen bg-gray-50 pb-20">
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
		<div class="px-4 py-6">
			<h1 class="text-2xl font-bold">Gachapon</h1>
			<p class="text-purple-100 text-sm mt-1">Welcome, {data.user.username}!</p>
		</div>
	</header>

	<!-- Active Events Banner -->
	{#if data.activeEvents.length > 0}
		<div class="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white">
			<div class="flex items-center gap-2">
				<Sparkles class="w-5 h-5 flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold truncate">
						{data.activeEvents[0].name}
					</p>
					<p class="text-xs text-amber-50 truncate">
						{data.activeEvents[0].description}
					</p>
				</div>
				<a
					href="/events"
					class="text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors whitespace-nowrap"
				>
					View All
				</a>
			</div>
		</div>
	{/if}

	<!-- Machine List -->
	<div class="p-4 space-y-4">
		<h2 class="text-lg font-semibold text-gray-900">Available Machines</h2>

		{#each data.machines as machine (machine.id)}
			<a
				href="/machines/{machine.id}"
				class="block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
				class:opacity-60={machine.status !== 'AVAILABLE'}
			>
				<!-- Machine Image -->
				<div class="relative aspect-video bg-gray-200">
					<img
						src={machine.imageUrl}
						alt={machine.name}
						class="w-full h-full object-cover"
					/>
					<!-- Status Badge -->
					<div class="absolute top-3 right-3">
						<span
							class="px-3 py-1 rounded-full text-xs font-medium {getMachineStatusBadge(
								machine.status
							)}"
						>
							{getMachineStatusText(machine.status)}
						</span>
					</div>
				</div>

				<!-- Machine Info -->
				<div class="p-4">
					<h3 class="text-lg font-semibold text-gray-900 mb-1">
						{machine.name}
					</h3>

					<div class="flex items-center text-sm text-gray-500 mb-3">
						<MapPin class="w-4 h-4 mr-1 flex-shrink-0" />
						<span class="truncate">{machine.location}</span>
					</div>

					<p class="text-sm text-gray-600 mb-4 line-clamp-2">
						{machine.description}
					</p>

					<!-- Featured Prizes Preview -->
					<div class="flex items-center gap-2 mb-4">
						{#each machine.featuredPrizes.slice(0, 3) as prize}
							<div class="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
								<img
									src={prize.imageUrl}
									alt={prize.name}
									class="w-full h-full object-cover"
								/>
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
							<p class="text-2xl font-bold text-purple-600">
								{formatPrice(machine.pricePerPlay)}
							</p>
							<p class="text-xs text-gray-500">per play</p>
						</div>

						{#if machine.status === 'AVAILABLE'}
							<div
								class="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm"
							>
								Play Now
							</div>
						{:else if machine.status === 'MAINTENANCE'}
							<div class="flex items-center gap-1 text-red-600 text-sm">
								<AlertCircle class="w-4 h-4" />
								<span>Under Maintenance</span>
							</div>
						{:else if machine.status === 'IN_USE'}
							<div class="text-yellow-600 text-sm">Currently in use</div>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
