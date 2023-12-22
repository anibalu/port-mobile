import {NameParams} from '@utils/Messaging/interfaces';
import {DEFAULT_NAME} from '@configs/constants';
import GroupReceiveAction from '../GroupReceiveAction';
import {updateMemberName} from '@utils/Groups';

class ReceiveName extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    await updateMemberName(
      this.chatId,
      this.senderId,
      (this.decryptedMessageContent.data as NameParams).name || DEFAULT_NAME,
    );
  }
}

export default ReceiveName;
