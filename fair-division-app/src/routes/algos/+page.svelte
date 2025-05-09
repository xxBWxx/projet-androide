<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<div class="p-10">
	<Button href="/" variant="outline" class="mb-10">
		<ArrowLeft />
		Return to home page
	</Button>

	<div>
		<h2 class="text-xl font-bold">Picking Sequence Algorithm</h2>
		<p class="mt-4 text-lg">
			The picking sequence is a simple, turn-based protocol where participants choose items
			one by one according to a predetermined order. At each turn, the next agent in the
			sequence selects their most preferred remaining object. Variations of the sequence (e.g.
			repeated, mirror, or randomized order) help balance first-mover advantage and improve
			perceived fairness. Because each choice is greedy—agents always pick their top available
			item—the algorithm is easy to understand and fast to execute (linear in the number of
			picks). While it guarantees EF1 (envy-freeness up to one good) under additive utilities,
			full envy-freeness may not hold in all cases. Picking sequences are ideal when
			transparency, simplicity, and interactive exploration are priorities.
		</p>
	</div>

	<div class="mt-10">
		<h2 class="text-xl font-bold">Lipton’s Cycle-Elimination Algorithm</h2>

		<p class="mt-4 text-lg">
			Lipton’s method constructs an allocation one item at a time and maintains an “envy
			graph” to track which agents envy others. After each assignment, the algorithm checks
			for directed cycles in this graph—sets of agents who form a loop of envy. Whenever a
			cycle is detected, the bundles along the cycle are rotated so each agent receives the
			next agent’s lot, breaking the envy loop. This process repeats until no cycles remain,
			ensuring an EF1 allocation under additive preferences. Although more computationally
			intensive (due to graph construction and cycle detection), Lipton’s algorithm can
			achieve stronger fairness guarantees than naive drafts and serves as a robust backbone
			for interactive demonstrations of envy resolution.
		</p>
	</div>
</div>
