import { DEFAULT_NAME, ORG_NAME } from "@configs/constants";

import CryptoDriver from "@utils/Crypto/CryptoDriver";
import DirectChat from "@utils/DirectChats/DirectChat";
import { generatorInitialInfoSend } from "@utils/DirectChats/initialInfoExchange";
import { generateRandomHexId } from "@utils/IdGenerator";
import { ContentType, MessageStatus } from "@utils/Messaging/interfaces";
import { setRemoteNotificationPermissionForDirectChat } from "@utils/Notifications";
import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { getProfileName } from "@utils/Profile";
import { isUserBlocked } from "@utils/Storage/blockUsers";
import { addConnection, getBasicConnectionInfo, getChatIdFromPairHash, updateConnectionOnNewMessage } from "@utils/Storage/connections";
import * as storageContactPorts from "@utils/Storage/contactPorts";
import { addContact } from "@utils/Storage/contacts";
import { ChatType } from "@utils/Storage/DBCalls/connections";
import { LineDataEntry } from "@utils/Storage/DBCalls/lines";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { ContactPortData } from "@utils/Storage/DBCalls/ports/contactPorts";
import { BundleTarget } from "@utils/Storage/DBCalls/ports/interfaces";
import { addLine, checkLineExists, readLineData } from "@utils/Storage/lines";
import * as permissionStorage from "@utils/Storage/permissions";
import { generateISOTimeStamp } from "@utils/Time";

import * as API from '../APICalls';
import SharedContactPortGenerator from "../SharedContactPortGenerator";

const SHARED_CONTACT_PORT_GENERATOR_VERSION = '1.0.0';

/**
 * Intro message received from the port reader after a successful port use.
 */
interface IntroMessage {
    pubkey: string;
    encryptedSecretContent: string;
}

/**
 * Decrypted version of intro message secret content.
 */
interface PlaintextSecretContent {
    rad: string;
    name: string;
    ticket: string;
}

class SharedContactPortGenerator_1_0_0 extends SharedContactPortGenerator {
    version: string = SHARED_CONTACT_PORT_GENERATOR_VERSION;

    /**
     * Creates a new shared contact port
     * @param pairHash - pairHash of the contact
     * @param folderId - folderId of the contact
     * @param permissions - permissions of the contact
     * @returns - contact port data
     */
    static async create(pairHash: string, folderId: string, permissions: PermissionsStrict): Promise<ContactPortData | null> {
        try {
            //check if a shared contact port already exists
            const existingSharedContactPort = await storageContactPorts.getContactPortDataFromPairHash(pairHash);
            //if it does, return the existing shared contact port
            if (existingSharedContactPort) {
                return existingSharedContactPort;
            }
            //else, create a new shared contact port
            const chatId = await getChatIdFromPairHash(pairHash);
            //if there is no chat associated with the pairHash, throw an error
            if (!chatId) {
                throw new Error('No chat associated with pairHash');
            }
            const chat = new DirectChat(chatId);
            const chatData = await chat.getChatData();
            //if the chat is disconnected or unauthenticated, throw an error
            if (chatData.disconnected || !chatData.authenticated) {
                throw new Error('Chat is disconnected or unauthenticated');
            }
            //get the permissions for the chat
            const chatPermissions = await chat.getPermissions();
            //create a new shared contact port
            const contactPortId = await API.getNewContactPort(
                chatData.lineId,
                chatPermissions.contactSharing,
            );
            //create new crypto Id
            const cryptoDriver = new CryptoDriver();
            await cryptoDriver.create();
            const cryptoId = cryptoDriver.getCryptoId();
            //create new permissions Id
            const permissionsId = generateRandomHexId();
            await permissionStorage.addPermissionEntry({
                permissionsId: permissionsId,
                ...permissions,
            });
            //create new contact port data
            const contactPortData: ContactPortData = {
                portId: contactPortId,
                pairHash: pairHash,
                owner: true,
                version: SHARED_CONTACT_PORT_GENERATOR_VERSION,
                createdOnTimestamp: generateISOTimeStamp(),
                cryptoId: cryptoId,
                connectionsMade: 0,
                folderId: folderId,
                paused: !chatPermissions.contactSharing,
                permissionsId: permissionsId,
            }
            //add the contact port data to storage
            await storageContactPorts.addContactPort(contactPortData);
            //return the contact port data
            return contactPortData;
        } catch (error) {
            console.log('Error creating shared contact port', error);
            return null;
        }
    }

    /**
     * Gets the version of the shared contact port generator
     * @returns - version of the shared contact port generator
     */
    getVersion(): string {
        return this.version;
    }

    /**
     * Gets the port data of the shared contact port
     * @returns - port data of the shared contact port
     */
    getPort(): ContactPortData {
        return this.portData;
    }

