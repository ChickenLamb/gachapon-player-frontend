<script lang="ts">
	import { Calendar, Gift, Percent, Trophy, CheckCircle, Clock, Target } from 'lucide-svelte';
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

	let EventIcon = $derived(getEventIcon(data.event.type));
	let active = $derived(isEventActive(data.event));
</script>

<div class="min-h-screen bg-gray-100 pb-20 font-display">
	<NavigationHeader title={data.event.name} showBack={true} />

	<div class="space-y-4 p-4" data-testid="event-detail">
		<!-- Event Header Card -->
		<div class="overflow-hidden rounded-2xl bg-white shadow-sm">
			<div class="p-4">
				<!-- Icon and Title -->
				<div class="mb-4 flex items-start gap-4">
					<div
						class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green/10"
					>
						<EventIcon class="h-7 w-7 text-accent-green" />
					</div>
					<div class="min-w-0 flex-1">
						<h1 class="mb-2 text-xl font-bold text-navy" data-testid="event-title">
							{data.event.name}
						</h1>
						<div class="flex items-center gap-2 text-sm">
							{#if active}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-0.5 font-medium text-accent-green"
								>
									<CheckCircle class="h-3 w-3" />
									Active
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-500"
								>
									<Clock class="h-3 w-3" />
									Ended
								</span>
							{/if}
							{#if data.event.joinMode === 'AUTO'}
								<span
									class="inline-flex rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy"
								>
									Auto-joined
								</span>
							{:else}
								<span
									class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
								>
									Manual join
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Event Dates -->
				<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
					<Calendar class="h-4 w-4" />
					<span>
						{formatDate(data.event.startDate)} - {formatDate(data.event.endDate)}
					</span>
				</div>

				<!-- Event Progress -->
				{#if data.event.progress !== undefined}
					<div class="mb-4">
						<div class="mb-2 flex items-center justify-between text-sm">
							<span class="font-medium text-gray-500">Your Progress</span>
							<span class="font-bold text-navy">{data.event.progress}%</span>
						</div>
						<div class="h-3 overflow-hidden rounded-full bg-gray-200">
							<div
								class="h-full bg-gradient-to-r from-accent-green to-accent-green/80 transition-all"
								style="width: {data.event.progress}%"
							></div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Description Section -->
		<div class="rounded-2xl bg-white p-4 shadow-sm">
			<h3 class="mb-3 font-bold text-navy">Event Details</h3>
			<p class="leading-relaxed text-gray-600" data-testid="event-description">
				{data.event.description}
			</p>
		</div>

		<!-- Requirements Section (if applicable) -->
		{#if data.event.requirements}
			<div class="rounded-2xl bg-white p-4 shadow-sm" data-testid="event-requirements">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-navy">
					<Target class="h-5 w-5 text-accent-green" />
					Requirements
				</h3>
				<ul class="space-y-2">
					{#each data.event.requirements as requirement, i (requirement)}
						<li class="flex items-start gap-2 text-gray-600" data-testid="requirement-{i}">
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-green" />
							<span>{requirement}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Rewards Section (if applicable) -->
		{#if data.event.rewards}
			<div class="rounded-2xl bg-white p-4 shadow-sm" data-testid="event-rewards">
				<h3 class="mb-3 flex items-center gap-2 font-bold text-navy">
					<Gift class="h-5 w-5 text-accent-gold" />
					Rewards
				</h3>
				<ul class="space-y-2">
					{#each data.event.rewards as reward (reward)}
						<li class="flex items-start gap-2 text-gray-600">
							<Trophy class="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-gold" />
							<span>{reward}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Action Button (for manual join events) -->
		{#if data.event.joinMode === 'MANUAL' && active}
			<div class="rounded-2xl bg-white p-4 shadow-sm">
				<button
					class="w-full rounded-full bg-navy py-4 font-semibold text-white shadow-lg transition-colors hover:bg-navy-light active:bg-navy-dark"
				>
					Join Event
				</button>
				<p class="mt-3 text-center text-sm text-gray-500">
					You can leave the event anytime before it ends
				</p>
			</div>
		{/if}
	</div>
</div>
