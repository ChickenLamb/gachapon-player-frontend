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

	<div class="p-6 space-y-6">
		<!-- Prize Image -->
		<div class="bg-white rounded-xl overflow-hidden">
			<div class="aspect-square bg-gray-100">
				<img
					src={data.item.prize.imageUrl}
					alt={data.item.prize.name}
					class="w-full h-full object-cover"
				/>
			</div>
		</div>

		<!-- Status Badge -->
		<div class="bg-white rounded-xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div
					class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center {getStatusColor(
						data.item.status
					)}"
				>
					<StatusIcon class="w-6 h-6" />
				</div>
				<div class="flex-1">
					<h2 class="text-lg font-semibold text-gray-900">
						{getStatusText(data.item.status)}
					</h2>
					<p class="text-sm text-gray-600">
						Won on {formatDate(data.item.wonAt)}
					</p>
				</div>
			</div>

			<!-- Timeline -->
			<div class="space-y-3 ml-6 border-l-2 border-gray-200 pl-4">
				<div class="flex items-start gap-3">
					<CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
					<div>
						<div class="font-medium text-gray-900">Won Prize</div>
						<div class="text-sm text-gray-600">{formatDate(data.item.wonAt)}</div>
					</div>
				</div>

				{#if data.item.claimedAt}
					<div class="flex items-start gap-3">
						<CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
						<div>
							<div class="font-medium text-gray-900">Claimed</div>
							<div class="text-sm text-gray-600">{formatDate(data.item.claimedAt)}</div>
						</div>
					</div>
				{:else}
					<div class="flex items-start gap-3">
						<Clock class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
						<div>
							<div class="font-medium text-gray-400">Not claimed yet</div>
							<div class="text-sm text-gray-500">Claim to proceed to collection</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prize Information -->
		<div class="bg-white rounded-xl p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-900">Prize Information</h2>

			<div>
				<h3 class="text-xl font-bold text-gray-900 mb-2">
					{data.item.prize.name}
				</h3>
				<p class="text-gray-600 leading-relaxed">
					{data.item.prize.description}
				</p>
			</div>

			<div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
				<div>
					<div class="text-sm text-gray-600 mb-1">Category</div>
					<div class="font-medium text-gray-900">{data.item.prize.category}</div>
				</div>
				<div>
					<div class="text-sm text-gray-600 mb-1">Rarity</div>
					<div class="font-medium text-gray-900">{data.item.prize.rarity}</div>
				</div>
			</div>
		</div>

		<!-- Collection QR Code (for UNCLAIMED items) -->
		{#if data.item.status === 'UNCLAIMED' && data.item.collectionQRCode}
			<div class="bg-white rounded-xl p-6 space-y-4">
				<h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
					<QrCode class="w-5 h-5 text-purple-600" />
					Collection QR Code
				</h2>

				<div class="bg-gray-100 rounded-xl p-8 text-center">
					<!-- Placeholder for QR code -->
					<div class="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
						<QrCode class="w-24 h-24 text-gray-400" />
					</div>
					<p class="text-sm text-gray-600 mt-4">
						QR Code: {data.item.collectionQRCode}
					</p>
				</div>

				<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
					<div class="flex items-start gap-3">
						<Package class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
						<div class="text-sm text-purple-800">
							<p class="font-medium mb-1">How to collect:</p>
							<ol class="list-decimal list-inside space-y-1 text-purple-700">
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
			<div class="bg-white rounded-xl p-6 space-y-3">
				<button
					class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
				>
					Mark as Claimed
				</button>
				<p class="text-xs text-gray-500 text-center">
					Mark as claimed after collecting from merchant
				</p>
			</div>
		{/if}

		<!-- Merchant Information (if available) -->
		{#if data.item.prize.merchant}
			<div class="bg-white rounded-xl p-6 space-y-4">
				<h2 class="text-lg font-semibold text-gray-900">Merchant Location</h2>
				<div>
					<div class="font-medium text-gray-900 mb-1">{data.item.prize.merchant.name}</div>
					<p class="text-sm text-gray-600">{data.item.prize.merchant.address}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
