<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { Scan, Clock, CheckCircle2, AlertCircle } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import {
		getQRCodeImageUrl,
		getQRCodeRemainingTime,
		formatRemainingTime
	} from '$lib/mocks/services/qr';
	import { drawPrize } from '$lib/mocks/services/play';

	let { data } = $props();

	let remainingSeconds = $state(getQRCodeRemainingTime(data.qrCode));
	let qrImageUrl = $state(getQRCodeImageUrl(data.qrCode.code));
	let isScanned = $state(false);
	let isDrawingPrize = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Countdown timer
	onMount(() => {
		intervalId = setInterval(() => {
			remainingSeconds = getQRCodeRemainingTime(data.qrCode);

			if (remainingSeconds <= 0) {
				if (intervalId) clearInterval(intervalId);
			}
		}, 1000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	// Simulate QR scan (for testing)
	async function simulateScan() {
		if (isScanned || isDrawingPrize) return;

		isScanned = true;
		isDrawingPrize = true;

		// Draw prize
		const prize = await drawPrize(data.machine.id);

		// Navigate to prize result
		goto(`/machines/${data.machine.id}/result/${prize.id}`);
	}

	// Timer color based on remaining time
	$effect(() => {
		if (remainingSeconds > 180) {
			// > 3 minutes: green
		} else if (remainingSeconds > 60) {
			// > 1 minute: yellow
		} else {
			// < 1 minute: red
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title="Scan QR Code" showBack={false} />

	<div class="space-y-6 p-6">
		<!-- Timer -->
		<div
			class="rounded-xl border-2 bg-white p-4 text-center"
			class:border-green-500={remainingSeconds > 180}
			class:border-yellow-500={remainingSeconds <= 180 && remainingSeconds > 60}
			class:border-red-500={remainingSeconds <= 60}
		>
			<div class="mb-2 flex items-center justify-center gap-2">
				<Clock
					class="h-5 w-5 {remainingSeconds > 180
						? 'text-green-600'
						: remainingSeconds > 60
							? 'text-yellow-600'
							: 'text-red-600'}"
				/>
				<span class="text-sm font-medium text-gray-600">Time Remaining</span>
			</div>
			<p
				class="text-4xl font-bold tabular-nums"
				data-testid="qr-countdown"
				class:text-green-600={remainingSeconds > 180}
				class:text-yellow-600={remainingSeconds <= 180 && remainingSeconds > 60}
				class:text-red-600={remainingSeconds <= 60}
			>
				{formatRemainingTime(remainingSeconds)}
			</p>
		</div>

		<!-- QR Code -->
		<div class="rounded-xl border border-gray-200 bg-white p-8">
			<div class="mb-6 text-center">
				<h2 class="mb-2 text-lg font-semibold text-gray-900">Ready to Play!</h2>
				<p class="text-sm text-gray-600">Scan this QR code at the machine to start</p>
			</div>

			<!-- QR Code Image -->
			<div class="mb-6 rounded-xl border-4 border-purple-600 bg-white p-4" data-testid="qr-code">
				<img
					src={qrImageUrl}
					alt="QR Code"
					class="h-auto w-full"
					class:opacity-50={remainingSeconds <= 0}
				/>
			</div>

			<!-- Machine Info -->
			<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
				<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
					<img
						src={data.machine.imageUrl}
						alt={data.machine.name}
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium text-gray-900">{data.machine.name}</p>
					<p class="truncate text-xs text-gray-600">{data.machine.location}</p>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
			<div class="flex gap-3">
				<Scan class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
				<div>
					<h3 class="mb-2 font-semibold text-blue-900">How to Use</h3>
					<ol class="space-y-1.5 text-sm text-blue-800">
						<li>1. Go to the machine at {data.machine.location}</li>
						<li>2. Tap "Scan QR" on the machine screen</li>
						<li>3. Show this QR code to the scanner</li>
						<li>4. Collect your prize!</li>
					</ol>
				</div>
			</div>
		</div>

		<!-- Status Messages -->
		{#if remainingSeconds <= 0}
			<div class="rounded-xl border border-red-200 bg-red-50 p-4">
				<div class="flex gap-3">
					<AlertCircle class="h-5 w-5 flex-shrink-0 text-red-600" />
					<div>
						<p class="font-semibold text-red-900">QR Code Expired</p>
						<p class="mt-1 text-sm text-red-700">
							This QR code has expired. Please create a new payment to play.
						</p>
					</div>
				</div>
			</div>
		{:else if isScanned}
			<div class="rounded-xl border border-green-200 bg-green-50 p-4">
				<div class="flex gap-3">
					<CheckCircle2 class="h-5 w-5 flex-shrink-0 text-green-600" />
					<div>
						<p class="font-semibold text-green-900">QR Code Scanned!</p>
						<p class="mt-1 text-sm text-green-700">Drawing your prize...</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Test Button (Development Only) -->
		<div class="rounded-xl border border-gray-300 bg-gray-100 p-4">
			<p class="mb-3 text-center text-xs text-gray-600">⚠️ Development Mode Only</p>
			<button
				type="button"
				onclick={simulateScan}
				disabled={isScanned || isDrawingPrize || remainingSeconds <= 0}
				class="w-full rounded-lg bg-gray-800 py-3 font-medium text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{#if isDrawingPrize}
					Drawing Prize...
				{:else if isScanned}
					Scanned
				{:else}
					🧪 Simulate QR Scan
				{/if}
			</button>
		</div>
	</div>
</div>
