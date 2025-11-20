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

<header class="sticky top-0 z-50 bg-white border-b border-gray-200">
	<div class="flex items-center h-14 px-4">
		{#if showBack}
			<button
				type="button"
				onclick={handleBack}
				class="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
				aria-label="Go back"
			>
				<ChevronLeft class="w-6 h-6 text-gray-700" />
			</button>
		{/if}
		<h1 class="text-lg font-semibold text-gray-900 truncate">
			{title}
		</h1>
	</div>
</header>
