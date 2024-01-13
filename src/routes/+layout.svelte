<script>
	import '@picocss/pico/css/pico.css';
	import '../app.css';


	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	export let data;

	const duration = 300;
	const delay = duration + 100;
	const y = 10;

	const transitionIn = { easing: cubicOut, y, duration, delay };
	const transitionOut = { easing: cubicIn, y: -y, duration };
</script>

{#key data.pathname}
<div
	data-theme="dark"
	class="mx-auto w-screen p-4 max-w-2xl"
	in:fly|global={transitionIn} out:fly|global={transitionOut}
>
	<slot />
</div>
{/key}