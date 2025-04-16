import axios from "axios";

import { LINE_MANAGEMENT_RESOURCE } from "@configs/api";

import { getToken } from "@utils/ServerAuth";

interface newLineData {
    lineId: string;
    pairHash: string;
}

export interface IntroMessage {
    pubkey: string;
    encryptedSecretContent: string;
}

export async function newDirectChatFromContactPort(
    contactPortId: string,
    introMessage: IntroMessage,
    ticket: string,
): Promise<newLineData> {
    const token = await getToken();
    const response = await axios.post(
        LINE_MANAGEMENT_RESOURCE,
        {
            ticket: ticket,
            contactPortId: contactPortId,
            introMessage: introMessage,
        },
        { headers: { Authorization: `${token}` } },
    );
    if (response.data.newLine) {
        const lineId: string = response.data.newLine;
        const pairHash: string = response.data.pairHash;
        return { lineId, pairHash };
    }
    throw new Error('APIError');
}     