<script>
	import { Github } from '@lucide/svelte';
	import { Button } from './ui/button';

	let updateDate = 'Last updated on May 9, 2025';
	let projectLink = 'https://github.com/xxBWxx/projet-androide.git';
</script>

<div class="flex w-full flex-col items-center bg-gray-50 p-12 text-center">
	<h1 class="text-xl font-bold">Explorable Explanations of Fair Allocation Notions</h1>
	<h2 class="text-lg">Supervisor: Nicolas Maudet</h2>
	<h3 class="text-lg">Baran Açıkel, Kaan Dişli, Guillaume Lebreton</h3>

	<Button href={projectLink} target="_blank" rel="noopener noreferrer" class="my-4">
		Explore the repository
		<Github />
	</Button>

	<div class="text-sm">{updateDate}</div>
</div>
