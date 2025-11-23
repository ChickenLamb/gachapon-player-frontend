<script lang="ts">
	import { Ticket } from 'lucide-svelte';
	import DiscountBadge from '$lib/components/DiscountBadge.svelte';
	import type { MerchantEvent } from '$lib/types';

	interface Props {
		events: MerchantEvent[];
		subtitle?: string;
		onEventClick: (event: MerchantEvent) => void;
	}

	let { events, subtitle = 'Available at participating machines', onEventClick }: Props = $props();

	function getEventDiscountPercentage(event: MerchantEvent): number {
		if (event.type === 'DISCOUNT') {
			const match = event.description.match(/(\d+)%/);
			if (match) {
				return parseInt(match[1], 10);
			}
		}
		return 0;
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
								<p class="font-semibold">{event.name}</p>
								<p class="text-xs text-amber-100">{subtitle}</p>
							</div>
						</div>
						{#if getEventDiscountPercentage(event) > 0}
							<DiscountBadge percentage={getEventDiscountPercentage(event)} size="sm" />
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
{/if}
