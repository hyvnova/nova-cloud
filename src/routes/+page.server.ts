import { upload_file } from '$lib/server/files';
import { create_group, get_groups, group_add_files } from '$lib/server/group';
import type { FileMetaType, GroupType } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let groups = await get_groups();

	return {
		groups
	};
};

export const actions = {
	submit: async ({ request }) => {
		// Handle file upload and/or group creation

		const form = await request.formData();

		let [group_name, files, group_id] = [
			form.get('group_name') as string | undefined,
			form.getAll('files') as File[] | undefined,
			form.get('group_id') as string | undefined
		];

		/**
		 * * Error handling
		 * If missing group_name or file, return 400 status code
		 */
		if (!group_name && !group_id) {
			return fail(400, { group_name, missing: true });
		}
		if (!files) {
			return fail(400, { files, missing: true });
		}

		// If total upload size is bigger than 4.5MB, reject
		if ((files.reduce((total, file) => total + file.size, 0) / 1024 / 1024) >= 4.5) {
			return fail(400, { error: "Upload size needs to be less than 4.5MB"})
		}

		// Upload files to db
		let uploaded_files_meta: FileMetaType[] = [];
		for (let file of files) {
			const file_id = await upload_file(file);
			uploaded_files_meta.push({
				id: file_id,
				name: file.name,
				size: file.size,
				type: file.type
			});
		}

		/**
		 * * Handle file upload
		 * If `group_id` is not provided, create a new group
		 */
		let group: GroupType | undefined = undefined; // If defined, will be returned
		if (!group_id) {
			group = await create_group(group_name as string, uploaded_files_meta);
			group_id = group.id;

			// For some reason _id is being sent, I give up.
			// @ts-ignore
			group._id = null;
		} else {
			// Add files to group
			await group_add_files(group_id, uploaded_files_meta);
		}

		console.log('group:', group);
		console.log('uploaded_files_meta:', uploaded_files_meta);

		return {
			status: 200,
			group_name,
			...(group ? { group: group } : { files: uploaded_files_meta })
		};
	}
} satisfies Actions;

