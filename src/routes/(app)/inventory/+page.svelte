<script lang="ts">
	import { Package, CheckCircle, Clock, Gift } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import type { InventoryItem, InventoryItemStatus } from '$lib/types';

	let { data } = $props();

	function getStatusColor(status: InventoryItemStatus): string {
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

	<div class="p-6 space-y-6">
		<!-- Summary Stats -->
		<div class="grid grid-cols-3 gap-3">
			<div class="bg-white rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-yellow-600">{unclaimedItems.length}</div>
				<div class="text-xs text-gray-600 mt-1">Unclaimed</div>
			</div>
			<div class="bg-white rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-blue-600">{claimedItems.length}</div>
				<div class="text-xs text-gray-600 mt-1">Claimed</div>
			</div>
			<div class="bg-white rounded-xl p-4 text-center">
				<div class="text-2xl font-bold text-green-600">{collectedItems.length}</div>
				<div class="text-xs text-gray-600 mt-1">Collected</div>
			</div>
		</div>

		<!-- Unclaimed Items (Priority) -->
		{#if unclaimedItems.length > 0}
			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Clock class="w-5 h-5 text-yellow-600" />
					Ready to Claim
				</h2>
				<div class="space-y-3">
					{#each unclaimedItems as item (item.id)}
						<a
							href="/inventory/{item.id}"
							class="block bg-white rounded-xl border-2 border-yellow-200 overflow-hidden hover:shadow-md transition-shadow"
						>
							<div class="p-4">
								<div class="flex items-start gap-3">
									<!-- Prize Image -->
									<div class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
										<img
											src={item.prize.imageUrl}
											alt={item.prize.name}
											class="w-full h-full object-cover"
										/>
									</div>

									<!-- Prize Info -->
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-gray-900 mb-1">
											{item.prize.name}
										</h3>
										<p class="text-sm text-gray-600 mb-2">
											Won on {formatDate(item.wonAt)}
										</p>
										<span
											class="inline-flex text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800"
										>
											{getStatusBadge(item.status).text}
										</span>
									</div>
								</div>

								<!-- QR Code Indicator -->
								{#if item.collectionQRCode}
									<div class="mt-3 pt-3 border-t border-gray-100">
										<div class="text-sm text-gray-600 flex items-center gap-2">
											<Package class="w-4 h-4" />
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
				<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<CheckCircle class="w-5 h-5 text-blue-600" />
					Claimed Items
				</h2>
				<div class="space-y-3">
					{#each claimedItems as item (item.id)}
						<a
							href="/inventory/{item.id}"
							class="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
						>
							<div class="p-4">
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
										<img
											src={item.prize.imageUrl}
											alt={item.prize.name}
											class="w-full h-full object-cover"
										/>
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-gray-900 mb-1">
											{item.prize.name}
										</h3>
										<p class="text-sm text-gray-600 mb-2">
											Claimed on {item.claimedAt ? formatDate(item.claimedAt) : 'N/A'}
										</p>
										<span
											class="inline-flex text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800"
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
				<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Gift class="w-5 h-5 text-green-600" />
					Collected
				</h2>
				<div class="space-y-3">
					{#each collectedItems as item (item.id)}
						<div class="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-75">
							<div class="p-4">
								<div class="flex items-start gap-3">
									<div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
										<img
											src={item.prize.imageUrl}
											alt={item.prize.name}
											class="w-full h-full object-cover"
										/>
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-gray-700 mb-1">
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
			<div class="bg-white rounded-xl p-12 text-center">
				<Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-gray-900 mb-2">No Items Yet</h3>
				<p class="text-gray-600">
					Play some gacha machines to win prizes and build your collection!
				</p>
			</div>
		{/if}
	</div>
</div>
