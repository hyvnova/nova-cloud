import type { FileMetaType, GroupType } from "./types";



/**
 * Upload/add files to a group
 * * If `group_id` is provided, files will be added to that group
 * - Will return a FileMetaType[] if successful
 * * Otherwise, a new group will be created
 * - Will return a GroupType if successful
 */
export async function upload_files(files: FormData) {
    let res = await fetch("/api/upload", {
        method: "POST",
        body: files
    })

    if (!res.ok) {
        console.log("Error uploading attachments", res);
        return res.json() as Promise<{error: string}>;
    }
    return res.json() as Promise<GroupType | FileMetaType[]>;
}

export async function perform_action(
	action: 'group delete' | 'group rename' | 'file delete' | 'file rename',
	group_id: string,
	file_id?: string,
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
