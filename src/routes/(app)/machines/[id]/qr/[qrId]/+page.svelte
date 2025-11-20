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

	<div class="p-6 space-y-6">
		<!-- Timer -->
		<div
			class="bg-white rounded-xl border-2 p-4 text-center"
			class:border-green-500={remainingSeconds > 180}
			class:border-yellow-500={remainingSeconds <= 180 && remainingSeconds > 60}
			class:border-red-500={remainingSeconds <= 60}
		>
			<div class="flex items-center justify-center gap-2 mb-2">
				<Clock class="w-5 h-5 {remainingSeconds > 180 ? 'text-green-600' : remainingSeconds > 60 ? 'text-yellow-600' : 'text-red-600'}" />
				<span class="text-sm font-medium text-gray-600">Time Remaining</span>
			</div>
			<p
				class="text-4xl font-bold tabular-nums"
				class:text-green-600={remainingSeconds > 180}
				class:text-yellow-600={remainingSeconds <= 180 && remainingSeconds > 60}
				class:text-red-600={remainingSeconds <= 60}
			>
				{formatRemainingTime(remainingSeconds)}
			</p>
		</div>

		<!-- QR Code -->
		<div class="bg-white rounded-xl border border-gray-200 p-8">
			<div class="text-center mb-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-2">Ready to Play!</h2>
				<p class="text-sm text-gray-600">
					Scan this QR code at the machine to start
				</p>
			</div>

			<!-- QR Code Image -->
			<div class="bg-white rounded-xl border-4 border-purple-600 p-4 mb-6">
				<img
					src={qrImageUrl}
					alt="QR Code"
					class="w-full h-auto"
					class:opacity-50={remainingSeconds <= 0}
				/>
			</div>

			<!-- Machine Info -->
			<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
				<div class="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
					<img
						src={data.machine.imageUrl}
						alt={data.machine.name}
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="flex-1 min-w-0">
					<p class="font-medium text-gray-900 truncate">{data.machine.name}</p>
					<p class="text-xs text-gray-600 truncate">{data.machine.location}</p>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
			<div class="flex gap-3">
				<Scan class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
				<div>
					<h3 class="font-semibold text-blue-900 mb-2">How to Use</h3>
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
			<div class="bg-red-50 border border-red-200 rounded-xl p-4">
				<div class="flex gap-3">
					<AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0" />
					<div>
						<p class="font-semibold text-red-900">QR Code Expired</p>
						<p class="text-sm text-red-700 mt-1">
							This QR code has expired. Please create a new payment to play.
						</p>
					</div>
				</div>
			</div>
		{:else if isScanned}
			<div class="bg-green-50 border border-green-200 rounded-xl p-4">
				<div class="flex gap-3">
					<CheckCircle2 class="w-5 h-5 text-green-600 flex-shrink-0" />
					<div>
						<p class="font-semibold text-green-900">QR Code Scanned!</p>
						<p class="text-sm text-green-700 mt-1">
							Drawing your prize...
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Test Button (Development Only) -->
		<div class="bg-gray-100 border border-gray-300 rounded-xl p-4">
			<p class="text-xs text-gray-600 mb-3 text-center">
				⚠️ Development Mode Only
			</p>
			<button
				type="button"
				onclick={simulateScan}
				disabled={isScanned || isDrawingPrize || remainingSeconds <= 0}
				class="w-full bg-gray-800 text-white font-medium py-3 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
