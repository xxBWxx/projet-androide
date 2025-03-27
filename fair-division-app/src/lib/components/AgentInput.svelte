<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLInputAttributes> & { type: 'attribution' | 'utility' };

	let { value, type, onchange }: Props = $props();

	if (isNaN(value)) {
		value = 0;
	}

	function validateValue(event: Event) {
		const input = event.target as HTMLInputElement;
		let newValue = parseInt(input.value, 10);

		const maxValue = type === 'utility' ? 5 : 10;
		if (newValue < 0) {
			newValue = 0;
		} else if (newValue > maxValue) {
			newValue = maxValue;
		}

		input.value = newValue.toString();
		value = newValue;
	}
</script>

<input
	class="border-border ring-offset-background focus-visible:ring-ring mr-2 inline w-16 rounded-md border pl-2 focus-visible:outline-none focus-visible:ring-2"
	bind:value
	min="0"
	max={type === 'utility' ? 5 : 10}
	type="number"
	{onchange}
	oninput={validateValue}
/>
