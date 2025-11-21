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

<div class="min-h-screen bg-gray-100 pb-20 font-display">
	<NavigationHeader title="Events & Promotions" showBack={true} />

	<div class="space-y-4 p-4">
		<!-- Active Events -->
		<div data-testid="events-section">
			<h3 class="mb-3 flex items-center gap-2 font-bold text-navy">
				<span class="h-5 w-1 rounded-full bg-accent-green"></span>
				Active Events
			</h3>
			<div class="space-y-4">
				{#each data.events.filter(isEventActive) as event (event.id)}
					{@const Icon = getEventIcon(event.type)}
					<a
						href="/events/{event.id}"
						data-testid="event-card-{event.id}"
						data-event-id={event.id}
						class="block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="p-4">
							<!-- Event Header -->
							<div class="mb-3 flex items-start gap-3">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green/10"
								>
									<Icon class="h-6 w-6 text-accent-green" />
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="mb-1 font-bold text-navy" data-testid="event-name">
										{event.name}
									</h3>
									<p class="line-clamp-2 text-sm text-gray-500" data-testid="event-description">
										{event.description}
									</p>
									<span class="hidden" data-testid="event-type">{event.type}</span>
								</div>
							</div>

							<!-- Event Progress -->
							{#if event.progress !== undefined}
								<div class="mb-3">
									<div class="mb-1 flex items-center justify-between text-sm">
										<span class="text-gray-500">Progress</span>
										<span class="font-medium text-navy" data-testid="event-progress"
											>{event.progress}%</span
										>
									</div>
									<div class="h-2 overflow-hidden rounded-full bg-gray-200">
										<div
											class="h-full bg-gradient-to-r from-accent-green to-accent-green/80 transition-all"
											style="width: {event.progress}%"
										></div>
									</div>
								</div>
							{/if}

							<!-- Event Dates -->
							<div class="flex items-center gap-2 text-sm text-gray-500">
								<Calendar class="h-4 w-4" />
								<span>
									{formatDate(event.startDate)} - {formatDate(event.endDate)}
								</span>
							</div>

							<!-- Join Mode Badge -->
							<div class="mt-3">
								{#if event.joinMode === 'AUTO'}
									<span
										class="inline-flex rounded-full bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green"
									>
										Auto-joined
									</span>
								{:else}
									<span
										class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
									>
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
				<h3 class="mb-3 flex items-center gap-2 font-bold text-navy">
					<span class="h-5 w-1 rounded-full bg-gray-300"></span>
					Past Events
				</h3>
				<div class="space-y-3">
					{#each data.events.filter((e) => !isEventActive(e)) as event (event.id)}
						{@const Icon = getEventIcon(event.type)}
						<div class="rounded-2xl bg-white p-4 opacity-60 shadow-sm">
							<div class="flex items-start gap-3">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100"
								>
									<Icon class="h-5 w-5 text-gray-400" />
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="mb-1 font-bold text-gray-500">
										{event.name}
									</h3>
									<p class="text-sm text-gray-400">
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
