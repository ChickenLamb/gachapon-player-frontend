<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { Clock, CheckCircle2, AlertCircle, Play, Loader2 } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { getQRCodeRemainingTime, formatRemainingTime } from '$lib/mocks/services/qr';
	import { drawPrize } from '$lib/mocks/services/play';

	let { data } = $props();

	let remainingSeconds = $state(getQRCodeRemainingTime(data.qrCode));
	let isWaitingForSpin = $state(false);
	let isDrawingPrize = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Countdown timer for spin window
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

	// Simulate machine spin (mock - in real app, WS receives spin event from machine)
	async function simulateMachineSpin() {
		if (isWaitingForSpin || isDrawingPrize) return;

		isWaitingForSpin = true;

		// Simulate machine processing
		await new Promise((resolve) => setTimeout(resolve, 1500));

		isDrawingPrize = true;

		// Draw prize (in real app, this comes from machine via WS)
		const prize = await drawPrize(data.machine.id);

		// Navigate to prize result
		goto(`/machines/${data.machine.id}/result/${prize.id}`);
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800">
	<NavigationHeader title="Ready to Spin!" showBack={false} />

	<div class="space-y-6 p-6">
		<!-- Success Header -->
		<div class="text-center text-white">
			<div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
				<CheckCircle2 class="h-12 w-12" />
			</div>
			<h1 class="mb-2 text-2xl font-bold">Payment Successful!</h1>
			<p class="text-purple-200">Machine is ready for your spin</p>
		</div>

		<!-- Machine Info Card -->
		<div class="rounded-xl bg-white p-6 shadow-lg">
			<div class="mb-4 flex items-center gap-4">
				<div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
					<img
						src={data.machine.imageUrl}
						alt={data.machine.name}
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-lg font-bold text-gray-900">{data.machine.name}</h2>
					<p class="truncate text-sm text-gray-600">{data.machine.location}</p>
				</div>
			</div>

			<!-- Spin Window Timer -->
			<div
				class="rounded-lg p-4 text-center"
				class:bg-green-50={remainingSeconds > 180}
				class:bg-yellow-50={remainingSeconds <= 180 && remainingSeconds > 60}
				class:bg-red-50={remainingSeconds <= 60}
			>
				<div class="mb-1 flex items-center justify-center gap-2">
					<Clock
						class="h-4 w-4 {remainingSeconds > 180
							? 'text-green-600'
							: remainingSeconds > 60
								? 'text-yellow-600'
								: 'text-red-600'}"
					/>
					<span class="text-xs font-medium text-gray-600">Spin within</span>
				</div>
				<p
					class="text-3xl font-bold tabular-nums"
					data-testid="qr-countdown"
					class:text-green-600={remainingSeconds > 180}
					class:text-yellow-600={remainingSeconds <= 180 && remainingSeconds > 60}
					class:text-red-600={remainingSeconds <= 60}
				>
					{formatRemainingTime(remainingSeconds)}
				</p>
			</div>
		</div>

		<!-- Instructions -->
		<div class="rounded-xl bg-white/10 p-6 text-white backdrop-blur-sm">
			<h3 class="mb-4 text-center text-lg font-semibold">How to Spin</h3>

			<div class="space-y-4">
				<div class="flex items-start gap-4">
					<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
						1
					</div>
					<div>
						<p class="font-medium">Go to the machine</p>
						<p class="text-sm text-purple-200">{data.machine.location}</p>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
						2
					</div>
					<div>
						<p class="font-medium">Turn the handle</p>
						<p class="text-sm text-purple-200">Machine is unlocked and ready</p>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
						3
					</div>
					<div>
						<p class="font-medium">Collect your prize!</p>
						<p class="text-sm text-purple-200">Prize dispensed automatically</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Animated Spin Indicator -->
		{#if !isWaitingForSpin && !isDrawingPrize && remainingSeconds > 0}
			<div class="text-center">
				<div class="mx-auto mb-3 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-white/20">
					<Play class="h-12 w-12 text-white" />
				</div>
				<p class="text-lg font-medium text-white">Waiting for spin...</p>
				<p class="text-sm text-purple-200">Turn the machine handle to play</p>
			</div>
		{/if}

		<!-- Status Messages -->
		{#if remainingSeconds <= 0}
			<div class="rounded-xl border border-red-300 bg-red-50 p-4">
				<div class="flex gap-3">
					<AlertCircle class="h-5 w-5 flex-shrink-0 text-red-600" />
					<div>
						<p class="font-semibold text-red-900">Spin Window Expired</p>
						<p class="mt-1 text-sm text-red-700">
							Time ran out. Please make a new payment to play.
						</p>
					</div>
				</div>
			</div>
		{:else if isWaitingForSpin || isDrawingPrize}
			<div class="rounded-xl bg-white p-6 text-center">
				<Loader2 class="mx-auto mb-3 h-10 w-10 animate-spin text-purple-600" />
				<p class="font-semibold text-gray-900">
					{isDrawingPrize ? 'Dispensing prize...' : 'Processing spin...'}
				</p>
				<p class="mt-1 text-sm text-gray-600">Please wait</p>
			</div>
		{/if}

		<!-- Dev Mode: Simulate Spin -->
		<div class="rounded-xl border border-white/20 bg-white/10 p-4">
			<p class="mb-3 text-center text-xs text-purple-200">⚠️ Development Mode</p>
			<button
				type="button"
				onclick={simulateMachineSpin}
				disabled={isWaitingForSpin || isDrawingPrize || remainingSeconds <= 0}
				class="w-full rounded-lg bg-white py-3 font-medium text-purple-600 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
			>
				{#if isDrawingPrize}
					Dispensing Prize...
				{:else if isWaitingForSpin}
					Processing...
				{:else}
					🧪 Simulate Machine Spin
				{/if}
			</button>
		</div>
	</div>
</div>
