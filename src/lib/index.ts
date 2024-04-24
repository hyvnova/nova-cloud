import type { FileMetaType, GroupType } from './types';

/*
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


	// @ts-ignore
	let group: GroupType = {
		id: form.get("grop_id") as string
	};

	// Form used when sending upload files request
	let request_json = {
		group_name: form.get('group') as string,
		group_id: form.get('group_id') as string,
		files: [] as FileMetaType[]
	};

	// If no form_id create a new group
	if (!form.get('group_id')) {
		let res = await fetch('/api/create_group', {
			method: 'POST',
			headers: {
    			'Content-Type': 'application/json'
  			},
			body: JSON.stringify({ name: form.get("group")})
		});

		if (!res.ok) {
			console.error("Error creating group: " + form.get("group"))	
			return (await res.json()) as { error: string };
		}

		let json = await res.json()
		group = JSON.parse(json);
		request_json.group_id = group.id
	}

	// Create blobs -- upload files to vercel blob
	for (const file of files) {
		const blob =  await put(`${group.id}/${file.name}`, file, { access: 'public' });
		request_json.files.push({
			id: `blob.url`,
			name: file.name,
			size: file.size,
			type: file.type
		});
	}

	// Make upload request
	let res = await fetch('/api/upload', {
		method: 'POST',
		headers: {
    		'Content-Type': 'application/json'
  		},
		body: JSON.stringify(request_json)
	});

	if (!res.ok) {
		console.log('Error uploading attachments', res);
		return (await res.json()) as { error: string };
	}

	let json = (await res.json()) as FileMetaType[] | GroupType;

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


	// Send request to server to perform action
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
