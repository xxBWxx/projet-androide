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
	import {
		fromFrontendAgents,
		chooseSequence,
		allocate,
		analyzeUtilities,
		calculateEnvy
	} from '$lib/logic/allocation/picking_sequence';
	import { liptonAllocate } from '$lib/logic/allocation/lipton';
	console.log('fromFrontendAgents:', fromFrontendAgents);
	import Agent from '$lib/components/Agent.svelte';
	import { sharedAgents } from '$lib/shared.svelte';
	import { CircleDot, RefreshCcw, Trash } from '@lucide/svelte';
	import { Button } from './ui/button';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	let sequenceStyle = $state<'repeated' | 'mirror' | 'random' | 'lipton'>('repeated');
	let results = $state<{
		allocation: any;
		utilityStats: any;
		envyValue: number;
		envyMatrix: any;
		sequence?: number[];
	} | null>(null);

	function runSimulation() {
		console.log('✅ Run Simulation clicked');
		const preferences = fromFrontendAgents(agents);
		const nAgents = agents.length;
		const nObjects = Object.keys(agents[0].utilities).length;
		console.log('Allocation Algorithm Style:', sequenceStyle);

		let allocation: any;
		let sequence: number[] | undefined = undefined; // Initialize sequence as undefined

		if (sequenceStyle === 'lipton') {
			// Run Lipton's allocation algorithm
			console.log("Running Lipton's algorithm...");
			// Assuming liptonAllocate takes preferences as input
			allocation = liptonAllocate(preferences);
		} else {
			// Run picking sequence allocation based on chosen sequence style
			sequence = chooseSequence(sequenceStyle, nAgents, nObjects);
			console.log('🔄 Picking Sequence:', sequence.join(' → '));
			console.log('🎯 Preferences:', preferences);
			allocation = allocate(preferences, sequence);
		}

		console.log('📦 Allocation:', allocation);

		// ✅ SET ATTRIBUTIONS BASED ON ALLOCATION
		for (const agent of agents) {
			const name = agent.name;
			// Assuming agent names are like "Agent1", "Agent2", etc.
			// Adjust this logic if your agent naming is different
			const agentNumberMatch = name.match(/\d+/);
			const key = agentNumberMatch ? `Agent ${agentNumberMatch[0]}` : name; // Use 'Agent X' or the original name
			const allocatedColors = allocation[key] ?? [];

			setAttributions(
				agent,
				Object.fromEntries(
					Object.keys(agent.attributions).map((color) => [
						color,
						allocatedColors.includes(color) ? 1 : 0
					])
				) as Record<Color, number>
			);
		}

		const utilityStats = analyzeUtilities(allocation, preferences);
		console.log('📊 Utility Stats:', utilityStats);
		const { envyValue, envyMatrix } = calculateEnvy(allocation, preferences);
		console.log('😠 Envy:', envyValue, envyMatrix);

		results = {
			sequence, // sequence will be undefined for Lipton
			allocation,
			utilityStats,
			envyValue,
			envyMatrix
		};
		console.log('DEBUG: results variable was just set to:', results);
		console.log('DEBUG: Type of results after setting:', typeof results);
		console.log('DEBUG: Is results truthy after setting for #if?', !!results);
	}

	let agents = $state(sharedAgents.agents);
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
		<div class="text-bold text-center text-3xl">Agent List</div>

		<div class="mt-6 hidden grid-cols-2 gap-20 lg:grid">
			<div class="border-border border-b">Attributions</div>
			<div class="border-border border-b">Utilities</div>
		</div>
		<div class="flex flex-col items-center gap-4">
			{#each agents as agent}
				<Agent {...agent} {deleteAgent} {resetAgent} {updateAgent} {cannotDelete} />
			{/each}
		</div>
	</div>

	<div class="flex flex-col items-center justify-center gap-x-28 gap-y-4 lg:flex-row">
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
		<!-- 🔁 Replace the existing "Run Simulation" button block with this -->
		<div class="mt-4 flex flex-col items-center gap-2">
			<!-- 👇 Picking sequence style buttons -->
			<div class="flex gap-4">
				<Button
					variant={sequenceStyle == 'repeated' ? 'default' : 'outline'}
					onclick={() => {
						sequenceStyle = 'repeated';
						console.log(
							'variant:',
							sequenceStyle == 'repeated' ? 'default' : 'outline'
						);
					}}
				>
					Repeated
				</Button>
				<Button
					variant={sequenceStyle == 'mirror' ? 'default' : 'outline'}
					onclick={() => {
						sequenceStyle = 'mirror';
						console.log('variant:', sequenceStyle == 'mirror' ? 'default' : 'outline');
					}}
				>
					Mirror
				</Button>
				<Button
					variant={sequenceStyle === 'random' ? 'default' : 'outline'}
					onclick={() => {
						sequenceStyle = 'random';
						console.log('variant ', sequenceStyle === 'random' ? 'default' : 'outline');
					}}
				>
					Random
				</Button>

				<Button
					variant={sequenceStyle === 'lipton' ? 'default' : 'outline'}
					onclick={() => (sequenceStyle = 'lipton')}
				>
					Lipton
				</Button>
			</div>

			<!-- 👇 Run button -->
			<Button variant="default" onclick={runSimulation}>Run Simulation</Button>
		</div>
	</div>
</div>
{#if results}
	<div class="bg-muted mx-auto mt-10 w-full max-w-4xl rounded-md border p-4">
		<h3 class="mt-6 text-xl font-semibold">📊 Utility Stats</h3>
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

		<h3 class="mt-6 text-xl font-semibold">🔥 Maximum Envy</h3>
		<pre class="bg-background overflow-auto rounded p-2">{results.envyValue}</pre>

		<h3 class="mt-6 text-xl font-semibold">🔄 Picking Sequence</h3>
		<pre class="bg-background overflow-auto rounded p-2">{results.sequence?.join(', ')}</pre>
	</div>
{/if}
