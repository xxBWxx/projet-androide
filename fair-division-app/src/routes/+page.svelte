<script lang="ts">
	import AgentList from '$lib/components/AgentList.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import Introduction from './Introduction.svelte';
	import Pool from '$lib/components/Pool.svelte';
	import SimulationDashboard from '$lib/components/SimulationDashboard.svelte';
	import type { IAgent } from '$lib/agent';
	import { sharedAgents } from '$lib/shared.svelte';

	let agents: IAgent[] = $state(sharedAgents.agents);
</script>

<AppHeader />

<Introduction />

<AgentList />

<BarChart class="px-40 py-20" />

<Pool />

<SimulationDashboard {agents} class="my-10" />
