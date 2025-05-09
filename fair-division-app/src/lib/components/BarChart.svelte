<script lang="ts">
	import type { Color, IAgent } from '$lib/agent';
	import { sharedAgents } from '$lib/shared.svelte';
	import type { WithElementRef } from 'bits-ui';
	import Chart from 'chart.js/auto';
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Select from './ui/select';
	import cytoscape from 'cytoscape';
	import { Button } from './ui/button';

	let agents = $state(sharedAgents.agents);
	let evaluatorAgent = $derived({ ...agents[0] });
	let envyMode = $state('Full');

	let isEvaluator = (agent: IAgent) => agent.name === evaluatorAgent.name;

	// Calculate the values of the lots
	let data = $derived(
		agents.map((agent) => {
			// Value of the complete lot
			const totalValue = Object.keys(agent.attributions).reduce(
				(sum, color) =>
					sum +
					agent.attributions[color as Color] * evaluatorAgent.utilities[color as Color],
				0
			);

			// Max value of an element of the lot (for Envy-One-Free)
			const maxUtility = Object.keys(agent.attributions)
				.filter((color) => agent.attributions[color as Color] > 0)
				.map((color) => evaluatorAgent.utilities[color as Color])
				.reduce((max, utility) => Math.max(max, utility), 0);

			// Min value of an element of the lot (for EFX)
			const minUtility = Object.keys(agent.attributions)
				.filter((color) => agent.attributions[color as Color] > 0)
				.map((color) => evaluatorAgent.utilities[color as Color])
				.reduce((min, utility) => Math.min(min, utility), Infinity);

			// Adjusted value based on the envy mode
			const adjustedValue =
				envyMode === 'OneFree' && !isEvaluator(agent)
					? totalValue - maxUtility
					: envyMode === 'EFX' && !isEvaluator(agent)
						? totalValue - minUtility
						: totalValue;

			return {
				agent: agent,
				value: adjustedValue
			};
		})
	);

	// Identify the agents envied by the evaluator agent
	let enviedAgents = $derived(
		data
			.filter(
				({ agent, value }) =>
					!isEvaluator(agent) &&
					value > (data.find(({ agent }) => isEvaluator(agent))?.value ?? 0)
			)
			.map(({ agent }) => agent)
	);

	let chartCanvas: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	function updateChart() {
		// Generate colors depending on conditions
		const backgroundColors = data.map((d) => {
			let color = '#8884d8'; // Default color

			// If the evaluator agent envies another agent
			if (enviedAgents.includes(d.agent)) {
				color = '#4CAF50'; // Green for envied agents
			}

			// If the evaluator agent is envious of someone
			if (enviedAgents.length > 0 && isEvaluator(d.agent)) {
				color = '#FF5733'; // Red for the envious evaluator agent
			}

			// The agent is either green or red depending on enviedAgents
			if (isEvaluator(d.agent)) {
				color = enviedAgents.length > 0 ? '#FF5733' : '#4CAF50'; // Red or Green
			}

			return color;
		});

		if (chartInstance) {
			chartInstance.data.labels = data.map((d) => d.agent.name);
			chartInstance.data.datasets[0].data = data.map((d) => d.value);
			chartInstance.data.datasets[0].backgroundColor = backgroundColors;
			chartInstance.update();
		} else {
			chartInstance = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: data.map((d) => d.agent.name),
					datasets: [
						{
							label: 'Values',
							data: data.map((d) => d.value),
							backgroundColor: backgroundColors
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: { display: false }
					}
				}
			});
		}
	}

	$effect(() => {
		if (!agents.map((agent) => agent.name).includes(evaluatorAgent.name)) {
			evaluatorAgent = { ...agents[0] };
		}

		updateChart();
	});

	let updateEvaluatorAgent = (name: string) => {
		evaluatorAgent = { ...agents.find((agent) => agent.name === name) } as IAgent;
	};

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { class: className }: Props = $props();

	// Fonction pour calculer les agents enviés pour un évaluateur donné
	function getEnviedAgents(evaluator: IAgent) {
		const evaluatorValue = Object.keys(evaluator.attributions).reduce(
			(sum, color) =>
				sum + evaluator.attributions[color as Color] * evaluator.utilities[color as Color],
			0
		);

		return agents.filter((evaluated) => {
			if (evaluator.name === evaluated.name) return false;

			const totalValue = Object.keys(evaluated.attributions).reduce(
				(sum, color) =>
					sum +
					evaluated.attributions[color as Color] * evaluator.utilities[color as Color],
				0
			);

			const maxUtility = Object.keys(evaluated.attributions)
				.filter((color) => evaluated.attributions[color as Color] > 0)
				.map((color) => evaluator.utilities[color as Color])
				.reduce((max, utility) => Math.max(max, utility), 0);

			const minUtility = Object.keys(evaluated.attributions)
				.filter((color) => evaluated.attributions[color as Color] > 0)
				.map((color) => evaluator.utilities[color as Color])
				.reduce((min, utility) => Math.min(min, utility), Infinity);

			const adjustedValue =
				envyMode === 'OneFree'
					? totalValue - maxUtility
					: envyMode === 'EFX'
						? totalValue - minUtility
						: totalValue;

			return adjustedValue > evaluatorValue;
		});
	}

	// Calculer les agents enviés pour chaque évaluateur
	let allEnviedAgents = $derived(
		agents.map((evaluator) => ({
			evaluator: evaluator.name,
			enviedAgents: getEnviedAgents(evaluator).map((agent) => agent.name)
		}))
	);

	// Cytoscape instance
	let cy: cytoscape.Core;

	// Fonction pour initialiser le graphe Cytoscape
	function initializeGraph() {
		// Convertir les données en nœuds et arêtes
		const elements = [
			...agents.map((agent) => ({
				data: { id: agent.name, label: agent.name },
				classes: getEnviedAgents(agent).length > 0 ? 'envy' : 'no-envy' // Ajouter une classe en fonction de l'envie
			})),
			...allEnviedAgents.flatMap(({ evaluator, enviedAgents }) =>
				enviedAgents.map((envied) => ({
					data: { source: evaluator, target: envied }
				}))
			)
		];

		// Initialiser Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'), // Conteneur pour le graphe
			elements,
			style: [
				{
					selector: 'node.no-envy', // Agents sans envie
					style: {
						label: 'data(label)',
						'text-valign': 'center',
						color: '#fff',
						'background-color': '#4CAF50', // Vert
						width: 50,
						height: 50,
						'font-size': '12px'
					}
				},
				{
					selector: 'node.envy', // Agents avec envie
					style: {
						label: 'data(label)',
						'text-valign': 'center',
						color: '#fff',
						'background-color': '#FF5733', // Rouge
						width: 50,
						height: 50,
						'font-size': '12px'
					}
				},
				{
					selector: 'edge',
					style: {
						width: 2,
						'line-color': '#999',
						'target-arrow-color': '#999',
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier'
					}
				}
			],
			layout: {
				name: 'circle', // Disposition circulaire
				animate: true
			},
			zoomingEnabled: false,
			userZoomingEnabled: false,
			panningEnabled: false,
			userPanningEnabled: false,
			boxSelectionEnabled: false
		});
	}

	// Réinitialiser le graphe lorsque les données changent
	$effect(() => {
		initializeGraph();
	});
