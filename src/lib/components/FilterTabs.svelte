<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab: string;
		onChange: (tabId: string) => void;
	}

	let { tabs, activeTab, onChange }: Props = $props();
</script>

<div class="filter-tabs" data-testid="filter-tabs">
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			class="filter-tab {activeTab === tab.id ? 'active' : ''}"
			onclick={() => onChange(tab.id)}
			data-testid="filter-tab-{tab.id}"
		>
			{tab.label}
		</button>
	{/each}
</div>

<style>
	.filter-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.filter-tab {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		background-color: rgb(243, 244, 246);
		color: rgb(75, 85, 99);
	}

	.filter-tab:hover {
		background-color: rgb(229, 231, 235);
		color: rgb(55, 65, 81);
	}

	.filter-tab.active {
		background-color: rgb(34, 197, 94);
		color: white;
		box-shadow:
			0 4px 6px -1px rgba(34, 197, 94, 0.3),
			0 2px 4px -1px rgba(34, 197, 94, 0.2);
	}
</style>
