import type { ToastType } from "$lib/types";
import { writable } from "svelte/store";


const toast: ToastType = writable(null);
export default toast;
