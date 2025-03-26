<script lang="ts">
	import { type Color } from '$lib/agent';
	import { CircleDot } from '@lucide/svelte';
	import AgentInput from './AgentInput.svelte';
	import ColoredBall from './ColoredBall.svelte';

	let defaultUtilities = {
		red: 0,
		green: 0,
		blue: 0,
		yellow: 0,
		purple: 0
	};

	let defaultAttributions = {
		red: 0,
		green: 0,
		blue: 0,
		yellow: 0,
		purple: 0
	};

	type Props = {
		name: string;
		attributions?: Record<Color, number>;
		utilities?: Record<Color, number>;
	};

	let {
		name,
		attributions = defaultAttributions,
		utilities = defaultUtilities
	}: Props = $props();
</script>

<div class="px-10 py-4 lg:px-20">
	<div class="mb-4 flex items-center gap-1 font-medium">
		<CircleDot size="15" />
		{name}
	</div>

	<div class="flex flex-col items-center justify-center gap-14 lg:flex-row">
		<div class="flex items-center justify-between">
			{#each Object.keys(attributions) as _color}
				<!-- type assertion	 -->
				{@const color = _color as Color}

				<div class="mr-3.5 flex items-center">
					<AgentInput value={attributions[color]} type="attribution" />

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
					<AgentInput value={utilities[color]} type="utility" />
				</div>
			{/each}
		</div>
	</div>
</div>
