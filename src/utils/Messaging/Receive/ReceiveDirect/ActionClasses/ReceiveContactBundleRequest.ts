// this is to receieve a contact bundle request
import DirectReceiveAction from '../DirectReceiveAction';
import {ContactBundleRequestParams} from '@utils/Messaging/interfaces';
import {respondToShareContactRequest} from '@utils/ContactSharing';

class ReceiveContactBundleRequest extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const destinationName = (
      this.decryptedMessageContent.data as ContactBundleRequestParams
    ).destinationName;

    await respondToShareContactRequest(this.chatId, destinationName);
  }
}

export default ReceiveContactBundleRequest;
