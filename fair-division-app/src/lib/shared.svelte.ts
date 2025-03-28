import { defaultAttributions, defaultUtilities } from './agent';

export const sharedAgents = $state({
	agents: [
		{
			name: 'Agent1',
			attributions: { ...defaultAttributions },
			utilities: { ...defaultUtilities }
		},
		{
			name: 'Agent2',
			attributions: { ...defaultAttributions },
			utilities: { ...defaultUtilities }
		}
	],
	count: 2
});
