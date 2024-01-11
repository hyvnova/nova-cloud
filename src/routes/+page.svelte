<script lang="ts">
	import { writable } from 'svelte/store';
	import type { PageServerData } from './$types';
	import { upload_files } from '$lib/api_shortcut';
	import type { GroupType } from '$lib/types';
	import Toast from '$lib/components/Toast.svelte';
	import toast from '$lib/stores/toast';
	import Fa from 'svelte-fa';
	import { faEdit, faTrashCan } from '@fortawesome/free-solid-svg-icons';

	export let data: PageServerData;

	// Form
	let files = writable<FileList | null>(null);
	let file_input: HTMLInputElement;
	let group_name: string;

	let group_list = writable(data.groups);

	async function handle_upload() {
		if (!$files) {
			return;
		}

		const formData = new FormData();
		formData.append('group', group_name);
		for (const file of $files) {
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

		file_input.files = null;
		files.set(null);
	}

	async function handle_group(action: string, group: GroupType) {
		let res: Response;

		switch (action) {
			case 'rename':
				const new_name = prompt('New name', group.name);
				if (!new_name) {
					alert("You need to enter a name");
					break;
				}

				// request to update name
				res = await fetch(`/api/group`, {
					method: 'POST',
					body: JSON.stringify({
						id: group.id,
						action,
						name: new_name
					})
				});

				if (res.status !== 200) {
					alert('Something went wrong while renaming the group.');
					break;
				}

				// Update list to reflect new name
				group_list.update((list) => {
					return list.map((g) => {
						if (g.id === group.id) {
							g.name = new_name;
						}
						return g;
					});
				});

				break; 


			case 'delete':
				if (!confirm(`Are you sure you want to delete ${group.name}?`)) {
					break;
				}

				res = await fetch(`/api/group`, {
					method: 'POST',
					body: JSON.stringify({
						id: group.id,
						action
					})
				});

				if (res.status !== 200) {
					alert('Something went wrong while deleting the group.');
					break;
				}

				// Remove from list
				group_list.update((list) => {
					return list.filter((g) => g.id !== group.id);
				});

				break;
			}
	}
</script>

<main class="flex flex-col justify-center items-center w-screen p-4">
	<Toast />

	<!-- upload files-->
	<form
		class="flex flex-col justify-center items-center w-10/12 h-auto bg-gray/80 rounded-md shadow-lg p-3 m-4 border"
		on:submit|preventDefault={handle_upload}
	>
		<input type="text" name="group" placeholder="Group name" bind:value={group_name} required />

		<input
			type="file"
			multiple
			bind:files={$files}
			accept="*"
			name="file"
			bind:this={file_input}
			required
		/>
		<button type="submit">Upload</button>
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

					<!-- Edit buttons -->
					<div class="flex justify-between items-center">
						<button
							class="p-2 mx-1 rounded-md shadow-md"
							on:click|preventDefault={() => handle_group('rename', group)}
						>
							<Fa icon={faEdit} />
						</button>

						<button
							class="p-2 mx-1 rounded-md shadow-md"
							on:click|preventDefault={() => handle_group('delete', group)}
						>
							<Fa icon={faTrashCan} />
						</button>
					</div>
				</li>
			</a>
		{/each}
	</ol>
</main>
