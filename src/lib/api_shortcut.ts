import type { FileMetaType, GroupType } from "./types";


/**
 * Message attachment upload
 */
export async function upload_files(files: FormData){
    let res = await fetch("/api/upload", {
        method: "POST",
        body: files
    })

    if (!res.ok) {
        console.log("Error uploading attachments", res);
        return res.json() as Promise<{error: string}>;
    }
    return res.json() as Promise<GroupType>;
}