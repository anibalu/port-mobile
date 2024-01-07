import {NameParams} from '@utils/Messaging/interfaces';
import {DEFAULT_NAME} from '@configs/constants';
import GroupReceiveAction from '../GroupReceiveAction';
import Group from '@utils/Groups/Group';

class ReceiveName extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    const groupHandler = new Group(this.chatId);
    await groupHandler.updateMemberName(
      this.senderId,
      (this.decryptedMessageContent.data as NameParams).name || DEFAULT_NAME,
    );
  }
}

export default ReceiveName;
