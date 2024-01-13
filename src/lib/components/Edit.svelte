<script lang="ts">
	import open_edit_store from '$lib/stores/open_edit';
	import { faArrowLeft, faArrowRight, faEdit, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { writable } from 'svelte/store';

	export let handlers: {
		rename: () => Promise<void>;
		delete: () => Promise<void>;
	};

	let open = writable(false);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- Edit buttons -->
<div
	class="flex justify-between items-center
    "
>


	<!-- Rename button -->
	<button 
		class="p-2 mx-1 rounded-md shadow-md {$open ? 'block' : 'hidden'}"
		title="Rename"
		on:click|preventDefault={handlers.rename}>
		<Fa icon={faEdit} />
	</button>

	<!-- Delete button -->
	<button 
		class="p-2 mx-1 rounded-md shadow-md {$open ? 'block' : 'hidden'}"
		title="Delete"
		on:click|preventDefault={handlers.delete}>
		<Fa icon={faTrashCan} />
	</button>

	<!-- Close -->
	<button 
		class="p-2 mx-1 outline-none border-none
			{$open ? 'block' : 'hidden'}
		"
		title="Close edit buttons"
		on:click|preventDefault={() => {
			open.set(false);
			open_edit_store.set(open);
		}}
	>
		<Fa class="text-2xl" icon={faArrowRight} />
	</button>

	<!-- Open -->
	<button 
		class="p-2 mx-1 outline-none border-none
			{$open ? 'hidden' : 'block'}
		"
		title="Open edit buttons"
	
		on:click|preventDefault={() => {
			if ($open_edit_store) {
				$open_edit_store.set(false);
			}
			open.set(true);
			open_edit_store.set(open);
		}}
	>
		<Fa class="text-2xl" icon={faArrowLeft} />
	</button>
</div>
