import store from '@store/appStore';
import DirectReceiveAction from '../DirectReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';
import DirectChat from '@utils/DirectChats/DirectChat';

class ReceiveDisplayImage extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.saveMessage();
    this.handleDownload();
  }
  //actual download and post process step.
  async handleDownload(): Promise<void> {
    try {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const data = await handleAsyncMediaDownload(
        this.chatId,
        this.decryptedMessageContent.messageId,
      );
      const chat = new DirectChat(this.chatId);
      await chat.updateDisplayPic('media://' + data.mediaId);
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
    } catch (error) {
      console.log('Error downloading media: ', error);
    }
  }
}

export default ReceiveDisplayImage;
