import { get_group, get_groups } from "$lib/server/group";
import type { GroupType } from "$lib/types";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    if (!id) return redirect(302, "/");

    const group = await get_group(id) as unknown as GroupType;
    return group;
}