export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'purple';

export interface Agent {
	name: string;
	attributions: Record<Color, number>;
	utilities: Record<Color, number>;
}
