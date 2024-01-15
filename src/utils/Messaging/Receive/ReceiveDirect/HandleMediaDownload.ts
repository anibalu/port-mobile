import store from '@store/appStore';
import {decryptFile} from '@utils/Crypto/aes';
import {downloadData} from '@utils/Messaging/LargeData/largeData';
import {ContentType, LargeDataParams} from '@utils/Messaging/interfaces';
import {
  saveToFilesDir,
  saveToMediaDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as storage from '@utils/Storage/messages';
import {getMessage} from '@utils/Storage/messages';
import {createThumbnail} from 'react-native-create-thumbnail';

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

      const fileUri =
        message.contentType === ContentType.file
          ? await saveToFilesDir(
              chatId,
              plaintext,
              (message.data as LargeDataParams).fileName,
            )
          : await saveToMediaDir(
              chatId,
              plaintext,
              (message.data as LargeDataParams).fileName,
            );

      const previewPath =
        message.contentType === ContentType.video
          ? await createThumbnail({
              url: fileUri,
              timeStamp: 0,
              cacheName: mediaId,
            })
          : undefined;

      const data = {
        ...(message.data as LargeDataParams),
        fileUri: fileUri,
        mediaId: null,
        key: null,
        previewUri: previewPath?.path ? previewPath.path : undefined,
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
