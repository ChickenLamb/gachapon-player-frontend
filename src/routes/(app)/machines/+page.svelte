<script lang="ts">
	import { MapPin, AlertCircle, Star, CheckCircle2 } from 'lucide-svelte';
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

<div class="min-h-screen bg-gray-100 pb-20 font-display">
	<NavigationHeader title="Gashapon products" showBack={true} />

	<div class="space-y-4 p-4" data-testid="machines-section">
		{#if data.machines.length === 0}
			<!-- Empty State -->
			<div class="rounded-2xl bg-white p-12 text-center">
				<AlertCircle class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-bold text-navy">No Available Machines</h3>
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
					class="flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md {isHighlighted ? 'ring-2 ring-accent-green' : ''}"
				>
					<!-- Machine Image -->
					<div class="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
						<img
							src={machine.imageUrl}
							alt={machine.name}
							data-testid="machine-image"
							class="h-full w-full object-contain p-2"
						/>
						{#if isHighlighted}
							<div class="absolute top-1 left-1">
								<Star class="h-4 w-4 fill-accent-gold text-accent-gold" />
							</div>
						{/if}
					</div>

					<!-- Machine Info -->
					<div class="flex min-w-0 flex-1 flex-col justify-between py-1">
						<div>
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span class="h-4 w-1 rounded-full bg-accent-green"></span>
									<h3 class="text-sm font-bold text-navy" data-testid="machine-name">
										{machine.name}
									</h3>
								</div>
								{#if isHighlighted}
									<div class="flex items-center gap-1 rounded-full bg-accent-green px-2 py-0.5">
										<CheckCircle2 class="h-3 w-3 text-white" />
										<span class="text-xs font-bold text-white">Connected</span>
									</div>
								{/if}
							</div>
							<p class="mt-0.5 text-xs text-gray-500">Gachapon Limited Edition</p>
						</div>

						<p class="text-lg font-bold text-navy" data-testid="machine-price">
							{formatPrice(machine.pricePerPlay)}
						</p>

						<div class="flex items-center text-xs text-accent-green">
							<MapPin class="mr-1 h-3 w-3 flex-shrink-0" />
							<span class="truncate">{machine.location}</span>
						</div>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
