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
			<div class="mb-4 rounded-xl border-4 border-purple-600 bg-white p-4" data-testid="qr-code">
				<img
					src={qrImageUrl}
					alt="QR Code"
					class="h-auto w-full"
					class:opacity-50={remainingSeconds <= 0}
				/>
			</div>

			<!-- QR Code ID -->
			<div class="mb-6 text-center">
				<p class="font-mono text-sm text-gray-600">{data.qrCode.code}</p>
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

		<!-- HOW TO SCAN Section -->
		<div class="rounded-xl border border-gray-200 bg-gray-50 p-6">
			<h3 class="mb-4 text-center text-sm font-semibold tracking-wide text-gray-700 uppercase">
				How to Scan?
			</h3>

			<!-- Visual Instruction -->
			<div class="mb-4 flex justify-center">
				<div class="relative">
					<!-- Illustration placeholder - simplified representation -->
					<div
						class="relative h-48 w-64 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-orange-100 to-amber-100 p-4"
					>
						<!-- Machine representation -->
						<div
							class="absolute right-4 bottom-4 h-32 w-24 rounded-lg bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg"
						>
							<!-- Scan area indicator -->
							<div
								class="absolute top-8 left-1/2 h-8 w-16 -translate-x-1/2 rounded bg-red-500 opacity-70"
							>
								<span class="flex h-full items-center justify-center text-xs font-bold text-white">
									SCAN
								</span>
							</div>
						</div>

						<!-- Phone/Hand representation -->
						<div class="absolute bottom-8 left-4 h-28 w-20 rounded-lg bg-gray-800 shadow-xl">
							<!-- Screen with QR -->
							<div class="absolute inset-2 rounded bg-white">
								<div class="flex h-full items-center justify-center">
									<div class="h-12 w-12 bg-black opacity-20">
										<!-- QR code representation -->
										<svg viewBox="0 0 100 100" class="h-full w-full">
											<rect x="0" y="0" width="100" height="100" fill="black" opacity="0.2" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						<!-- Arrow indicator -->
						<div class="absolute bottom-20 left-24">
							<svg
								class="h-8 w-8 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>

			<!-- Instruction Text -->
			<p class="text-center text-sm leading-relaxed text-gray-700">
				Hold your QR code near the <span class="font-semibold">Gachapon machine's scan area</span> to
				connect and gain extra reward.
			</p>
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
