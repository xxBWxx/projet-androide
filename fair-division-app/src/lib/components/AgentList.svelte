<script lang="ts">
	import {
		defaultAttributions,
		defaultUtilities,
		setAttribution,
		setAttributions,
		setUtilities,
		setUtility,
		type Color
	} from '$lib/agent';
	import Agent from '$lib/components/Agent.svelte';
	import { sharedAgents } from '$lib/shared.svelte';
	import { CircleDot } from '@lucide/svelte';
	import { Button } from './ui/button';

	let agents = $state(sharedAgents.agents);

	let addAgent = () => {
		let agent = {
			name: `Agent ${agents.length + 1}`,
			attributions: defaultAttributions,
			utilities: defaultUtilities
		};

		agents.push(agent);
	};

	let generateRandomAttribution = () => {
		agents.map((agent) => {
			let attributions = { ...defaultAttributions };
			for (let color of ['red', 'green', 'blue', 'yellow', 'purple']) {
				setAttribution(agent, color as Color, Math.floor(Math.random() * 10));
			}

			return { ...agent, attributions };
		});
	};

	let generateRandomUtility = () => {
		agents.map((agent) => {
			let utilities = { ...defaultUtilities };
			for (let color of ['red', 'green', 'blue', 'yellow', 'purple']) {
				setUtility(agent, color as Color, Math.floor(Math.random() * 6));
			}

			return { ...agent, utilities };
		});
	};

	type Props = {
		validate: () => void;
	};

	let { validate }: Props = $props();

	let updateAgent = (
		name: string,
		propType: 'attribution' | 'utility',
		newEntries: Record<Color, number>
	) => {
		agents.map((agent) => {
			if (agent.name === name) {
				if (propType === 'attribution') {
					setAttributions(agent, newEntries);
				} else {
					setUtilities(agent, newEntries);
				}
			}

			return agent;
		});
	};
</script>

<div class="p-10">
	<div class="text-bold text-center text-3xl">Agent List</div>

	<div class="mt-6 hidden grid-cols-2 gap-20 lg:grid">
		<div class="border-border border-b">Attributions</div>
		<div class="border-border border-b">Utilities</div>
	</div>
	<div class="flex flex-col items-center gap-4">
		{#each agents as agent}
			<Agent {...agent} {updateAgent} />
		{/each}
	</div>
</div>

<div class="mb-20 flex items-center justify-center gap-28">
	<Button onclick={addAgent}>
		<CircleDot />
		Add Agent
	</Button>

	<div class="flex items-center justify-center gap-3">
		<Button variant="secondary" onclick={generateRandomAttribution}>
			Generate random attributions
		</Button>

		<Button variant="secondary" onclick={generateRandomUtility}>
			Generate random utility values
		</Button>
	</div>
	</div>
</div>
