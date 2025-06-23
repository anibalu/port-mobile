import axios from 'axios';

import {BUG_REPORTING_ENDPOINT} from '@configs/api';

import {uploadRawMedia} from '@utils/Messaging/LargeData';
import { getToken } from '@utils/ServerAuth';

async function submitBugReport(
  category: string,
  subcategory: string,
  device: string,
  images: any,
  description: string,
  port: string | null,
) {
  try {
    const token = await getToken();
    const response = await axios.post(BUG_REPORTING_ENDPOINT, {
      category: category,
      subcategory: subcategory,
      device: device,
      description: description,
      attached_files: images,
      port: port
    },{headers: {Authorization: `${token}`}});
    const media_urls = response.data.media_urls;

    for (let i = 0; i < media_urls.length; i++) {
      try {
        if (images) {
          await uploadRawMedia(images[i], media_urls[i]);
        }
      } catch (err) {
        console.error(`Upload failed at index ${i}:`, err);
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export {submitBugReport};
