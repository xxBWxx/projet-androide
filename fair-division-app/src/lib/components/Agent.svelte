<script lang="ts">
	import { defaultAttributions, defaultUtilities, type Color } from '$lib/agent';
	import { CircleDot } from '@lucide/svelte';
	import AgentInput from './AgentInput.svelte';
	import ColoredBall from './ColoredBall.svelte';

	type Props = {
		name: string;
		attributions?: Record<Color, number>;
		utilities?: Record<Color, number>;
		updateAgent: (
			name: string,
			propType: 'attribution' | 'utility',
			newEntries: Record<Color, number>
		) => void;
	};

	let {
		name,
		attributions = { ...defaultAttributions },
		utilities = { ...defaultUtilities },
		updateAgent
	}: Props = $props();
</script>

<div class="px-10 py-4 lg:px-20">
	<div class="mb-8 flex items-center gap-1 font-medium lg:mb-4">
		<CircleDot size="15" />
		{name}
	</div>

	<div class="flex flex-col items-center justify-center gap-x-28 gap-y-12 lg:flex-row">
		<div class="flex items-center justify-between gap-x-8">
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
			{#each Object.keys(utilities) as _color}
				<!-- type assertion	 -->
				{@const color = _color as Color}

				<div class="mr-3.5 flex items-center">
					<ColoredBall {color} />
					<span class="mr-2 text-sm">=</span>
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