</script>

<div class={className}>
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<span class="text-muted-foreground p-1 text-sm">Evaluator</span>
			<Select.Root
				type="single"
				value={evaluatorAgent.name}
				onValueChange={updateEvaluatorAgent}
			>
				<Select.Trigger class="w-[180px]">
					{evaluatorAgent.name}
				</Select.Trigger>
				<Select.Content>
					{#each agents as agent (agent.name)}
						<Select.Item value={agent.name} label={agent.name}>
							{agent.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex items-center space-x-2">
			<span class="text-muted-foreground p-1 text-sm">Envy Mode</span>
			<Select.Root
				type="single"
				value={envyMode}
				onValueChange={(value) => (envyMode = value as 'Full' | 'OneFree' | 'EFX')}
			>
				<Select.Trigger class="w-[180px]">
					{envyMode}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="Full" label="Full">Full</Select.Item>
					<Select.Item value="OneFree" label="OneFree">OneFree</Select.Item>
					<Select.Item value="EFX" label="EFX">EFX</Select.Item>
				</Select.Content>
			</Select.Root>

			<Button href="/envy-modes" variant="link">More about envy modes</Button>
		</div>
	</div>

	<!-- Conteneur pour l'histogramme et le graphe -->
	<div class="flex space-x-4">
		<!-- Histogramme -->
		<div class="w-2/3">
			<canvas bind:this={chartCanvas}></canvas>
			<p class="text-muted-foreground mt-5 text-center">
				{#if enviedAgents.length === 0}
					The division is fair for <span class="text-primary font-semibold">
						{evaluatorAgent.name}
					</span>
				{:else}
					<span class="text-primary font-semibold">{evaluatorAgent.name}</span> envies
					<span class="text-primary font-semibold">
						{enviedAgents.map((enviedAgent) => enviedAgent.name).join(', ')}
					</span>
				{/if}
			</p>
		</div>

		<!-- Graphe Cytoscape -->
		<div class="w-1/3">
			<div id="cy" style="width: 100%; height: 400px; border: 1px solid #ccc;"></div>
		</div>
	</div>
</div>
