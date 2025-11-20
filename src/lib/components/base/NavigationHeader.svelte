<script lang="ts">
	import { ChevronLeft } from 'lucide-svelte';

	interface Props {
		title: string;
		showBack?: boolean;
		onBack?: () => void;
	}

	let { title, showBack = false, onBack }: Props = $props();

	function handleBack() {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	}
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white">
	<div class="flex h-14 items-center px-4">
		{#if showBack}
			<button
				type="button"
				data-testid="back-button"
				onclick={handleBack}
				class="mr-2 -ml-2 rounded-full p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
				aria-label="Go back"
			>
				<ChevronLeft class="h-6 w-6 text-gray-700" />
			</button>
		{/if}
		<h1 class="truncate text-lg font-semibold text-gray-900" data-testid="page-title">
			{title}
		</h1>
	</div>
</header>
