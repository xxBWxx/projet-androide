<script lang="ts">
	import { defaultAttributions, defaultUtilities, type Color } from '$lib/agent';
	import { CircleDot, RefreshCcw, Trash } from '@lucide/svelte';
	import AgentInput from './AgentInput.svelte';
	import ColoredBall from './ColoredBall.svelte';
	import { Badge } from './ui/badge';
	import { Button } from './ui/button';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		name: string;
		attributions?: Record<Color, number>;
		cannotDelete?: boolean;
		utilities?: Record<Color, number>;
		deleteAgent: (name: string) => void;
		resetAgent: (name: string) => void;
		updateAgent: (
			name: string,
			propType: 'attribution' | 'utility',
			newEntries: Record<Color, number>
		) => void;
	};

	let {
		name,
		attributions = { ...defaultAttributions },
		cannotDelete,
		utilities = { ...defaultUtilities },
		deleteAgent,
		resetAgent,
		updateAgent
	}: Props = $props();
</script>

<div class="px-10 py-4 xl:px-20">
	<div class="mb-8 inline-flex items-center justify-between gap-4 xl:mb-4">
		<div class="flex items-center gap-1 font-medium">
			<CircleDot size="15" />
			{name}
		</div>

		<div>
			<Button
				variant="outline"
				title="Reset agent values"
				class="h-4 w-4 p-4"
				onclick={() => resetAgent(name)}
			>
				<RefreshCcw />
			</Button>
			<Button
				variant="destructive"
				title="Delete agent"
				class="h-4 w-4 p-4"
				onclick={() => deleteAgent(name)}
				disabled={cannotDelete}
			>
				<Trash />
			</Button>
		</div>
	</div>

	<div class="flex flex-col items-center justify-center gap-y-12 xl:flex-row xl:gap-x-28">
		<div class="flex items-center justify-between xl:gap-8">
			<Badge variant="secondary" class="mr-10 xl:hidden">Attributions</Badge>

			{#each Object.keys(attributions) as _color}
				<!-- type assertion	 -->
				{@const color = _color as Color}

				<div class="flex items-center">
					<AgentInput
						value={attributions[color]}
						type="attribution"
						onchange={(e) => {
							const updatedAttributions: Record<Color, number> = {
								...attributions,
								[color]: Number(e.currentTarget.value)
							};
							updateAgent(name, 'attribution', updatedAttributions);
						}}
					/>

					<ColoredBall {color} />
				</div>
			{/each}
		</div>

		<div class="flex items-center justify-between">
			<Badge variant="secondary" class="mr-10 xl:hidden">Utilities</Badge>

			{#each Object.keys(utilities) as _color}
				<!-- type assertion	 -->
				{@const color = _color as Color}

				<div class="flex items-center">
					<ColoredBall {color} />
					<span class="pr-2 text-sm">=</span>
					<AgentInput
						value={utilities[color]}
						type="utility"
						onchange={(e) => {
							const updatedUtilities: Record<Color, number> = {
								...utilities,
								[color]: Number(e.currentTarget.value)
							};
							updateAgent(name, 'utility', updatedUtilities);
						}}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>
