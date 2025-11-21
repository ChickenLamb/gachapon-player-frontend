<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		show: boolean;
		onClose: () => void;
		children: Snippet;
		position?: 'top' | 'bottom';
	}

	let { show = $bindable(), onClose, children, position = 'top' }: Props = $props();
</script>

{#if show}
	<div
		class="fixed right-0 left-0 z-[60] px-4 {position === 'top' ? 'top-16' : 'bottom-24'}"
		transition:fly={{ y: position === 'top' ? -20 : 20, duration: 300 }}
	>
		<div
			class="relative mx-auto max-w-md overflow-hidden rounded-xl shadow-lg"
			transition:fade={{ duration: 200 }}
		>
			<button
				type="button"
				onclick={onClose}
				class="absolute top-3 right-3 z-10 rounded-full bg-black/20 p-1.5 text-white transition-colors hover:bg-black/30"
				aria-label="Close notification"
			>
				<X class="h-4 w-4" />
			</button>
			{@render children()}
		</div>
	</div>
{/if}
