import type { IAgent } from '$lib/agent';
import { get } from 'svelte/store';
import { pool } from '$lib/pool';

export type Preferences = Record<string, Record<string, number>>;
export type Allocation = Record<string, string[]>;
export type EnvyMatrix = Record<string, Record<string, number>>;
export type UtilityStats = {
	total_utilities_per_agent: Record<string, number>;
	total_utility: number;
	max_agent: [string, number];
	min_agent: [string, number];
};

// Converts frontend agent input to backend preference map
export function fromFrontendAgents(agents: IAgent[]): Preferences {
	const prefs: Preferences = {};
	for (const agent of agents) {
		prefs[`Agent ${agent.name.replace(/\D/g, '')}`] = agent.utilities;
	}
	return prefs;
}

export function chooseSequence(
	style: string,
	nAgents: number,
	nPicks: number,
	seed?: number
): number[] {
	if (seed !== undefined) seedRandom(seed);

	if (style === 'mirror') {
		const forward = Array.from({ length: nAgents }, (_, i) => i + 1);
		return [...forward, ...forward.reverse()].slice(0, nPicks);
	}

	if (style === 'random') {
		return Array.from({ length: nPicks }, () => randInt(1, nAgents));
	}

	if (style === 'repeated') {
		const base = Array.from({ length: nAgents }, (_, i) => i + 1);
		const result: number[] = [];
		while (result.length < nPicks) result.push(...base);
		return result.slice(0, nPicks);
	}

	throw new Error("Please choose a style: 'mirror', 'random', or 'repeated'.");
}

export function allocate(preferences: Preferences, sequence: number[]): Allocation {
    const agents = Object.keys(preferences);
    const remainingObjects: Record<string, number> = { ...get(pool) }; // Copie locale du pool
    const allocation: Allocation = Object.fromEntries(agents.map((a) => [a, []]));

    // Continue la distribution tant qu'il reste des biens dans le pool
    while (Object.values(remainingObjects).some((quantity) => quantity > 0)) {
        for (const turn of sequence) {
            const agent = `Agent ${turn}`;
            const available = Object.keys(remainingObjects).filter((obj) => remainingObjects[obj] > 0);

            // Arrêter si plus de biens disponibles
            if (available.length === 0) break;

            // Préférences de l'agent pour les biens disponibles
            const preferencesForAvailable = preferences[agent];
            const preferredObject = available.reduce((best, obj) =>
                preferencesForAvailable[obj] > preferencesForAvailable[best] ? obj : best
            );

            // Attribuer le bien préféré à l'agent
            allocation[agent].push(preferredObject);
            remainingObjects[preferredObject] -= 1; // Réduire la quantité du bien

            // Supprimer l'objet du pool s'il n'en reste plus
            if (remainingObjects[preferredObject] === 0) {
                delete remainingObjects[preferredObject];
            }
        }
    }

    return allocation;
}

export function analyzeUtilities(allocation: Allocation, preferences: Preferences): UtilityStats {
	const totalUtilities: Record<string, number> = {};
	for (const agent in allocation) {
		totalUtilities[agent] = allocation[agent].reduce(
			(sum, obj) => sum + preferences[agent][obj],
			0
		);
	}

	const entries = Object.entries(totalUtilities);
	const totalUtility = entries.reduce((sum, [, val]) => sum + val, 0);
	const maxAgent = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
	const minAgent = entries.reduce((a, b) => (a[1] < b[1] ? a : b));

	return {
		total_utilities_per_agent: totalUtilities,
		total_utility: totalUtility,
		max_agent: maxAgent,
		min_agent: minAgent
	};
}

export function calculateEnvy(
	allocation: Allocation,
	preferences: Preferences
): { envyValue: number; envyMatrix: EnvyMatrix } {
	const agents = Object.keys(allocation);
	const envyMatrix: EnvyMatrix = {};
	let maxEnvy = 0;

	for (const i of agents) {
		envyMatrix[i] = {};
		const selfUtility = allocation[i].reduce((sum, obj) => sum + preferences[i][obj], 0);

		for (const j of agents) {
			if (i === j) {
				envyMatrix[i][j] = 0;
				continue;
			}

			const othersUtility = allocation[j].reduce((sum, obj) => sum + preferences[i][obj], 0);
			const envy = Math.max(0, othersUtility - selfUtility);
			envyMatrix[i][j] = envy;
			maxEnvy = Math.max(maxEnvy, envy);
		}
	}

	return { envyValue: maxEnvy, envyMatrix };
}

function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seedRandom(seed: number) {
	let state = seed;
	Math.random = function () {
		state = (state * 16807) % 2147483647;
		return (state - 1) / 2147483646;
	};
}
