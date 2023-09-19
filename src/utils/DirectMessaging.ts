import {Store} from '@reduxjs/toolkit';
import {saveNewDirectMessage} from './messagefs';
import {updateConnection, getConnection} from './Connection';
import {bundleShownHandshake} from '../actions/BundleShownHandshake';
import {displaySimpleNotification} from './notifications';
import {trySending} from './MessageJournal';
import {
  ContentType,
  MediaContent,
  directMessageContent,
  preparedMessage,
} from './MessageInterface';
import {
  convertedFileResponse,
  downloadLargeFile,
  tempFileToLocalFile,
  toLocalFile,
} from './LargeFiles';

//class that does direct messaging.
//takes as input the line id.
/*functions
1. recieve message
2. send message
3. get associated crypto key file
*/
/**
 * Class that facilitates direct messaging with a connection.
 * Provides functions for receiving and sending messages.
 */
export class DirectMessaging {
  private id: string; //line id
  /**
   * Creates an instance of DirectMessaging with the provided Line ID.
   * @param {string} lineId - The Line ID of the connection.
   */
  constructor(lineId: string) {
    this.id = lineId;
  }

  /**
   * Receives and processes a message from the contact.
   *
   * @param {any} messageFCM - The received message object from FCM.
   * @param {Store} store - The Redux store for managing application state.
   *
   * @todo Check if message has already been received after multifile support has been added for chat messages.
   */
  async receiveMessage(messageFCM: any, store: Store) {
    const sentTime = new Date(messageFCM.sentTime);
    const messageData = messageFCM.data;
    let notificationData;
    let showNotification = true;
    //if the received message is a handshake message
    if (!messageData.messageContent && messageData.lineLinkId) {
      //crypto handshake action
      await bundleShownHandshake(messageData.lineLinkId, this.id);
      console.log('updating store with latest new connection');
      store.dispatch({
        type: 'NEW_CONNECTION',
        payload: {
          lineId: messageData.lineId,
          lineLinkId: messageData.lineLinkId,
        },
      });
    }
    //if the received message is a non-handshake message
    if (messageData.messageContent) {
      const content: directMessageContent = JSON.parse(
        messageData.messageContent,
      );
      const savedMessageData = content.data;
      const connection = await getConnection(this.id);
      showNotification = connection.permissions.notifications.toggled;
      switch (content.messageType) {
        //nickname message
        case ContentType.NICKNAME:
          if (savedMessageData.mediaId) {
            const fileObj = await downloadLargeFile(savedMessageData.mediaId);
            if (fileObj === null) {
              throw new Error('download failed');
            }
            const fileParams: convertedFileResponse = await toLocalFile(
              this.id,
              fileObj,
              ContentType.IMAGE,
            );
            console.log('local file created: ', fileParams);
            await updateConnection({
              id: this.id,
              pathToImage: fileParams.filePath,
            });
            savedMessageData.filePath = fileParams.filePath;
            savedMessageData.mediaType = fileParams.type;
            savedMessageData.sender = false;
            savedMessageData.timestamp = sentTime.toISOString();
            await saveNewDirectMessage(this.id, {
              messageType: content.messageType,
              messageId: '0002_' + content.messageId,
              data: savedMessageData,
            });
          } else {
            savedMessageData.sender = false;
            savedMessageData.timestamp = sentTime.toISOString();
            await saveNewDirectMessage(this.id, {
              messageType: content.messageType,
              messageId: '0002_' + content.messageId,
              data: savedMessageData,
            });
          }
          if (!connection.userChoiceNickname) {
            await updateConnection({
              id: this.id,
              newMessageType: content.messageType,
              nickname: content.data.nickname,
              readStatus: 'new',
            });
            if (connection.nickname === '') {
              notificationData = {
                title: 'New connection',
                body: content.data.nickname + ' has connected with you.',
              };
            }
          }
          break;
        //generic text message
        case ContentType.TEXT:
          await updateConnection({
            id: this.id,
            newMessageType: content.messageType,
            text: content.data.text,
            readStatus: 'new',
          });
          savedMessageData.sender = false;
          savedMessageData.timestamp = sentTime.toISOString();
          await saveNewDirectMessage(this.id, {
            messageType: content.messageType,
            messageId: '0002_' + content.messageId,
            data: savedMessageData,
          });
          notificationData = {
            title: connection.nickname,
            body: content.data.text,
          };
          break;
        //image shared
        case ContentType.IMAGE:
          {
            const fileObj = await downloadLargeFile(savedMessageData.mediaId);
            if (fileObj === null) {
              throw new Error('download failed');
            }
            const fileParams: convertedFileResponse = await toLocalFile(
              this.id,
              fileObj,
              ContentType.IMAGE,
            );
            console.log('local file created: ', fileParams);
            await updateConnection({
              id: this.id,
              newMessageType: content.messageType,
              text: content.data.text || 'image',
              readStatus: 'new',
            });
            savedMessageData.filePath = fileParams.filePath;
            savedMessageData.mediaType = fileParams.type;
            savedMessageData.sender = false;
            savedMessageData.timestamp = sentTime.toISOString();
            console.log('data: ', savedMessageData);
            await saveNewDirectMessage(this.id, {
              messageType: content.messageType,
              messageId: '0002_' + content.messageId,
              data: savedMessageData,
            });
            /**
             * @todo attempt to download media only if media autodownload is ON.
             */
            notificationData = {
              title: connection.nickname,
              body: content.data.text || 'image',
            };
          }
          break;
        case ContentType.VIDEO:
          {
            const fileObj = await downloadLargeFile(savedMessageData.mediaId);
            if (fileObj === null) {
              throw new Error('download failed');
            }
            const fileParams: convertedFileResponse = await toLocalFile(
              this.id,
              fileObj,
              ContentType.VIDEO,
            );
            console.log('local file created: ', fileParams);
            await updateConnection({
              id: this.id,
              newMessageType: content.messageType,
              text: content.data.text || 'video',
              readStatus: 'new',
            });
            savedMessageData.filePath = fileParams.filePath;
            savedMessageData.mediaType = fileParams.type;
            savedMessageData.sender = false;
            savedMessageData.timestamp = sentTime.toISOString();
            console.log('data: ', savedMessageData);
            await saveNewDirectMessage(this.id, {
              messageType: content.messageType,
              messageId: '0002_' + content.messageId,
              data: savedMessageData,
            });
            /**
             * @todo attempt to download media only if media autodownload is ON.
             */
            notificationData = {
              title: connection.nickname,
              body: content.data.text || 'video',
            };
          }
          break;
        case ContentType.OTHER_FILE:
          {
            const fileObj = await downloadLargeFile(savedMessageData.mediaId);
            if (fileObj === null) {
              throw new Error('download failed');
            }
            const fileParams: convertedFileResponse = await toLocalFile(
              this.id,
              fileObj,
              ContentType.OTHER_FILE,
            );
            console.log('local file created: ', fileParams);
            await updateConnection({
              id: this.id,
              newMessageType: content.messageType,
              text: content.data.text || 'file',
              readStatus: 'new',
            });
            savedMessageData.filePath = fileParams.filePath;
            savedMessageData.mediaType = fileParams.type;
            savedMessageData.sender = false;
            savedMessageData.timestamp = sentTime.toISOString();
            console.log('data: ', savedMessageData);
            await saveNewDirectMessage(this.id, {
              messageType: content.messageType,
              messageId: '0002_' + content.messageId,
              data: savedMessageData,
            });
            /**
             * @todo attempt to download media only if media autodownload is ON.
             */
            notificationData = {
              title: connection.nickname,
              body: content.data.text || 'image',
            };
          }
          break;
        case ContentType.HANDSHAKE:
          //for when authentication is added
          break;
        default:
          break;
      }
    }
    store.dispatch({type: 'NEW_MESSAGE', payload: messageFCM});
    // Display the notification
    if (showNotification && notificationData) {
      console.log(notificationData);
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
  }
  /**
   * Saves message to FS and attempts to send message to contact
   *
   * @param {directMessageContent} messageContent - The content of the message to send.
   */
  async sendMessage(messageContent: directMessageContent) {
    if (messageContent.messageType === ContentType.NICKNAME) {
      const now: Date = new Date();
      const savedMessageData = messageContent.data;
      savedMessageData.sender = true;
      savedMessageData.timestamp = now.toISOString();
      const preparedMessage: preparedMessage = {
        message: {...messageContent},
        line: this.id,
      };
      const isSent = await trySending(preparedMessage);
      console.log('message send invoked');
      await saveNewDirectMessage(this.id, {
        messageType: messageContent.messageType,
        messageId: '0001_' + messageContent.messageId,
        isSent: isSent,
        data: savedMessageData,
      });
      return isSent;
      /**
       * @todo support letting users know if message has been successfully sent.
       * This can be done using the MessageJournal module.
       * Better to do this after multiple messages file support has been added.
       */
    }
    if (messageContent.messageType === ContentType.TEXT) {
      const savedMessageData = messageContent.data;
      const preparedMessage: preparedMessage = {
        message: {...messageContent},
        line: this.id,
      };
      const isSent = await trySending(preparedMessage);
      console.log('message send invoked');
      await saveNewDirectMessage(this.id, {
        messageType: messageContent.messageType,
        messageId: '0001_' + messageContent.messageId,
        isSent: isSent,
        data: savedMessageData,
      });
      return isSent;
      /**
       * @todo support letting users know if message has been successfully sent.
       * This can be done using the MessageJournal module.
       * Better to do this after multiple messages file support has been added.
       */
    }
    if (messageContent.messageType === ContentType.IMAGE) {
      const fileParams: convertedFileResponse = await tempFileToLocalFile(
        this.id,
        messageContent.data.filePath,
        ContentType.IMAGE,
      );
      const savedMessageData: MediaContent = {
        mediaId: messageContent.data.mediaId,
        sender: true,
        timestamp: messageContent.data.timestamp,
        fileName: messageContent.data.fileName,
      };
      const preparedMessage: preparedMessage = {
        message: {
          ...messageContent,
          ...{data: savedMessageData},
        },
        line: this.id,
      };
      savedMessageData.filePath = fileParams.filePath;
      savedMessageData.mediaType = fileParams.type;
      const isSent = await trySending(preparedMessage);
      console.log('message send invoked');
      await saveNewDirectMessage(this.id, {
        messageType: messageContent.messageType,
        messageId: '0001_' + messageContent.messageId,
        isSent: isSent,
        data: savedMessageData,
      });
      return isSent;
      /**
       * @todo support letting users know if message has been successfully sent.
       * This can be done using the MessageJournal module.
       * Better to do this after multiple messages file support has been added.
       */
    }
    if (messageContent.messageType === ContentType.VIDEO) {
      const fileParams: convertedFileResponse = await tempFileToLocalFile(
        this.id,
        messageContent.data.filePath,
        ContentType.VIDEO,
      );
      const savedMessageData: MediaContent = {
        mediaId: messageContent.data.mediaId,
        sender: true,
        timestamp: messageContent.data.timestamp,
        fileName: messageContent.data.fileName,
      };
      const preparedMessage: preparedMessage = {
        message: {
          ...messageContent,
          ...{data: savedMessageData},
        },
        line: this.id,
      };
      savedMessageData.filePath = fileParams.filePath;
      savedMessageData.mediaType = fileParams.type;
      const isSent = await trySending(preparedMessage);
      console.log('message send invoked');
      await saveNewDirectMessage(this.id, {
        messageType: messageContent.messageType,
        messageId: '0001_' + messageContent.messageId,
        isSent: isSent,
        data: savedMessageData,
      });
      return isSent;
      /**
       * @todo support letting users know if message has been successfully sent.
       * This can be done using the MessageJournal module.
       * Better to do this after multiple messages file support has been added.
       */
    }
    if (messageContent.messageType === ContentType.OTHER_FILE) {
      const fileParams: convertedFileResponse = await tempFileToLocalFile(
        this.id,
        messageContent.data.filePath,
        ContentType.OTHER_FILE,
      );
      const savedMessageData: MediaContent = {
        mediaId: messageContent.data.mediaId,
        sender: true,
        timestamp: messageContent.data.timestamp,
        fileName: messageContent.data.fileName,
      };
      const preparedMessage: preparedMessage = {
        message: {
          ...messageContent,
          ...{data: savedMessageData},
        },
        line: this.id,
      };
      savedMessageData.filePath = fileParams.filePath;
      savedMessageData.mediaType = fileParams.type;
      const isSent = await trySending(preparedMessage);
      console.log('message send invoked');
      await saveNewDirectMessage(this.id, {
        messageType: messageContent.messageType,
        messageId: '0001_' + messageContent.messageId,
        isSent: isSent,
        data: savedMessageData,
      });
      return isSent;
      /**
       * @todo support letting users know if message has been successfully sent.
       * This can be done using the MessageJournal module.
       * Better to do this after multiple messages file support has been added.
       */
    }
    return false;
  }
  /**
   * Generates unique message ID based on the current time.
   *
   * @returns {string} A unique message ID.
   */
  public generateMessageId() {
    const date = new Date();
    return date.getTime().toString();
  }
  private async getKeyFile() {
    //get the crypto file associated with the contact
    return this.id;
  }
}
