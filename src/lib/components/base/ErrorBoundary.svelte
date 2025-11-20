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
	<div class="flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center">
		<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
			<AlertCircle class="h-8 w-8 text-red-600" />
		</div>
		<h2 class="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h2>
		<p class="mb-6 max-w-md text-gray-600">
			{error}
		</p>
		{#if retry}
			<button
				type="button"
				onclick={retry}
				class="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:bg-purple-800"
			>
				Try again
			</button>
		{/if}
	</div>
{:else}
	{@render children()}
{/if}
