<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLInputAttributes> & { type: 'attribution' | 'utility' };

	let { value = $bindable(), type }: Props = $props();
</script>

<input
	class="border-border ring-offset-background focus-visible:ring-ring mr-2 inline w-16 rounded-md border pl-2 focus-visible:outline-none focus-visible:ring-2"
	bind:value
	type="number"
	min="0"
	max={type === 'utility' ? 5 : 10}
/>
