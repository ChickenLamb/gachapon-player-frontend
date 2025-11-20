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

		// Note: Server-side redirect handles authentication redirect
		// This client-side logic is only for cases where server doesn't redirect
		// (e.g., viewing auth test page without token parameter)
	});

	// Available mock tokens for testing
	const mockTokens = [
		{
			name: 'Alice Chen',
			token: 'mock_token_alice',
			userId: 'user_mock_alice',
			email: 'alice@example.com'
		},
		{
			name: 'Bob Wang',
			token: 'mock_token_bob',
			userId: 'user_mock_bob',
			email: 'bob@example.com'
		},
		{
			name: 'Charlie Liu',
			token: 'mock_token_charlie',
			userId: 'user_mock_charlie',
			email: 'charlie@example.com'
		}
	];
</script>

<div class="min-h-screen bg-gray-50">
	<NavigationHeader title="Mock Authentication" showBack={true} />

	<div class="mx-auto max-w-2xl space-y-6 p-6">
		<!-- Environment Info -->
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-lg font-semibold">Environment</h2>
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between">
					<dt class="text-gray-600">Unity WebView:</dt>
					<dd class="font-mono">{isUnityWebView() ? '✅ Yes' : '❌ No'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-gray-600">Current URL:</dt>
					<dd class="max-w-xs truncate font-mono text-xs">{$page.url.href}</dd>
				</div>
			</dl>
		</div>

		<!-- Token from URL -->
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-lg font-semibold">Token from URL</h2>
			{#if data.tokenFromUrl}
				<p class="rounded bg-green-50 p-3 font-mono text-sm text-green-600">
					?token={data.tokenFromUrl}
				</p>
			{:else}
				<p class="text-sm text-gray-500 italic">No token in URL</p>
			{/if}
		</div>

		<!-- Session State -->
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-lg font-semibold">Session State</h2>
			{#if data.session}
				<div class="space-y-3">
					<div class="rounded border border-green-200 bg-green-50 p-3">
						<p class="mb-2 text-sm font-semibold text-green-800">✅ Authenticated</p>
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
				<div class="rounded border border-yellow-200 bg-yellow-50 p-3">
					<p class="text-sm font-semibold text-yellow-800">⚠️ Not authenticated</p>
					<p class="mt-1 text-sm text-yellow-700">Add ?token=xxx to URL to authenticate</p>
				</div>
			{/if}
		</div>

		<!-- Test Links -->
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-lg font-semibold">Test Authentication</h2>
			<p class="mb-4 text-sm text-gray-600">
				Click a link below to test with different mock users:
			</p>
			<div class="space-y-2">
				{#each mockTokens as { name, token, userId, email } (userId)}
					<a
						href="/auth-test?token={token}"
						data-testid="mock-user-{userId}"
						class="block rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900">{name}</p>
								<p class="text-xs text-gray-500">{email}</p>
								<p class="font-mono text-xs text-gray-500">ID: {userId}</p>
							</div>
							<span class="font-mono text-xs text-purple-600">→</span>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Raw Data (Debug) -->
		<details class="rounded-lg bg-gray-100 p-4">
			<summary class="cursor-pointer text-sm font-semibold text-gray-700">
				🔍 Raw Data (Debug)
			</summary>
			<pre
				class="mt-4 overflow-auto rounded bg-gray-900 p-4 text-xs text-green-400">{JSON.stringify(
					{ user: data.user, session: data.session, tokenFromUrl: data.tokenFromUrl },
					null,
					2
				)}</pre>
		</details>
	</div>
</div>
