/**
 *  ROUTE: /api/file
 * METHOD: GET
 * Returns file data
 */

import { exists, get_file } from "$lib/server/files";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {

    const id = params.id;

    if (!id || !await exists(id)) {
        return new Response(null, { status: 404, statusText: "File not found" });
    }

    let file = await get_file(id);

    if (!file) {
        return new Response(null, { status: 404, statusText: "File not found" });
    }

    return new Response(
        file.data,
        {
            status: 200,
            headers: {
                "Content-Type": file.type,
                "Content-Disposition": `attachment; filename=${file.name}`
            }
        }
    );
};