<script lang="ts">
	import { Package, CheckCircle, Clock, Gift } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import type { InventoryItemStatus } from '$lib/types';

	let { data } = $props();

	function getStatusColor(status: InventoryItemStatus) {
		switch (status) {
			case 'UNCLAIMED':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			case 'CLAIMED':
				return 'bg-blue-50 border-blue-200 text-blue-800';
			case 'COLLECTED':
				return 'bg-green-50 border-green-200 text-green-800';
			default:
				return 'bg-gray-50 border-gray-200 text-gray-800';
		}
	}

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

	// Group inventory by status
	let unclaimedItems = $derived(data.inventory.filter((item) => item.status === 'UNCLAIMED'));
	let claimedItems = $derived(data.inventory.filter((item) => item.status === 'CLAIMED'));
	let collectedItems = $derived(data.inventory.filter((item) => item.status === 'COLLECTED'));
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="My Inventory" showBack={true} />

	<div class="space-y-6 p-6" data-testid="inventory-section">
		<!-- Summary Stats -->
		<div class="grid grid-cols-3 gap-3">
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-yellow-600">{unclaimedItems.length}</div>
				<div class="mt-1 text-xs text-gray-600">Unclaimed</div>
			</div>
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-blue-600">{claimedItems.length}</div>
				<div class="mt-1 text-xs text-gray-600">Claimed</div>
			</div>
			<div class="rounded-xl bg-white p-4 text-center">
				<div class="text-2xl font-bold text-green-600">{collectedItems.length}</div>
				<div class="mt-1 text-xs text-gray-600">Collected</div>
			</div>
		</div>

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
