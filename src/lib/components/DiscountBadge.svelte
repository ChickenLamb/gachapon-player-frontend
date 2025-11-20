<script lang="ts">
	interface Props {
		percentage: number;
		color?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { percentage, color = '#7c3aed', size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'text-xs py-1 px-2',
		md: 'text-sm py-1.5 px-3',
		lg: 'text-base py-2 px-4'
	};
</script>

<div
	class="discount-badge {sizeClasses[size]}"
	style:background-color={color}
	data-testid="discount-badge"
>
	<span class="percentage">{percentage}%</span>
	<span class="off">OFF</span>
</div>

<style>
	.discount-badge {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		font-weight: 700;
		color: white;
		line-height: 1;
		gap: 0.125rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.percentage {
		font-size: 1.25em;
	}

	.off {
		font-size: 0.75em;
		opacity: 0.9;
	}
</style>
