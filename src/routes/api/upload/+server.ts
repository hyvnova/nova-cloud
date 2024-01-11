/**
 * Handle message attachments upload
 * Takes FormData containing files and uploads them to the server
 * 
 * @param {FormData} formData - FormData object containing files 
 * @returns {Promise<AttachmentType[]>}
 */

import { upload_file } from "$lib/server/files";
import { create_group } from "$lib/server/group";
import type { FileMetaType } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import "dotenv/config";

export const POST: RequestHandler = async ({ request }) => {
    const formData = await request.formData();

    const group_name = formData.get("group") as string; // Group name

    const files = formData.getAll("files") as File[];
    console.log("Files", files);

    if (!files || files.length === 0 || !group_name) {
        return json({
            error: "There are no files or group name"
        }, { status: 400 });
    }

    const result: FileMetaType[] = [];

    // Upload files
    for (const file of files) {
        try{
            const id = await upload_file(file);
            result.push({
                id: id,
                type: file.type,
                name: file.name,
                size: file.size
            });
        } catch (e) {
            console.log("Error uploading file", e);
        }
    }

    const group = await create_group(group_name, result);

    return json(group, { status: 200 });
};
