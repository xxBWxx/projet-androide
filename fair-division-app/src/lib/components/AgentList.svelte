<script lang="ts">
	import Agent from '$lib/components/Agent.svelte';
	import { Check, CircleDot } from '@lucide/svelte';
	import type { IAgent } from '$lib/agent';
	import { Button } from './ui/button';

	let addAgent = () => {
		agents = [...agents, { name: `Agent ${agents.length + 1}` }];
	};

	let generateRandomAttribution = () => {
		agents = agents.map((agent) => {
			let attributions = {};
			for (let color of ['red', 'green', 'blue', 'yellow', 'purple']) {
				attributions[color] = Math.floor(Math.random() * 10);
			}
			return { ...agent, attributions };
		});
	};

	let generateRandomUtility = () => {
		agents = agents.map((agent) => {
			let utilities = {};
			for (let color of ['red', 'green', 'blue', 'yellow', 'purple']) {
				utilities[color] = Math.floor(Math.random() * 6);
			}
			return { ...agent, utilities };
		});
	};

	type Props = {
		agents?: IAgent[];
	};

	let defaultAgents = [{ name: 'Agent 1' }, { name: 'Agent 2' }];

	let { agents = defaultAgents }: Props = $props();
</script>

<div class="p-10">
	<div class="text-bold text-center text-3xl">Agent List</div>

	<div class="mt-6 hidden grid-cols-2 gap-20 lg:grid">
		<div class="border-border border-b">Attributions</div>
		<div class="border-border border-b">Utilities</div>
	</div>
	<div class="flex flex-col items-center gap-4">
		{#each agents as agent, i}
			<Agent {...agent} />
		{/each}
	</div>
</div>

<div class="flex items-center justify-center gap-28">
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

	<div>
		<Button>
			Validate
			<Check />
		</Button>
	</div>
</div>
