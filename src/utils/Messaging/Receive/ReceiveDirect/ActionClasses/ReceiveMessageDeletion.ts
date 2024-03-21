import {DeletionParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {cleanDeleteMessage} from '@utils/Storage/messages';

class ReceiveMessageDeletion extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const deletion = this.decryptedMessageContent.data as DeletionParams;
    cleanDeleteMessage(this.chatId, deletion.messageIdToDelete, true);
  }
}

export default ReceiveMessageDeletion;
