<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { CheckCircle2, AlertCircle, Loader2, CreditCard, Clock } from 'lucide-svelte';
	// import { X, Ticket } from 'lucide-svelte'; // TODO: Enable for future release
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	// import DiscountBadge from '$lib/components/DiscountBadge.svelte'; // TODO: Enable for future release
	// import EventsCarousel from '$lib/components/EventsCarousel.svelte'; // TODO: Enable for future release
	import { getMachineContext } from '$lib/stores/machine.svelte';
	import { formatPrice } from '$lib/mocks/services/payment';
	// import type { MerchantEvent } from '$lib/types'; // TODO: Enable for future release

	let { data } = $props();
	const machine = getMachineContext();

	// Check if redirected from payment success
	let showSpinReminder = $derived($page.url.searchParams.get('paid') === 'true');

	// Event modal state
	// TODO: Enable for future release
	// let showEventModal = $state(false);
	// let selectedEvent = $state<MerchantEvent | null>(null);

	// Spin reminder modal state
	let spinReminderDismissed = $state(false);
	let showSpinModal = $derived(showSpinReminder && !spinReminderDismissed && machine.scanned);

	// TODO: Enable for future release
	// function openEventModal(event: MerchantEvent) {
	// 	selectedEvent = event;
	// 	showEventModal = true;
	// }

	// function closeEventModal() {
	// 	showEventModal = false;
	// }

	function dismissSpinReminder() {
		spinReminderDismissed = true;
		// Clean URL
		goto('/dashboard', { replaceState: true });
	}

	// TODO: Enable for future release
	// function getEventDiscountPercentage(event: MerchantEvent): number {
	// 	if (event.type === 'DISCOUNT') {
	// 		const match = event.description.match(/(\d+)%/);
	// 		if (match) {
	// 			return parseInt(match[1], 10);
	// 		}
	// 	}
	// 	return 0;
	// }

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
		machine.scanned
			? data.machines.find((m) => m.id === machine.machineId) || data.machines[0]
			: null
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
		return data.machines
			.flatMap((m) => m.featuredPrizes.map((prize) => ({ ...prize, machineId: m.id })))
			.slice(0, 6);
	});
</script>

