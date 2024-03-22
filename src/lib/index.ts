import type { FileMetaType, GroupType } from './types';

// @ts-ignore
import HugeUploader from 'huge-uploader';

/**
 * Upload/add files to a group
 * * If `group_id` is provided, files will be added to that group
 * - Will return a FileMetaType[] if successful
 * * Otherwise, a new group will be created
 * - Will return a GroupType if successful
 */
export async function upload_files(form: FormData) {
	/**
	 * form = {
	 *     files: [File, File, ...],
	 *     groud_id?: string
	 *     group: string # group name
	 * }	
	 */

	let files: File[] = form.getAll("files") as File[];


	// Form used when sending upload files request
	let request_form = new FormData();

	// If there's a groud_id parameter use it. 
	request_form.append('group', form.get('group') as string);
	if (form.get('group_id')) request_form.append('group_id', form.get('group_id') as string);

	for (const value of files) {
		request_form.append('files', value);
	}

	let res = await fetch('/api/upload', {
		method: 'POST',
		body: request_form
 	});

	if (!res.ok) {
		console.log('Error uploading attachments', res);
		return res.json() as Promise<{ error: string }>;
	}

	let json = await res.json() as FileMetaType[] | GroupType;

	return json;
}

export async function perform_action(
	action: 'group delete' | 'group rename' | 'file delete' | 'file rename',
	group_id: string,
	file_id?: string
) {
	// If renaming a file, ask for new name
	let new_name: string | null = null;
	if (action.includes('rename')) {
		new_name = prompt('Enter new name');
		if (!new_name) {
			alert('You need to enter a name');
			return false;
		}
	}

	// If deleting a file, ask for confirmation
	if (action.includes('delete') && !confirm(`Are you sure you want to delete this?`)) {
		return false;
	}

	let res = await fetch(`/api/group`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			group_id: group_id,
			action: action,
			file_id: file_id,
			new_name: new_name
		})
	});

	if (res.status !== 200) {
		alert(`Something went wrong while performing ${action}.`);
		return false;
	}
	return new_name || true;
}
