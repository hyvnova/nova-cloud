<script lang="ts">
	import { writable } from 'svelte/store';
	import type { ActionData, PageServerData } from './$types';
	import type { GroupType } from '$lib/types';
	import Toast from '$lib/components/Toast.svelte';
	import toast from '$lib/stores/toast';
	import Edit from '$lib/components/Edit.svelte';
	import { perform_action } from '$lib/index';

	import Fa from 'svelte-fa';
	import { faSpinner } from '@fortawesome/free-solid-svg-icons';

	export let data: PageServerData;
	export let form: ActionData; 

	// Handle form submission response
	function after_submit(form: ActionData) {
		if (!form) return;

		uploading.set(false);

		// If error
		if (form.status !== 200) {
			toast.set({
				type: 'error',
				title: 'Could not upload files to group',
				duration: 5000,
				message: 'Make sure all fields are filled properly.'
			});
			return;
		}

		// clear form
		input_files.set(null);

		// If a new group was created, add it to the list
		if (form.group) {
			group_list.update((list) => {
				list.push(form.group);
				return list;
			});
		} 

		toast.set({
			type: 'info',
			title: 'Success',
			duration: 3000,
			message: `Files succesfully uploaded to ${form.group_name}!`
		});
	}

	// Form
	let input_files = writable<FileList | null>(null);

	let group_list = writable(data.groups);

	let uploading = writable(false);

	async function handle_group(action: string, group: GroupType) {
		switch (action) {
			case 'rename':
				let new_name = await perform_action('group rename', group.id);
				if (!new_name) {
					break;
				} // Error already handled

				// Update list to reflect new name
				group_list.update((list) => {
					return list.map((g) => {
						if (g.id === group.id) {
							g.name = new_name as string;
						}
						return g;
					});
				});

				break;

			case 'delete':
				if (!(await perform_action('group delete', group.id))) {
					break;
				} // Error already handled

				// Remove from list
				group_list.update((list) => {
					return list.filter((g) => g.id !== group.id);
				});

				break;
		}
	}

	async function handle_submit(e) {
		uploading.set(true);

		let res = await fetch(e.target.action, {
			method: 'POST',
			body: new FormData(e.target)
		})
		
		let data = await res.json();

		form = data;
		after_submit(data);
	}

</script>

<svelte:head>
	<title>Home - NoVaCloud</title>
	<meta name="description" content="NoVaCloud home page, group creation." />
	<meta name="keywords" content="NoVaCloud, upload, files, share, cloud" />
</svelte:head>

<main class="flex flex-col justify-center items-center w-auto p-4">
	<Toast />

	<!-- upload files-->
	<form
		class="flex flex-col justify-center items-center w-full h-auto bg-gray/80 rounded-md shadow-lg p-2 m-1 mb-3 border"
		action="/?/submit"
		method="POST"
		enctype="multipart/form-data"
		on:submit|preventDefault={handle_submit}
	>
		{#if form?.missing}
			<p class="text-red-500">Missing group name or files...</p>
		{/if}

		<input
			aria-label="Group name"
			class="p-1 text-base"
			type="text"
			name="group_name"
			placeholder="Group name"
			value={form?.group_name ?? ''}
			required
		/>

		<div class="flex justify-center items-center w-full">
			<input
				class="text-base w-1/2"
				style="margin-bottom: 0 !important;"
				type="file"
				multiple
				bind:files={$input_files}
				accept="*"
				name="files"
				required
			/>
			{#if $uploading}
				<div class="w-1/2">
					<Fa icon={faSpinner} class="animate-spin text-lg" />
				</div>
			{:else}
				<button class="p-1 text-base w-1/2" type="submit"> Upload </button>
			{/if}
		</div>
	</form>

	<ol
		class="flex flex-col justify-center items-center w-10/12 h-auto bg-gray/80 rounded-md shadow-lg p-4 m-4 border"
	>
		{#if $group_list.length === 0}
			<h1 class="text-2xl text-gray-100">Nothing here...</h1>
		{/if}

		{#each $group_list as group}
			<li class="w-full">
				<a
					class="flex justify-between items-center m-1 p-1 w-full hover:border-b hover:shadow-lg"
					href="/group/{group.id}"
				>
					<h1 class="text-md">{group.name}</h1>

					<Edit
						handlers={{
							rename: async () => await handle_group('rename', group),
							delete: async () => await handle_group('delete', group)
						}}
					/>
				</a>
			</li>
		{/each}
	</ol>
</main>
