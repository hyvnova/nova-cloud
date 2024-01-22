import type { FileMetaType, GroupType } from './types';
import HugeUploader from 'huge-uploader';

/**
 * Upload/add files to a group
 * * If `group_id` is provided, files will be added to that group
 * - Will return a FileMetaType[] if successful
 * * Otherwise, a new group will be created
 * - Will return a GroupType if successful
 */
export async function upload_files(files: FormData) {
	let [heavy_files, light_files] = Array.from(files.entries()).reduce(
		// @ts-ignore
		(acc: [File[], FormData], [key, value]) => {
			// If file is larger than 5MB, add to heavy_files
			if (value instanceof File && value.size > 5 * 1024 * 1024) {
				acc[0].push(value);
			} else {
				acc[1].append(key, value);
			}
			return acc;
		}
	) as unknown as [File[], FormData];

	console.log({ heavy_files, light_files });

	/**
	 * * Handling heavy files (> 5MB)
	 * - Large files will be uploaded through a separate endpoint
	 *
	 */

	let uploaded_files: FileMetaType[] = [];
    let group: GroupType | null = null;

	for (const value of heavy_files) {
		let uploader = new HugeUploader({
			endpoint: '/api/upload/heavy',
			file: value
		});

        if (process.env.NODE_ENV === 'development') {
            uploader.on('progress', (progress: {detail: number}) => {
                console.log(`${value.name} - ${progress.detail}%`);
            });
        }

        uploader.on('error', (err: {detail: string}) => {
            console.log('Error uploading file', err);
        });

		uploader.on('finish', (body: {detail: FileMetaType | GroupType}) => {
            console.log('Finished uploading file', body);    
            // If GroupType, set group
			if ('files' in body.detail) {
				group = body.detail;
			} else {
				uploaded_files.push(body.detail);
			}        
        });
	}

	/**
	 * * Handling light files (< 5MB)
	 */

	let res = await fetch('/api/upload', {
		method: 'POST',
		body: light_files
	});

	if (!res.ok) {
		console.log('Error uploading attachments', res);
		return res.json() as Promise<{ error: string }>;
	}
	return res.json() as Promise<GroupType | FileMetaType[]>;
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
