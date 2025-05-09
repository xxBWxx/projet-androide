<script lang="ts">
	import { pool } from '$lib/pool'; // Import du store pool
	import type { Pool } from '$lib/pool'; // Import du type Pool
	import { Dice3, RefreshCcw } from '@lucide/svelte';
	import ColoredBall from './ColoredBall.svelte';
	import { Button } from './ui/button';

	// Fonction pour réinitialiser le pool à zéro
	const resetPool = () => {
		pool.set({
			red: 0,
			blue: 0,
			green: 0,
			yellow: 0,
			purple: 0
		});
	};

	// Fonction pour générer un pool aléatoire
	const generateRandomPool = () => {
		const randomPool: Pool = {
			red: Math.floor(Math.random() * 10),
			blue: Math.floor(Math.random() * 10),
			green: Math.floor(Math.random() * 10),
			yellow: Math.floor(Math.random() * 10),
			purple: Math.floor(Math.random() * 10)
		};
		pool.set(randomPool);
	};

	// Fonction pour mettre à jour les quantités du pool
	const updatePool = (color: keyof Pool, value: number) => {
		const updatedPool = { ...$pool, [color]: value };
		pool.set(updatedPool);
	};
</script>

<div class="flex w-full flex-col items-center">
	<div class="flex items-center justify-center gap-4 lg:mb-4">
		<span class="font-medium">Pool</span>

		<div class="flex gap-4">
			<Button variant="outline" onclick={generateRandomPool}>
				<Dice3 />
				Random
			</Button>

			<Button variant="outline" onclick={resetPool}>
				<RefreshCcw />
				Reset
			</Button>
		</div>
	</div>

	<div class="flex items-center justify-center gap-6">
		{#each Object.keys($pool) as color (color)}
			<div class="flex items-center gap-2">
				<ColoredBall {color} />
				<input
					type="number"
					min="0"
					bind:value={$pool[color as keyof Pool]}
					on:input={(e) =>
						updatePool(
							color as keyof Pool,
							parseInt((e.target as HTMLInputElement).value)
						)}
					class="w-16 rounded-md border p-1"
				/>
			</div>
		{/each}
	</div>
</div>
