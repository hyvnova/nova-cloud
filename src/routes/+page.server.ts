import { upload_file } from '$lib/server/files';
import { create_group, get_groups, group_add_files } from '$lib/server/group';
import type { FileMetaType, GroupType } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const groups = (await get_groups()) as unknown as GroupType[];
	return {
		groups
	};
};

export const actions = {
	default: async ({ request }) => {
		// Handle file upload and/or group creation

		const form = await request.formData();

		let [group_name, files, group_id]  = [
            form.get('group_name') as string | undefined,
            form.getAll('files') as File[] | undefined,
            form.get('group_id') as string | undefined
        ];

        /**
         * * Error handling
         * If missing group_name or file, return 400 status code
         */
        if (!group_name) {
            return fail(400, { group_name, missing: true} );
        } 
        if (!files) {
            return fail(400, { files, missing: true} );
        }

        /**
         * * Handle file upload
         * If `group_id` is not provided, create a new group
         */
        let group: GroupType | undefined = undefined; // If defined, will be returned
        if (!group_id) {
            group = await create_group(group_name);
            group_id = group.id;
        }

        // Handle file upload   
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

        // Add files to group 
        await group_add_files(group_id, uploaded_files_meta);

        if (group) {
            return {
                status: 200,
                body: group 
            };
        } else {
            return {
                status: 200,
                body: uploaded_files_meta 
            };
        }

	}
} satisfies Actions;
