import type { Writable } from "svelte/store";

export type FileMetaType = {
    id: string,
    type: string,
    name: string,
    size: number // in bytes
}


export type GroupType = {
    id: string,
    name: string, // Display name
    files: FileMetaType[],
    groups: GroupType[]
}

export type ToastType = Writable<{
    type: "error" | "info";
    title: string;
    message: string;
    duration?: number;
} | null>;
