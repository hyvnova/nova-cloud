import { writable, type Writable } from "svelte/store";

let open_edit_store = writable<Writable<boolean> | null>(null);

export default open_edit_store;