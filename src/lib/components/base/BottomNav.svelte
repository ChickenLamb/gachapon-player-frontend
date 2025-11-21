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
			href: '/history',
			label: 'History',
			icon: Package
		}
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white"
	data-testid="bottom-nav"
>
	<div class="flex items-center justify-around">
		{#each navItems as item (item.href)}
			{@const Icon = item.icon}
			{@const navLabel = item.label.toLowerCase()}
			<a
				href={item.href}
				data-testid="bottom-nav-{navLabel}"
				class="flex flex-1 flex-col items-center gap-1 py-3 transition-colors {isActive(item.href)
					? 'text-purple-600'
					: 'text-gray-600 hover:text-gray-900'}"
				class:active={isActive(item.href)}
			>
				<Icon class="h-6 w-6" />
				<span class="text-xs font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
