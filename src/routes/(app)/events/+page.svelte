<script lang="ts">
	import { Calendar, Gift, Percent, Trophy } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
	import type { MerchantEvent } from '$lib/types';

	let { data } = $props();

	function getEventIcon(type: MerchantEvent['type']) {
		switch (type) {
			case 'DISCOUNT':
				return Percent;
			case 'FREE_PLAY':
				return Gift;
			case 'BONUS_PRIZE':
				return Trophy;
			default:
				return Gift;
		}
	}

	function getEventColor(type: MerchantEvent['type']): string {
		switch (type) {
			case 'DISCOUNT':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'FREE_PLAY':
				return 'bg-purple-50 border-purple-200 text-purple-800';
			case 'BONUS_PRIZE':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			default:
				return 'bg-gray-50 border-gray-200 text-gray-800';
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-MY', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(date);
	}

	function isEventActive(event: MerchantEvent): boolean {
		const now = new Date();
		return event.startDate <= now && event.endDate >= now;
	}
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="Events & Promotions" showBack={true} />

	<div class="p-6 space-y-6">
		<!-- Active Events -->
		<div>
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Active Events</h2>
			<div class="space-y-4">
				{#each data.events.filter(isEventActive) as event (event.id)}
					{@const Icon = getEventIcon(event.type)}
					<a
						href="/events/{event.id}"
						class="block bg-white rounded-xl border-2 {getEventColor(
							event.type
						)} overflow-hidden hover:shadow-md transition-shadow"
					>
						<div class="p-4">
							<!-- Event Header -->
							<div class="flex items-start gap-3 mb-3">
								<div
									class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center {getEventColor(
										event.type
									)}"
								>
									<Icon class="w-6 h-6" />
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-gray-900 mb-1">
										{event.name}
									</h3>
									<p class="text-sm text-gray-600 line-clamp-2">
										{event.description}
									</p>
								</div>
							</div>

							<!-- Event Progress -->
							{#if event.progress !== undefined}
								<div class="mb-3">
									<div class="flex items-center justify-between text-sm mb-1">
										<span class="text-gray-600">Progress</span>
										<span class="font-medium text-gray-900">{event.progress}%</span>
									</div>
									<div class="h-2 bg-gray-200 rounded-full overflow-hidden">
										<div
											class="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
											style="width: {event.progress}%"
										></div>
									</div>
								</div>
							{/if}

							<!-- Event Dates -->
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Calendar class="w-4 h-4" />
								<span>
									{formatDate(event.startDate)} - {formatDate(event.endDate)}
								</span>
							</div>

							<!-- Join Mode Badge -->
							<div class="mt-3">
								{#if event.joinMode === 'AUTO'}
									<span class="inline-flex text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
										Auto-joined
									</span>
								{:else}
									<span class="inline-flex text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800">
										Manual join required
									</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Upcoming/Expired Events -->
		{#if data.events.filter((e) => !isEventActive(e)).length > 0}
			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Past Events</h2>
				<div class="space-y-4">
					{#each data.events.filter((e) => !isEventActive(e)) as event (event.id)}
						{@const Icon = getEventIcon(event.type)}
						<div class="bg-white rounded-xl border border-gray-200 p-4 opacity-60">
							<div class="flex items-start gap-3">
								<div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
									<Icon class="w-5 h-5 text-gray-400" />
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-gray-700 mb-1">
										{event.name}
									</h3>
									<p class="text-sm text-gray-500">
										Ended {formatDate(event.endDate)}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
