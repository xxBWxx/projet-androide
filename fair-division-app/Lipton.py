import itertools
import pandas as pd

# Define agents, items, and utilities
agents = ['1', '2', '3']
items = ['o1', 'o2', 'o3', 'o4', 'o5']

utilities = {
    '1': {'o1': 1, 'o2': 2, 'o3': 5, 'o4': 3, 'o5': 7},
    '2': {'o1': 2, 'o2': 6, 'o3': 8, 'o4': 1, 'o5': 5},
    '3': {'o1': 5, 'o2': 4, 'o3': 4, 'o4': 3, 'o5': 12}
}

def bundle_value(agent, bundle):
    return sum(utilities[agent][o] for o in bundle)

def build_envy_graph(allocation):
    graph = {i: [] for i in agents}
    for i, j in itertools.permutations(agents, 2):
        if bundle_value(i, allocation[j]) - bundle_value(i, allocation[i]) > 0:
            graph[i].append(j)
    return graph

def find_cycle(graph):
    # First try to find a 2-cycle (mutual envy)
    for i, j in itertools.permutations(agents, 2):
        if j in graph[i] and i in graph[j]:
            return [i, j]
    # Otherwise use DFS for longer cycles
    visited = set()
    def dfs(u, path):
        visited.add(u)
        path.append(u)
        for v in graph[u]:
            if v in path:
                return path[path.index(v):]
            if v not in visited:
                cycle = dfs(v, path)
                if cycle:
                    return cycle
        path.pop()
        return None

    for a in agents:
        if a not in visited:
            cycle = dfs(a, [])
            if cycle:
                return cycle
    return None

def rotate_cycle(allocation, cycle):
    new_alloc = allocation.copy()
    for idx, agent in enumerate(cycle):
        source = cycle[(idx + 1) % len(cycle)]
        new_alloc[agent] = list(allocation[source])
    return new_alloc

def lipton_allocation(agents, items):
    allocation = {a: [] for a in agents}
    allocation[agents[0]].append(items[0])

    for item in items[1:]:
        # break cycles until none remain
        while True:
            graph = build_envy_graph(allocation)
            cycle = find_cycle(graph)
            if not cycle:
                break
            allocation = rotate_cycle(allocation, cycle)
        # allocate to an agent with no incoming envy
        graph = build_envy_graph(allocation)
        indegree = {a: 0 for a in agents}
        for src, neighs in graph.items():
            for tgt in neighs:
                indegree[tgt] += 1
        for a in agents:
            if indegree[a] == 0:
                allocation[a].append(item)
                break

    # final envy-free rotation
    while True:
        graph = build_envy_graph(allocation)
        cycle = find_cycle(graph)
        if not cycle:
            break
        allocation = rotate_cycle(allocation, cycle)

    return allocation

# Run algorithm on example
alloc = lipton_allocation(agents, items)

# Compute maximum envy and record envy relations
max_envy = 0
envy_relations = []
for i, j in itertools.permutations(agents, 2):
    envy_amount = bundle_value(i, alloc[j]) - bundle_value(i, alloc[i])
    if envy_amount > 0:
        envy_relations.append((i, j, envy_amount))
    max_envy = max(max_envy, envy_amount)

# Display allocation table
df = pd.DataFrame([
    {
        'Agent': a,
        'Bundle': ', '.join(alloc[a]),
        'Utility': bundle_value(a, alloc[a])
    }
    for a in agents
])
print(df.to_string(index=False))

# Print envy relations or "No envy!"
if envy_relations:
    print("\nEnvy relations:")
    for i, j, amt in envy_relations:
        print(f"Agent {i} envies Agent {j} by {amt}")
else:
    print("\nNo envy!")

print(f"\nMaximum envy: {max_envy}")
