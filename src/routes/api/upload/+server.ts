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

function remove_ext(name: string) {
	// Remove extension
	name = name.replace(/\.[^/.]+$/, '');
	return name;
}

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();

	const group_name = formData.get('group') as string; // Group name
	const group_id = formData.get('group_id') as string | null; // If group_id is present, add files to existing group

	const files = formData.getAll('files') as File[];
	console.log('Files', files);

	if (!files || files.length === 0 || !group_name) {
		return json(
			{
				error: 'There are no files or group name'
			},
			{ status: 400 }
		);
	}

	const result: FileMetaType[] = [];

	// Upload files
	for (const file of files) {
		try {
			const id = await upload_file(file);
			result.push({
				id: id,
				type: file.type,
				name: remove_ext(file.name),
				size: file.size
			});
		} catch (e) {
			console.log('Error uploading file', e);
		}
	}

	if (group_id) {
		await group_add_files(group_id, result);
		return json(result, { status: 200 });
	} else {
		const group = await create_group(group_name, result);
		return json(group, { status: 200 });
	}
};
