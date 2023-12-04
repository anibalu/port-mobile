import axios from 'axios';
import {
  DIRECT_MESSAGING_RESOURCE,
  GROUP_MESSAGING_RESOURCE,
} from '../../configs/api';
import {
  ContentType,
  SavedMessageParams,
  SendStatus,
  SendMessageParams,
  JournaledMessageParams,
  SendMessageOutput,
  SendMessageParamsStrict,
} from './interfaces';
import {generateISOTimeStamp} from '../Time';
import * as storage from '../Storage/messages';
import {DownloadParams, uploadLargeFile} from './largeData';
import {
  moveToFilesDir,
  moveToMediaDir,
} from '../Storage/StorageRNFS/sharedFileHandlers';
import {encryptMessage} from '../Crypto/aes';
import {getToken} from '../ServerAuth';
import {ServerAuthToken} from '../ServerAuth/interfaces';
import {getConnection, updateConnectionOnNewMessage} from '../Connections';
import {ConnectionType, ReadStatus} from '../Connections/interfaces';
import store from '../../store/appStore';
import {getJournaled} from '../Storage/journal';
import uuid from 'react-native-uuid';

/**
 * The function used to send messages. The send operation has the following flow:
 * If the message being sent is a new message (not an old message being resent from journal):
 * 1. MessageId is added to "sending" queue on store and message is saved to storage with an "undefined" send status
 * 2. Send is attempted.
 * 3. The attempted send can resolve into 3 situations:
 *  a. success - Message in storage is updated to "success" send status
 * and MessageId is removed from "sending" queue on store.
 *  b. failed - Message in storage is updated to "failed" send status
 * and MessageId is removed from "sending" queue on store.
 *  c. journaled - Message in storage is updated to "journaled" send status
 * and MessageId is removed from "sending" queue on store.
 *
 * If the message being sent is a journaled message (an old message being resent from journal):
 * 1. MessageId is added to "sending" queue on store.
 * 2. Send is attempted.
 * 3. The attempted send can resolve into 3 situations:
 *  a. success - Message in storage is updated to "success" send status
 * and MessageId is removed from "sending" queue on store.
 *  b. failed - MessageId is removed from "sending" queue on store.
 *
 * @param {string} chatId
 * @param {} message
 * @param {} journal
 * @returns
 */
export async function sendMessage(
  chatId: string,
  message: SendMessageParams,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  try {
    //ensure message has a valid message Id
    let tempMessageId = message.messageId || generateRandomHexId();
    const newMessage: SendMessageParamsStrict = {
      ...message,
      messageId: tempMessageId,
    };
    //handle message differently for content types.
    switch (message.contentType) {
      case ContentType.text: {
        return await sendTextMessage(chatId, newMessage, journal, isGroup);
      }
      case ContentType.name: {
        return await sendNameMessage(chatId, newMessage, journal, isGroup);
      }
      case ContentType.displayImage:
        return await sendMediaMessage(chatId, newMessage, journal, isGroup);
      case ContentType.video:
        return await sendMediaMessage(chatId, newMessage, journal, isGroup);
      case ContentType.image: {
        return await sendMediaMessage(chatId, newMessage, journal, isGroup);
      }
      case ContentType.file: {
        return await sendFileMessage(chatId, newMessage, journal, isGroup);
      }
      case ContentType.handshakeA1: {
        return await sendHandshakeDirectMessage(chatId, newMessage, journal);
      }
      case ContentType.handshakeB2: {
        return await sendHandshakeDirectMessage(chatId, newMessage, journal);
      }
    }
    throw new Error('Unrecognised send operation');
  } catch (error) {
    console.log('Message send failed: ', error);
    return {sendStatus: SendStatus.failed, message: message};
  }
}

/**
 * Send helpers for various type of send operations.
 */

async function journalingFailedActions(
  chatId: string,
  message: SendMessageParamsStrict,
) {
  //update send status in storage
  await updateMessageSendStatus(
    chatId,
    message.messageId,
    SendStatus.failed,
    true,
  );
  return {sendStatus: SendStatus.failed, message: message};
}

