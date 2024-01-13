import { delete_group, group_remove_file, group_rename_file, rename_group } from '$lib/server/group';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Adding files or creating a group is done in /api/upload
 * This endpoint is manage groups and files
 */

type Params = {
	group_id: string;
	file_id?: string;
	action: 'group delete' | 'group rename' | 'file delete' | 'file rename';
	new_name?: string;
};

export const POST: RequestHandler = async ({ request }) => {
	let req_json = (await request.json()) as unknown as Params;
	const { group_id, file_id, action, new_name } = req_json;

	if (
        // Required parameters
        !group_id || !action 

        // If renaming a file, new_name is required
        || (action.includes('rename') && !new_name)
        
        // If working with a file, file_id is required
        || (action.includes('file') && !file_id)
        ) {
		return json(
			{
				error: 'Invalid parameters'
			},
			{ status: 400 }
		);
	}

	switch (action) {
		case 'group delete':
			// Delete group
			await delete_group(group_id);
			break;
		case 'group rename':
			await rename_group(group_id, new_name as string);
			break;

        // File actions

        case 'file delete':
            // Delete group
            await group_remove_file(group_id, file_id as string)
            break;

        case 'file rename':
            await group_rename_file(group_id, file_id as string, new_name as string);
            break;

        default:
			return json(
				{
					error: 'Invalid action'
				},
				{ status: 400 }
			);
	}

	return new Response(null, { status: 200 });
};
