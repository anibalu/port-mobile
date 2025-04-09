import {getMessage} from '@utils/Storage/messages';
import {getMedia} from '@utils/Storage/DBCalls/media';
import {getConnection} from '@utils/Storage/connections';
import * as API from './APICalls';
import {LineIllegalReport} from './index';
import {ContentType} from '@utils/Messaging/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';
import {generateISOTimeStamp} from '@utils/Time';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

/**
 * Tries to create a LineIllegalReport and calls submitIllegalReport
 * @param {string} chatId  - Id of the chat
 * @param {string} messageId  - Id of the message
 * @param {string} reportType  - type of report in REPORT_TYPE_MAP
 * @param {string} additionalInfo  - Additional information, if any
 * @returns {string} - response data from submitIllegalReport
 */
export async function createLineMessageReport(
  chatId: string,
  messageId: string,
  reportType: string, //todo: joe - change type
  additionalInfo: string = '',
): Promise<string> {
  const attachedFiles = []; // Using an array in case we allow bulk reporting of media
  let contentType: string = ''; // Content-Type HTTP header is not mandatory but it is recommended
  const message = await getMessage(chatId, messageId);
  const mediaId = message?.mediaId;
  if (mediaId) {
    const media = await getMedia(mediaId);
    // If we want to POST multiple files, we need to use a for loop
    if (media) {
      const mediaType = media?.type;
      switch (mediaType) {
        case ContentType.video:
          contentType = 'video/mp4';
          break;

        case ContentType.image:
          contentType = 'image/jpeg';
          break;

        default:
          contentType = '';
          break;
      }
      attachedFiles.push({
        uri: getSafeAbsoluteURI(media?.filePath, 'doc'),
        type: contentType,
        name: media?.name,
      });
    }
  }

  const connection = await getConnection(chatId);
  const chat = new DirectChat(chatId);
  const lineId = (await chat.getChatData()).lineId;
  const timestamp =
    new Date(message?.timestamp).toISOString() || generateISOTimeStamp();
  const report: LineIllegalReport = {
    timestamp: timestamp,
    line_id: lineId,
    message: message?.data?.text || '',
    additional_info: additionalInfo,
    screen_name: connection.name,
    report_type: reportType,
  };
  const response = await API.submitIllegalReport(report, attachedFiles);
  return response;
}
