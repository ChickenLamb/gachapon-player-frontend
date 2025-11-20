<script lang="ts">
	import { List, Grid3x3 } from 'lucide-svelte';

	interface Props {
		currentView: 'list' | 'grid';
		onToggle: (view: 'list' | 'grid') => void;
	}

	let { currentView, onToggle }: Props = $props();
</script>

<div class="view-toggle" data-testid="view-toggle">
	<button
		type="button"
		class="toggle-button {currentView === 'list' ? 'active' : ''}"
		onclick={() => onToggle('list')}
		aria-label="List view"
		data-testid="view-toggle-list"
	>
		<List class="h-5 w-5" />
	</button>
	<button
		type="button"
		class="toggle-button {currentView === 'grid' ? 'active' : ''}"
		onclick={() => onToggle('grid')}
		aria-label="Grid view"
		data-testid="view-toggle-grid"
	>
		<Grid3x3 class="h-5 w-5" />
	</button>
</div>

<style>
	.view-toggle {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: rgb(243, 244, 246);
	}

	.toggle-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.375rem;
		background-color: transparent;
		border: none;
		color: rgb(107, 114, 128);
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-button:hover {
		background-color: rgb(229, 231, 235);
		color: rgb(55, 65, 81);
	}

	.toggle-button.active {
		background-color: white;
		color: rgb(124, 58, 237);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
	}
</style>
