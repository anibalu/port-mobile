/**
 * Tries to empty journal by sending messages.
 * unsent messages get re-journaled.
 */
import {getGroupJournaled, getJournaled} from '@utils/Storage/messages';
import SendMessage from './SendMessage';

async function sendJournaled() {
  try {
    //get current journal

    const journaledGroupMessages = await getGroupJournaled();
    for (let index = 0; index < journaledGroupMessages.length; index++) {
      const {contentType, data, replyId, messageId, chatId} =
        journaledGroupMessages[index];

      const sender = new SendMessage(
        chatId,
        contentType,
        data,
        replyId,
        messageId,
      );
      await sender.send(false);
    }

    const journaledMessages = await getJournaled();
    for (let index = 0; index < journaledMessages.length; index++) {
      const {contentType, data, replyId, messageId, chatId} =
        journaledMessages[index];

      const sender = new SendMessage(
        chatId,
        contentType,
        data,
        replyId,
        messageId,
      );
      await sender.send(false);
    }
  } catch (error) {
    console.log('Error in emptying journal: ', error);
  }
}

export default sendJournaled;
