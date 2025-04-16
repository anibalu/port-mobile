import axios from "axios";

import { CONTACT_SHARING_TICKET_MANAGEMENT } from "@configs/api";

import { getToken } from "@utils/ServerAuth";

/**
 * Create a valid ticket for a contact port
 * @param contactPort
 * @param ticket - valid ticket
 * @param message - contains encrypted ticket to be forwarded to contact port owner
 */
export async function createContactPortTicket(
    contactPort: string,
    ticket: string,
    lineId: string,
    message: object,
) {
    try {
        const token = await getToken();
        await axios.post(
            CONTACT_SHARING_TICKET_MANAGEMENT,
            {
                contactPort: contactPort,
                ticket: ticket,
                lineId: lineId,
                message: message,
            },
            { headers: { Authorization: `${token}` } },
        );
    } catch (error: any) {
        if (typeof error === 'object' && error?.response) {
            if (
                error.response?.status === 404 ||
                error.response?.status === 401 ||
                error.response?.status === 400 ||
                error.response?.status === 403
            ) {
                throw new Error('PermissionError');
            }
        }
        console.log('Error pausing contact port: ', error);
        throw new Error('APIError');
    }
}
