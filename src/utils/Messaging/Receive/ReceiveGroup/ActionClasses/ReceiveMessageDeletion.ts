import {ContentType, DeletionParams} from '@utils/Messaging/interfaces';
import {updateConnectionIfLatestMessageIsX} from '@utils/Storage/connections';
import {
  cleanDeleteGroupMessage,
  getGroupMessage,
} from '@utils/Storage/groupMessages';

import GroupReceiveAction from '../GroupReceiveAction';

class ReceiveMessageDeletion extends GroupReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const deletion = this.decryptedMessageContent.data as DeletionParams;
    const message = await getGroupMessage(
      this.chatId,
      deletion.messageIdToDelete,
    );
    if (message?.memberId && message.memberId === this.senderId) {
      await cleanDeleteGroupMessage(
        this.chatId,
        deletion.messageIdToDelete,
        true,
      );
      const update = {
        chatId: this.chatId,
        text: 'This message was deleted',
        recentMessageType: ContentType.deleted,
      };
      await updateConnectionIfLatestMessageIsX(
        deletion.messageIdToDelete,
        update,
      );
    }
  }
}

export default ReceiveMessageDeletion;
