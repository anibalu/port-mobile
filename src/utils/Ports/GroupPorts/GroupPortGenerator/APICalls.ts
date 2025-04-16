import axios from "axios";

import { GROUP_LINKS_MANAGEMENT_RESOURCE } from "@configs/api";

import { getToken } from "@utils/ServerAuth";

/**
 * Fetches new unused group ports for a group
 * @param groupId - Id of the group
 * @returns - array of Port Ids
 */
export async function getNewGroupPorts(groupId: string): Promise<string[]> {
    const token = await getToken();
    //add group links management resource
    const response = await axios.post(
        GROUP_LINKS_MANAGEMENT_RESOURCE,
        {
            groupId: groupId,
        },
        { headers: { Authorization: `${token}` } },
    );
    if (response.data) {
        const connectionLinks: string[] = response.data;
        return connectionLinks;
    }
    throw new Error('APIError');
}