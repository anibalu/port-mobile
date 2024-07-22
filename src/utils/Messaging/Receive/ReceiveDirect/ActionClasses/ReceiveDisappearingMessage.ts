import DirectChat from '@utils/DirectChats/DirectChat';
import {
  DisappearingMessageParams,
  MessageStatus,
} from '@utils/Messaging/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnectionOnNewMessage} from '@utils/Connections';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

class ReceiveDisappearingMessage extends DirectReceiveAction {
  generatePreviewText() {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const data = this.decryptedMessageContent.data as DisappearingMessageParams;
    const text = getConnectionTextByContentType(
      this.decryptedMessageContent.contentType,
      data,
    );
    return text;
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    const data = this.decryptedMessageContent.data as DisappearingMessageParams;
    //save message to storage
    await this.saveMessage();

    const dataHandler = new DirectChat(this.chatId);

    const chatData = await (dataHandler as DirectChat).getChatData();
    const permissions = await getPermissions(chatData.permissionsId);
    const updatedPermissions = {
      ...permissions,
      ['disappearingMessages']: data.timeoutValue,
    };

    if (chatData.permissionsId) {
      await updatePermissions(chatData.permissionsId, updatedPermissions);
    }

    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        text: this.generatePreviewText(),
        readStatus: MessageStatus.latest,
        recentMessageType: this.decryptedMessageContent.contentType,
        latestMessageId: this.decryptedMessageContent.messageId,
        timestamp: this.receiveTime,
      },
      NewMessageCountAction.unchanged,
    );
  }
}

export default ReceiveDisappearingMessage;
