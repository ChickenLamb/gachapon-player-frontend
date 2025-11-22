<script lang="ts">
	import { Package, Clock, Headphones, MapPin } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import ViewToggle from '$lib/components/ViewToggle.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';

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
</script>

<div class="min-h-screen bg-gray-100 pb-4 font-display">
	<NavigationHeader title="History" showBack={true} />

	<div class="space-y-4 p-4" data-testid="history-section">
		<!-- Header with Stats and Support -->
		<div class="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
			<div>
				<p class="text-2xl font-bold text-navy">{data.inventory.length}</p>
				<p class="text-sm text-gray-500">Total Plays</p>
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
							class="flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
						>
							<!-- Machine Image -->
							<div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
								<img
									data-testid="machine-image"
									src={item.machineImageUrl || '/machine.svg'}
									alt={item.machineName}
									class="h-full w-full object-contain p-2"
								/>
							</div>

							<!-- Machine Info -->
							<div class="flex min-w-0 flex-1 flex-col justify-between py-1">
								<div>
									<h3 class="font-bold text-navy" data-testid="machine-name">
										{item.machineName}
									</h3>
									{#if item.machine?.location}
										<div class="mt-0.5 flex items-center gap-1 text-xs text-accent-green">
											<MapPin class="h-3 w-3 flex-shrink-0" />
											<span class="truncate">{item.machine.location}</span>
										</div>
									{/if}
									<div class="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
										<Clock class="h-3 w-3" />
										<span>{formatDate(item.wonAt)}</span>
									</div>
								</div>
								<div class="flex items-center justify-between">
									<p class="font-bold text-navy">{formatPrice(item.pricePerPlay)}</p>
									<span
										class="rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green"
									>
										Dispensed
									</span>
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
							class="block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
						>
							<!-- Machine Image -->
							<div class="aspect-square bg-gray-50 p-2">
								<img
									data-testid="machine-image"
									src={item.machineImageUrl || '/machine.svg'}
									alt={item.machineName}
									class="h-full w-full object-contain"
								/>
							</div>

							<!-- Machine Info -->
							<div class="p-2">
								<h3
									class="mb-1 line-clamp-2 text-xs font-bold text-navy"
									data-testid="machine-name"
								>
									{item.machineName}
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
			<div
				class="rounded-2xl bg-white p-12 text-center shadow-sm"
				data-testid="empty-history-message"
			>
				<Package class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h3 class="mb-2 text-lg font-bold text-navy">No History Yet</h3>
				<p class="text-gray-500">Your play history will appear here after you make a purchase.</p>
			</div>
		{/if}
	</div>
</div>
