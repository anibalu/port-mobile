import {DEFAULT_NAME} from '../../configs/constants';
import store from '../../store/appStore';
import {
  getConnection,
  updateConnection,
  updateConnectionOnNewMessage,
} from '../Connections';
import {ReadStatus} from '../Connections/interfaces';
import {decryptFile, decryptMessage} from '../Crypto/aes';
import {removeMember, updateMemberName, updateNewMember} from '../Groups';
import {displaySimpleNotification} from '../Notifications';
import {getProfileName} from '../Profile';
import {saveToMediaDir} from '../Storage/StorageRNFS/sharedFileHandlers';
import {saveMessage} from '../Storage/messages';
import {
  ContentType,
  MessageType,
  ReceiveStatus,
  SavedMessageParams,
  SendMessageParamsStrict,
} from './interfaces';
import {
  addMediatoDownloading,
  downloadData,
  removeMediaFromDownloading,
} from './largeData';
import {sendMessage} from './sendMessage';

export async function receiveGroupMessage(
  messageFCM: any,
): Promise<ReceiveStatus> {
  try {
    const groupId: string = messageFCM.data.group;
    const senderId: string = messageFCM.data.sender;
    const messageData = messageFCM.data;
    const sentTime = new Date(messageFCM.sentTime);
    const timestamp = sentTime.toISOString();
    if (messageData.content) {
      const firstParse = JSON.parse(messageData.content);
      if (firstParse.newMember) {
        //new member added actions
        console.log('adding new member ', firstParse.newMember);
        store.dispatch({
          type: 'NEW_CONNECTION',
          payload: {
            chatId: groupId,
            connectionLinkId: timestamp,
          },
        });
        //add new member to member list
        await updateNewMember(groupId, firstParse.newMember);
        //send your name
        await sendMessage(
          groupId,
          {
            contentType: ContentType.name,
            messageType: MessageType.new,
            data: {name: await getProfileName()},
          },
          true,
          true,
        );
        return ReceiveStatus.success;
      }
      if (firstParse.removedMember) {
        //removed member actions
        console.log('removing member');
        await removeMember(groupId, firstParse.removedMember);
        return ReceiveStatus.success;
      }
      if (firstParse.removedFromGroup) {
        //removed from group notification
        console.log('removing myself');
        await updateConnection({chatId: groupId, disconnected: true});
        return ReceiveStatus.success;
      }
      //regular group message
      const message: SendMessageParamsStrict = JSON.parse(
        JSON.parse(await decryptMessage(groupId, messageData.content)),
      );
      if (senderId !== 'Numberless') {
        await updateNewMember(groupId, senderId);
      }
      switch (message.contentType) {
        case ContentType.text: {
          return await receiveTextGroupMessage(
            groupId,
            senderId,
            message,
            timestamp,
          );
        }
        case ContentType.name: {
          return await receiveNameGroupMessage(
            groupId,
            senderId,
            message,
            timestamp,
          );
        }
        case ContentType.video: {
          return await receiveMediaOrFileDirectMessage(
            groupId,
            senderId,
            message,
            timestamp,
          );
        }
        case ContentType.image: {
          return await receiveMediaOrFileDirectMessage(
            groupId,
            senderId,
            message,
            timestamp,
          );
        }
        case ContentType.file: {
          return await receiveMediaOrFileDirectMessage(
            groupId,
            senderId,
            message,
            timestamp,
          );
        }
        case ContentType.displayImage: {
        }
        default: {
          throw new Error('unrecognised content type');
        }
      }
    }
    return ReceiveStatus.failed;
  } catch (error) {
    console.log('receive failed: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveTextGroupMessage(
  groupId: string,
  senderId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //save message to storage
    const savedMessage: SavedMessageParams = {
      ...message,
      chatId: groupId,
      messageId: getReceiverPrefix(senderId) + message.messageId,
      memberId: senderId,
      sender: false,
      timestamp: timestamp,
    };
    await saveMessage(groupId, savedMessage);
    //update connection
    await updateConnectionOnNewMessage({
      chatId: groupId,
      text: savedMessage.data.text || '',
      readStatus: ReadStatus.new,
      recentMessageType: savedMessage.contentType,
    });
    //notify user if notifications are ON
    const connection = await getConnection(groupId);
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

async function receiveNameGroupMessage(
  groupId: string,
  senderId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //save message to storage
    const savedMessage: SavedMessageParams = {
      ...message,
      chatId: groupId,
      messageId: getReceiverPrefix(senderId) + message.messageId,
      memberId: senderId,
      sender: false,
      timestamp: timestamp,
    };
    await saveMessage(groupId, savedMessage);
    console.log('received name: ', message.data.name);
    await updateMemberName(
      groupId,
      senderId,
      message.data.name || DEFAULT_NAME,
    );
    return ReceiveStatus.success;
  } catch (error) {
    console.log('Error receiving text direct message: ', error);
    return ReceiveStatus.failed;
  }
}

async function receiveMediaOrFileDirectMessage(
  groupId: string,
  senderId: string,
  message: SendMessageParamsStrict,
  timestamp: string,
) {
  try {
    //two cases:
    const connection = await getConnection(groupId);
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
            groupId,
            plaintext,
            message.data.fileName,
          );
          break;
        case ContentType.video:
          fileUri = await saveToMediaDir(
            groupId,
            plaintext,
            message.data.fileName,
          );
          break;
        default:
          fileUri = await saveToFilesDir(
            groupId,
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
        chatId: groupId,
        messageId: getReceiverPrefix(senderId) + message.messageId,
        memberId: senderId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(groupId, savedMessage);
      removeMediaFromDownloading(message.data.mediaId || '');
    }
    //2. Media Autodownload permission is OFF
    else {
      //save message to storage
      const savedMessage: SavedMessageParams = {
        ...message,
        chatId: groupId,
        messageId: getReceiverPrefix(senderId) + message.messageId,
        memberId: senderId,
        sender: false,
        timestamp: timestamp,
      };
      await saveMessage(groupId, savedMessage);
    }
    //update connection
    await updateConnectionOnNewMessage({
      chatId: groupId,
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

function getReceiverPrefix(senderId: string) {
  return senderId + '_';
}
