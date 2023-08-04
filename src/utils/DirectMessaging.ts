import {Store} from '@reduxjs/toolkit';
import {getToken} from './Token';
import axios from 'axios';
import {LINE_MESSAGING_RESOURCE} from '../configs/api';
import {saveNewDirectMessage} from './messagefs';
import {ConnectionType, updateConnection, getConnection} from './Connection';
import {bundleShownHandshake} from '../actions/BundleShownHandshake';
import {displaySimpleNotification} from './notifications';

export interface directMessageContent {
  messageType: string;
  messageId: string;
  data: any;
  sender: boolean; //am i the sender?
  sent: boolean; //message successfully sent?
  timestamp: string; //iso string
}

export interface messageContent {
  messageType: string; //nickname, multimedia, text, key, keyReply, etc
  messageId: string; //assigned by client
  data: any;
}

//class that does direct messaging.
//takes as input the line id.
/*functions
1. recieve message
2. send message
3. get associated crypto key file
*/
export class DirectMessaging {
  private id: string; //line id
  constructor(lineId: string) {
    this.id = lineId;
  }
  async recieveMessage(messageFCM: any, store: Store) {
    const sentTime = new Date(messageFCM.sentTime);
    const messageData = messageFCM.data;
    let notificationData;
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
    if (messageData.messageContent) {
      const content: messageContent = JSON.parse(messageData.messageContent);
      switch (content.messageType) {
        case 'nickname':
          if (content.data.nickname) {
            await updateConnection({
              id: this.id,
              nickname: content.data.nickname,
              readStatus: 'new',
            });
          }
          notificationData = {
            title: 'New connection',
            body: content.data.nickname + ' has connected with you.',
          };
          break;
        case 'text':
          if (content.data.text) {
            await updateConnection({
              id: this.id,
              text: content.data.text,
              readStatus: 'new',
            });
            await saveNewDirectMessage(this.id, {
              messageType: ConnectionType.line,
              messageId: '0002_' + content.messageId,
              sender: false,
              sent: false,
              data: content.data,
              timestamp: sentTime.toISOString(),
            });
            const connection = await getConnection(this.id);
            notificationData = {
              title: connection.nickname,
              body: content.data.text,
            };
          }
          break;
        case 'key':
          //for when authentication is added
          break;
        case 'keyReply':
          //for when authentication is added
          break;
        default:
          break;
      }
    }
    store.dispatch({type: 'NEW_MESSAGE', payload: messageFCM});
    // Display the notification
    if (notificationData) {
      console.log(notificationData);
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
  }
  async sendMessage(messageContent: messageContent) {
    const token = await getToken();
    try {
      await axios.post(LINE_MESSAGING_RESOURCE, {
        token: token,
        message: JSON.stringify(messageContent),
        line: this.id,
      });
      //if successful
      if (messageContent.messageId !== 'nan') {
        const now = new Date();
        await saveNewDirectMessage(this.id, {
          ...messageContent,
          ...{
            messageId: '0001_' + messageContent.messageId,
            sender: true,
            sent: true,
            timestamp: now.toISOString(),
          },
        });
        await updateConnection({
          id: this.id,
          text: messageContent.data.text,
          readStatus: 'sent',
        });
      }
    } catch (error) {
      console.log('error sending message: ', error);
      //handle failure
      //handle failure for regular message (messageId is not 'nan' for regular message)
      if (messageContent.messageId !== 'nan') {
        const now = new Date();
        await saveNewDirectMessage(this.id, {
          ...messageContent,
          ...{
            messageId: '0001_' + messageContent.messageId,
            sender: true,
            sent: false,
            timestamp: now.toISOString(),
          },
        });
      }
      //handle failure for bundle handshake message (messageId is 'nan' for bundle handshake message)
    }
  }
  public generateMessageId() {
    //for now, message id is based on time sent. We prepend with '0001_' while saving message to ensure uniqueness of id.
    const date = new Date();
    return date.getTime().toString();
  }
  private async getKeyFile() {
    //get the crypto file associated with the contact
    return this.id;
  }
}
