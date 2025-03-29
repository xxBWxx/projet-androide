<script lang="ts">
	import type { Color, IAgent } from '$lib/agent';
	import { sharedAgents } from '$lib/shared.svelte';
	import type { WithElementRef } from 'bits-ui';
	import Chart from 'chart.js/auto';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Label } from './ui/label';
	import * as Select from './ui/select';
	import { Switch } from './ui/switch';

	let agents = $state(sharedAgents.agents);
	let evaluatorAgent = $derived({ ...agents[0] });
	let isEnvyFree = $state(false);

	let isEvaluator = (agent: IAgent) => agent.name === evaluatorAgent.name;

	// Value of the evaluator agent's lot (complete)
	// let evaluatorValue = $derived(
	// 	Object.keys(evaluatorAgent.attributions).reduce(
	// 		(sum, color) =>
	// 			sum +
	// 			evaluatorAgent.attributions[color as Color] *
	// 				evaluatorAgent.utilities[color as Color],
	// 		0
	// 	)
	// );

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
			const maxItemValue = Math.max(
				...Object.keys(agent.attributions).map(
					(color) =>
						agent.attributions[color as Color] *
						evaluatorAgent.utilities[color as Color]
				)
			);

			// Adjusted value (without the preferred item) if Envy-One-Free is enabled
			const adjustedValue =
				isEnvyFree && !isEvaluator(agent) ? totalValue - maxItemValue : totalValue;

			return {
				agent: agent,
				value: adjustedValue // Always show the adjusted value if Envy-One-Free is enabled
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
		updateChart();
	});

	let updateEvaluatorAgent = (name: string) => {
		evaluatorAgent = { ...agents.find((agent) => agent.name === name) } as IAgent;
	};

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { class: className }: Props = $props();
</script>

<div class={className}>
	<div class="mb-4 flex items-center justify-between">
		<div class="flex flex-col items-start">
			<span class="text-muted-foreground p-1 text-sm">Evaluator Agent</span>
			<Select.Root
				type="single"
				bind:value={evaluatorAgent.name}
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
			<Switch id="envy-free" bind:checked={isEnvyFree} />
			<Label for="envy-free">Envy One-Free</Label>
		</div>
	</div>

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
