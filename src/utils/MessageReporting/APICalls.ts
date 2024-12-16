import {
  LINE_MESSAGE_REPORTING_RESOURCE,
  MESSAGE_REPORTING_RESOURCE,
} from '@configs/api';
import {uploadRawMedia} from '@utils/Messaging/LargeData';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import DirectChat from '@utils/DirectChats/DirectChat';
import {LineIllegalReport, GroupIllegalReport, attachedFiles} from './index';

export async function sendMessageReport(
  chatId: string,
  message: string,
  description: string,
  files: string[],
) {
  try {
    const token = await getToken();

    const chat = new DirectChat(chatId);
    const lineId = (await chat.getChatData()).lineId;
    const response = await axios.post(
      LINE_MESSAGE_REPORTING_RESOURCE,
      {
        lineId: lineId,
        message: message,
        description: description,
        attachedFiles: files,
      },
      {headers: {Authorization: `${token}`}},
    );
    const media_urls = response.data?.media_urls;

    media_urls?.map((url: any, i: number) => {
      return (async () => {
        if (files) {
          return await uploadRawMedia(files[i], url);
        }
      })();
    });
  } catch (error) {
    console.log('Error while sending report:', error);
  }
}

/**
 * Tries to submit an illegal report of type GroupIllegalReport | LineIllegalReport
 * @param {GroupIllegalReport | LineIllegalReport} report - report obj
 * @returns {string} - response data
 */
export async function submitIllegalReport(
  report: GroupIllegalReport | LineIllegalReport,
  attachedFiles: Array<attachedFiles> | [],
): Promise<String> {
  const formData = new FormData();
  Object.keys(report).forEach(key =>
    formData.append(key, report[key as keyof typeof report]),
  );
  if (attachedFiles.length) {
    for (let file in attachedFiles) {
      formData.append('attached_files', attachedFiles[file]);
    }
  }
  const token = await getToken();

  const headers = {
    'Content-Type': 'multipart/form-data;',
    Authorization: `${token}`,
  };

  const response = await axios.post(MESSAGE_REPORTING_RESOURCE, formData, {
    headers: headers,
  });

  return response.data;
}
