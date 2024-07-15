import {createPreview} from '@utils/ImageUtils';
import LargeDataDownload from '@utils/Messaging/LargeData/LargeDataDownload';
import {LargeDataParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {updateMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';
import {getMessage} from '@utils/Storage/messages';

/**
 * Function to handle media download for a message. Can be called asynchronosly, or awaited.
 * @param chatId
 * @param messageId
 */
export const handleAsyncMediaDownload = async (
  chatId: string,
  messageId: string,
): Promise<string | null> => {
  const message = await getMessage(chatId, messageId);
  //download will only move forward if message data exists.
  if (!(message && message.data)) {
    throw new Error('Message Data not found');
  }
  const mediaId = (message.data as LargeDataParams).mediaId;
  const key = (message.data as LargeDataParams).key;
  //don't proceed if mediaId or key don't exist
  if (!(mediaId && key)) {
    throw new Error('No mediaId or key');
  }
  const downloader = new LargeDataDownload(
    chatId,
    message.contentType,
    mediaId,
    key,
    (message.data as LargeDataParams).fileName,
  );
  //download and decrypt file to a local location.
  await downloader.download();
  const fileUri = downloader.getDownloadedFilePath();
  //generate preview path for images, videos and display pictures.
  const previewConfig = {
    chatId: chatId,
    url: getSafeAbsoluteURI(fileUri),
  };
  const previewPath = await createPreview(message.contentType, previewConfig);
  const data = {
    ...(message.data as LargeDataParams),
    fileUri: fileUri,
    previewUri: previewPath,
  };
  //update media entry with relative URIs for the paths
  await updateMedia(message.mediaId || '', {
    type: message.contentType,
    name: data.fileName,
    filePath: data.fileUri,
    previewPath: data.previewUri,
  });
  await storage.updateMessageData(chatId, messageId, data);
  return message.mediaId || null;
};
