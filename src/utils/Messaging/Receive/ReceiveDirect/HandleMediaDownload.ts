import store from '@store/appStore';
import {decryptFile} from '@utils/Crypto/aes';
import {LargeDataParams} from '@utils/Messaging/interfaces';
import {downloadData} from '@utils/Messaging/LargeData/largeData';
import {saveToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getMessage} from '@utils/Storage/messages';
import * as storage from '@utils/Storage/messages';

/**
 * Function to handle media download for a message. Can be called asynchronosly, or awaited.
 * @param chatId
 * @param messageId
 */
export const handleAsyncMediaDownload = async (
  chatId: string,
  messageId: string,
): Promise<void> => {
  const message = await getMessage(chatId, messageId);

  if (message?.data) {
    const mediaId = (message.data as LargeDataParams).mediaId;
    const key = (message.data as LargeDataParams).key;
    if (mediaId && key) {
      const ciphertext = await downloadData(mediaId);
      if (!ciphertext) {
        throw new Error('NoMediaAvailable');
      }
      //decrypt media with key
      const plaintext = await decryptFile(ciphertext, key);

      const fileUri = await saveToMediaDir(
        chatId,
        plaintext,
        (message.data as LargeDataParams).fileName,
      );

      const data = {
        ...(message.data as LargeDataParams),
        fileUri: fileUri,
        mediaId: null,
        key: null,
      };

      await storage.updateMessage(chatId, messageId, data);
      store.dispatch({
        type: 'NEW_MEDIA_STATUS_UPDATE',
        payload: {
          chatId: chatId,
          messageId: messageId,
          data: data,
        },
      });
    }
  }
};
