<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		title: string;
		viewAllHref?: string;
		badge?: {
			text: string;
			color?: string;
		};
	}

	let { title, viewAllHref, badge }: Props = $props();
</script>

<div class="section-header">
	<div class="title-row">
		<h2 class="section-title">{title}</h2>
		{#if badge}
			<span class="badge" style:background-color={badge.color || '#7c3aed'}>
				{badge.text}
			</span>
		{/if}
	</div>

	{#if viewAllHref}
		<a href={viewAllHref} class="view-all" data-testid="view-all-link" data-sveltekit-preload-data>
			<span class="view-all-text">view all</span>
			<ChevronRight class="h-4 w-4" />
		</a>
	{/if}
</div>

<style>
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding: 0 0.25rem;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgb(17, 24, 39);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
	}

	.view-all {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: rgb(124, 58, 237);
		text-decoration: none;
		transition: color 0.2s;
	}

	.view-all:hover {
		color: rgb(109, 40, 217);
	}

	.view-all-text {
		text-transform: lowercase;
	}
</style>
