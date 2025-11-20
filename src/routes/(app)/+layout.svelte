<script lang="ts">
	import BottomNav from '$lib/components/base/BottomNav.svelte';

	let { children } = $props();
</script>

{@render children()}

<BottomNav />
