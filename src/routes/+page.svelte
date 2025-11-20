<script lang="ts">
	import { Dice5, Gift, Calendar, Package } from 'lucide-svelte';

	const mockTokens = [
		{ name: 'Demo Player', token: 'dev_player_token' },
		{ name: 'Test Player', token: 'dev_test_token' }
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-6">
	<div class="max-w-md w-full">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
				<Dice5 class="w-10 h-10 text-purple-600" />
			</div>
			<h1 class="text-4xl font-bold text-white mb-2">Gachapon Player</h1>
			<p class="text-purple-100">Play, Win, Collect Amazing Prizes!</p>
		</div>

		<!-- Features -->
		<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
			<div class="space-y-4">
				<div class="flex items-start gap-3 text-white">
					<Gift class="w-6 h-6 flex-shrink-0 mt-0.5" />
					<div>
						<div class="font-semibold">Win Real Prizes</div>
						<div class="text-sm text-purple-100">Physical items, vouchers, and free plays</div>
					</div>
				</div>
				<div class="flex items-start gap-3 text-white">
					<Calendar class="w-6 h-6 flex-shrink-0 mt-0.5" />
					<div>
						<div class="font-semibold">Special Events</div>
						<div class="text-sm text-purple-100">Join promotions and bonus prize campaigns</div>
					</div>
				</div>
				<div class="flex items-start gap-3 text-white">
					<Package class="w-6 h-6 flex-shrink-0 mt-0.5" />
					<div>
						<div class="font-semibold">Manage Inventory</div>
						<div class="text-sm text-purple-100">Track and collect your won prizes easily</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Dev Testing Section -->
		<div class="bg-white rounded-2xl p-6 shadow-2xl">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">🧪 Development Testing</h2>
			<p class="text-sm text-gray-600 mb-4">
				In production, users enter through Unity WebView with a token. For testing, choose a mock
				user:
			</p>

			<div class="space-y-2">
				{#each mockTokens as mock (mock.token)}
					<a
						href="/dashboard?token={mock.token}"
						class="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg text-center"
					>
						Continue as {mock.name}
					</a>
				{/each}
			</div>

			<div class="mt-4 pt-4 border-t border-gray-200">
				<p class="text-xs text-gray-500 text-center">
					💡 Unity URL format: <code class="bg-gray-100 px-2 py-1 rounded">/dashboard?token=JWT</code>
				</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center mt-6 text-purple-100 text-sm">
			<p>Powered by SvelteKit + Cloudflare</p>
		</div>
	</div>
</div>
