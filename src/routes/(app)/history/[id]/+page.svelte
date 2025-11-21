<script lang="ts">
	import { Clock, MapPin } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';

	let { data } = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-MY', {
			weekday: 'short',
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
	<NavigationHeader title="Purchase Details" showBack={true} />

	<div class="space-y-4 p-4" data-testid="history-detail">
		<!-- Prize Image -->
		<div class="overflow-hidden rounded-xl bg-white">
			<div class="aspect-square bg-gray-100">
				<img
					data-testid="prize-image"
					src={data.item.prize.imageUrl}
					alt={data.item.prize.name}
					class="h-full w-full object-cover"
				/>
			</div>
		</div>

		<!-- Prize Information -->
		<div class="space-y-4 rounded-xl bg-white p-4">
			<div>
				<h2 class="text-xl font-bold text-gray-900" data-testid="prize-name">
					{data.item.prize.name}
				</h2>
				<p class="mt-1 text-sm text-gray-600" data-testid="prize-description">
					{data.item.prize.description}
				</p>
			</div>

			<div class="flex items-center justify-between border-t border-gray-100 pt-4">
				<div class="flex items-center gap-2 text-sm text-gray-500">
					<Clock class="h-4 w-4" />
					<span>{formatDate(data.item.wonAt)}</span>
				</div>
				<div class="text-right">
					<p class="text-lg font-bold text-purple-600">{formatPrice(data.item.prize.value || 5)}</p>
					<p class="text-xs text-green-600">Dispensed</p>
				</div>
			</div>
		</div>

		<!-- Prize Details -->
		<div class="rounded-xl bg-white p-4">
			<h3 class="mb-3 font-semibold text-gray-900">Details</h3>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-xs text-gray-500">Category</p>
					<p class="font-medium text-gray-900" data-testid="prize-type">
						{data.item.prize.category}
					</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Rarity</p>
					<p class="font-medium text-gray-900" data-testid="prize-rarity">
						{data.item.prize.rarity}
					</p>
				</div>
			</div>
		</div>

		<!-- Machine Info -->
		{#if data.item.machineId}
			<div class="rounded-xl bg-white p-4">
				<h3 class="mb-3 font-semibold text-gray-900">Machine</h3>
				<div class="flex items-center gap-2 text-sm text-gray-600">
					<MapPin class="h-4 w-4" />
					<span>Machine ID: {data.item.machineId}</span>
				</div>
			</div>
		{/if}

		<!-- Transaction ID -->
		<div class="rounded-xl bg-gray-100 p-4">
			<p class="text-xs text-gray-500">Transaction ID</p>
			<p class="font-mono text-sm text-gray-700">{data.item.id}</p>
		</div>
	</div>
</div>