async function sendTextMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  //add messageId (with sender prefix) to sending queue on store
  // store.dispatch({
  //   type: 'ADD_TO_SENDING',
  //   payload: {chatId: chatId, messageId: message.messageId},
  // });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(savedMessage);
  }
  //encrypt message
  const ciphertext: string = await encryptMessage(
    chatId,
    JSON.stringify(message),
  );
  //try sending
  try {
    await trySendingMessage(chatId, ciphertext, isGroup);
    //if succeeds:
    //update message send status in storage
    await updateMessageSendStatus(
      chatId,
      message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    // store.dispatch({
    //   type: 'REMOVE_FROM_SENDING',
    //   payload: {
    //     chatId: chatId,
    //     messageId: message.messageId,
    //   },
    // });
    //update connection properties
    await updateConnectionOnNewMessage({
      chatId: chatId,
      text: savedMessage.data.text || '',
      readStatus: ReadStatus.sent,
      recentMessageType: savedMessage.contentType,
    });
    //return success status.
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    console.log('failed to send: ', error);
    //if fails, save to journal (if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      //await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        message.messageId,
        SendStatus.journaled,
        true,
      );
      //update connection properties
      await updateConnectionOnNewMessage({
        chatId: chatId,
        text: journaledMessage.data.text || '',
        readStatus: ReadStatus.journaled,
        recentMessageType: journaledMessage.contentType,
      });
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.journaled, message: journaledMessage};
    } catch (error) {
      console.log('Journaling failed: ', error);
      return await journalingFailedActions(chatId, message);
    }
  }
}

async function sendHandshakeDirectMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
): Promise<SendMessageOutput> {
  //add messageId (with sender prefix) to sending queue on store
  // store.dispatch({
  //   type: 'ADD_TO_SENDING',
  //   payload: {chatId: chatId, messageId: message.messageId},
  // });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(savedMessage);
  }
  //encrypt message
  const ciphertext: string = await encryptMessage(
    chatId,
    JSON.stringify(message),
  );
  //try sending
  try {
    await trySendingMessage(chatId, ciphertext);
    //if succeeds:
    //update message send status in storage
    await updateMessageSendStatus(
      chatId,
      message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    // store.dispatch({
    //   type: 'REMOVE_FROM_SENDING',
    //   payload: {
    //     chatId: chatId,
    //     messageId: message.messageId,
    //   },
    // });
    //return success status.
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    //if fails, save to journal (if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      //await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        message.messageId,
        SendStatus.journaled,
        true,
      );
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.journaled, message: journaledMessage};
    } catch (error) {
      console.log('Journaling failed: ', error);
      //remove message Id from sending store
      return await journalingFailedActions(chatId, message);
    }
  }
}

async function sendNameMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  //add messageId (with sender prefix) to sending queue on store
  // store.dispatch({
  //   type: 'ADD_TO_SENDING',
  //   payload: {chatId: chatId, messageId: message.messageId},
  // });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(savedMessage);
  }
  //encrypt message
  const ciphertext: string = await encryptMessage(
    chatId,
    JSON.stringify(message),
  );
  //try sending
  try {
    await trySendingMessage(chatId, ciphertext, isGroup);
    //if succeeds:
    //update message send status in storage
    await updateMessageSendStatus(
      chatId,
      message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    // store.dispatch({
    //   type: 'REMOVE_FROM_SENDING',
    //   payload: {
    //     chatId: chatId,
    //     messageId: message.messageId,
    //   },
    // });
    //return success status.
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    //if fails, save to journal (if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      //await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        message.messageId,
        SendStatus.journaled,
        true,
      );
      //remove message Id from sending store
      // store.dispatch({
      //   type: 'REMOVE_FROM_SENDING',
      //   payload: {
      //     chatId: chatId,
      //     messageId: message.messageId,
      //   },
      // });
      return {sendStatus: SendStatus.journaled, message: journaledMessage};
    } catch (error) {
      console.log('Journaling failed: ', error);
      //remove message Id from sending store
      return await journalingFailedActions(chatId, message);
    }
  }
}

