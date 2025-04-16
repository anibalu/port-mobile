import axios from 'axios';

import { CONTACT_BASE, CONTACT_SHARING_PAUSE, CONTACT_SHARING_RESUME } from "@configs/api";

import { getToken } from '@utils/ServerAuth';


/**
 * Create a contact port
 * @param lineId - line for which the contact port is being created
 * @param active - whether you want the contact port to be active
 * @returns - contact port
 */
export async function getNewContactPort(
    lineId: string,
    active: boolean,
): Promise<string> {
    const token = await getToken();
    const response = await axios.post(
        CONTACT_BASE,
        {
            lineId: lineId,
            active: active,
        },
        { headers: { Authorization: `${token}` } },
    );
    if (response.data?.newContactPort) {
        const contactPort = response.data.newContactPort;
        return contactPort;
    }
    throw new Error('APIError');
}

/**
 * Pause a contact port
 * @param contactPort - contact port to pause
 */
export async function pauseContactPorts(contactPorts: string[]) {
    const token = await getToken();
    try {
        console.log('attempting contact port pause');
        await axios.patch(
            CONTACT_SHARING_PAUSE,
            {
                contactPort: contactPorts,
            },
            {
                headers: { Authorization: `${token}` },
            },
        );
    } catch (error: any) {
        if (typeof error === 'object' && error?.response) {
            if (error.response?.status === 404) {
                return;
            }
        }
        console.log('Error pausing contact port: ', error);
        throw new Error('APIError');
    }
}

/**
 * resume a contact port
 * @param contactPort - contact port to resume
 */
export async function resumeContactPorts(contactPorts: string[]) {
    console.log('attempting contact port resume');
    const token = await getToken();
    try {
        await axios.patch(
            CONTACT_SHARING_RESUME,
            {
                contactPort: contactPorts,
            },
            {
                headers: { Authorization: `${token}` },
            },
        );
    } catch (error: any) {
        if (typeof error === 'object' && error?.response) {
            if (error.response?.status === 404) {
                return;
            }
        }
        console.log('Error resuming contact port: ', error);
        throw new Error('APIError');
    }
}