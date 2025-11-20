<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		color?: 'primary' | 'white' | 'gray';
	}

	let { size = 'md', color = 'primary' }: Props = $props();

	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-3',
		lg: 'w-12 h-12 border-4'
	};

	const colorClasses = {
		primary: 'border-purple-600 border-t-transparent',
		white: 'border-white border-t-transparent',
		gray: 'border-gray-400 border-t-transparent'
	};
</script>

<div
	class="animate-spin rounded-full {sizeClasses[size]} {colorClasses[color]}"
	data-testid="loading-spinner"
	role="status"
	aria-label="Loading"
>
	<span class="sr-only">Loading...</span>
</div>
