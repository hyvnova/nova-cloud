<script lang="ts">
	import Fa from 'svelte-fa';
	import type { PageServerData } from './$types';
	import { faHome, faSpinner } from '@fortawesome/free-solid-svg-icons';
	import Edit from '$lib/components/Edit.svelte';
	import { writable } from 'svelte/store';
	import { perform_action } from '$lib';
	import toast from '$lib/stores/toast';
	import Toast from '$lib/components/Toast.svelte';
	import type { FileMetaType } from '$lib/types';
	import { bytesToSize, mimeToExt } from '.';
	import type { ActionData } from '../../$types';
	import { goto } from '$app/navigation';
	import { applyAction, enhance } from '$app/forms';
	import { page } from '$app/stores';

	export let data: PageServerData;

	let group_name = writable(data.name); // Store to update UI on rename
	let files = writable(data.files);
	let input_files = writable<FileList | null>(null);
	let uploading = writable(false);

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
				message: form.error || 'Make sure all fields are filled properly.'
			});
			return;
		}

		// clear form
		input_files.set(null);

		let form_files = form.files as FileMetaType[];

		toast.set({
			type: 'info',
			title: 'Success',
			duration: 3000,
			message: `Uploaded ${form_files.length} files to ${form.group_name}!`
		});

		// Add files to UI
		files.update((list) => {
			list.push(...(form_files as FileMetaType[]));
			return list;
		});
	}

	function update_file_name(file_id: string, new_name: string) {
		files.update((list) => {
			const index = list.findIndex((file) => file.id === file_id);
			const extension = list[index].name.split('.').pop();
			list[index].name = `${new_name}.${extension}`;
			return list;
		});
	}

	async function handle_action(
		action: 'group rename' | 'group delete' | 'file rename' | 'file delete',
		group_id: string,
		file_id?: string
	) {
		// returns: either new_name (if renaming) or boolean (false if error)
		const result = await perform_action(action, group_id, file_id);

		// Reflect changes
		if (!result) {
			return;
		} // Error already told

		// If deleting group -> redirect to home
		if (action === 'group delete') {
			if (await perform_action('group delete', group_id)) {
				goto('/');
			}
		}
		// If deleting file -> remove from UI
		else if (action === 'file delete') {
			files.update((list) => list.filter((file) => file.id !== file_id));
		}

		// If renaming
		else if (action.includes('rename')) {
			action.includes('group')
				? group_name.set(result as string) // Rename group
				: update_file_name(file_id as string, result as string); // Rename file
		}
	}

	// On mount calculate total size of group
	let total_size = $files ? $files.reduce((acc, file) => acc + file.size, 0) : 0;

	files.subscribe((list) => {
		total_size = list.reduce((acc, file) => acc + file.size, 0);
	});

	$: if ($page.form) {
		after_submit($page.form);
	}
</script>

<svelte:head>
	<title>{$group_name} - NoVaCloud</title>
	<meta name="description" content="Group: {$group_name} - NoVaCloud file cloud." />
	<meta name="keywords" content="NovaCloud, Group, {$group_name}" />
</svelte:head>

<main class="flex flex-col justify-center items-center p-2 w-auto">
	<nav class="flex justify-between items-center w-full px-4 mb-3">
		<a href="/">
			<Fa icon={faHome} class="text-2xl" />
		</a>

		<h1 class="text-2xl text-center p-1">{$group_name}</h1>

		<Edit
			handlers={{
				rename: async () => await handle_action('group rename', data.id),
				delete: async () => await handle_action('group delete', data.id)
			}}
		/>
	</nav>

	<Toast />

	<!-- upload files-->
	<form
		class="flex flex-col justify-center items-center w-full h-auto bg-gray/80 rounded-md shadow-lg p-2 m-1 mb-3 border"
		enctype="multipart/form-data"
		action="/?/submit"
		method="POST"
		use:enhance={({ formElement }) => {
			// Reset form after submission
			formElement.reset();

			return async ({ result }) => {
				// `result` is an `ActionResult` object
				if (result.type === 'redirect') {
					goto(result.location);
				} else {
					await applyAction(result);
				}
			};
		}}
	>
		<input type="hidden" name="group_id" value={data.id} />

		<div class="flex justify-center items-center w-full">
			<input
				class="text-base w-1/2"
				style="margin: 0 !important; padding: 0.25rem;"
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

	<h3 class="text-xl text-center">{$files.length} files - {bytesToSize(total_size)}</h3>

	<!-- files -->
	<ol
		class="flex flex-col justify-center items-center w-full h-auto bg-gray/80 rounded-md shadow-lg p-4 m-4 border"
	>
		{#if $files.length === 0}
			<p class="text-white text-md">No files uploaded yet...</p>
		{/if}

		{#each $files as file}
			<li class="flex w-full justify-between items-center m-1 p-1">
				<p
					class="text-white text-md hover:text-gray-100 truncate"
					title={file.size / 1024 / 1024 > 1
						? `${(file.size / 1024 / 1024).toFixed(2)} MB`
						: `${(file.size / 1024).toFixed(2)} KB`}
				>
					{bytesToSize(file.size)}
				</p>

				<a href="/file/{file.id}" class="hover:underline truncate" target="_blank">
					<p
						class="
						text-white text-md hover:text-gray-100
						"
					>
						{file.name}
					</p>
				</a>

				<Edit
					handlers={{
						rename: async () => await handle_action('file rename', data.id, file.id),
						delete: async () => await handle_action('file delete', data.id, file.id)
					}}
				/>
			</li>
		{/each}
	</ol>
</main>
