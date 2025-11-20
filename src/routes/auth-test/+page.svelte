<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import { isUnityWebView, notifyUnityReady } from '$lib/utils/unity-webview';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(() => {
		// Notify Unity that page is ready (if in Unity WebView)
		if (isUnityWebView()) {
			notifyUnityReady();
		}

		// Auto-redirect after authentication if redirect parameter exists
		if (data.session && data.redirectAfterAuth) {
			// Small delay to show authentication success
			setTimeout(() => {
				goto(data.redirectAfterAuth);
			}, 500);
		}
	});

	// Available mock tokens for testing
	const mockTokens = [
		{ name: 'Demo Player', token: 'dev_player_token', userId: 'player_456' },
		{ name: 'Test Player', token: 'dev_test_token', userId: 'player_789' }
	];
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title="Auth Flow Test" showBack={true} />

	<div class="p-6 max-w-2xl mx-auto space-y-6">
		<!-- Environment Info -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold mb-4">Environment</h2>
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between">
					<dt class="text-gray-600">Unity WebView:</dt>
					<dd class="font-mono">{isUnityWebView() ? '✅ Yes' : '❌ No'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-gray-600">Current URL:</dt>
					<dd class="font-mono text-xs truncate max-w-xs">{$page.url.href}</dd>
				</div>
			</dl>
		</div>

		<!-- Token from URL -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold mb-4">Token from URL</h2>
			{#if data.tokenFromUrl}
				<p class="text-sm text-green-600 font-mono bg-green-50 p-3 rounded">
					?token={data.tokenFromUrl}
				</p>
			{:else}
				<p class="text-sm text-gray-500 italic">No token in URL</p>
			{/if}
		</div>

		<!-- Session State -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold mb-4">Session State</h2>
			{#if data.session}
				<div class="space-y-3">
					<div class="bg-green-50 border border-green-200 rounded p-3">
						<p class="text-sm font-semibold text-green-800 mb-2">✅ Authenticated</p>
						<dl class="space-y-2 text-sm">
							<div>
								<dt class="text-gray-600">User ID:</dt>
								<dd class="font-mono text-green-700">{data.session.user.id}</dd>
							</div>
							<div>
								<dt class="text-gray-600">Username:</dt>
								<dd class="font-mono text-green-700">{data.session.user.username}</dd>
							</div>
							<div>
								<dt class="text-gray-600">Roles:</dt>
								<dd class="font-mono text-green-700">
									{data.session.user.roles.join(', ')}
								</dd>
							</div>
							{#if data.session.user.organizationId}
								<div>
									<dt class="text-gray-600">Organization:</dt>
									<dd class="font-mono text-green-700">
										{data.session.user.organizationId}
									</dd>
								</div>
							{/if}
							<div>
								<dt class="text-gray-600">Expires:</dt>
								<dd class="font-mono text-green-700">
									{new Date(data.session.expiresAt).toLocaleString()}
								</dd>
							</div>
						</dl>
					</div>
				</div>
			{:else}
				<div class="bg-yellow-50 border border-yellow-200 rounded p-3">
					<p class="text-sm font-semibold text-yellow-800">⚠️ Not authenticated</p>
					<p class="text-sm text-yellow-700 mt-1">
						Add ?token=xxx to URL to authenticate
					</p>
				</div>
			{/if}
		</div>

		<!-- Test Links -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold mb-4">Test Authentication</h2>
			<p class="text-sm text-gray-600 mb-4">
				Click a link below to test with different mock users:
			</p>
			<div class="space-y-2">
				{#each mockTokens as { name, token, userId }}
					<a
						href="/auth-test?token={token}"
						class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900">{name}</p>
								<p class="text-xs text-gray-500 font-mono">ID: {userId}</p>
							</div>
							<span class="text-xs text-purple-600 font-mono">→</span>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Raw Data (Debug) -->
		<details class="bg-gray-100 rounded-lg p-4">
			<summary class="cursor-pointer text-sm font-semibold text-gray-700">
				🔍 Raw Data (Debug)
			</summary>
			<pre
				class="mt-4 text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded">{JSON.stringify(
					{ user: data.user, session: data.session, tokenFromUrl: data.tokenFromUrl },
					null,
					2
				)}</pre>
		</details>
	</div>
</div>
