import {useCreatedBundle} from '@utils/Ports';
import DirectReceiveAction from '../DirectReceiveAction';
import {BundleTarget} from '@utils/Ports/interfaces';

class NewChatOverPort extends DirectReceiveAction {
  async performAction(): Promise<void> {
    console.log('newchatoverport pairhash: ', this.message.pairHash);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useCreatedBundle(
      this.chatId,
      this.message.lineLinkId,
      BundleTarget.direct,
      this.message.pairHash,
    );
  }
}

export default NewChatOverPort;
