<script lang="ts">
	import {
		defaultAttributions,
		defaultUtilities,
		setAttribution,
		setAttributions,
		setUtilities,
		setUtility,
		type Color,
		type IAgent
	} from '$lib/agent';
	import Agent from '$lib/components/Agent.svelte';
	import { sharedAgents } from '$lib/shared.svelte';
	import { CircleDot, RefreshCcw, Trash } from '@lucide/svelte';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Button } from './ui/button';

	let agents: IAgent[] = $state(sharedAgents.agents);
	let cannotDelete = $state(true);

	let addAgent = () => {
		let agent = {
			name: `Agent${++sharedAgents.count}`,
			attributions: defaultAttributions,
			utilities: defaultUtilities
		};

		agents.push(agent);

		if (agents.length > 2) {
			cannotDelete = false;
		}
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

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { class: className }: Props = $props();

	let deleteAgent = (name: string) => {
		if (agents.length <= 2) {
			return;
		}

		agents.splice(
			agents.findIndex((agent) => agent.name === name),
			1
		);

		if (agents.length <= 2) {
			cannotDelete = true;
		}
	};

	let deleteAllAgents = () => {
		if (agents.length <= 2) {
			return;
		}

		agents.splice(2, agents.length);

		if (agents.length <= 2) {
			cannotDelete = true;
		}
	};

	let resetAgent = (name: string) => {
		updateAgent(name, 'attribution', defaultAttributions);
		updateAgent(name, 'utility', defaultUtilities);
	};

	let resetAllAgents = () => {
		agents.map((agent) => {
			resetAgent(agent.name);
		});
	};

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

<div class={className}>
	<div class="p-10">
		<div class="text-center text-3xl font-semibold">Agent List</div>

		<div class="mt-6 hidden grid-cols-2 gap-20 xl:grid">
			<div class="border-border border-b">Attributions</div>
			<div class="border-border border-b">Utilities</div>
		</div>
		<div class="flex flex-col items-center gap-4">
			{#each agents as agent}
				<Agent {...agent} {deleteAgent} {resetAgent} {updateAgent} {cannotDelete} />
			{/each}
		</div>
	</div>

	<div class="flex flex-col items-center justify-center gap-x-28 gap-y-4 xl:flex-row">
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

		<div class="flex items-center justify-center gap-3">
			<Button variant="outline" title="Reset all agents" onclick={() => resetAllAgents()}>
				<RefreshCcw />
				Reset all agents
			</Button>
			<Button
				variant="destructive"
				title="Delete all agents"
				onclick={() => deleteAllAgents()}
				disabled={cannotDelete}
			>
				<Trash />
				Delete all agents
			</Button>
		</div>
	</div>
</div>
