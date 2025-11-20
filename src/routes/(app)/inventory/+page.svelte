<script lang="ts">
	import { Package, CheckCircle, Clock, Gift } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import FilterTabs from '$lib/components/FilterTabs.svelte';
	import ViewToggle from '$lib/components/ViewToggle.svelte';
	import type { InventoryItemStatus } from '$lib/types';

	let { data } = $props();

	// State management
	let activeFilter = $state<'all' | InventoryItemStatus>('all');
	let currentView = $state<'list' | 'grid'>('list');

	// Filter tabs configuration
	const filterTabs = [
		{ id: 'all', label: 'All' },
		{ id: 'UNCLAIMED', label: 'Unclaimed' },
		{ id: 'CLAIMED', label: 'Claimed' },
		{ id: 'COLLECTED', label: 'Collected' }
	];

	function getStatusBadge(status: InventoryItemStatus) {
		switch (status) {
			case 'UNCLAIMED':
				return { text: 'Ready to Claim', icon: Clock };
			case 'CLAIMED':
				return { text: 'Claimed', icon: CheckCircle };
			case 'COLLECTED':
				return { text: 'Collected', icon: Gift };
			default:
				return { text: status, icon: Package };
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-MY', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	// Filter items based on active filter
	let filteredItems = $derived(
		activeFilter === 'all'
			? data.inventory
			: data.inventory.filter((item) => item.status === activeFilter)
	);

	// Group inventory by status (for list view)
	let unclaimedItems = $derived(filteredItems.filter((item) => item.status === 'UNCLAIMED'));
	let claimedItems = $derived(filteredItems.filter((item) => item.status === 'CLAIMED'));
	let collectedItems = $derived(filteredItems.filter((item) => item.status === 'COLLECTED'));

	// Stats
	let allUnclaimedCount = $derived(
		data.inventory.filter((item) => item.status === 'UNCLAIMED').length
	);
	let allClaimedCount = $derived(data.inventory.filter((item) => item.status === 'CLAIMED').length);
	let allCollectedCount = $derived(
		data.inventory.filter((item) => item.status === 'COLLECTED').length
	);
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="My Inventory" showBack={true} />

	<div class="space-y-6 p-6" data-testid="inventory-section">
		<!-- Summary Stats -->
		<div class="grid grid-cols-3 gap-3">
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-yellow-600">{allUnclaimedCount}</div>
				<div class="mt-1 text-xs text-gray-600">Unclaimed</div>
			</div>
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-blue-600">{allClaimedCount}</div>
				<div class="mt-1 text-xs text-gray-600">Claimed</div>
			</div>
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-green-600">{allCollectedCount}</div>
				<div class="mt-1 text-xs text-gray-600">Collected</div>
			</div>
		</div>

		<!-- Filter and View Controls -->
		<div class="flex items-center justify-between">
			<FilterTabs
				tabs={filterTabs}
				activeTab={activeFilter}
				onChange={(tabId) => (activeFilter = tabId as 'all' | InventoryItemStatus)}
			/>
			<ViewToggle {currentView} onToggle={(view) => (currentView = view)} />
		</div>

		<!-- Inventory Items (filtered) -->
		{#if currentView === 'list'}
			<!-- LIST VIEW -->
			<!-- Unclaimed Items (Priority) -->
			{#if unclaimedItems.length > 0}
				<div data-testid="inventory-grid">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Clock class="h-5 w-5 text-yellow-600" />
						Ready to Claim
					</h2>
					<div class="space-y-3">
						{#each unclaimedItems as item (item.id)}
							<a
								href="/inventory/{item.id}"
								data-testid="inventory-item-{item.id}"
								data-prize-id={item.id}
								class="block overflow-hidden rounded-xl border-2 border-yellow-200 bg-white transition-shadow hover:shadow-md"
							>
								<div class="p-4">
									<div class="flex items-start gap-3">
										<!-- Prize Image -->
										<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
											<img
												data-testid="prize-image"
												src={item.prize.imageUrl}
												alt={item.prize.name}
												class="h-full w-full object-cover"
											/>
										</div>

										<!-- Prize Info -->
										<div class="min-w-0 flex-1">
											<h3 class="mb-1 font-semibold text-gray-900" data-testid="prize-name">
												{item.prize.name}
											</h3>
											<p class="mb-2 text-sm text-gray-600">
												Won on {formatDate(item.wonAt)}
											</p>
											<span
												class="inline-flex rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
												data-testid="prize-status"
											>
												{getStatusBadge(item.status).text}
											</span>
											<span class="hidden" data-testid="prize-rarity">{item.prize.rarity}</span>
										</div>
									</div>

									<!-- QR Code Indicator -->
									{#if item.collectionQRCode}
										<div class="mt-3 border-t border-gray-100 pt-3">
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Package class="h-4 w-4" />
												<span>Tap to view collection QR code</span>
											</div>
										</div>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Claimed Items -->
			{#if claimedItems.length > 0}
				<div>
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<CheckCircle class="h-5 w-5 text-blue-600" />
						Claimed Items
					</h2>
					<div class="space-y-3">
						{#each claimedItems as item (item.id)}
							<a
								href="/inventory/{item.id}"
								class="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
							>
								<div class="p-4">
									<div class="flex items-start gap-3">
										<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
											<img
												src={item.prize.imageUrl}
												alt={item.prize.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="min-w-0 flex-1">
											<h3 class="mb-1 font-semibold text-gray-900">
												{item.prize.name}
											</h3>
											<p class="mb-2 text-sm text-gray-600">
												Claimed on {item.claimedAt ? formatDate(item.claimedAt) : 'N/A'}
											</p>
											<span
												class="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
											>
												{getStatusBadge(item.status).text}
											</span>
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Collected Items -->
			{#if collectedItems.length > 0}
				<div>
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Gift class="h-5 w-5 text-green-600" />
						Collected
					</h2>
					<div class="space-y-3">
						{#each collectedItems as item (item.id)}
							<div class="overflow-hidden rounded-xl border border-gray-200 bg-white opacity-75">
								<div class="p-4">
									<div class="flex items-start gap-3">
										<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
											<img
												src={item.prize.imageUrl}
												alt={item.prize.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="min-w-0 flex-1">
											<h3 class="mb-1 font-semibold text-gray-700">
												{item.prize.name}
											</h3>
											<p class="text-sm text-gray-500">
												Collected on {item.claimedAt ? formatDate(item.claimedAt) : 'N/A'}
											</p>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<!-- GRID VIEW -->
			<div class="grid grid-cols-3 gap-3" data-testid="inventory-grid">
				{#each filteredItems as item (item.id)}
					<a
						href="/inventory/{item.id}"
						data-testid="inventory-item-{item.id}"
						data-prize-id={item.id}
						class="block overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
						class:border-yellow-200={item.status === 'UNCLAIMED'}
						class:border-blue-200={item.status === 'CLAIMED'}
						class:border-gray-200={item.status === 'COLLECTED'}
						class:opacity-75={item.status === 'COLLECTED'}
					>
						<!-- Prize Image -->
						<div class="aspect-square bg-gray-100">
							<img
								data-testid="prize-image"
								src={item.prize.imageUrl}
								alt={item.prize.name}
								class="h-full w-full object-cover"
							/>
						</div>

						<!-- Prize Info -->
						<div class="p-2">
							<h3
								class="mb-1 line-clamp-2 text-xs font-semibold text-gray-900"
								data-testid="prize-name"
							>
								{item.prize.name}
							</h3>
							<span
								class="inline-flex rounded px-1.5 py-0.5 text-xs font-medium"
								class:bg-yellow-100={item.status === 'UNCLAIMED'}
								class:text-yellow-800={item.status === 'UNCLAIMED'}
								class:bg-blue-100={item.status === 'CLAIMED'}
								class:text-blue-800={item.status === 'CLAIMED'}
								class:bg-green-100={item.status === 'COLLECTED'}
								class:text-green-800={item.status === 'COLLECTED'}
								data-testid="prize-status"
							>
								{getStatusBadge(item.status).text}
							</span>
							<span class="hidden" data-testid="prize-rarity">{item.prize.rarity}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Empty State -->
		{#if data.inventory.length === 0}
			<div class="rounded-xl bg-white p-12 text-center" data-testid="empty-inventory-message">
				<Package class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-semibold text-gray-900">No Items Yet</h3>
				<p class="text-gray-600">
					Play some gacha machines to win prizes and build your collection!
				</p>
			</div>
		{/if}
	</div>
</div>
