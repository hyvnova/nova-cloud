<script lang="ts">
	import toast from '$lib/stores/toast';

	/**
	 * A general porpuse notification.
	 * Position: top center
	 */

	let card_styles = {
		error: 'bg-black border border-red-400 text-red-700',
		info: 'bg-black border border-blue-400 text-blue-700'
	};

	$: if ($toast?.duration) {
		setTimeout(() => {
			toast.set(null);
		}, $toast.duration);
	}
</script>

{#if $toast}
	<div
		class="w-10/12 relative top-0 left-0 flex flex-col justify-center items-center p-2 m-4 rounded-lg z-50 mx-auto {card_styles[
			$toast.type
		]}"
	>
		<h3
			class="text-center text-lg text-gray-200"
		>{$toast.title}</h3>
		<p
			class="text-center text-md text-gray-400"
		>{$toast.message}</p>
	</div>
{/if}
