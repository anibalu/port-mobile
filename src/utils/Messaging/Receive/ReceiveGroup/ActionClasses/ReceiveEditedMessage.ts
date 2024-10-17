import {ContentType, editableContentTypes} from '@utils/Messaging/interfaces';
import {updateConnectionIfLatestMessageIsX} from '@utils/Storage/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import * as storage from '@utils/Storage/groupMessages';
import GroupReceiveAction from '../GroupReceiveAction';

/**
 * This receive edited message gets decryptedMessageContent which has an messageIdToEdit and text.
 * We use these parameters to update the original message using updateMessageData util. We also wanna make
 * sure to guard against this message getting edited.
 */
class ReceiveEditedMessage extends GroupReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const text = getConnectionTextByContentType(
      this.decryptedMessageContent.contentType,
      this.decryptedMessageContent.data,
    );
    return text;
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const messageIdToEdit = this.decryptedMessageContent.data?.messageIdToEdit;
    const editedText = this.decryptedMessageContent.data?.text;
    const message = await storage.getGroupMessage(this.chatId, messageIdToEdit);
    if (
      !message?.sender &&
      editableContentTypes.includes(message?.contentType)
    ) {
      await storage.updateGroupMessageData(this.chatId, messageIdToEdit, {
        text: editedText,
        messageIdToEdit: messageIdToEdit,
      });
      await this.updateConnectionInfo(messageIdToEdit);
    } else {
      return;
    }
  }

  private async updateConnectionInfo(messageIdToEdit: string) {
    const update = {
      chatId: this.chatId,
      text: this.generatePreviewText(),
      recentMessageType: ContentType.editedMessage,
    };
    await updateConnectionIfLatestMessageIsX(messageIdToEdit, update);
  }
}

export default ReceiveEditedMessage;
