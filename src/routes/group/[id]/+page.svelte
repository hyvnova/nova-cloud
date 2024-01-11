<script lang="ts">
	import type { PageServerData } from "./$types";

    export let data: PageServerData;
</script>

<main class="flex flex-col justify-center items-center w-screen p-4">
    <h1
        class="text-3xl text-center"
    >{data.name}</h1>

    <ul
        class="mt-4 p-2 m-1 border w-10/12"
    >
        {#each data.files as file}
            <li>
                <a
                    href="/file/{file.id}"
                    class="hover:underline"
                >{file.name}</a>
            </li>
        {/each}
    </ul>
</main> 