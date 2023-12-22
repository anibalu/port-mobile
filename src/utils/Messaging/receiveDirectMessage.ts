import {
  provideContactShareBundle,
  relayContactShareBundle,
} from '@utils/ContactSharing';
import {DEFAULT_NAME} from '../../configs/constants';
import {
  getConnection,
  updateConnection,
  updateConnectionOnNewMessage,
} from '../Connections';
import {ReadStatus} from '../Connections/interfaces';
import {decryptFile, decryptMessage} from '../Crypto/aes';
import {
  handshakeActionsA1,
  handshakeActionsA2,
  handshakeActionsB2,
} from '../DirectChats/handshake';
import {displaySimpleNotification} from '../Notifications';
import {
  saveToFilesDir,
  saveToMediaDir,
} from '../Storage/StorageRNFS/sharedFileHandlers';
import {saveMessage} from '../Storage/messages';
import {
  ContentType,
  ReceiveStatus,
  SavedMessageParams,
  SendMessageParamsStrict,
} from './interfaces';
import {
  addMediatoDownloading,
  downloadData,
  removeMediaFromDownloading,
} from './largeData';

/**
 * @deprecated
 */
export async function receiveDirectMessage(
  messageFCM: any,
): Promise<ReceiveStatus> {
  try {
    const chatId: string = messageFCM.data.lineId || messageFCM.data.deletion;
    if (!chatId || chatId === '') {
      return ReceiveStatus.failed;
    }
    const messageData = messageFCM.data;
    const sentTime = messageFCM.sentTime
      ? new Date(messageFCM.sentTime)
      : new Date();
    const timestamp = sentTime.toISOString();
    if (messageData.deletion) {
      await updateConnection({chatId: chatId, disconnected: true});
    }
    //if the received message is a handshake A1 message (server notifies that the other party has used a connection link to create a connection).
    if (!messageData.messageContent && messageData.lineLinkId) {
      if (messageData.superportId && messageData.superportId !== 'None') {
        await handshakeActionsA1(chatId, messageData.superportId);
        return ReceiveStatus.success;
      }
      //trigger handshake A1
      await handshakeActionsA1(chatId, messageData.lineLinkId);
      return ReceiveStatus.success;
    }
    //if received message has message content, receive the message based on content type of the message.
    if (messageData.messageContent) {
      //messageContent is ciphertext. we decrypt it
      const message: SendMessageParamsStrict = JSON.parse(
        await decryptMessage(chatId, messageData.messageContent),
      );
      // const message: SendMessageParamsStrict = JSON.parse(
      //   JSON.parse(await decryptMessage(chatId, messageData.content)),
      // );
      switch (message.contentType) {
        case ContentType.text: {
          return await receiveTextDirectMessage(chatId, message, timestamp);
        }
        case ContentType.name: {
          return await receiveNameDirectMessage(chatId, message, timestamp);
        }
        case ContentType.displayImage: {
          return await receiveDisplayPictureDirectMessage(
            chatId,
            message,
            timestamp,
          );
        }
        case ContentType.video: {
          return await receiveMediaOrFileDirectMessage(
            chatId,
            message,
            timestamp,
          );
        }
        case ContentType.image: {
          return await receiveMediaOrFileDirectMessage(
            chatId,
            message,
            timestamp,
          );
        }
        case ContentType.file: {
          return await receiveMediaOrFileDirectMessage(
            chatId,
            message,
            timestamp,
          );
        }
        case ContentType.handshakeA1:
        case ContentType.handshakeB2: {
          return await receiveHandshakeDirectMessage(chatId, message);
        }
        case ContentType.contactBundleRequest: {
          await provideContactShareBundle(chatId, message.data.bundleId || '');
          return ReceiveStatus.success;
        }
        case ContentType.contactBundleResponse: {
          await relayContactShareBundle(chatId, message.data);
          return ReceiveStatus.success;
        }
        case ContentType.contactBundle: {
          return await receiveContactBundle(chatId, message, timestamp);
        }
      }
    }
    return ReceiveStatus.failed;
  } catch (error) {
    console.log('error receiving message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveContactBundle(
  chatId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  //respond to getting a valid bundle
  const savedMessage: SavedMessageParams = {
    ...message,
    chatId: chatId,
    messageId: message.messageId,
    sender: false,
    timestamp: timestamp,
  };
  await saveMessage(savedMessage);
  return ReceiveStatus.success;
}

async function receiveTextDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //save message to storage
    const savedMessage: SavedMessageParams = {
      ...message,
      chatId: chatId,
      messageId: message.messageId,
      sender: false,
      timestamp: timestamp,
    };
    await saveMessage(savedMessage);
    //update connection
    await updateConnectionOnNewMessage({
      chatId: chatId,
      text: savedMessage.data.text || '',
      readStatus: ReadStatus.new,
      recentMessageType: savedMessage.contentType,
    });
    //notify user if notifications are ON
    const connection = await getConnection(chatId);
    const showNotification = connection.permissions.notifications.toggled;
    if (showNotification) {
      const notificationData = {
        title: connection.name,
        body: savedMessage.data.text,
      };
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
    return ReceiveStatus.success;
  } catch (error) {
    console.log('Error receiving text direct message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveNameDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //save message to storage
    const savedMessage: SavedMessageParams = {
      ...message,
      chatId: chatId,
      messageId: message.messageId,
      sender: false,
      timestamp: timestamp,
    };
    await saveMessage(savedMessage);
    //update connection if name not present
    const connection = await getConnection(chatId);
    if (connection.name === undefined || connection.name === '') {
      await updateConnection({
        chatId: chatId,
        name: savedMessage.data.name || DEFAULT_NAME,
      });
      //notify user if notifications are ON
      if (connection.permissions.notifications.toggled) {
        const notificationData = {
          title: 'New connection',
          body: savedMessage.data.name + ' has connected with you.',
        };
        displaySimpleNotification(
          notificationData.title,
          notificationData.body,
        );
      }
      return ReceiveStatus.success;
    }
    return ReceiveStatus.failed;
  } catch (error) {
    console.log('Error receiving name direct message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveMediaOrFileDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //two cases:
    const connection = await getConnection(chatId);
    const contentType = message.contentType;
    //1. Media Autodownload permissoin is ON
    if (connection.permissions.autoDownload.toggled) {
      //if media Id doesn't exist, throw error.
      if (
        message.data.mediaId === undefined ||
        message.data.key === undefined
      ) {
        throw new Error('MediaId or key undefined error');
      }
      //try to download file and update mediaId to downloading media store
      addMediatoDownloading(message.data.mediaId || '');
      const ciphertext = await downloadData(message.data.mediaId);
      //decrypt file with key
      const plaintext = await decryptFile(ciphertext, message.data.key);
      //save file to chat storage and update fileUri
      let fileUri = null;
      switch (contentType) {
        case ContentType.image:
          fileUri = await saveToMediaDir(
            chatId,
            plaintext,
            message.data.fileName,
          );
          break;
        case ContentType.video:
          fileUri = await saveToMediaDir(
            chatId,
            plaintext,
            message.data.fileName,
          );
          break;
        default:
          fileUri = await saveToFilesDir(
            chatId,
            plaintext,
            message.data.fileName,
          );
          break;
      }
      //save message to storage
      const savedMessage: SavedMessageParams = {
        ...message,
        data: {
          ...message.data,
          fileUri: fileUri,
          mediaId: null,
          key: null,
        },
        chatId: chatId,
        messageId: message.messageId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(savedMessage);
      removeMediaFromDownloading(message.data.mediaId || '');
    }
    //2. Media Autodownload permission is OFF
    else {
      //save message to storage
      const savedMessage: SavedMessageParams = {
        ...message,
        chatId: chatId,
        messageId: message.messageId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(savedMessage);
    }
    //update connection
    await updateConnectionOnNewMessage({
      chatId: chatId,
      readStatus: ReadStatus.new,
      recentMessageType: message.contentType,
      text: message.data.text || 'media/file',
    });
    //notify user if notifications are ON
    if (connection.permissions.notifications.toggled) {
      let notificationData = {
        title: connection.name,
        body: 'new media or file',
      };
      switch (contentType) {
        case ContentType.file:
          notificationData = {
            title: connection.name,
            body: message.data.text || 'file',
          };
          break;
        case ContentType.image:
          notificationData = {
            title: connection.name,
            body: message.data.text || 'image',
          };
          break;
        case ContentType.video:
          notificationData = {
            title: connection.name,
            body: message.data.text || 'video',
          };
          break;
        default:
          notificationData = {
            title: connection.name,
            body: message.data.text || 'unsupported file',
          };
          break;
      }
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
    return ReceiveStatus.success;
  } catch (error) {
    console.log('Error receiving media or file direct message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveDisplayPictureDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    if (message.data.fileType === 'avatar') {
      //save message to storage
      const savedMessage: SavedMessageParams = {
        ...message,
        chatId: chatId,
        messageId: message.messageId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(savedMessage);
      //update connection
      await updateConnection({
        chatId: chatId,
        pathToDisplayPic: message.data.fileUri,
      });
      return ReceiveStatus.success;
    } else {
      //try to download file
      const ciphertext = await downloadData(message.data.mediaId || '');
      //decrypt file with key
      const plaintext = await decryptFile(ciphertext, message.data.key || '');
      //save file to chat storage and update fileUri
      const fileUri = await saveToMediaDir(
        chatId,
        plaintext,
        message.data.fileName,
      );
      // //save message to storage
      const savedMessage: SavedMessageParams = {
        ...message,
        chatId: chatId,
        data: {
          ...message.data,
          fileUri: fileUri,
          mediaId: null,
          key: null,
        },
        messageId: message.messageId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(savedMessage);
      //update connection
      await updateConnection({
        chatId: chatId,
        pathToDisplayPic: 'file://' + fileUri,
      });
      return ReceiveStatus.success;
    }
  } catch (error) {
    console.log('Error receiving diplay picture direct message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveHandshakeDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
) {
  try {
    switch (message.contentType) {
      case ContentType.handshakeA1:
        await handshakeActionsB2(chatId, message.data.pubKey || '');
        break;
      case ContentType.handshakeB2:
        await handshakeActionsA2(
          chatId,
          message.data.pubKey || '',
          message.data.encryptedNonce || '',
        );
        break;
    }
    return ReceiveStatus.success;
  } catch (error) {
    console.log('Error receiving handshake direct message: ', error);
    return ReceiveStatus.failed;
  }
}
