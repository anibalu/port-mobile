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
import {
  saveMessage,
  updateMessage,
  updateMessageSendStatus,
} from '../Storage/messages';
import {getJournal, saveToJournal, updateJournal} from './journal';
import {DownloadParams, uploadLargeFile} from './largeData';
import {
  copyToFilesDir,
  copyToMediaDir,
} from '../Storage/StorageRNFS/sharedFileHandlers';
import {encryptMessage} from '../Crypto/aes';
import {getToken} from '../ServerAuth';
import {ServerAuthToken} from '../ServerAuth/interfaces';
import {updateConnectionOnNewMessage} from '../Connections';
import {ReadStatus} from '../Connections/interfaces';
import store from '../../store/appStore';

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
  //ensure message has a valid message Id
  const tempMessageId = message.messageId || generateTempMessageId();
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
  return {sendStatus: SendStatus.failed, message: message};
}

/**
 * Send helpers for various type of send operations.
 */

async function journalingFailedActions(
  chatId: string,
  message: SendMessageParamsStrict,
) {
  //remove message Id from sending store
  store.dispatch({
    type: 'REMOVE_FROM_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
  //update send status in storage
  await updateMessageSendStatus(
    chatId,
    getSenderPrefix() + message.messageId,
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
  store.dispatch({
    type: 'ADD_TO_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: getSenderPrefix() + message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(chatId, savedMessage);
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
      getSenderPrefix() + message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    store.dispatch({
      type: 'REMOVE_FROM_SENDING',
      payload: {
        chatId: chatId,
        messageId: getSenderPrefix() + message.messageId,
      },
    });
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
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        getSenderPrefix() + message.messageId,
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
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
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
  store.dispatch({
    type: 'ADD_TO_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: getSenderPrefix() + message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(chatId, savedMessage);
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
      getSenderPrefix() + message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    store.dispatch({
      type: 'REMOVE_FROM_SENDING',
      payload: {
        chatId: chatId,
        messageId: getSenderPrefix() + message.messageId,
      },
    });
    //return success status.
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    //if fails, save to journal (if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        getSenderPrefix() + message.messageId,
        SendStatus.journaled,
        true,
      );
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
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
  store.dispatch({
    type: 'ADD_TO_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
  const savedMessage: SavedMessageParams = {
    ...message,
    messageId: getSenderPrefix() + message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //save message to storage only if not already journaled.
    await saveMessage(chatId, savedMessage);
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
      getSenderPrefix() + message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    store.dispatch({
      type: 'REMOVE_FROM_SENDING',
      payload: {
        chatId: chatId,
        messageId: getSenderPrefix() + message.messageId,
      },
    });
    //return success status.
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    //if fails, save to journal (if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      //add to journal
      await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        getSenderPrefix() + message.messageId,
        SendStatus.journaled,
        true,
      );
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
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
  //add messageId (with sender prefix) to sending queue on store
  store.dispatch({
    type: 'ADD_TO_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
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
      const savedMessage: SavedMessageParams = {
        ...message,
        messageId: getSenderPrefix() + message.messageId,
        chatId: chatId,
        sender: true,
        timestamp: generateISOTimeStamp(),
        sendStatus: SendStatus.undefined,
      };
      if (journal) {
        //save message to storage only if not already journaled.
        await saveMessage(chatId, savedMessage);
      }
      const downloadParams: DownloadParams = await uploadLargeFile(
        message.data.fileUri,
      );
      let destinationPath = '';
      if (message.contentType !== ContentType.displayImage) {
        destinationPath = await copyToMediaDir(
          chatId,
          message.data.fileUri,
          message.data.fileName,
        );
      }
      const newData = {
        ...message.data,
        mediaId: downloadParams.mediaId,
        key: downloadParams.key,
        fileUri: destinationPath,
      };
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
  //add messageId (with sender prefix) to sending queue on store
  store.dispatch({
    type: 'ADD_TO_SENDING',
    payload: {chatId: chatId, messageId: getSenderPrefix() + message.messageId},
  });
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
      const savedMessage: SavedMessageParams = {
        ...message,
        messageId: getSenderPrefix() + message.messageId,
        chatId: chatId,
        sender: true,
        timestamp: generateISOTimeStamp(),
        sendStatus: SendStatus.undefined,
      };
      if (journal) {
        //save message to storage only if not already journaled.
        await saveMessage(chatId, savedMessage);
      }
      const downloadParams: DownloadParams = await uploadLargeFile(
        message.data.fileUri,
      );
      const destinationPath = await copyToFilesDir(
        chatId,
        message.data.fileUri,
        message.data.fileName,
      );
      const newData = {
        ...message.data,
        mediaId: downloadParams.mediaId,
        key: downloadParams.key,
        fileUri: destinationPath,
      };
      //once mediaId is created, sending is routine.
      return await mediaIdExistsActions(
        chatId,
        {...message, data: newData},
        journal,
        isGroup,
      );
    } catch (error) {
      console.log('Error fetching mediaId and key: ', error);
      return {sendStatus: SendStatus.failed, message: message};
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
  const savedMessage: SavedMessageParams = {
    ...message,
    data: {...message.data, mediaId: null, key: null},
    messageId: getSenderPrefix() + message.messageId,
    chatId: chatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
    sendStatus: SendStatus.undefined,
  };
  if (journal) {
    //update message in storage only if not already journaled.
    await updateMessage(
      chatId,
      getSenderPrefix() + message.messageId,
      savedMessage,
    );
  }
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
      getSenderPrefix() + message.messageId,
      SendStatus.success,
      true,
    );
    //remove messageId from store
    store.dispatch({
      type: 'REMOVE_FROM_SENDING',
      payload: {
        chatId: chatId,
        messageId: getSenderPrefix() + message.messageId,
      },
    });
    if (message.contentType !== ContentType.displayImage) {
      //update connection properties
      await updateConnectionOnNewMessage({
        chatId: chatId,
        readStatus: ReadStatus.sent,
        recentMessageType: savedMessage.contentType,
        text: savedMessage.data.text || '',
      });
    }
    //return success status.
    console.log('message sent successfully');
    return {sendStatus: SendStatus.success, message: savedMessage};
  } catch (error) {
    console.log('failed to send: ', error);
    //if fails, save to journal (only if journaling is ON), update connection
    if (!journal) {
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
      return {sendStatus: SendStatus.failed, message: message};
    }
    const journaledMessage: JournaledMessageParams = {
      ...message,
      chatId,
    };
    try {
      await saveToJournal(journaledMessage);
      //update send status in storage
      await updateMessageSendStatus(
        chatId,
        getSenderPrefix() + message.messageId,
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
      //remove message Id from sending store
      store.dispatch({
        type: 'REMOVE_FROM_SENDING',
        payload: {
          chatId: chatId,
          messageId: getSenderPrefix() + message.messageId,
        },
      });
      return {sendStatus: SendStatus.journaled, message: journaledMessage};
    } catch (error) {
      console.log('Journaling failed: ', error);
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
    await axios.post(GROUP_MESSAGING_RESOURCE, {
      token: token,
      type: 'group',
      message: message,
      chat: chatId,
    });
  } else {
    await axios.post(DIRECT_MESSAGING_RESOURCE, {
      token: token,
      message: message,
      line: chatId,
    });
  }
  console.log('messages sent: ', JSON.parse(message));
}

/**
 * Generates unique message ID based on the current time.
 * @returns {string} A unique message ID
 */
export function generateTempMessageId(): string {
  const date = new Date();
  return date.getTime().toString();
}
function getSenderPrefix() {
  return '0001_';
}

/**
 * Tries to empty journal by sending messages.
 * unsent messages get re-journaled.
 */

export async function tryToSendJournaled() {
  //get current journal
  const journaledMessages = await getJournal();
  while (journaledMessages.length > 0) {
    const {contentType, messageType, data, replyId, messageId, chatId} =
      journaledMessages[0];
    const sendOutput = await sendMessage(
      chatId,
      {
        messageType,
        contentType,
        data,
        messageId,
        replyId,
      },
      false,
    );
    if (sendOutput.sendStatus === SendStatus.success) {
      journaledMessages.shift();
    } else {
      break;
    }
  }
  //update journal with new journal
  await updateJournal(journaledMessages);
}
