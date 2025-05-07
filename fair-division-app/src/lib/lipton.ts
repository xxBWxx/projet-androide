import type { Preferences, Allocation, EnvyMatrix, UtilityStats } from './picking_sequence';
import { analyzeUtilities, calculateEnvy } from './picking_sequence';

// Helper: compute utility of a bundle for an agent
function bundleValue(agent: string, bundle: string[], prefs: Preferences): number {
	return bundle.reduce((sum, obj) => sum + prefs[agent][obj], 0);
}

// Build envy graph: edges i -> j if i envies j
function buildEnvyGraph(allocation: Allocation, prefs: Preferences): Record<string, string[]> {
	const agents = Object.keys(allocation);
	const graph: Record<string, string[]> = {};
	for (const i of agents) {
		graph[i] = [];
		for (const j of agents) {
			if (i === j) continue;
			const diff =
				bundleValue(i, allocation[j], prefs) - bundleValue(i, allocation[i], prefs);
			if (diff > 0) graph[i].push(j);
		}
	}
	return graph;
}

// Find a cycle, preferring 2-cycles
function findCycle(graph: Record<string, string[]>): string[] | null {
	const agents = Object.keys(graph);
	// check mutual envy (2-cycles)
	for (const i of agents) {
		for (const j of graph[i]) {
			if (graph[j]?.includes(i)) return [i, j];
		}
	}
	// DFS for longer cycles
	const visited = new Set<string>();
	function dfs(u: string, path: string[]): string[] | null {
		visited.add(u);
		path.push(u);
		for (const v of graph[u] || []) {
			const idx = path.indexOf(v);
			if (idx >= 0) return path.slice(idx);
			if (!visited.has(v)) {
				const cycle = dfs(v, path);
				if (cycle) return cycle;
			}
		}
		path.pop();
		return null;
	}
	for (const a of agents) {
		if (!visited.has(a)) {
			const cycle = dfs(a, []);
			if (cycle) return cycle;
		}
	}
	return null;
}

// Rotate bundles along a cycle
function rotateCycle(allocation: Allocation, cycle: string[]): Allocation {
	const newAlloc: Allocation = {};
	for (const a in allocation) newAlloc[a] = [...allocation[a]];
	for (let i = 0; i < cycle.length; i++) {
		const cur = cycle[i];
		const next = cycle[(i + 1) % cycle.length];
		newAlloc[cur] = [...allocation[next]];
	}
	return newAlloc;
}

// Main Lipton algorithm
export function liptonAllocate(prefs: Preferences): Allocation {
	const agents = Object.keys(prefs);
	const objects = Object.keys(prefs[agents[0]]);
	let alloc: Allocation = Object.fromEntries(agents.map((a) => [a, []]));

	// 1) Give first object to first agent
	alloc[agents[0]].push(objects[0]);

	// 2) Sequentially allocate remaining
	for (const o of objects.slice(1)) {
		// break envy cycles
		while (true) {
			const graph = buildEnvyGraph(alloc, prefs);
			const cycle = findCycle(graph);
			if (!cycle) break;
			alloc = rotateCycle(alloc, cycle);
		}
		// pick an agent with no incoming edges
		const graph = buildEnvyGraph(alloc, prefs);
		const indegree: Record<string, number> = Object.fromEntries(agents.map((a) => [a, 0]));
		for (const i of agents) for (const j of graph[i]) indegree[j]++;
		const target = agents.find((a) => indegree[a] === 0)!;
		alloc[target].push(o);
	}

	// 3) Final break of any remaining envy
	while (true) {
		const graph = buildEnvyGraph(alloc, prefs);
		const cycle = findCycle(graph);
		if (!cycle) break;
		alloc = rotateCycle(alloc, cycle);
	}

	return alloc;
}

export function runLipton(prefs: Preferences): {
	allocation: Allocation;
	envyMatrix: EnvyMatrix;
	envyValue: number;
	utilityStats: UtilityStats;
	sequence: number[]; // PS always returns a sequence
} {
	const allocation = liptonAllocate(prefs);

	// compute utilities & envy just like PS
	const utilityStats = analyzeUtilities(allocation, prefs);
	const { envyValue, envyMatrix } = calculateEnvy(allocation, prefs);

	// if not envy‐free, bail out so UI can warn
	if (envyValue > 0) {
		throw new Error('No envy-free allocation possible');
	}

	// Lipton has no “pick” sequence to show, so return empty array
	return { allocation, envyMatrix, envyValue, utilityStats, sequence: [] };
}
