<script lang="ts">
	import { Package, Clock, Headphones } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import ViewToggle from '$lib/components/ViewToggle.svelte';

	let { data } = $props();

	// State management
	let currentView = $state<'list' | 'grid'>('list');

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-MY', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function formatPrice(amount: number): string {
		return `RM ${amount.toFixed(2)}`;
	}
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="History" showBack={true} />

	<div class="space-y-4 p-4" data-testid="history-section">
		<!-- Header with Stats and Support -->
		<div class="flex items-center justify-between rounded-xl bg-white p-4">
			<div>
				<p class="text-2xl font-bold text-purple-600">{data.inventory.length}</p>
				<p class="text-sm text-gray-600">Total Plays</p>
			</div>
			<div class="flex items-center gap-2">
				<a
					href="/support"
					class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
				>
					<Headphones class="h-4 w-4" />
					<span>Support</span>
				</a>
				<ViewToggle {currentView} onToggle={(view) => (currentView = view)} />
			</div>
		</div>

		<!-- History Items -->
		{#if data.inventory.length > 0}
			{#if currentView === 'list'}
				<!-- LIST VIEW -->
				<div class="space-y-3" data-testid="history-list">
					{#each data.inventory as item (item.id)}
						<a
							href="/history/{item.id}"
							data-testid="history-item-{item.id}"
							class="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
						>
							<div class="p-4">
								<div class="flex items-start gap-3">
									<!-- Prize Image -->
									<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
										<div class="flex items-center gap-1.5 text-sm text-gray-500">
											<Clock class="h-3.5 w-3.5" />
											<span>{formatDate(item.wonAt)}</span>
										</div>
									</div>

									<!-- Price Paid -->
									<div class="text-right">
										<p class="font-semibold text-gray-900">{formatPrice(item.prize.value || 5)}</p>
										<p class="text-xs text-green-600">Dispensed</p>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<!-- GRID VIEW -->
				<div class="grid grid-cols-3 gap-3" data-testid="history-grid">
					{#each data.inventory as item (item.id)}
						<a
							href="/history/{item.id}"
							data-testid="history-item-{item.id}"
							class="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
								<p class="text-xs text-gray-500">
									{formatDate(item.wonAt)}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Empty State -->
			<div class="rounded-xl bg-white p-12 text-center" data-testid="empty-history-message">
				<Package class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-semibold text-gray-900">No History Yet</h3>
				<p class="text-gray-600">
					Your play history will appear here after you make a purchase.
				</p>
			</div>
		{/if}
	</div>
</div>
