import store from '@store/appStore';
import {generateRandomHexId} from '@utils/IdGenerator';
import {LinkParams} from '@utils/Messaging/interfaces';
import {downloadImageToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';
import {getMessage} from '@utils/Storage/messages';
import {OpenGraphParser} from 'react-native-opengraph-kit';

/**
 * Function to handle media download for a message. Can be called asynchronosly, or awaited.
 * @param chatId
 * @param messageId
 */
export const handleAsyncLinkDownload = async (
  chatId: string,
  messageId: string,
  receiveTime: string,
): Promise<void> => {
  const message = await getMessage(chatId, messageId);
  if (message?.data) {
    const initialDataObj = message.data as LinkParams;
    const openGraphData = await fetchData(initialDataObj.linkUri);
    let fileUri = openGraphData
      ? await downloadImageToMediaDir(
          chatId,
          initialDataObj.fileName || generateRandomHexId(),
          openGraphData['og:image'] || openGraphData.image || null,
        )
      : null;

    const dataObj: LinkParams = {
      title: initialDataObj.title,
      description: initialDataObj.description,
      fileUri: fileUri,
      linkUri: initialDataObj.linkUri,
      fileName: initialDataObj.fileName || generateRandomHexId(),
      text: initialDataObj.text,
      mediaId: fileUri ? generateRandomHexId() : undefined,
    };

    const mediaId = dataObj.mediaId;

    if (mediaId) {
      await saveNewMedia(mediaId, chatId, messageId, receiveTime);

      //Saves relative URIs for the paths
      await updateMedia(mediaId, {
        type: message.contentType,
        name: dataObj.fileName as string,
        filePath: dataObj.fileUri as string,
      });
    }
    await storage.updateMessage(chatId, messageId, dataObj);
    store.dispatch({
      type: 'NEW_MEDIA_STATUS_UPDATE',
      payload: {
        chatId: chatId,
        messageId: messageId,
        data: dataObj,
      },
    });
  }
};

async function fetchData(url?: string): Promise<object | null> {
  if (url) {
    try {
      const dataPromise = OpenGraphParser.extractMeta(url);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(), 2000),
      );
      const data = await Promise.race([dataPromise, timeoutPromise]);
      return data[0];
    } catch (error) {
      console.log('Error fetching Open Graph data:', error);
    }
  }

  return null;
}
