<script lang="ts">
	import { writable } from 'svelte/store';
	import type { PageServerData } from './$types';
	import type { GroupType } from '$lib/types';
	import Toast from '$lib/components/Toast.svelte';
	import toast from '$lib/stores/toast';
	import Edit from '$lib/components/Edit.svelte';
	import { perform_action, upload_files } from '$lib/index';

	export let data: PageServerData;

	// Form
	let input_files = writable<FileList | null>(null);
	let file_input_element: HTMLInputElement;
	let group_name: string;

	let group_list = writable(data.groups);

	async function handle_upload() {
		if (!$input_files) {
			return;
		}

		const formData = new FormData();
		formData.append('group', group_name);
		for (const file of $input_files) {
			formData.append('files', file);
		}

		let group = await upload_files(formData);

		if ('error' in group && group.error) {
			toast.set({
				title: 'Error',
				message: 'Something went wrong while uploading the files.',
				type: 'error',
				duration: 3000
			});

			return;
		}

		group_list.update((list) => {
			list.push(group as GroupType);
			return list;
		});

		file_input_element.files = null;
		input_files.set(null);
	}

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
</script>

<main class="flex flex-col justify-center items-center w-auto p-4 ">
	<Toast />

	<!-- upload files-->
	<form
		class="flex flex-col justify-center items-center w-full h-auto bg-gray/80 rounded-md shadow-lg p-2 m-1 mb-3 border"
		on:submit|preventDefault={handle_upload}
	>
		<input
			class="p-1 text-base"
			type="text"
			name="group"
			placeholder="Group name"
			bind:value={group_name}
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
				name="file"
				bind:this={file_input_element}
				required
			/>
			<button class="p-1 text-base w-1/2" type="submit"> Upload </button>
		</div>
	</form>

	<ol
		class="flex flex-col justify-center items-center w-10/12 h-auto bg-gray/80 rounded-md shadow-lg p-4 m-4 border"
	>
		{#if $group_list.length === 0}
			<h1 class="text-2xl text-gray-100">Nothing here...</h1>
		{/if}

		{#each $group_list as group}
			<a class="w-full" href="/group/{group.id}">
				<li class="flex justify-between items-center m-1 p-1 w-full hover:border-b hover:shadow-lg">
					<h1 class="text-md">{group.name}</h1>

					<Edit
						handlers={{
							rename: async () => await handle_group('rename', group),
							delete: async () => await handle_group('delete', group)
						}}
					/>
				</li>
			</a>
		{/each}
	</ol>
</main>
