import store from '@store/appStore';

import { SuperPort } from '@utils/Ports/SuperPorts/SuperPort';

import DirectReceiveAction from '../DirectReceiveAction';

class NewChatOverSuperport extends DirectReceiveAction {
  /**
   * new chat creation classes can skip validation.
   */
  async validate(): Promise<void> { }
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    try {
      //create new chat over super port
      const port = await SuperPort.generator.fromPortId(this.message.superportId);
      await port.use(this.lineId, this.message.pairHash, this.message.introduction);
      //update store of new connection
      store.dispatch({
        type: 'NEW_CONNECTION',
        payload: {
          lineId: this.lineId,
          connectionLinkId: this.message.superportId,
        },
      });
    } catch (error) {
      console.log('Error creating new chat over super port: ', error);
    }
  }
}

export default NewChatOverSuperport;
