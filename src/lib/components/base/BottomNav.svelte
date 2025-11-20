<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Dice5, Calendar, Package } from 'lucide-svelte';

	const navItems = [
		{
			href: '/dashboard',
			label: 'Home',
			icon: Home
		},
		{
			href: '/machines',
			label: 'Machines',
			icon: Dice5
		},
		{
			href: '/events',
			label: 'Events',
			icon: Calendar
		},
		{
			href: '/inventory',
			label: 'Inventory',
			icon: Package
		}
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
	<div class="flex items-center justify-around">
		{#each navItems as item}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex-1 flex flex-col items-center gap-1 py-3 transition-colors {isActive(item.href)
					? 'text-purple-600'
					: 'text-gray-600 hover:text-gray-900'}"
			>
				<Icon class="w-6 h-6" />
				<span class="text-xs font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
