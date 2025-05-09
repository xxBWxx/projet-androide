<script lang="ts">
	import { setAttributions, type Color, type IAgent } from '$lib/agent';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { liptonAllocate } from '$lib/lipton';
	import {
		allocate,
		analyzeUtilities,
		calculateEnvy,
		chooseSequence,
		fromFrontendAgents,
		type Allocation,
		type EnvyMatrix,
		type UtilityStats
	} from '$lib/picking_sequence';
	import { cn } from '$lib/utils';
	import { CirclePlay } from '@lucide/svelte';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Button } from './ui/button';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		agents: IAgent[];
	};

	let { agents, class: className }: Props = $props();

	type SequenceStyle = 'repeated' | 'mirror' | 'random' | 'lipton';
	let sequenceStyle = $state<SequenceStyle>('repeated');

	type SimulationResults = {
		allocation: Allocation;
		utilityStats: UtilityStats;
		envyValue: number;
		envyMatrix: EnvyMatrix;
		sequence?: number[];
	};
	let results = $state<SimulationResults | null>(null);

	function runSimulation() {
		const preferences = fromFrontendAgents(agents);
		const nAgents = agents.length;
		const nObjects = Object.keys(agents[0].utilities).length;

		let allocation: Allocation;
		let sequence: number[] | undefined = undefined;

		if (sequenceStyle === 'lipton') {
			allocation = liptonAllocate(preferences);
		} else {
			sequence = chooseSequence(sequenceStyle, nAgents, nObjects);
			allocation = allocate(preferences, sequence);
		}

		for (const agent of agents) {
			const name = agent.name;
			const agentNumberMatch = name.match(/\d+/);
			const key = agentNumberMatch ? `Agent ${agentNumberMatch[0]}` : name;
			const allocatedColors = allocation[key] ?? [];

			// Compter le nombre d'occurrences de chaque couleur dans l'allocation
			const colorCounts = allocatedColors.reduce(
				(counts, color) => {
					counts[color as Color] = (counts[color as Color] || 0) + 1;
					return counts;
				},
				{} as Record<Color, number>
			);

			// Mettre à jour les attributions de l'agent avec les quantités réelles
			setAttributions(
				agent,
				Object.fromEntries(
					Object.keys(agent.attributions).map((color) => [
						color,
						colorCounts[color as Color] || 0 // Utiliser la quantité réelle ou 0 si non attribué
					])
				) as Record<Color, number>
			);
		}

		const utilityStats = analyzeUtilities(allocation, preferences);
		const { envyValue, envyMatrix } = calculateEnvy(allocation, preferences);

		results = {
			sequence, // sequence will be undefined for Lipton
			allocation,
			utilityStats,
			envyValue,
			envyMatrix
		};
	}
</script>

<div class={cn('flex flex-col items-center justify-center gap-4', className)}>
	<Tabs.Root bind:value={sequenceStyle} class="flex gap-4">
		<Tabs.List>
			<Tabs.Trigger value="repeated">Repeated</Tabs.Trigger>
			<Tabs.Trigger value="mirror">Mirror</Tabs.Trigger>
			<Tabs.Trigger value="random">Random</Tabs.Trigger>
			<Tabs.Trigger value="lipton">Lipton</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<div class="flex w-full items-center justify-center gap-4">
		<Button onclick={runSimulation}>
			Run Simulation
			<CirclePlay />
		</Button>

		<Button href="/algos" variant="link">More about algorithms</Button>
	</div>
</div>

{#if results}
	<div class="bg-muted mx-auto mb-10 w-full max-w-4xl rounded-md border p-4">
		<h3 class="mt-6 text-xl font-semibold">Utility Stats</h3>
		<ul class="list-disc pl-6">
			{#each Object.entries(results.utilityStats.total_utilities_per_agent) as [agent, util]}
				<li><strong>{agent}</strong>: {util}</li>
			{/each}
		</ul>
		<p>Total utility: <strong>{results.utilityStats.total_utility}</strong></p>
		<p>
			Top performer: <strong>{results.utilityStats.max_agent[0]}</strong> ({results
				.utilityStats.max_agent[1]})
		</p>
		<p>
			Lowest performer: <strong>{results.utilityStats.min_agent[0]}</strong> ({results
				.utilityStats.min_agent[1]})
		</p>

		<h3 class="mt-6 text-xl font-semibold">Maximum Envy</h3>
		<pre class="bg-background overflow-auto rounded p-2">{results.envyValue}</pre>

		<h3 class="mt-6 text-xl font-semibold">Picking Sequence</h3>
		<pre class="bg-background overflow-auto rounded p-2">{results.sequence?.join(', ')}</pre>
	</div>
{/if}
