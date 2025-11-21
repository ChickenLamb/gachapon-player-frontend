<script lang="ts">
	import { browser } from '$app/environment';
	import { CheckCircle, AlertTriangle, ScrollText } from 'lucide-svelte';
	import BottomNav from '$lib/components/base/BottomNav.svelte';
	import { createMachineStore, setMachineContext } from '$lib/stores/machine.svelte';

	let { children } = $props();

	// Initialize machine store for WebSocket state
	const machineStore = createMachineStore();
	setMachineContext(machineStore);

	// Terms & Conditions acceptance state
	// Increment this version in .env when T&C content changes - forces re-acceptance
	const TC_VERSION = import.meta.env.VITE_TC_VERSION || '1.0';
	const TC_STORAGE_KEY = 'gachapon_tc_version';
	let tcAccepted = $state(false);
	let showTcModal = $state(false);

	// Auto-connect to WebSocket and check T&C on mount
	$effect(() => {
		if (browser) {
			// Simulate WebSocket connection on app start (clears dismissed events)
			machineStore.autoConnect();

			// Check T&C acceptance
			const acceptedVersion = localStorage.getItem(TC_STORAGE_KEY);
			if (acceptedVersion === TC_VERSION) {
				tcAccepted = true;
			} else {
				showTcModal = true;
			}
		}
	});

	function acceptTerms() {
		if (browser) {
			localStorage.setItem(TC_STORAGE_KEY, TC_VERSION);
		}
		tcAccepted = true;
		showTcModal = false;
	}
</script>

{#if tcAccepted}
	{@render children()}

	<!-- Footer with T&C Link -->
	<footer class="bg-gray-100 px-4 pt-3 pb-24 text-center">
		<button
			type="button"
			onclick={() => (showTcModal = true)}
			class="text-sm text-gray-500 underline hover:text-purple-600"
		>
			Terms & Conditions (v{TC_VERSION})
		</button>
		<p class="mt-2 text-xs text-gray-400">© 2024 Gachapon. All rights reserved.</p>
	</footer>

	<BottomNav />
{/if}

<!-- Terms & Conditions Modal -->
{#if showTcModal}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
		<div class="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
			<!-- Header Image -->
			<div
				class="relative bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-center text-white"
			>
				<div
					class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
				>
					<ScrollText class="h-8 w-8" />
				</div>
				<h1 class="text-xl font-bold">Welcome to Gachapon!</h1>
				<p class="mt-1 text-sm text-purple-200">Please read and accept our terms (v{TC_VERSION})</p>
			</div>

			<!-- Content -->
			<div class="max-h-[50vh] overflow-y-auto p-6">
				<div class="space-y-4">
					<!-- How It Works -->
					<div>
						<h3 class="mb-2 font-semibold text-gray-900">How It Works</h3>
						<ol class="space-y-2 text-sm text-gray-600">
							<li class="flex gap-2">
								<span
									class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600"
									>1</span
								>
								<span>Show your QR code to the machine</span>
							</li>
							<li class="flex gap-2">
								<span
									class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600"
									>2</span
								>
								<span>Complete payment on your phone</span>
							</li>
							<li class="flex gap-2">
								<span
									class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600"
									>3</span
								>
								<span>Turn the handle and collect your prize!</span>
							</li>
						</ol>
					</div>

					<!-- Important Terms -->
					<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
						<div class="mb-2 flex items-center gap-2">
							<AlertTriangle class="h-5 w-5 text-amber-600" />
							<h3 class="font-semibold text-amber-800">Important Terms</h3>
						</div>
						<ul class="space-y-2 text-sm text-amber-700">
							<li class="flex items-start gap-2">
								<CheckCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
								<span>All items are <strong>dispensed immediately</strong> after payment</span>
							</li>
							<li class="flex items-start gap-2">
								<CheckCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
								<span><strong>No refunds</strong> unless machine malfunction occurs</span>
							</li>
							<li class="flex items-start gap-2">
								<CheckCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
								<span>Contact support if you experience any issues with the machine</span>
							</li>
						</ul>
					</div>

					<!-- Additional Info -->
					<div class="text-xs text-gray-500">
						<p>
							By accepting, you agree to our Terms of Service and Privacy Policy. You must be 18
							years or older to use this service.
						</p>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-200 p-4">
				<button
					type="button"
					onclick={acceptTerms}
					class="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
				>
					I Accept & Continue
				</button>
			</div>
		</div>
	</div>
{/if}
