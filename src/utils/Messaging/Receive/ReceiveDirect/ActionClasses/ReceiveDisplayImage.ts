import {DisplayImageParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {downloadData} from '@utils/Messaging/LargeData/largeData';
import {decryptFile} from '@utils/Crypto/aes';
import {saveToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import DirectChat from '@utils/DirectChats/DirectChat';
import {DEFAULT_AVATAR} from '@configs/constants';

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
    if (!ciphertext) {
      throw new Error('NoMediaAvailable');
    }
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
    const chat = new DirectChat(this.chatId);
    await chat.updateDisplayPic(fileUri || DEFAULT_AVATAR);
  }
}

export default ReceiveDisplayImage;
