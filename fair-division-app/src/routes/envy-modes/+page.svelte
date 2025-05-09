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
		<h2 class="text-xl font-bold">Full Envy-Freeness (EF)</h2>
		<p class="mt-4 text-lg">
			An allocation is envy-free if no agent strictly prefers another agent’s bundle to their
			own. In other words, every participant values their own share at least as much as any
			other’s. EF is the gold-standard of fairness, but for indivisible items it often fails
			to exist: simple examples with a small number of high-value objects can create
			unavoidable envy. Testing EF is straightforward—compare each pair of bundles—but finding
			an EF allocation (when it exists) can be computationally hard and may require complex
			coordination or tie-breaking rules.
		</p>
	</div>

	<div class="mt-10">
		<h2 class="text-xl font-bold">Envy-Freeness up to One Good (EF1)</h2>

		<p class="mt-4 text-lg">
			EF1 relaxes full envy-freeness by allowing each agent to remove at most one item from
			another’s bundle to eliminate envy. Formally, for every pair of agents i , j i,j, there
			exists a good in j j’s bundle whose removal makes i i no longer envy j j. Under additive
			utilities, EF1 allocations always exist and can be found efficiently (e.g., via picking
			sequences). EF1 strikes a practical balance: it guarantees a strong notion of fairness
			without the impossibility issues of exact EF, and it admits simple, polynomial-time
			algorithms.
		</p>
	</div>

	<div class="mt-10">
		<h2 class="text-xl font-bold">Envy-Freeness up to Any Good (EFX)</h2>

		<p class="mt-4 text-lg">
			EFX strengthens EF1 by requiring that, for any single item removed from another agent’s
			bundle—no matter which one—envy disappears. That is, for every pair i , j i,j and every
			good in j j’s bundle, removing that good makes i i non-envious. EFX allocations, if they
			exist, provide very robust fairness guarantees and are highly desirable in practice.
			However, whether an EFX allocation always exists under general additive preferences
			remains an open research question, and known algorithms for finding EFX are either
			restricted to special cases or run in exponential time.
		</p>
	</div>
</div>