    /**
     * Accepts a ticket for the shared contact port
     * @param ticketId - ticketId of the ticket
     * @param chatId - chatId of the chat
     */
    async acceptTicket(ticketId: string, chatId: string): Promise<void> {
        try {
            console.log('Accepting ticket for shared contact port');
            //if the port is paused, do not accept the ticket.
            //Also, inform the server that the contact port is paused.
            if (this.portData.paused) {
                console.log('Contact port is paused. Not accepting ticket.');
                this.pause();
                return;
            }
            const connection = await getBasicConnectionInfo(chatId);
            //if pairHashes match and the contact port is not paused, accept the ticket.
            if (connection.pairHash === this.portData.pairHash) {
                await storageContactPorts.addContactPortTicket({
                    contactPortId: this.portData.portId,
                    ticketId: ticketId,
                    active: true,
                });
            }
        } catch (error) {
            console.log('Error accepting contact port ticket: ', error);
        }
    }

    /**
     * Gets the shareable bundle of the shared contact port
     * @returns - shareable bundle of the shared contact port
     */
    async getShareableBundle(): Promise<DirectContactPortBundle> {
        const name = await getProfileName();
        const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
        const rad = await cryptoDriver.getRad();
        const keyHash = await cryptoDriver.getPublicKeyHash();
        const pubKey = await cryptoDriver.getPublicKey();
        const bundle: DirectContactPortBundle = {
            portId: this.portData.portId,
            version: this.portData.version,
            org: ORG_NAME,
            target: BundleTarget.contactPort,
            name: name,
            rad: rad,
            keyHash: keyHash,
            pubkey: pubKey,
        }
        return bundle;
    }

    /**
     * Pauses the shared contact port
     */
    async pause(): Promise<void> {
        await API.pauseContactPorts([this.portData.portId]);
        await storageContactPorts.updateContactPortData(this.portData.portId, {
            paused: true,
        });
        const chatId = await getChatIdFromPairHash(this.portData.pairHash);
        if (chatId) {
            const directChat = new DirectChat(chatId);
            await permissionStorage.updatePermissions((await directChat.getChatData()).permissionsId, { contactSharing: false });
        }
    }

    /**
     * Resumes the shared contact port
     */
    async resume(): Promise<void> {
        await API.resumeContactPorts([this.portData.portId]);
        await storageContactPorts.updateContactPortData(this.portData.portId, {
            paused: false,
        });
        const chatId = await getChatIdFromPairHash(this.portData.pairHash);
        if (chatId) {
            const directChat = new DirectChat(chatId);
            await permissionStorage.updatePermissions((await directChat.getChatData()).permissionsId, { contactSharing: true });
        }
    }

    /**
     * Cleans the shared contact port
     */
    async clean(): Promise<void> {
        try {
            //Try to pause the port to ensure that the port is not used after deletion.
            await this.pause(); 
        } catch (error) {
            console.log('Error pausing shared contact port', error);
            console.log('Proceeding with cleanup anyway...');
        }
        try {
            //delete the contact port data
            await storageContactPorts.deleteContactPortData(this.portData.portId);
            //delete the crypto data
            if (this.portData.cryptoId) {
                const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
                await cryptoDriver.deleteCryptoData();
            }
            //delete the permissions
            if (this.portData.permissionsId) {
                await permissionStorage.clearPermissions(this.portData.permissionsId);
            }
        } catch (error) {
            console.log('Error cleaning shared contact port', error);
        }
    }

    /**
     * Creates default permissions for the port in case it doesn't exist.
     * Ports before version 1.0.0 might not have permissions.
     */
    private async createPermissions() {
        const permissionsId = generateRandomHexId();
        const defaultPermissions = await permissionStorage.getPermissions();
        await permissionStorage.addPermissionEntry({
            permissionsId: permissionsId,
            ...defaultPermissions,
        });
        this.portData = { ...this.portData, permissionsId: permissionsId };
        await storageContactPorts.updateContactPortData(this.portData.portId, this.portData);
    }

    /**
     * Verifies the intro message
     * @param introMessage - The intro message sent by the SuperPort reader
     * @returns The plaintext secret content
     */
    private async verifyIntroMessage(introMessage: IntroMessage): Promise<PlaintextSecretContent> {
        try {
            if (!introMessage || !introMessage.pubkey || !introMessage.encryptedSecretContent) {
                throw new Error('Intro message is missing required fields');
            }
            const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
            await cryptoDriver.updateSharedSecret(introMessage.pubkey);
            const plaintextSecret = JSON.parse(
                await cryptoDriver.decrypt(introMessage.encryptedSecretContent),
            ) as PlaintextSecretContent;
            if (!((await cryptoDriver.getRad()) === plaintextSecret.rad)) {
                throw new Error('Intro message verification failed');
            }
            if (!plaintextSecret.ticket) {
                throw new Error('Intro message verification failed due to missing ticket');
            }
            const storedTicket = await storageContactPorts.getContactPortTicket(
                this.portData.portId,
                plaintextSecret.ticket,
            );
            if (!storedTicket) {
                throw new Error(
                    'Intro message verification failed due to missing ticket in storage',
                );
            } else {
                if (!storedTicket.active) {
                    throw new Error(
                        'Intro message verification failed due to expired ticket',
                    );
                }
            }
            console.log('Intro message verified successfully. valid ticket found in storage.');
            return plaintextSecret;
        } catch (error) {
            console.log('Error verifying intro message: ', error);
            throw new Error('Invalid intro message');
        }
    }

