<script lang="ts">
	import { ChevronLeft } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		showBack?: boolean;
		onBack?: () => void;
		actions?: Snippet;
	}

	let { title, showBack = false, onBack, actions }: Props = $props();

	function handleBack() {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	}
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
	<div class="flex h-14 items-center justify-between px-4">
		<div class="flex items-center">
			{#if showBack}
				<button
					type="button"
					data-testid="back-button"
					onclick={handleBack}
					class="mr-2 -ml-2 rounded-full p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
					aria-label="Go back"
				>
					<ChevronLeft class="h-6 w-6 text-accent-green" />
				</button>
			{/if}
			<h1 class="truncate text-lg font-bold text-navy" data-testid="page-title">
				{title}
			</h1>
		</div>
		{#if actions}
			<div class="flex items-center">
				{@render actions()}
			</div>
		{/if}
	</div>
</header>