async function sendMediaMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  //two cases:
  //1. mediaId created
  if (message.data.mediaId !== null && message.data.mediaId !== undefined) {
    //sending is routine
    return await mediaIdExistsActions(chatId, message, journal, isGroup);
  }
  //2. mediaId not yet created
  else {
    //try getting mediaId, fail message send if unsuccessful
    try {
      let destinationPath = '';
      if (message.contentType !== ContentType.displayImage) {
        destinationPath = await moveToMediaDir(
          chatId,
          message.data.fileUri,
          message.data.fileName,
        );
      }
      const savedMessage: SavedMessageParams = {
        ...message,
        data: {...message.data, fileUri: destinationPath},
        messageId: message.messageId,
        chatId: chatId,
        sender: true,
        timestamp: generateISOTimeStamp(),
        sendStatus: SendStatus.undefined,
      };
      if (journal) {
        //save message to storage only if not already journaled.
        await saveMessage(savedMessage);
      }
      const downloadParams: DownloadParams = await uploadLargeFile(
        savedMessage.data.fileUri,
      );
      const newData = {
        ...savedMessage.data,
        mediaId: downloadParams.mediaId,
        key: downloadParams.key,
      };
      if (journal) {
        //update message in storage only if not already journaled.
        await storage.updateMessage(chatId, message.messageId, newData, true);
      }
      //once mediaId is created, sending is routine.
      return await mediaIdExistsActions(
        chatId,
        {...message, data: newData},
        journal,
        isGroup,
      );
    } catch (error) {
      console.log('Error fetching mediaId and key: ', error);
      return await journalingFailedActions(chatId, message);
    }
  }
}

async function sendFileMessage(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  //two cases:
  //1. mediaId created
  if (message.data.mediaId !== null && message.data.mediaId !== undefined) {
    //sending is routine
    return await mediaIdExistsActions(chatId, message, journal, isGroup);
  }
  //2. mediaId not yet created
  else {
    //try getting mediaId, fail message send if unsuccessful
    try {
      let destinationPath = '';
      if (message.contentType !== ContentType.displayImage) {
        destinationPath = await moveToFilesDir(
          chatId,
          message.data.fileUri,
          message.data.fileName,
        );
      }
      const savedMessage: SavedMessageParams = {
        ...message,
        data: {...message.data, fileUri: destinationPath},
        messageId: message.messageId,
        chatId: chatId,
        sender: true,
        timestamp: generateISOTimeStamp(),
        sendStatus: SendStatus.undefined,
      };
      if (journal) {
        //save message to storage only if not already journaled.
        await saveMessage(savedMessage);
      }
      const downloadParams: DownloadParams = await uploadLargeFile(
        savedMessage.data.fileUri,
      );
      const newData = {
        ...savedMessage.data,
        mediaId: downloadParams.mediaId,
        key: downloadParams.key,
      };
      if (journal) {
        //update message in storage only if not already journaled.
        await storage.updateMessage(chatId, message.messageId, newData, true);
      }
      //once mediaId is created, sending is routine.
      return await mediaIdExistsActions(
        chatId,
        {...message, data: newData},
        journal,
        isGroup,
      );
    } catch (error) {
      console.log('Error fetching mediaId and key: ', error);
      return await journalingFailedActions(chatId, message);
    }
  }
}

