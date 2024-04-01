/**
 * Handle file upload
 * Takes FormData containing files and uploads them to the server
 *
 * @param {FormData} formData - FormData object containing files
 */

import { upload_file } from '$lib/server/files';
import { create_group, get_group, group_add_files } from '$lib/server/group';
import type { FileMetaType } from '$lib/types';
import { json, type RequestHandler } from '@sveltejs/kit';
import 'dotenv/config';

export const POST: RequestHandler = async ({ request }) => {
	let {group_name, group_id, files}: {
		group_name: string;
		group_id: string;
		files: FileMetaType[];
	} = await request.json();

	if (!files || files.length === 0 || !group_name) {
		return json(
			{
				error: 'There are no files or group name'
			},
			{ status: 400 }
		);
	}

	// @ts-ignore
	await group_add_files(group_id, files);
	return new Response(null, {
		status: 200
	})
};
