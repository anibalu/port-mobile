import {NameParams} from '@utils/Messaging/interfaces';
import GroupReceiveAction from '../GroupReceiveAction';
import Group from '@utils/Groups/Group';

class ReceiveName extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    const name = (this.decryptedMessageContent.data as NameParams).name || null;
    if (name) {
      const groupHandler = new Group(this.chatId);
      await groupHandler.updateMemberContactData(this.senderId, {name: name});
    }
  }
}

export default ReceiveName;
