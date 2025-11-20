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

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title={data.event.name} showBack={true} />

	<div class="p-6 space-y-6">
		<!-- Event Header Card -->
		<div class="bg-white rounded-xl border-2 {getEventColor(data.event.type)} overflow-hidden">
			<div class="p-6">
				<!-- Icon and Title -->
				<div class="flex items-start gap-4 mb-4">
					<div
						class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center {getEventColor(
							data.event.type
						)}"
					>
						<EventIcon class="w-8 h-8" />
					</div>
					<div class="flex-1 min-w-0">
						<h1 class="text-2xl font-bold text-gray-900 mb-2">
							{data.event.name}
						</h1>
						<div class="flex items-center gap-2 text-sm">
							{#if active}
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
									<CheckCircle class="w-3 h-3" />
									Active
								</span>
							{:else}
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
									<Clock class="w-3 h-3" />
									Ended
								</span>
							{/if}
							{#if data.event.joinMode === 'AUTO'}
								<span class="inline-flex text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
									Auto-joined
								</span>
							{:else}
								<span class="inline-flex text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 font-medium">
									Manual join
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Event Dates -->
				<div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
					<Calendar class="w-4 h-4" />
					<span>
						{formatDate(data.event.startDate)} - {formatDate(data.event.endDate)}
					</span>
				</div>

				<!-- Event Progress -->
				{#if data.event.progress !== undefined}
					<div class="mb-4">
						<div class="flex items-center justify-between text-sm mb-2">
							<span class="text-gray-600 font-medium">Your Progress</span>
							<span class="font-bold text-gray-900">{data.event.progress}%</span>
						</div>
						<div class="h-3 bg-gray-200 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
								style="width: {data.event.progress}%"
							></div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Description Section -->
		<div class="bg-white rounded-xl p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-900">Event Details</h2>
			<p class="text-gray-600 leading-relaxed">
				{data.event.description}
			</p>
		</div>

		<!-- Requirements Section (if applicable) -->
		{#if data.event.requirements}
			<div class="bg-white rounded-xl p-6 space-y-4">
				<h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
					<Target class="w-5 h-5 text-purple-600" />
					Requirements
				</h2>
				<ul class="space-y-2">
					{#each data.event.requirements as requirement (requirement)}
						<li class="flex items-start gap-2 text-gray-600">
							<CheckCircle class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
							<span>{requirement}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Rewards Section (if applicable) -->
		{#if data.event.rewards}
			<div class="bg-white rounded-xl p-6 space-y-4">
				<h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
					<Gift class="w-5 h-5 text-purple-600" />
					Rewards
				</h2>
				<ul class="space-y-2">
					{#each data.event.rewards as reward (reward)}
						<li class="flex items-start gap-2 text-gray-600">
							<Trophy class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
							<span>{reward}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Action Button (for manual join events) -->
		{#if data.event.joinMode === 'MANUAL' && active}
			<div class="bg-white rounded-xl p-6">
				<button
					class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
				>
					Join Event
				</button>
				<p class="text-sm text-gray-500 text-center mt-3">
					You can leave the event anytime before it ends
				</p>
			</div>
		{/if}
	</div>
</div>
