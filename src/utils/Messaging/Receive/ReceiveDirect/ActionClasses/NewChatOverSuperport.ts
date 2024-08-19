import {useCreatedBundle} from '@utils/Ports';
import DirectReceiveAction from '../DirectReceiveAction';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';

class NewChatOverSuperport extends DirectReceiveAction {
  /**
   * new chat creation classes can skip validation.
   */
  async validate(): Promise<void> {}
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useCreatedBundle(
      this.lineId,
      this.message.superportId,
      BundleTarget.superportDirect,
      this.message.pairHash,
      this.message.introduction,
    );
  }
}

export default NewChatOverSuperport;
