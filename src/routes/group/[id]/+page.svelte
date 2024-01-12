<script lang="ts">
	import Fa from 'svelte-fa';
	import type { PageServerData } from './$types';
	import { faHome } from '@fortawesome/free-solid-svg-icons';
	import Edit from '$lib/components/Edit.svelte';
	import { writable } from 'svelte/store';
	import { redirect } from '@sveltejs/kit';
	import { delete_file, delete_group, rename_file, rename_group } from '$lib';

	export let data: PageServerData;

	let group_name = writable(data.name); // Store to update UI on rename

	async function handle_group(action: string) {
		switch (action) {
			case 'rename':
				let new_name = await rename_group(data);
				if (!new_name) {
					break;
				} // Error already handled
				group_name.set(new_name as string);

			case 'delete':
				if (!(await delete_group(data))) {
					break;
				} // Error already handled

				throw redirect(302, '/');
		}
	}

	async function handle_file(file_id: string, action: string) {
		switch (action) {
			case 'rename':
				let new_name = await rename_file(file_id);
				if (!new_name) {
					break;
				} // Error already handled
				group_name.set(new_name as string);

			case 'delete':
				if (!(await delete_file(file_id))) {
					break;
				} // Error already handled

				throw redirect(302, '/');
		}
	}
</script>

<main class="flex flex-col justify-center items-center max-w-full p-2">
	<nav class="flex justify-between items-center w-full px-4 my-1">
		<a href="/">
			<Fa icon={faHome} class="text-2xl" />
		</a>

		<h1 class="text-2xl text-center">{$group_name}</h1>

		<Edit
			handlers={{
				rename: async () => await handle_group('rename'),
				delete: async () => await handle_group('delete')
			}}
		/>
	</nav>

	<ol
		class="flex flex-col justify-center items-center w-10/12 h-auto bg-gray/80 rounded-md shadow-lg p-4 m-4 border"
	>
		{#each data.files as file}
			<li class="flex w-full justify-between items-center m-1 p-1">
				<a href="/file/{file.id}" class="hover:underline">
					<p class="text-white text-md hover:text-gray-100">{file.name}</p>
				</a>
<!-- 
				<Edit
					handlers={{
						rename: async () => await handle_file(file.id, 'rename'),
						delete: async () => await handle_file(file.id, 'delete')
					}}
				/> -->
			</li>
		{/each}
	</ol>
</main>
