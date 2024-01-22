/**
 * Handle heavy file upload (> 5MB)
 * Takes FormData containing file and uploads them to the server
 *
 * @param {FormData} formData - FormData object containing files
 */

import { upload_file } from '$lib/server/files';
import { create_group, get_group, group_add_file, group_add_files } from '$lib/server/group';
import type { FileMetaType } from '$lib/types';
import { json, type RequestHandler } from '@sveltejs/kit';
import 'dotenv/config';

function remove_ext(name: string) {
	// Remove extension
	name = name.replace(/\.[^/.]+$/, '');
	return name;
}

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();

	const group_name = formData.get('group') as string; // Group name
	const group_id = formData.get('group_id') as string | null; // If group_id is present, add files to existing group

	const file = formData.get('file') as File; // File
	console.log(formData);

	// If no file is present, return empty array
	if (!file) {
		return json([], { status: 200 });
	}

	if (!group_name) {
		return json(
			{
				error: 'There is no group name. Where the fuck do I upload this file to then?'
			},
			{ status: 400 }
		);
	}

	let result: FileMetaType;

	// Upload file
	try {
		const id = await upload_file(file);
		result = {
			id: id,
			type: file.type,
			name: remove_ext(file.name),
			size: file.size
		};
	} catch (e) {
		console.log('Error uploading file', e);
		return json(
			{
				error: 'Error uploading file'
			},
			{ status: 500 }
		);
	}

	// Uploading to a existing group
	if (group_id) {
		await group_add_file(group_id, result);
		return json(result, { status: 200 });

		// Create a new group
	} else {
		const group = await create_group(group_name, [result]);
		return json(group, { status: 200 });
	}
};
