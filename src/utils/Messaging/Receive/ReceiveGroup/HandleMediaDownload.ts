import store from '@store/appStore';
import {ContentType, LargeDataParams} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import * as storage from '@utils/Storage/messages';
import {createThumbnail} from 'react-native-create-thumbnail';
import LargeDataDownload from '@utils/Messaging/LargeData/LargeDataDownload';
import {getRelativeURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {updateMedia} from '@utils/Storage/media';
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
      const downloader = new LargeDataDownload(
        chatId,
        message.contentType,
        mediaId,
        key,
        (message.data as LargeDataParams).fileName,
      );
      await downloader.download();
      const fileUri = downloader.getDownloadedFilePath();

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
        fileUri: getRelativeURI(fileUri, 'doc'),
        mediaId: null,
        key: null,
        previewUri: previewPath?.path
          ? getRelativeURI(previewPath.path, 'cache')
          : undefined,
      };

      //Saves relative URIs for the paths
      await updateMedia(mediaId, {
        type: message.contentType,
        name: data.fileName,
        filePath: data.fileUri,
        previewPath: data.previewUri,
      });

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
