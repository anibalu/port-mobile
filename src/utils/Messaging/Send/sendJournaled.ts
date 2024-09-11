/**
 * Tries to empty journal by sending messages.
 * unsent messages get re-journaled.
 */
import {getJournaled} from '@utils/Storage/messages';
import {getGroupJournaled} from '@utils/Storage/groupMessages';
import SendMessage from './SendMessage';

async function sendJournaled() {
  try {
    //get current journal

    const journaledGroupMessages = await getGroupJournaled();
    for (let index = 0; index < journaledGroupMessages.length; index++) {
      const {contentType, data, replyId, messageId, chatId, singleRecepient} =
        journaledGroupMessages[index];

      const sender = new SendMessage(
        chatId,
        contentType,
        data,
        replyId,
        messageId,
        singleRecepient,
      );
      await sender.retry();
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
      await sender.retry();
    }
  } catch (error) {
    console.log('Error in emptying journal: ', error);
  }
}

export default sendJournaled;
