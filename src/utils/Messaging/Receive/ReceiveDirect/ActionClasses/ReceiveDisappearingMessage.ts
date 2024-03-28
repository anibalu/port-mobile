import DirectChat from '@utils/DirectChats/DirectChat';
import {DisappearingMessageParams} from '@utils/Messaging/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveDisappearingMessage extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const data = this.decryptedMessageContent.data as DisappearingMessageParams;

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

    //save message to storage
    await this.saveMessage();
  }
}

export default ReceiveDisappearingMessage;
