<script lang="ts">
	interface Props {
		current: number;
		total: number;
		label: string;
		badgeText?: string;
		color?: 'orange' | 'purple' | 'green';
	}

	let { current, total, label, badgeText, color = 'orange' }: Props = $props();

	const percentage = $derived((current / total) * 100);

	const colorClasses = {
		orange: 'bg-orange-500',
		purple: 'bg-purple-600',
		green: 'bg-green-500'
	};

	const badgeColorClasses = {
		orange: 'bg-orange-600 text-white',
		purple: 'bg-purple-700 text-white',
		green: 'bg-green-600 text-white'
	};
</script>

<div class="progress-container" data-testid="progress-bar">
	<div class="progress-header">
		<div class="label-wrapper">
			<span class="label">{label}</span>
			{#if badgeText}
				<span class="badge {badgeColorClasses[color]}">{badgeText}</span>
			{/if}
		</div>
		<span class="counter" data-testid="progress-counter">{current}/{total}</span>
	</div>

	<div class="progress-track">
		<div class="progress-fill {colorClasses[color]}" style:width="{percentage}%"></div>
	</div>
</div>

<style>
	.progress-container {
		width: 100%;
	}

	.progress-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.label-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(17, 24, 39);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.counter {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(75, 85, 99);
	}

	.progress-track {
		width: 100%;
		height: 0.75rem;
		background-color: rgb(229, 231, 235);
		border-radius: 9999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.3s ease-in-out;
		border-radius: 9999px;
	}
</style>
