<script lang="ts">
	import AgentList from '$lib/components/AgentList.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import Introduction from '$lib/components/Introduction.svelte';
</script>

<AppHeader />

<Introduction />

<AgentList />

<BarChart class="px-40 py-20" />
