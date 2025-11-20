<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';

	interface Props {
		error?: string;
		retry?: () => void;
		children: import('svelte').Snippet;
	}

	let { error, retry, children }: Props = $props();
</script>

{#if error}
	<div class="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
		<div
			class="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100"
		>
			<AlertCircle class="w-8 h-8 text-red-600" />
		</div>
		<h2 class="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h2>
		<p class="mb-6 text-gray-600 max-w-md">
			{error}
		</p>
		{#if retry}
			<button
				type="button"
				onclick={retry}
				class="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors"
			>
				Try again
			</button>
		{/if}
	</div>
{:else}
	{@render children()}
{/if}
