import {ContentType, DeletionParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {cleanDeleteMessage} from '@utils/Storage/messages';
import {updateConnectionIfLatestMessageIsX} from '@utils/Storage/connections';

class ReceiveMessageDeletion extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const deletion = this.decryptedMessageContent.data as DeletionParams;
    await cleanDeleteMessage(this.chatId, deletion.messageIdToDelete, true);

    const update = {
      chatId: this.chatId,
      text: 'This message was deleted',
      recentMessageType: ContentType.deleted,
    };
    await updateConnectionIfLatestMessageIsX({
      messageIdToBeUpdated: deletion.messageIdToDelete,
      update,
    });
  }
}

export default ReceiveMessageDeletion;
