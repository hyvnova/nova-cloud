import type { GroupType } from "./types";

async function performAction(endpoint: string, id: string | number, action: string, name?: string) {
    let res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            action: action,
            name: name
        })
    });

    if (res.status !== 200) {
        alert(`Something went wrong while ${action} the ${endpoint}.`);
        return false;
    } 
    return name || true;
}

export async function rename_group(group: GroupType) {
    const new_name = prompt('New name', group.name);
    if (!new_name) {
        alert("You need to enter a name");
        return false;
    }
    return performAction('group', group.id, 'rename', new_name);
}

export async function delete_group(group: GroupType) {
    if (!confirm(`Are you sure you want to delete ${group.name}?`)) {
        return false;
    }
    return performAction('group', group.id, 'delete');
}

export async function rename_file(file_id: string) {
    const new_name = prompt('New name');
    if (!new_name) {
        alert("You need to enter a name");
        return false;
    }
    return performAction('file', file_id, 'rename', new_name);
}

export async function delete_file(file_id: string) {
    if (!confirm(`Are you sure you want to delete this file?`)) {
        return false;
    }
    return performAction('file', file_id, 'delete');
}