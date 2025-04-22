import { z } from 'zod';

import { BUNDLE_ID_PREPEND_LINK } from '@configs/api';
import { DEFAULT_NAME, NAME_LENGTH_LIMIT , ORG_NAME } from "@configs/constants";




import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import { generateRandomHexId } from '@utils/IdGenerator';
import { jsonToUrl } from '@utils/JsonToUrl';
import { ContactPortTicketParams, ContentType, PayloadMessageParams } from '@utils/Messaging/interfaces';
import { getBundleId } from '@utils/Ports/APICalls';
import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { getChatIdFromPairHash } from '@utils/Storage/connections';
import * as storageContactPorts from "@utils/Storage/contactPorts";
import { AcceptedContactPortData } from "@utils/Storage/DBCalls/ports/contactPorts";
import { BundleTarget } from '@utils/Storage/DBCalls/ports/interfaces';
import { generateISOTimeStamp } from '@utils/Time';

import AcceptedContactPortGenerator from "../AcceptedContactPortGenerator";
import * as API from '../APICalls';

const ACCEPTED_CONTACT_PORT_GENERATOR_VERSION = '1.0.0';

const AcceptedContactPortBundleSchema = z.object({
    portId: z.string().length(32).regex(/^[0-9a-f]{32}$/),
    version: z.literal(ACCEPTED_CONTACT_PORT_GENERATOR_VERSION),
    org: z.literal(ORG_NAME),
    target: z.literal(BundleTarget.contactPort),
    name: z.string().max(NAME_LENGTH_LIMIT).optional(),
    rad: z.string().length(32).regex(/^[0-9a-f]{32}$/),
    keyHash: z.string().length(64).regex(/^[0-9a-f]{64}$/),
    pubkey: z.string().length(64).regex(/^[0-9a-f]{64}$/),
});

type AcceptedContactPortBundle_1_0_0 = z.infer<typeof AcceptedContactPortBundleSchema>;

class AcceptedContactPortGenerator_1_0_0 extends AcceptedContactPortGenerator {
    version: string = ACCEPTED_CONTACT_PORT_GENERATOR_VERSION;
    private bundle: DirectContactPortBundle | null = null;
    private bundleId: string | null = null;

    /**
     * Validates the contact port bundle
     * @param bundleData - The contact port bundle data to validate.
     * @returns The validated contact port bundle.
     * @throws {Error} If the bundle data is invalid.
     */
    static validateBundle(bundleData: any): DirectContactPortBundle {
        const parsedBundle: AcceptedContactPortBundle_1_0_0 = AcceptedContactPortBundleSchema.parse(bundleData);
        // DirectContactPortBundle is a superset of AcceptedContactPortBundle_1_0_0
        return parsedBundle as DirectContactPortBundle;
    }

    /**
     * Creates a new accepted contact port
     * @param pairHash - The pair hash to create the accepted contact port for.
     * @param bundleData - The contact port bundle data to create the accepted contact port from.
     * @returns The created accepted contact port data.
     */
    static async create(pairHash: string, bundleData: DirectContactPortBundle): Promise<AcceptedContactPortData | null> {
        try {
            //we can assume that bundle data is validated
            const validatedBundle = bundleData as AcceptedContactPortBundle_1_0_0;
            //check if an accepted contact port already exists
            const existingAcceptedContactPort = await storageContactPorts.getAcceptedContactPortDataFromPairHash(pairHash);
            //if it does, replace the existing accepted contact port with the new one
            if (existingAcceptedContactPort) {
                await storageContactPorts.deleteContactPortData(existingAcceptedContactPort.portId);
            }
            //if it doesn't, create a new accepted contact port
            const cryptoDriver = new CryptoDriver();
            await cryptoDriver.createForContactPort({
                publicKey: validatedBundle.pubkey,
                rad: validatedBundle.rad,
                peerPublicKeyHash: validatedBundle.keyHash,
            });
            const cryptoId = cryptoDriver.getCryptoId();
            const acceptedContactPort: AcceptedContactPortData = {
                portId: validatedBundle.portId,
                pairHash: pairHash,
                owner: false,
                version: validatedBundle.version,
                createdOnTimestamp: generateISOTimeStamp(),
                cryptoId: cryptoId,
            }
            await storageContactPorts.acceptContactPort(acceptedContactPort);
            return acceptedContactPort;
        } catch (error) {
            console.log('Error accepting accepted contact port', error);
            return null;
        }
    }

    /**
     * Gets the version of the accepted contact port generator
     * @returns - version of the accepted contact port generator
     */
    getVersion(): string {
        return this.version;
    }

    /**
     * Gets the port data of the accepted contact port
     * @returns - port data of the accepted contact port
     */
    getPort(): AcceptedContactPortData {
        return this.portData;
    }

    /**
     * Gets the shareable bundle of the accepted contact port
     * @returns - shareable bundle of the accepted contact port
     */
    async getShareableBundle(): Promise<DirectContactPortBundle> {
        if (this.bundle) {
            return this.bundle;
        }
        const chatId = await getChatIdFromPairHash(this.portData.pairHash);
        if (!chatId) {
            throw new Error('No chat id found for accepted contact port');
        }
        const ticket = generateRandomHexId();
        const ticketParams: ContactPortTicketParams = {
            ticketId: ticket,
            contactPortId: this.portData.portId,
        };
        const payload: PayloadMessageParams = {
            messageId: generateRandomHexId(),
            contentType: ContentType.contactPortTicket,
            data: ticketParams,
        };
        const plaintext = JSON.stringify(payload);
        const chat = new DirectChat(chatId);
        const chatData = await chat.getChatData();
        const cryptoDriver = new CryptoDriver(chatData.cryptoId);
        const message = { encryptedContent: await cryptoDriver.encrypt(plaintext) };
        await API.createContactPortTicket(
            this.portData.portId,
            ticket,
            chatData.lineId,
            message,
        );
        const contactPortCryptoData = await new CryptoDriver(
            this.portData.cryptoId,
        ).getContactPortData();
        this.bundle = {
            portId: this.portData.portId,
            version: this.portData.version,
            org: ORG_NAME,
            target: BundleTarget.contactPort,
            name: chatData.name || DEFAULT_NAME,
            rad: contactPortCryptoData.rad,
            keyHash: contactPortCryptoData.peerPublicKeyHash,
            pubkey: contactPortCryptoData.publicKey,
            ticket: ticket,
        };
        return this.bundle;
    }

    /**
     * Gets the shareable link of the accepted contact port
     * @returns - shareable link of the accepted contact port
     */
    async getShareableLink(): Promise<string> {
        if (this.bundleId) {
            return BUNDLE_ID_PREPEND_LINK + this.bundleId;
        } else {
            const bundle = await this.getShareableBundle();
            try {
                this.bundleId = await getBundleId(JSON.stringify(bundle), false);
                return BUNDLE_ID_PREPEND_LINK + this.bundleId;
            } catch (error) {
                console.log('Error getting shareable link: ', error);
                //If that fails, construct the port data as a link.
                const longLink = jsonToUrl(bundle as any);
                if (!longLink) {
                    throw new Error('Error getting shareable link');
                }
                return longLink;
            }
        }
    }

    /**
     * Cleans the accepted contact port
     */
    async clean(): Promise<void> {
        try {
            await storageContactPorts.deleteContactPortData(this.portData.portId);
        } catch (error) {
            console.log('Error cleaning accepted contact port', error);
        }
    }
}

export default AcceptedContactPortGenerator_1_0_0;