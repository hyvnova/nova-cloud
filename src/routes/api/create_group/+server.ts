import { create_group } from '$lib/server/group';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Create and return a group
 * @param name - name of the group
 */
export const POST: RequestHandler = async ({ request }) => {
	const { name } = await request.json();

	if (!name)
		json(
			{
				error: 'Missing group name. { name: "Is not that hard" }'
			},
			{ status: 422 }
		);

	const group = await create_group(name);

	return json({ group }, { status: 200 });
};