<div class="min-h-screen bg-gray-100 pb-4 font-display" data-testid="dashboard-content">
	<NavigationHeader
		title="Gashapon"
		showBack={true}
		onBack={() => {
			if (window.Unity?.call) {
				window.Unity.call('closeWebView');
			} else {
				window.location.href = 'unity://close';
			}
		}}
	>
		{#snippet actions()}
			{#if !machine.scanned}
				<div class="flex gap-1">
					<button
						type="button"
						onclick={() => machine.mockScanSuccess()}
						disabled={machine.status === 'connecting'}
						class="rounded px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:text-green-300"
					>
						✓
					</button>
					<button
						type="button"
						onclick={() => machine.mockScanFail()}
						disabled={machine.status === 'connecting'}
						class="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:text-red-300"
					>
						✕
					</button>
				</div>
			{/if}
		{/snippet}
	</NavigationHeader>

	<div class="space-y-4 px-4 py-2">
		{#if machine.scanned && connectedMachine}
			<!-- ========== CONNECTED STATE ========== -->

			<!-- Machine-Specific Events Carousel (above payment) -->
			<!-- TODO: Enable events carousel in future release -->
			<!-- <EventsCarousel
				events={connectedMachine.activeEvents || []}
				subtitle="Valid for this machine only"
				onEventClick={openEventModal}
			/> -->

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
						class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-accent-brown shadow-sm transition-colors hover:bg-gray-50"
					>
						Disconnect
					</button>
				</div>

				<!-- Spin Tracker -->
				<div class="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4">
					<div class="flex items-center gap-4">
						<img src="/machine-milestone.svg" alt="Milestone" class="h-20 w-auto" />
						<div class="flex-1">
							<div class="mb-1">
								<span class="font-bold text-navy">One Extra Spin</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-full bg-gradient-to-r from-accent-gold to-amber-400 transition-all"
										style="width: {Math.min((machine.spinCount / 10) * 100, 100)}%"
									></div>
								</div>
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold text-sm font-bold text-white"
								>
									+1
								</div>
							</div>
							<p class="mt-1 text-sm text-gray-500">{machine.spinCount}/10</p>
						</div>
					</div>
				</div>

				<!-- Payment Section (after milestone) -->
				<div class="rounded-xl bg-gradient-to-br from-navy-light to-navy p-3 text-white shadow-lg">
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<CreditCard class="h-5 w-5" />
							<div>
								<p class="text-sm">Price per spin</p>
								<p class="text-xl font-bold">{formatPrice(connectedMachine.pricePerPlay)}</p>
							</div>
						</div>
					</div>

					<a
						href="/machines/{connectedMachine.id}/payment"
						class="block w-full rounded-xl bg-white py-3 text-center font-semibold text-navy shadow-md transition-colors hover:bg-purple-50"
					>
						Pay & Spin Now
					</a>

					<p class="mt-2 text-center text-xs">1 payment = 1 spin</p>
				</div>
			</div>

			<!-- Machine Prizes Grid -->
			<div class="rounded-2xl bg-white p-4 shadow-sm">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="flex items-center gap-2 font-bold text-navy">
						<span class="h-5 w-1 rounded-full bg-accent-green"></span>
						Available Prizes
					</h3>
				</div>
				<div class="grid grid-cols-4 gap-2">
					{#each machinePrizes().slice(0, 8) as prize (prize.id)}
						<div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
							<img src={prize.imageUrl} alt={prize.name} class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent History Section -->
			{#if data.inventory && data.inventory.length > 0}
				<div class="rounded-2xl bg-white p-4 shadow-sm">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="flex items-center gap-2 font-bold text-navy">
							<span class="h-5 w-1 rounded-full bg-accent-green"></span>
							Recent Purchases
						</h3>
						<a
							href="/history"
							class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-gray-50"
							style="box-shadow: 0 4px 6px -1px rgb(34 197 94 / 0.3), 0 2px 4px -2px rgb(34 197 94 / 0.3);"
						>
							view all
						</a>
					</div>

					<div class="space-y-3">
						{#each data.inventory.slice(0, 3) as item (item.id)}
							<a
								href="/history/{item.id}"
								class="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
							>
								<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 p-1">
									<img
										src={item.machineImageUrl || '/machine.svg'}
										alt={item.machineName}
										class="h-full w-full object-contain"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate font-bold text-navy">{item.machineName}</p>
									<div class="flex items-center gap-2 text-xs text-gray-500">
										<Clock class="h-3 w-3" />
										<span>{formatDate(item.wonAt)}</span>
									</div>
								</div>
								<span
									class="rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green"
								>
									Dispensed
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<!-- ========== NOT CONNECTED STATE ========== -->

			<!-- Global Events Carousel (above QR) -->
			<!-- TODO: Enable events carousel in future release -->
			<!-- <EventsCarousel events={data.activeEvents} onEventClick={openEventModal} /> -->

			<!-- QR Code Section -->
			<div class="mt-4 rounded-2xl bg-white shadow-sm">
				<div class="pb-1 text-center">
					<div class="pt-4">
						<h2 class="mb-2 text-lg font-bold text-navy">Show QR code to Gashapon</h2>
					</div>
					<div
						class="mx-auto inline-block rounded-2xl bg-gradient-to-b from-accent-green/10 to-accent-green/5 p-2"
						data-testid="user-qr-code"
					>
						<img src={getQRCodeUrl(data.user.id)} alt="Your QR Code" class="h-44 w-44" />
					</div>
					<p class="mb-2 text-sm font-bold text-navy">{data.user.id}</p>

					{#if machine.status === 'idle'}
						<p class="text-sm text-accent-green">Waiting for machine scan...</p>
					{:else if machine.status === 'connecting'}
						<div class="flex items-center justify-center gap-2 text-navy">
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
				</div>
			</div>

			<!-- How to Scan Section -->
			<div class="rounded-2xl bg-white p-4 shadow-sm">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-navy">
					<span class="h-5 w-1 rounded-full bg-accent-green"></span>
					HOW TO SCAN?
				</h3>
				<div class="flex items-center gap-4">
					<img src="/machine.svg" alt="Gashapon machine" class="h-32 w-auto" />
					<p class="text-sm font-semibold text-navy">
						Hold your QR code near the <span class="font-semibold text-accent-green"
							>Gachapon machine's scan area</span
						> to connect and earn extra rewards.
					</p>
				</div>
			</div>

			<!-- Featured Prizes Section -->
			{#if featuredPrizes().length > 0}
				<div class="rounded-2xl bg-white p-4 shadow-sm">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="flex items-center gap-2 font-bold text-navy">
							<span class="h-5 w-1 rounded-full bg-accent-green"></span>
							New product
						</h3>
						<a
							href="/machines"
							class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-gray-50"
							style="box-shadow: 0 4px 6px -1px rgb(34 197 94 / 0.3), 0 2px 4px -2px rgb(34 197 94 / 0.3);"
						>
							view all
						</a>
					</div>

					<div class="grid grid-cols-3 gap-3">
						{#each featuredPrizes() as prize, index (prize.id + '-' + index)}
							<a
								href="/machines/{prize.machineId}"
								class="block overflow-hidden rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100"
							>
								<div class="aspect-square p-2">
									<img src={prize.imageUrl} alt={prize.name} class="h-full w-full object-contain" />
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
				<div
					class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
				>
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
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-light/30 text-sm font-bold text-navy"
						>
							1
						</div>
						<p class="text-sm text-gray-700">Go to the machine</p>
					</div>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-light/30 text-sm font-bold text-navy"
						>
							2
						</div>
						<p class="text-sm text-gray-700">Turn the handle to spin</p>
					</div>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-light/30 text-sm font-bold text-navy"
						>
							3
						</div>
						<p class="text-sm text-gray-700">Collect your prize!</p>
					</div>
				</div>

				<button
					type="button"
					onclick={dismissSpinReminder}
					class="w-full rounded-xl bg-navy py-3 font-semibold text-white transition-colors hover:bg-navy/90"
				>
					Got it!
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- TODO: Enable for future release -->
<!-- Event Modal -->
<!-- {#if showEventModal && selectedEvent}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
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
{/if} -->
