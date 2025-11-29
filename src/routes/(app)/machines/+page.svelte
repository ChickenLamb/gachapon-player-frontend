<script lang="ts">
	import { MapPin, AlertCircle, Star, CheckCircle2, Search, Eye, EyeOff } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';
	import { getMachineContext } from '$lib/stores/machine.svelte';

	let { data } = $props();
	const machine = getMachineContext();

	// Search and show prizes state
	let searchQuery = $state('');
	let showPrizes = $state(false);

	// Get highlighted machine from store (single source of truth)
	let highlightId = $derived(machine.scanned ? machine.machineId : null);

	// Sort machines: highlighted one first
	let sortedMachines = $derived(() => {
		if (!highlightId) return data.machines;
		const highlighted = data.machines.filter((m) => m.id === highlightId);
		const others = data.machines.filter((m) => m.id !== highlightId);
		return [...highlighted, ...others];
	});

	// Filter machines by search query (machine name, location, or prize names)
	let filteredMachines = $derived(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return sortedMachines();

		return sortedMachines().filter((m) => {
			// Search by machine name
			if (m.name.toLowerCase().includes(query)) return true;

			// Search by location
			if (m.location.toLowerCase().includes(query)) return true;

			// Search by prize names
			return m.featuredPrizes.some((prize) => prize.name.toLowerCase().includes(query));
		});
	});

	function togglePrizes() {
		showPrizes = !showPrizes;
	}
</script>

<div class="min-h-screen bg-gray-100 pb-4 font-display">
	<NavigationHeader title="Gashapon products" showBack={true} />

	<!-- Search Bar -->
	<div class="p-4 pb-0">
		<div class="relative">
			<Search class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
			<input
				type="text"
				placeholder="places or item..."
				bind:value={searchQuery}
				class="w-full rounded-xl border-0 bg-white py-3 pr-4 pl-10 text-sm shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-accent-green"
			/>
		</div>
	</div>

	<!-- Show Prizes Toggle -->
	<div class="flex justify-start px-4 pt-3">
		<button
			type="button"
			onclick={togglePrizes}
			class="flex items-center gap-2 rounded-full px-4 py-2 transition-colors {showPrizes
				? 'bg-accent-green text-white'
				: 'bg-white text-accent-green hover:bg-gray-50'}"
			style="box-shadow: 0 4px 6px -1px rgb(34 197 94 / 0.3), 0 2px 4px -2px rgb(34 197 94 / 0.3);"
		>
			{#if showPrizes}
				<EyeOff class="h-5 w-5" />
			{:else}
				<Eye class="h-5 w-5" />
			{/if}
			<span class="text-sm font-medium">{showPrizes ? 'Hide Items' : 'Show Items'}</span>
		</button>
	</div>

	<div class="p-4 pt-3" data-testid="machines-section">
		{#if data.machines.length === 0}
			<!-- Empty State -->
			<div class="rounded-2xl bg-white p-12 text-center">
				<AlertCircle class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-bold text-navy">No Available Machines</h3>
				<p class="text-gray-600">
					All machines are currently unavailable. Please check back later!
				</p>
			</div>
		{:else if filteredMachines().length === 0}
			<!-- No Search Results -->
			<div class="rounded-2xl bg-white p-12 text-center">
				<Search class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-bold text-navy">No Machines Found</h3>
				<p class="text-gray-600">
					Try adjusting your search for "{searchQuery}"
				</p>
			</div>
		{:else}
			<!-- Machine List with Expandable Prizes -->
			<div class="space-y-4">
				{#each filteredMachines() as machineItem (machineItem.id)}
					{@const isHighlighted = machineItem.id === highlightId}
					<div
						class="overflow-hidden rounded-2xl bg-white shadow-sm {isHighlighted
							? 'ring-2 ring-accent-green'
							: ''}"
					>
						<!-- Machine Card (clickable to navigate) -->
						<a
							href="/machines/{machineItem.id}"
							data-sveltekit-preload-data
							data-testid="machine-card-{machineItem.id}"
							data-machine-id={machineItem.id}
							class="flex gap-4 p-3 transition-colors hover:bg-gray-50"
						>
							<!-- Machine Image -->
							<div class="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
								<img
									src={machineItem.imageUrl}
									alt={machineItem.name}
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
												{machineItem.name}
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
									{formatPrice(machineItem.drawCost)}
								</p>

								<div class="flex items-center text-xs text-accent-green">
									<MapPin class="mr-1 h-3 w-3 flex-shrink-0" />
									<span class="truncate">{machineItem.location}</span>
								</div>
							</div>
						</a>

						<!-- Prize Drawer (shows when showPrizes is true) -->
						{#if showPrizes}
							<div class="border-t border-gray-100 bg-gray-50 p-3">
								<div class="grid grid-cols-3 gap-3">
									{#each machineItem.featuredPrizes as prize (prize.id)}
										<div class="overflow-hidden rounded-xl bg-white shadow-sm">
											<div class="aspect-square bg-gray-50 p-2">
												<img
													src={prize.imageUrl}
													alt={prize.name}
													class="h-full w-full object-contain"
												/>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