async function mediaIdExistsActions(
  chatId: string,
  message: SendMessageParamsStrict,
  journal: boolean = true,
  isGroup: boolean = false,
): Promise<SendMessageOutput> {
  const newMessage = {
    ...message,
    data: {...message.data, fileUri: null},
  };
  //encrypt message
  const ciphertext: string = await encryptMessage(
    chatId,
    JSON.stringify(newMessage),
  );
  //try sending
  try {
    await trySendingMessage(chatId, ciphertext, isGroup);
    //if succeeds:
    //update message send status in storage
    await updateMessageSendStatus(
      chatId,
      message.messageId,
      SendStatus.success,
      true,
    );
    if (message.contentType !== ContentType.displayImage) {
      //update connection properties
      await updateConnectionOnNewMessage({
        chatId: chatId,
        readStatus: ReadStatus.sent,
        recentMessageType: newMessage.contentType,
        text: newMessage.data.text || '',
      });
    }
    //return success status.
    store.dispatch({
      type: 'NEW_SEND_STATUS_UPDATE',
      payload: {
        chatId: chatId,
        messageId: message.messageId,
        sendStatus: SendStatus.success,
        timestamp: generateISOTimeStamp(),
      },
    });
    return {
      sendStatus: SendStatus.success,
      message: message,
    };
  } catch (error) {
    try {
      //if fails, save to journal (only if journaling is ON), update connection
      if (!journal) {
        throw new Error('Journal disabled');
      }
      const journaledMessage: JournaledMessageParams = {
        ...message,
        chatId,
      };
      //await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        message.messageId,
        SendStatus.journaled,
        true,
      );
      //update connection properties
      await updateConnectionOnNewMessage({
        chatId: chatId,
        readStatus: ReadStatus.journaled,
        recentMessageType: journaledMessage.contentType,
        text: journaledMessage.data.text || '',
      });
      return {sendStatus: SendStatus.journaled, message: journaledMessage};
    } catch (error) {
      return await journalingFailedActions(chatId, message);
    }
  }
}

/**
 * Sends a message asynchronously using the Messaging API.
 *
 * @param {string} message - The encrypted message to send.
 * @throws {Error} If there's an issue generating a valid token or sending the message.
 * @returns {Promise<void>} A Promise that resolves once the message is sent successfully.
 */
async function trySendingMessage(
  chatId: string,
  message: string,
  isGroup: boolean = false,
): Promise<void> {
  const token: ServerAuthToken = await getToken();
  if (isGroup) {
    await axios.post(
      GROUP_MESSAGING_RESOURCE,
      {
        type: 'group',
        message: message,
        chat: chatId,
      },
      {headers: {Authorization: `${token}`}},
    );
  } else {
    await axios.post(
      DIRECT_MESSAGING_RESOURCE,
      {
        message: message,
        line: chatId,
      },
      {headers: {Authorization: `${token}`}},
    );
  }
  console.log('messages sent successfully: ', JSON.parse(message));
}

/**
 * Tries to empty journal by sending messages.
 * unsent messages get re-journaled.
 */

export async function tryToSendJournaled() {
  try {
    //get current journal
    const journaledMessages = await getJournaled();
    console.log('journaled messages: ', journaledMessages);
    for (let index = 0; index < journaledMessages.length; index++) {
      const {contentType, data, replyId, messageId, chatId} =
        journaledMessages[index];
      const connection = await getConnection(chatId);
      const isGroup =
        connection.connectionType === ConnectionType.group ? true : false;
      const sendOutput = await sendMessage(
        chatId,
        {
          contentType,
          data,
          messageId,
          replyId,
        },
        false,
        isGroup,
      );
      console.log('send output: ', sendOutput);
    }
  } catch (error) {
    console.log('Error in emptying journal: ', error);
  }
}

function generateRandomHexId(): string {
  // Generate a UUID
  const uuidv4 = uuid.v4();
  const hexUUID = uuidv4.toString().replace(/-/g, '');
  return hexUUID;
}

async function saveMessage(
  message: SavedMessageParams,
  blocking: boolean = true,
): Promise<void> {
  await storage.saveMessage(message, blocking);
  store.dispatch({
    type: 'NEW_SENT_MESSAGE',
    payload: message,
  });
}

async function updateMessageSendStatus(
  chatId: string,
  messageId: string, //with sender prefix
  updatedStatus: SendStatus,
  blocking: boolean = true,
): Promise<void> {
  await storage.updateMessageSendStatus(
    chatId,
    messageId,
    updatedStatus,
    blocking,
  );
  store.dispatch({
    type: 'NEW_SEND_STATUS_UPDATE',
    payload: {
      chatId: chatId,
      messageId: messageId,
      sendStatus: updatedStatus,
      timestamp: generateISOTimeStamp(),
    },
  });
}
