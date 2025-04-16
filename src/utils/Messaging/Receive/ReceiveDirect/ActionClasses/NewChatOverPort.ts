import store from '@store/appStore';

import { Port } from '@utils/Ports/SingleUsePorts/Port';

import DirectReceiveAction from '../DirectReceiveAction';

class NewChatOverPort extends DirectReceiveAction {
  /**
   * new chat creation classes can skip validation.
   */
  async validate(): Promise<void> {}

  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    try {
      //create new chat over port
      const port = await Port.generator.fromPortId(this.message.lineLinkId);
      await port.use(this.lineId, this.message.pairHash, this.message.introduction);
      //update store of new connection
      store.dispatch({
        type: 'NEW_CONNECTION',
        payload: {
          lineId: this.lineId,
          connectionLinkId: this.message.lineLinkId,
        },
      });
    } catch (error) {
      console.log('Error creating new chat over port: ', error);
    }
  }
}

export default NewChatOverPort;
