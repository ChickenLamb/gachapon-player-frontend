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
		// Support page should highlight History nav item
		if (href === '/history' && $page.url.pathname === '/support') {
			return true;
		}
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
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				data-testid="bottom-nav-{navLabel}"
				class="flex flex-1 flex-col items-center gap-1 py-3 transition-all"
				class:active
			>
				<Icon class="h-6 w-6 {active ? 'text-navy' : 'text-gray-500'}" />
				<span class="text-md font-bold {active ? 'nav-gradient' : 'text-gray-500'}">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.nav-gradient {
		background: linear-gradient(135deg, var(--color-navy-light) 0%, var(--color-navy) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
