import { get_groups } from "$lib/server/group";
import type { GroupType } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const groups = await get_groups() as unknown as GroupType[]  ;
    return {
        groups
    }
}