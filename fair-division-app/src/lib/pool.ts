import { writable } from 'svelte/store';
import type { Color } from './agent';

// Définir le type du pool
export type Pool = Record<Color, number>;

// Initialiser le store du pool avec un état par défaut
export const pool = writable<Pool>({
	red: 0,
	blue: 0,
	green: 0,
	yellow: 0,
	purple: 0
});
