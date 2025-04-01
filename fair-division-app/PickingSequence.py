import random
import pandas as pd
import json



#Parameters to be passed by the front end are:
# n_agents: number of agents
# n_objects: number of objects
# utility_range: range of utility values (or we can hardcode it to be some value)
# style: style of picking sequence (mirror, random, repeated)





def generate_cardinal_preferences(n_agents, n_objects, utility_range=(1, 10), seed=None):
    if seed is not None:
        random.seed(seed)

    agents = [f'Agent {i+1}' for i in range(n_agents)]
    objects = [f'Object {j+1}' for j in range(n_objects)]

    # Create utility table: agent -> object -> utility
    preferences = {}
    for agent in agents:
        preferences[agent] = {}
        for obj in objects:
            preferences[agent][obj] = random.randint(*utility_range)

    df = pd.DataFrame(preferences).T
    return df

def picking_sequence_allocation(preferences_df, sequence):
    remaining_objects = set(preferences_df.columns)
    allocation = {agent: [] for agent in preferences_df.index}

    for turn in sequence:
        agent = f"Agent {turn}"
        # Get the agent's preferences restricted to remaining objects
        agent_prefs = preferences_df.loc[agent][list(remaining_objects)]
        # Pick the most preferred remaining object
        if not agent_prefs.empty:
            best_object = agent_prefs.idxmax()
            allocation[agent].append(best_object)
            remaining_objects.remove(best_object)
    
    return allocation

def display_allocation(allocation):
    print("\nFinal Allocation:")
    for agent, objects in allocation.items():
        print(f"{agent}: {objects}")

def choose_sequence(style, n_agents, n_picks, seed=None):
    if seed is not None:
        random.seed(seed)

    if style == "mirror":
        forward = list(range(1, n_agents + 1))
        sequence = forward + forward[::-1]
        return sequence[:n_picks]

    elif style == "random":
        return [random.randint(1, n_agents) for _ in range(n_picks)]

    elif style == "repeated":
        base = list(range(1, n_agents + 1))
        sequence = (base * ((n_picks + n_agents - 1) // n_agents))[:n_picks]
        return sequence

    else:
        print("❌ Please choose a style of sequence: 'mirror', 'random', or 'repeated'.")
        return []



def analyze_utilities(allocation, preferences_df):
    total_utilities = {}
    
    for agent, allocated_objects in allocation.items():
        utility = sum(preferences_df.loc[agent][obj] for obj in allocated_objects)
        total_utilities[agent] = utility

    total_combined = sum(total_utilities.values())
    max_agent = max(total_utilities, key=total_utilities.get)
    min_agent = min(total_utilities, key=total_utilities.get)

    print("\n📊 Utility Analysis:")
    for agent, util in total_utilities.items():
        print(f"{agent}: {util} utility")

    print(f"\n💰 Total Utility (All Agents Combined): {total_combined}")
    print(f"🏆 Max Utility: {max_agent} with {total_utilities[max_agent]}")
    print(f"📉 Min Utility: {min_agent} with {total_utilities[min_agent]}")

    return {
        "total_utilities_per_agent": total_utilities,
        "total_utility": total_combined,
        "max_agent": (max_agent, total_utilities[max_agent]),
        "min_agent": (min_agent, total_utilities[min_agent])
    }

def calculate_envy(allocation, preferences_df):
    agents = list(preferences_df.index)
    envy_matrix = {}

    max_envy = 0
    envies = None
    is_envied = None
    for i in agents:
        envy_matrix[i] = {}
        for j in agents:
            if i == j:
                envy_matrix[i][j] = 0
                continue

            # Utility of agent i for their own bundle
            own_utility = sum(preferences_df.loc[i][obj] for obj in allocation[i])

            # Utility of agent i for agent j's bundle
            others_utility = sum(preferences_df.loc[i][obj] for obj in allocation[j])

            envy = max(0, others_utility - own_utility)
            envy_matrix[i][j] = envy
            
            max_envy = max(max_envy, envy)
            if envy > 0:
                envies = i
                is_envied = j
    

    print(f"😠 Envy of the allocation: {envies} envies {is_envied} with envy value of {max_envy}") if max_envy > 0 else print("No envy detected!")
    return max_envy, envy_matrix


# Example usage
if __name__ == "__main__":
    n_agents = 3
    n_objects = 5
    picking_seq = choose_sequence("random", n_agents, n_picks=n_objects, seed=42)
    print("Picking Sequence:", picking_seq)
    preferences_df = generate_cardinal_preferences(n_agents, n_objects, seed=42) #CURRENTLY THE PREFERENCES ARE GENERATED RANDOMLY WE CAN IMPORT FROM THE FRONTEND
    print("Cardinal Preferences (Utilities):")
    print(preferences_df)

    allocation = picking_sequence_allocation(preferences_df, picking_seq)
    print("Raw Allocation:")
    print(allocation) #this is the dictionary of allocations you need for the front end
    print("\nAllocation Summary:")
    display_allocation(allocation)
    # Analyze utilities after allocation
    utility_dictionary = analyze_utilities(allocation, preferences_df) #this is the dictionary of utilities you need for the front end
    # Compute envy of allocation
    envy_value, envy_matrix = calculate_envy(allocation, preferences_df) #this is the maximum envy value you need for the front end
    print("\nEnvy Matrix:")
    for agent, envies in envy_matrix.items():
        print(f"{agent}: {envies}")
    print(f"\nMaximum Envy: {envy_value}") 



