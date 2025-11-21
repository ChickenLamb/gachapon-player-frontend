<script lang="ts">
	import { MapPin, AlertCircle, Star } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import type { Machine } from '$lib/types';
	import { formatPrice } from '$lib/mocks/services/payment';
	import { getMachineContext } from '$lib/stores/machine.svelte';

	let { data } = $props();
	const machine = getMachineContext();

	// Get highlighted machine from store (single source of truth)
	let highlightId = $derived(machine.scanned ? machine.machineId : null);

	// Sort machines: highlighted one first
	let sortedMachines = $derived(() => {
		if (!highlightId) return data.machines;
		const highlighted = data.machines.filter(m => m.id === highlightId);
		const others = data.machines.filter(m => m.id !== highlightId);
		return [...highlighted, ...others];
	});

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
	<NavigationHeader title="Available Machines" showBack={true} />

	<div class="space-y-4 p-6" data-testid="machines-section">
		{#if data.machines.length === 0}
			<!-- Empty State -->
			<div class="rounded-xl bg-white p-12 text-center">
				<AlertCircle class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-semibold text-gray-900">No Available Machines</h3>
				<p class="text-gray-600">
					All machines are currently unavailable. Please check back later!
				</p>
			</div>
		{:else}
			{#each sortedMachines() as machine (machine.id)}
				{@const isHighlighted = machine.id === highlightId}
				<a
					href="/machines/{machine.id}"
					data-sveltekit-preload-data
					data-testid="machine-card-{machine.id}"
					data-machine-id={machine.id}
					class="block overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-shadow hover:shadow-md {isHighlighted ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}"
				>
					{#if isHighlighted}
						<div class="flex items-center gap-2 bg-purple-600 px-4 py-2 text-white">
							<Star class="h-4 w-4" />
							<span class="text-sm font-medium">Connected Machine</span>
						</div>
					{/if}
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

							<div class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white">
								Play Now
							</div>
						</div>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
