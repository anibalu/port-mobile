

import store from '@store/appStore';

import { ContactPort } from '@utils/Ports/ContactPorts/ContactPort';

import DirectReceiveAction from '../DirectReceiveAction';

class NewChatOverContactPort extends DirectReceiveAction {
  /**
   * new chat creation classes can skip validation.
   */
  async validate(): Promise<void> {}

  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    try {
            //create new chat over contact port
            const port = await ContactPort.generator.shared.fromPortId(this.message.lineLinkId);
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
      console.log('Error creating new chat over contact port: ', error);
    }
  }
}

export default NewChatOverContactPort;
