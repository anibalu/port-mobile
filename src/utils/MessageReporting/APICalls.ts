import {LINE_MESSAGE_REPORTING_RESOURCE} from '@configs/api';
import {uploadRawMedia} from '@utils/Messaging/LargeData';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

async function sendMessageReport({
  lineId,
  message,
  description,
  attachedFiles,
}: {
  lineId: string;
  message: string;
  description: string;
  attachedFiles?: string[];
}) {
  try {
    const token = await getToken();
    const response = await axios.post(
      LINE_MESSAGE_REPORTING_RESOURCE,
      {
        lineId: lineId,
        message: message,
        description: description,
        attachedFiles: attachedFiles,
      },
      {headers: {Authorization: `${token}`}},
    );
    const media_urls = response.data.media_urls;

    media_urls.map((url: any, i: number) => {
      return (async () => {
        if (attachedFiles) {
          return await uploadRawMedia(attachedFiles[i], url);
        }
      })();
    });
  } catch (error) {
    console.log('Error while sending report:', error);
  }
}

export {sendMessageReport};
