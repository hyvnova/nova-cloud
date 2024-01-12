import { delete_file, rename_file } from "$lib/server/files";
import { json, type RequestHandler } from "@sveltejs/kit";


type ExpectedParams = {
    id: string;
    action: "delete" | "rename";
    name?: string;
}

export const POST: RequestHandler = async ({ request }) => {
    let req_json = await request.json() as unknown as ExpectedParams;
    const { id, action, name } = req_json;

    if (!id || !action || (action === "rename" && !name)) {
        return json({
            error: "Invalid parameters. Received: " + JSON.stringify(req_json) + "."
        }, { status: 400 })
    }


    switch (action) {
        case "delete":
            // Delete group
            await delete_file(id)
            break;
        case "rename":
            await rename_file(id, name as string)
            break;
        default:
            return json({
                error: "Invalid action"
            }, { status: 400 })
    }

    return new Response(null, { status: 200 });

}