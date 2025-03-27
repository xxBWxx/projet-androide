export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'purple';

export interface IAgent {
	name: string;
	attributions: Record<Color, number>;
	utilities: Record<Color, number>;
}

export const defaultAttributions: Record<Color, number> = {
	red: 0,
	green: 0,
	blue: 0,
	yellow: 0,
	purple: 0
};

export const defaultUtilities: Record<Color, number> = {
	red: 0,
	green: 0,
	blue: 0,
	yellow: 0,
	purple: 0
};

export const setAttribution = (agent: IAgent, color: Color, value: number) => {
	agent.attributions[color] = value;
};

export const setAttributions = (agent: IAgent, attributions: Record<Color, number>) => {
	Object.assign(agent.attributions, attributions);
};

export const setName = (agent: IAgent, name: string) => {
	agent.name = name;
};

export const setUtility = (agent: IAgent, color: Color, value: number) => {
	agent.utilities[color] = value;
};

export const setUtilities = (agent: IAgent, utilities: Record<Color, number>) => {
	Object.assign(agent.utilities, utilities);
};
