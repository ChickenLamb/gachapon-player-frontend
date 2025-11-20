<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props<T = unknown> {
		items: T[];
		itemWidth?: string;
		gap?: string;
		showScrollbar?: boolean;
		children: Snippet<[item: T, index: number]>;
	}

	let {
		items,
		itemWidth = '280px',
		gap = '16px',
		showScrollbar = false,
		children
	}: Props = $props();
</script>

<div
	class="horizontal-scroll {showScrollbar ? 'show-scrollbar' : ''}"
	style:--item-width={itemWidth}
	style:--gap={gap}
>
	{#each items as item, index ((item as { id?: string }).id || index)}
		<div class="scroll-item">
			{@render children(item, index)}
		</div>
	{/each}
</div>

<style>
	.horizontal-scroll {
		display: flex;
		gap: var(--gap);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding-bottom: 0.5rem;
	}

	.horizontal-scroll::-webkit-scrollbar {
		display: none;
	}

	.horizontal-scroll.show-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
	}

	.horizontal-scroll.show-scrollbar::-webkit-scrollbar {
		display: block;
		height: 6px;
	}

	.horizontal-scroll.show-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.horizontal-scroll.show-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(124, 58, 237, 0.3);
		border-radius: 3px;
	}

	.scroll-item {
		flex: 0 0 var(--item-width);
		scroll-snap-align: start;
	}

	/* Mobile: Full width items with small peek */
	@media (max-width: 640px) {
		.scroll-item {
			flex: 0 0 calc(100vw - 3rem);
		}
	}
</style>
