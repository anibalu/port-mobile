import CryptoDriver from '@utils/Crypto/CryptoDriver';
import * as storageReadPorts from '@utils/Storage/readPorts';
import * as permissionStorage from '@utils/Storage/permissions';
import {generateISOTimeStamp, hasExpired} from '@utils/Time';
import {createChatPermissionsFromFolderId} from '@utils/Storage/permissions';

import {defaultFolderId} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import {getMessage, updateMessageData} from '@utils/Storage/messages';
import {ContactBundleParams, ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import SuperPortReader from '../SuperPortReader';

const SUPERPORT_READER_VERSION = '1.0.0';

class SuperPortReader_1_0_0 extends SuperPortReader {
  version: string = SUPERPORT_READER_VERSION;

  static validateBundle(bundleData: any): void {
    if (
      !bundleData.version ||
      bundleData.version !== SUPERPORT_READER_VERSION
    ) {
      throw new Error('Invalid version for Port Data');
    }
  }

  static validate(portData: any): void {
    SuperPortReader_1_0_0.validateBundle(portData);
    if (
      !portData.cryptoId ||
      typeof portData.cryptoId !== 'string' ||
      portData.cryptoId.length !== 32
    ) {
      throw new Error('Invalid cryptoId in SuperPort data');
    }
  }

  /**
   * util to accept the port bundle received
   * @param bundleData bundle data received
   * @param folderId of the chat
   */
  static async accept(bundleData: any, folderId: string = defaultFolderId) {
    SuperPortReader_1_0_0.validateBundle(bundleData);
    //setup crypto
    const cryptoDriver = new CryptoDriver();
    await cryptoDriver.create();
    const cryptoId = cryptoDriver.getCryptoId();
    //save read port
    await storageReadPorts.newReadPort({
      portId: bundleData.portId,
      version: bundleData.version,
      target: bundleData.target,
      name: bundleData.name,
      description: bundleData.description,
      usedOnTimestamp: generateISOTimeStamp(),
      folderId: folderId,
      cryptoId: cryptoId,
    });
  }

  /**
   * Forms a chat
   */
  async use(): Promise<void> {
    //create chat permissions to be assigned to chat using folder Id
    const permissionsId = await createChatPermissionsFromFolderId(
      this.portData.folderId,
    );
    //check timestamp expiry
    if (hasExpired(this.portData.expiryTimestamp)) {
      await cleanup(
        this.portData.portId,
        permissionsId,
        this.portData.cryptoId,
      );
      return;
    }
    const chat = new DirectChat();
    try {
      //try to create direct chat. If port is invalid, expire the port
      await chat.createChatUsingPortId(
        this.portData.portId,
        {
          name: this.portData.name,
          authenticated: false,
          disconnected: false,
          cryptoId: this.portData.cryptoId,
          connectedOn: this.portData.usedOnTimestamp,
          connectionSource: this.portData.channel,
          permissionsId: permissionsId,
        },
        this.portData.folderId,
        false,
      );
      if (this.portData.channel) {
        const channel = this.portData.channel;
        if (channel.substring(0, 9) === 'shared://') {
          const fromChatId = channel.substring(9, 9 + 32);
          const messsageId = channel.substring(9 + 32 + 3, 9 + 32 + 3 + 32);
          const message = await getMessage(fromChatId, messsageId);
          if (message) {
            const update = message.data as ContactBundleParams;
            update.accepted = true;
            update.createdChatId = chat.getChatId();
            await updateMessageData(fromChatId, messsageId, update);
          }
        }
      }
      console.log('[Deleting read port on successful chat formation]');
      await storageReadPorts.deleteReadPortData(this.portData.portId);
      console.log('[Sending initial set of messages]');
      const chatId = chat.getChatId();
      await readerInitialInfoSend(chatId);
    } catch (error: any) {
      //delete permissions if there is an error.
      if (typeof error === 'object' && error.response) {
        if (error.response.status === 404) {
          console.log('Port has expired');
          //expire port
          await cleanup(
            this.portData.portId,
            permissionsId,
            this.portData.cryptoId,
          );
        }
      }
    }
  }
}

export default SuperPortReader_1_0_0;

/**
 * Cleanup residuals if port creation fails.
 * @param portId
 * @param permissionsId
 * @param cryptoId
 */
async function cleanup(
  portId: string,
  permissionsId: string,
  cryptoId: string,
) {
  //load up crypto driver
  const cryptoDriver = new CryptoDriver(cryptoId);
  await storageReadPorts.deleteReadPortData(portId);
  await cryptoDriver.deleteCryptoData();
  await permissionStorage.clearPermissions(permissionsId);
}

/**
 * Initial messages sent by port reader.
 * @param chatId
 */
async function readerInitialInfoSend(chatId: string) {
  //send name
  const nameSender = new SendMessage(chatId, ContentType.name, {
    name: await getProfileName(),
  });
  await nameSender.send();
  //send contact port
  const contactPortSender = new SendMessage(
    chatId,
    ContentType.contactPortBundle,
    {},
  );
  await contactPortSender.send();
  //send profile picture based on permission
  const chatPermissions = await getChatPermissions(chatId, ChatType.direct);
  if (chatPermissions.displayPicture) {
    const profilePictureAttributes = await getProfilePicture();
    if (!profilePictureAttributes) {
      return;
    }
    const contentType =
      profilePictureAttributes.fileType === 'avatar'
        ? ContentType.displayAvatar
        : ContentType.displayImage;
    const sendDisplayPicture = new SendMessage(chatId, contentType, {
      ...profilePictureAttributes,
    });
    await sendDisplayPicture.send();
  }
}
