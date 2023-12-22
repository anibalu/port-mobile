import {DisplayImageParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnection} from '@utils/Connections';
import {downloadData} from '@utils/Messaging/largeData';
import {decryptFile} from '@utils/Crypto/aes';
import {saveToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

class ReceiveDisplayImage extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //try to download file
    if (
      !(this.decryptedMessageContent.data as DisplayImageParams).mediaId ||
      !(this.decryptedMessageContent.data as DisplayImageParams).key
    ) {
      throw new Error('MediaIdOrKeyNull');
    }
    const mediaId = (this.decryptedMessageContent.data as DisplayImageParams)
      .mediaId as string;
    const key = (this.decryptedMessageContent.data as DisplayImageParams)
      .key as string;
    const ciphertext = await downloadData(mediaId);
    //decrypt file with key
    const plaintext = await decryptFile(ciphertext, key);
    //save file to chat storage and update fileUri
    const fileUri = await saveToMediaDir(
      this.chatId,
      plaintext,
      (this.decryptedMessageContent.data as DisplayImageParams).fileName,
    );
    //save message to storage
    await this.saveMessage({
      ...(this.decryptedMessageContent.data as DisplayImageParams),
      fileUri: fileUri,
      mediaId: null,
      key: null,
    });
    //update connection
    await updateConnection({
      chatId: this.chatId,
      pathToDisplayPic: 'file://' + fileUri,
    });
  }
}

export default ReceiveDisplayImage;
