<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { CheckCircle2, AlertCircle, Loader2, CreditCard, Gift, X, Ticket, Clock } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import DiscountBadge from '$lib/components/DiscountBadge.svelte';
	import { getMachineContext } from '$lib/stores/machine.svelte';
	import type { MerchantEvent } from '$lib/types';

	let { data } = $props();
	const machine = getMachineContext();

	// Check if redirected from payment success
	let showSpinReminder = $derived($page.url.searchParams.get('paid') === 'true');

	// Event modal state
	let showEventModal = $state(false);
	let selectedEvent = $state<MerchantEvent | null>(null);

	// Spin reminder modal state
	let spinReminderDismissed = $state(false);
	let showSpinModal = $derived(showSpinReminder && !spinReminderDismissed && machine.scanned);

	function openEventModal(event: MerchantEvent) {
		selectedEvent = event;
		showEventModal = true;
	}

	function closeEventModal() {
		showEventModal = false;
		selectedEvent = null;
	}

	function dismissSpinReminder() {
		spinReminderDismissed = true;
		// Clean URL
		goto('/dashboard', { replaceState: true });
	}

	function getEventDiscountPercentage(event: MerchantEvent): number {
		if (event.type === 'DISCOUNT') {
			const match = event.description.match(/(\d+)%/);
			if (match) {
				return parseInt(match[1], 10);
			}
		}
		return 0;
	}

	function getQRCodeUrl(userId: string): string {
		return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userId)}`;
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-MY', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	// Get connected machine data (mock - in real app this comes from WS)
	let connectedMachine = $derived(
		machine.scanned ? data.machines.find(m => m.id === machine.machineId) || data.machines[0] : null
	);

	// Machine prizes when connected
	let machinePrizes = $derived(() => {
		if (connectedMachine) {
			return connectedMachine.featuredPrizes;
		}
		return [];
	});

	// Featured prizes when not connected (global)
	let featuredPrizes = $derived(() => {
		return data.machines.flatMap((m) =>
			m.featuredPrizes.map(prize => ({ ...prize, machineId: m.id }))
		).slice(0, 6);
	});
</script>

<div class="min-h-screen bg-gray-50 pb-20" data-testid="dashboard-content">
	<NavigationHeader title="Gachapon" showBack={true} onBack={() => {
		if (window.Unity?.call) {
			window.Unity.call('closeWebView');
		} else {
			window.location.href = 'unity://close';
		}
	}} />

	<div class="space-y-6 px-4 py-6">
		{#if machine.scanned && connectedMachine}
			<!-- ========== CONNECTED STATE ========== -->

			<!-- Events Banner (on top when connected) -->
			{#if data.activeEvents.length > 0}
				<button
					type="button"
					onclick={() => openEventModal(data.activeEvents[0])}
					class="w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-left text-white shadow-md transition-transform hover:scale-[1.01]"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Ticket class="h-6 w-6" />
							<div>
								<p class="font-semibold">{data.activeEvents[0].name}</p>
								<p class="text-xs text-amber-100">Tap to view details</p>
							</div>
						</div>
						{#if getEventDiscountPercentage(data.activeEvents[0]) > 0}
							<DiscountBadge percentage={getEventDiscountPercentage(data.activeEvents[0])} size="sm" />
						{/if}
					</div>
				</button>
			{/if}

			<!-- Payment Section (under events) -->
			<div class="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-5 text-white shadow-lg">
				<div class="mb-3 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<CreditCard class="h-5 w-5" />
						<div>
							<p class="text-sm text-purple-200">Price per spin</p>
							<p class="text-xl font-bold">RM {connectedMachine.pricePerPlay.toFixed(2)}</p>
						</div>
					</div>
				</div>

				<a
					href="/machines/{connectedMachine.id}/payment"
					class="block w-full rounded-xl bg-white py-3 text-center font-semibold text-purple-600 shadow-md transition-colors hover:bg-purple-50"
				>
					Pay & Spin Now
				</a>

				<p class="mt-2 text-center text-xs text-purple-200">1 payment = 1 spin</p>
			</div>

			<!-- Machine Prizes Section (replaces QR when connected) -->
			<div class="rounded-xl bg-white p-4 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
							<img
								src={connectedMachine.imageUrl}
								alt={connectedMachine.name}
								class="h-full w-full object-cover"
							/>
						</div>
						<div>
							<div class="flex items-center gap-2">
								<CheckCircle2 class="h-4 w-4 text-green-500" />
								<h3 class="font-semibold text-gray-900">{connectedMachine.name}</h3>
							</div>
							<p class="text-xs text-gray-500">{connectedMachine.location}</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => machine.disconnect()}
						class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
					>
						Disconnect
					</button>
				</div>

				<!-- Bonus Spins Badge -->
				{#if machine.spinCount > 0}
					<div class="mb-4 rounded-lg bg-orange-50 p-3">
						<div class="flex items-center justify-center gap-2 text-orange-600">
							<Gift class="h-5 w-5" />
							<span class="font-semibold">
								{machine.spinCount} Bonus Spin{machine.spinCount > 1 ? 's' : ''} Available!
							</span>
						</div>
					</div>
				{/if}

				<!-- Machine Prizes Grid -->
				<p class="mb-3 text-sm font-medium text-gray-700">Available Prizes</p>
				<div class="grid grid-cols-4 gap-2">
					{#each machinePrizes().slice(0, 8) as prize (prize.id)}
						<div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
							<img
								src={prize.imageUrl}
								alt={prize.name}
								class="h-full w-full object-cover"
							/>
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent History Section -->
			{#if data.inventory && data.inventory.length > 0}
				<div>
					<SectionHeader title="Recent Purchases" viewAllHref="/history" />

					<div class="space-y-3">
						{#each data.inventory.slice(0, 3) as item (item.id)}
							<a
								href="/history/{item.id}"
								class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
							>
								<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
									<img
										src={item.prize.imageUrl}
										alt={item.prize.name}
										class="h-full w-full object-cover"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate font-medium text-gray-900">{item.prize.name}</p>
									<div class="flex items-center gap-2 text-xs text-gray-500">
										<Clock class="h-3 w-3" />
										<span>{formatDate(item.wonAt)}</span>
									</div>
								</div>
								<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
									Dispensed
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}

		{:else}
			<!-- ========== NOT CONNECTED STATE ========== -->

			<!-- Events Banner (same position as connected state) -->
			{#if data.activeEvents.length > 0}
				<button
					type="button"
					onclick={() => openEventModal(data.activeEvents[0])}
					class="w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-left text-white shadow-md transition-transform hover:scale-[1.01]"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Ticket class="h-6 w-6" />
							<div>
								<p class="font-semibold">{data.activeEvents[0].name}</p>
								<p class="text-xs text-amber-100">Tap to view details</p>
							</div>
						</div>
						{#if getEventDiscountPercentage(data.activeEvents[0]) > 0}
							<DiscountBadge percentage={getEventDiscountPercentage(data.activeEvents[0])} size="sm" />
						{/if}
					</div>
				</button>
			{/if}

			<!-- QR Code Section -->
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<div class="text-center">
					<h2 class="mb-2 text-lg font-semibold text-gray-900">Your QR Code</h2>
					<p class="mb-4 text-sm text-gray-600">
						Show this to the machine to start playing
					</p>

					<div
						class="mx-auto mb-4 inline-block rounded-xl border-4 border-purple-600 bg-white p-3"
						data-testid="user-qr-code"
					>
						<img
							src={getQRCodeUrl(data.user.id)}
							alt="Your QR Code"
							class="h-40 w-40"
						/>
					</div>

					{#if machine.status === 'idle'}
						<p class="text-sm text-gray-500">Waiting for machine scan...</p>
					{:else if machine.status === 'connecting'}
						<div class="flex items-center justify-center gap-2 text-purple-600">
							<Loader2 class="h-4 w-4 animate-spin" />
							<span class="text-sm">Connecting to machine...</span>
						</div>
					{:else if machine.status === 'error'}
						<div class="rounded-lg bg-red-50 p-3">
							<div class="flex items-center justify-center gap-2 text-red-600">
								<AlertCircle class="h-5 w-5" />
								<span class="font-medium">Connection failed</span>
							</div>
							<p class="mt-1 text-sm text-red-700">{machine.error}</p>
						</div>
					{/if}

					<!-- Mock Scan Buttons (Dev Only) -->
					<div class="mt-4 border-t border-gray-200 pt-4">
						<p class="mb-2 text-xs text-gray-500">Dev Mode</p>
						<div class="flex justify-center gap-2">
							<button
								type="button"
								onclick={() => machine.mockScanSuccess()}
								disabled={machine.status === 'connecting'}
								class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-300"
							>
								{machine.status === 'connecting' ? 'Connecting...' : 'Mock Success'}
							</button>
							<button
								type="button"
								onclick={() => machine.mockScanFail()}
								disabled={machine.status === 'connecting'}
								class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-300"
							>
								Mock Fail
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Featured Prizes Section -->
			{#if featuredPrizes().length > 0}
				<div>
					<SectionHeader title="Featured Prizes" viewAllHref="/machines" />

					<div class="grid grid-cols-3 gap-3">
						{#each featuredPrizes() as prize, index (prize.id + '-' + index)}
							<a
								href="/machines/{prize.machineId}"
								class="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="aspect-square bg-gray-100">
									<img
										src={prize.imageUrl}
										alt={prize.name}
										class="h-full w-full object-cover"
									/>
								</div>
								<div class="p-2">
									<p class="line-clamp-2 text-xs font-medium text-gray-900">{prize.name}</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Spin Reminder Modal (after payment success) -->
{#if showSpinModal && connectedMachine}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
			<!-- Modal Header -->
			<div class="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center text-white">
				<div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
					<CheckCircle2 class="h-10 w-10" />
				</div>
				<h2 class="text-xl font-bold">Payment Successful!</h2>
				<p class="mt-1 text-green-100">Your spin is ready</p>
			</div>

			<!-- Modal Body -->
			<div class="p-6">
				<!-- Machine Info -->
				<div class="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
					<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
						<img
							src={connectedMachine.imageUrl}
							alt={connectedMachine.name}
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate font-medium text-gray-900">{connectedMachine.name}</p>
						<p class="truncate text-xs text-gray-600">{connectedMachine.location}</p>
					</div>
				</div>

				<!-- Instructions -->
				<div class="mb-6 space-y-3">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
							1
						</div>
						<p class="text-sm text-gray-700">Go to the machine</p>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
							2
						</div>
						<p class="text-sm text-gray-700">Turn the handle to spin</p>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
							3
						</div>
						<p class="text-sm text-gray-700">Collect your prize!</p>
					</div>
				</div>

				<button
					type="button"
					onclick={dismissSpinReminder}
					class="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
				>
					Got it!
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Event Modal -->
{#if showEventModal && selectedEvent}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
			<!-- Modal Header -->
			<div class="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
				<button
					type="button"
					onclick={closeEventModal}
					class="absolute top-4 right-4 rounded-full bg-white/20 p-1 transition-colors hover:bg-white/30"
				>
					<X class="h-5 w-5" />
				</button>
				<Ticket class="mb-3 h-10 w-10" />
				<h2 class="text-xl font-bold">{selectedEvent.name}</h2>
				{#if getEventDiscountPercentage(selectedEvent) > 0}
					<div class="mt-2">
						<DiscountBadge percentage={getEventDiscountPercentage(selectedEvent)} size="lg" />
					</div>
				{/if}
			</div>

			<!-- Modal Body -->
			<div class="p-6">
				<p class="mb-4 text-gray-600">{selectedEvent.description}</p>

				<div class="mb-6 rounded-lg bg-gray-50 p-3">
					<p class="text-xs text-gray-500">Valid until</p>
					<p class="font-semibold text-gray-900">
						{new Date(selectedEvent.endDate).toLocaleDateString('en-MY', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={closeEventModal}
						class="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						Close
					</button>
					<a
						href="/events/{selectedEvent.id}"
						class="flex-1 rounded-xl bg-orange-500 py-3 text-center font-medium text-white transition-colors hover:bg-orange-600"
					>
						View More
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
