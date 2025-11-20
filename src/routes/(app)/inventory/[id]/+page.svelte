<script lang="ts">
	import { QrCode, Package, CheckCircle, Clock, Gift } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import type { InventoryItemStatus } from '$lib/types';

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

	function getStatusIcon(status: InventoryItemStatus) {
		switch (status) {
			case 'UNCLAIMED':
				return Clock;
			case 'CLAIMED':
				return CheckCircle;
			case 'COLLECTED':
				return Gift;
			default:
				return Package;
		}
	}

	function getStatusText(status: InventoryItemStatus): string {
		switch (status) {
			case 'UNCLAIMED':
				return 'Ready to Claim';
			case 'CLAIMED':
				return 'Claimed - Awaiting Collection';
			case 'COLLECTED':
				return 'Collected';
			default:
				return status;
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

	let StatusIcon = $derived(getStatusIcon(data.item.status));
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="Prize Details" showBack={true} />

	<div class="space-y-6 p-6" data-testid="prize-detail">
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

		<!-- Status Badge -->
		<div class="rounded-xl bg-white p-6">
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full {getStatusColor(
						data.item.status
					)}"
				>
					<StatusIcon class="h-6 w-6" />
				</div>
				<div class="flex-1">
					<h2 class="text-lg font-semibold text-gray-900" data-testid="prize-status">
						{getStatusText(data.item.status)}
					</h2>
					<p class="text-sm text-gray-600">
						Won on {formatDate(data.item.wonAt)}
					</p>
				</div>
			</div>

			<!-- Timeline -->
			<div class="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
				<div class="flex items-start gap-3">
					<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
					<div>
						<div class="font-medium text-gray-900">Won Prize</div>
						<div class="text-sm text-gray-600">{formatDate(data.item.wonAt)}</div>
					</div>
				</div>

				{#if data.item.claimedAt}
					<div class="flex items-start gap-3">
						<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
						<div>
							<div class="font-medium text-gray-900">Claimed</div>
							<div class="text-sm text-gray-600">{formatDate(data.item.claimedAt)}</div>
						</div>
					</div>
				{:else}
					<div class="flex items-start gap-3">
						<Clock class="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
						<div>
							<div class="font-medium text-gray-400">Not claimed yet</div>
							<div class="text-sm text-gray-500">Claim to proceed to collection</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prize Information -->
		<div class="space-y-4 rounded-xl bg-white p-6">
			<h2 class="text-lg font-semibold text-gray-900">Prize Information</h2>

			<div>
				<h3 class="mb-2 text-xl font-bold text-gray-900" data-testid="prize-name">
					{data.item.prize.name}
				</h3>
				<p class="leading-relaxed text-gray-600" data-testid="prize-description">
					{data.item.prize.description}
				</p>
			</div>

			<div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
				<div>
					<div class="mb-1 text-sm text-gray-600">Category</div>
					<div class="font-medium text-gray-900" data-testid="prize-type">
						{data.item.prize.category}
					</div>
				</div>
				<div>
					<div class="mb-1 text-sm text-gray-600">Rarity</div>
					<div class="font-medium text-gray-900" data-testid="prize-rarity">
						{data.item.prize.rarity}
					</div>
				</div>
			</div>
		</div>

		<!-- Collection QR Code (for UNCLAIMED items) -->
		{#if data.item.status === 'UNCLAIMED' && data.item.collectionQRCode}
			<div class="space-y-4 rounded-xl bg-white p-6" data-testid="collection-qr">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">
					<QrCode class="h-5 w-5 text-purple-600" />
					Collection QR Code
				</h2>

				<div class="rounded-xl bg-gray-100 p-8 text-center">
					<!-- Placeholder for QR code -->
					<div
						class="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-gray-300 bg-white"
						data-testid="qr-code"
					>
						<QrCode class="h-24 w-24 text-gray-400" />
					</div>
					<p class="mt-4 text-sm text-gray-600">
						QR Code: {data.item.collectionQRCode}
					</p>
				</div>

				<div class="rounded-lg border border-purple-200 bg-purple-50 p-4">
					<div class="flex items-start gap-3">
						<Package class="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
						<div class="text-sm text-purple-800">
							<p class="mb-1 font-medium">How to collect:</p>
							<ol class="list-inside list-decimal space-y-1 text-purple-700">
								<li>Show this QR code at the merchant counter</li>
								<li>Staff will scan and verify your prize</li>
								<li>Collect your prize and enjoy!</li>
							</ol>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Action Buttons -->
		{#if data.item.status === 'UNCLAIMED'}
			<div class="space-y-3 rounded-xl bg-white p-6">
				<button
					data-testid="claim-prize-button"
					class="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800"
				>
					Mark as Claimed
				</button>
				<p class="text-center text-xs text-gray-500">
					Mark as claimed after collecting from merchant
				</p>
			</div>
		{/if}

		<!-- Collection Date (if collected) -->
		{#if data.item.status === 'COLLECTED' && data.item.claimedAt}
			<div class="rounded-xl bg-white p-6">
				<div class="mb-1 text-sm text-gray-600">Collection Date</div>
				<div class="font-medium text-gray-900" data-testid="collection-date">
					{formatDate(data.item.claimedAt)}
				</div>
			</div>
		{/if}

		<!-- Merchant Information (if available) -->
		{#if data.item.prize.merchant}
			<div class="space-y-4 rounded-xl bg-white p-6">
				<h2 class="text-lg font-semibold text-gray-900">Merchant Location</h2>
				<div>
					<div class="mb-1 font-medium text-gray-900">{data.item.prize.merchant.name}</div>
					<p class="text-sm text-gray-600">{data.item.prize.merchant.address}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
