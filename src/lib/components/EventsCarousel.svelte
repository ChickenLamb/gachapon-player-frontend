<script lang="ts">
	import { Ticket } from 'lucide-svelte';
	import type { MerchantEvent } from '$lib/types';

	interface Props {
		events: MerchantEvent[];
		subtitle?: string;
		onEventClick: (event: MerchantEvent) => void;
	}

	let { events, subtitle = 'Available at participating machines', onEventClick }: Props = $props();

	function getEventRewardDisplay(event: MerchantEvent): string {
		if (event.rewardType === 'EXTRA_SPIN') {
			return `+${event.rewardValue} bonus draw${parseInt(event.rewardValue) > 1 ? 's' : ''}`;
		} else if (event.rewardType === 'VOUCHER') {
			return 'Voucher reward';
		}
		return event.description;
	}
</script>

{#if events.length > 0}
	<div class="relative -mx-4 overflow-x-auto px-4">
		<div class="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
			{#each events as event (event.id)}
				<button
					type="button"
					onclick={() => onEventClick(event)}
					class="w-[calc(100vw-3rem)] flex-shrink-0 snap-center overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-left text-white shadow-lg transition-transform hover:scale-[1.02]"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Ticket class="h-6 w-6" />
							<div>
								<p class="font-semibold">{event.title}</p>
								<p class="text-xs text-amber-100">{subtitle}</p>
							</div>
						</div>
						<span class="rounded-full bg-white/20 px-2 py-1 text-xs font-medium">
							{getEventRewardDisplay(event)}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>
{/if}