    /**
     * Increments the connections made
     */
    async incrementConnectionsMade() {
        await storageContactPorts.incrementConnectionsMade(this.portData.portId, generateISOTimeStamp());
        this.portData = {...this.portData, connectionsMade: this.portData.connectionsMade + 1};
    }

    /**
     * Uses the shared contact port to form a new chat
     * @param lineId - The line ID created by the server for the new chat.
     * @param pairHash - The unique pair hash for the user pair.
     * @param introMessage - The intro message sent by the Port reader.
     */
    async use(lineId: string, pairHash: string, introMessage: any): Promise<void> {
        try {
            //run basic checks before attempting to use the shared contact port.
            //if chat is already formed, this guard prevents retrying new chat over super port.
            if (await checkLineExists(lineId)) {
                return;
            }
            //if permissions don't exist, create them.
            if (!this.portData.permissionsId) {
                await this.createPermissions();
            }
            //if shared contact port is paused, inform the server and throw an error.
            if (this.portData.paused) {
                this.pause();
                throw new Error('Attempted to use a paused contact port');
            }
            //validate intro message
            const plaintextSecret = await this.verifyIntroMessage(introMessage);
            //Ensure user is not blocked
            if (await isUserBlocked(pairHash)) {
                throw new Error('User is blocked');
            }
            //Ensure active connection does not exist for the pairHash
            let associatedChatId: string | null = await getChatIdFromPairHash(pairHash);
            let lineData: LineDataEntry | null = null;
            if (associatedChatId) {
                console.log('Existing chatId found for pairHash: ', associatedChatId);
                const existingConnection = await getBasicConnectionInfo(associatedChatId);
                lineData = await readLineData(
                    existingConnection.routingId,
                );
                if (lineData && !lineData.disconnected) {
                    throw new Error('Connection already exists for the pairHash');
                }
            }
            //create duplicate crypto entry and permissions entry.
            const contactPortCryptoDriver = new CryptoDriver(this.portData.cryptoId);
            const cryptoDriver = new CryptoDriver();
            await cryptoDriver.create(await contactPortCryptoDriver.getData());
            const cryptoId = cryptoDriver.getCryptoId();
            const permissionsId = generateRandomHexId();
            await permissionStorage.addPermissionEntry({
                permissionsId: permissionsId,
                ...(await permissionStorage.getPermissions(this.portData.permissionsId)),
            });
            //add line to db
            await addLine({
                lineId: lineId,
                authenticated: true,
                disconnected: false,
                cryptoId: cryptoId,
                permissionsId: permissionsId,
            });

            if (associatedChatId) {
                //update existing connection with new lineId
                await updateConnectionOnNewMessage({
                    chatId: associatedChatId,
                    routingId: lineId,
                });
                //clean delete old lineId and associated data
                if (lineData) {
                    await DirectChat.cleanDeleteLine(lineData.lineId, lineData);
                }
            } else {
                //generate new chatId
                associatedChatId = generateRandomHexId();
                //add new connection
                await addConnection({
                    chatId: associatedChatId,
                    connectionType: ChatType.direct,
                    recentMessageType: ContentType.newChat,
                    readStatus: MessageStatus.latest,
                    timestamp: generateISOTimeStamp(),
                    newMessageCount: 0,
                    folderId: this.portData.folderId,
                    pairHash: pairHash,
                    routingId: lineId,
                });
                //add contact since pairHash is new
                await addContact({
                    pairHash: pairHash,
                    name: plaintextSecret.name || DEFAULT_NAME,
                    connectedOn: generateISOTimeStamp(),
                    connectionSource: 'contact://' + this.portData.pairHash
                });
            }
            //increase the count of connections made using this superport
            await this.incrementConnectionsMade();
            //set remote notification permission for the line
            const permissions = await permissionStorage.getPermissions(this.portData.permissionsId);
            setRemoteNotificationPermissionForDirectChat(lineId, permissions.notifications, true);
            //send generator initial info messages
            generatorInitialInfoSend(associatedChatId);
        } catch (error) {
            console.log('Error using created contact port: ', error);
            console.log('Informing server of failure to form chat on the contact port generator side.');
            await DirectChat.cleanDeleteLine(lineId);
            DirectChat.informServerOfDisconnection(lineId);
            return;
        }
    }
}

export default SharedContactPortGenerator_1_0_0;
