<script lang="ts">
	import { Clock, MapPin } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';

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
</script>

<div class="min-h-screen bg-gray-100 pb-20 font-display">
	<NavigationHeader title="Purchase Details" showBack={true} />

	<div class="space-y-4 p-4" data-testid="history-detail">
		<!-- Machine Image -->
		<div class="overflow-hidden rounded-2xl bg-white shadow-sm">
			<div class="aspect-square bg-gradient-to-b from-accent-green/10 to-gray-50 p-8">
				<img
					data-testid="machine-image"
					src={data.machine?.imageUrl || data.item.machineImageUrl || '/machine.svg'}
					alt={data.machine?.name || data.item.machineName}
					class="h-full w-full object-contain"
				/>
			</div>
		</div>

		<!-- Purchase Information -->
		<div class="rounded-2xl bg-white p-4 shadow-sm">
			<h3 class="mb-3 font-bold text-navy">Purchase Details</h3>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-500">Price per play</span>
					<p class="text-lg font-bold text-navy">{formatPrice(data.item.pricePerPlay)}</p>
				</div>
				<div class="flex items-center justify-between border-t border-gray-100 pt-3">
					<div class="flex items-center gap-2 text-sm text-gray-500">
						<Clock class="h-4 w-4" />
						<span>{formatDate(data.item.wonAt)}</span>
					</div>
					<span class="rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green">Dispensed</span>
				</div>
			</div>
		</div>

		<!-- Machine Information -->
		{#if data.machine}
			<div class="rounded-2xl bg-white p-4 shadow-sm">
				<h3 class="mb-3 font-bold text-navy">Machine Information</h3>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 p-1">
							<img
								src={data.machine.imageUrl}
								alt={data.machine.name}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="flex-1">
							<p class="font-bold text-navy" data-testid="machine-name">{data.machine.name}</p>
							<p class="text-xs text-gray-500">Gachapon Limited Edition</p>
						</div>
					</div>
					<div class="border-t border-gray-100 pt-3">
						<div class="flex items-center gap-2 text-sm text-accent-green">
							<MapPin class="h-4 w-4" />
							<span>{data.machine.location}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Transaction ID -->
		<div class="rounded-2xl bg-gray-200/50 p-4">
			<p class="text-xs text-gray-500">Transaction ID</p>
			<p class="font-mono text-sm text-navy">{data.item.id}</p>
		</div>
	</div>
</div>
