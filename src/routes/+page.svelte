<script lang="ts">
	import { Dice5, Gift, Calendar, Package } from 'lucide-svelte';

	const mockTokens = [
		{ name: 'Demo Player', token: 'dev_player_token' },
		{ name: 'Test Player', token: 'dev_test_token' }
	];
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 p-6"
>
	<div class="w-full max-w-md">
		<!-- Logo/Header -->
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white">
				<Dice5 class="h-10 w-10 text-purple-600" />
			</div>
			<h1 class="mb-2 text-4xl font-bold text-white">Gachapon Player</h1>
			<p class="text-purple-100">Play, Win, Collect Amazing Prizes!</p>
		</div>

		<!-- Features -->
		<div class="mb-6 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
			<div class="space-y-4">
				<div class="flex items-start gap-3 text-white">
					<Gift class="mt-0.5 h-6 w-6 flex-shrink-0" />
					<div>
						<div class="font-semibold">Win Real Prizes</div>
						<div class="text-sm text-purple-100">Physical items, vouchers, and free plays</div>
					</div>
				</div>
				<div class="flex items-start gap-3 text-white">
					<Calendar class="mt-0.5 h-6 w-6 flex-shrink-0" />
					<div>
						<div class="font-semibold">Special Events</div>
						<div class="text-sm text-purple-100">Join promotions and bonus prize campaigns</div>
					</div>
				</div>
				<div class="flex items-start gap-3 text-white">
					<Package class="mt-0.5 h-6 w-6 flex-shrink-0" />
					<div>
						<div class="font-semibold">Manage Inventory</div>
						<div class="text-sm text-purple-100">Track and collect your won prizes easily</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Dev Testing Section -->
		<div class="rounded-2xl bg-white p-6 shadow-2xl">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">🧪 Development Testing</h2>
			<p class="mb-4 text-sm text-gray-600">
				In production, users enter through Unity WebView with a token. For testing, choose a mock
				user:
			</p>

			<div class="space-y-2">
				{#each mockTokens as mock (mock.token)}
					<a
						href="/dashboard?token={mock.token}"
						data-testid="launch-dashboard"
						class="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-center font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800"
					>
						Continue as {mock.name}
					</a>
				{/each}
			</div>

			<div class="mt-4 border-t border-gray-200 pt-4">
				<p class="text-center text-xs text-gray-500">
					💡 Unity URL format: <code class="rounded bg-gray-100 px-2 py-1"
						>/dashboard?token=JWT</code
					>
				</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-6 text-center text-sm text-purple-100">
			<p>Powered by SvelteKit + Cloudflare</p>
		</div>
	</div>
</div>
