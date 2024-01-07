import {useCreatedBundle} from '@utils/Ports';
import DirectReceiveAction from '../DirectReceiveAction';
import {BundleTarget} from '@utils/Ports/interfaces';

class NewChatOverSuperport extends DirectReceiveAction {
  async performAction(): Promise<void> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useCreatedBundle(
      this.chatId,
      this.message.superportId,
      BundleTarget.superportDirect,
    );
  }
}

export default NewChatOverSuperport;
