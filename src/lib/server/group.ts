import { db } from './db';
import type { FileMetaType, GroupType } from '$lib/types'
import { randomUUID } from 'crypto';
import { delete_files } from './files';
;

let collection = db.collection<GroupType>("groups");

export async function create_group(name: string, files: FileMetaType[]) {
    const group = {
        id: randomUUID(),
        name,
        files,
        groups: []
    }

    await collection.insertOne(group);
    return group;
}

export async function get_group(identifier: string): Promise<GroupType | null> {
    const group = await collection.findOne(
        { $or: [{ id: identifier }, { name: identifier }] },
        { projection: { _id: 0 } }
    );

    if (!group) { return null; }
    return group;
}

export async function get_groups() {
    return (await collection.find({}, { projection: { _id: 0 } }).toArray())
}

export async function get_group_file_list(name: string): Promise<FileMetaType[]> {
    const group = await get_group(name);
    if (!group) { return []; }
    return group.files;
}


/**
 * delete a group and all its files
 */
export async function delete_group(id: string) {

    let group = await get_group(id);

    if (!group) { return; }

    // Delete all files
    await delete_files(group.files.map(file => file.id));

    await collection.deleteOne({ id });
}

/**
 * Rename a group
 */
export async function rename_group(id: string, name: string) {
    await collection.updateOne({ id }, { $set: { name } });
}