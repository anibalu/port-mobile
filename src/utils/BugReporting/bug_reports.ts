import axios from 'axios';

import {BUG_REPORTING_ENDPOINT} from '@configs/api';

import {uploadRawMedia} from '@utils/Messaging/LargeData';

async function submitBugReport(
  category: string,
  subcategory: string,
  device: string,
  images: any,
  description: string,
  setIsLoading: (x: boolean) => any,
) {
  try {
    setIsLoading(true);
    const response = await axios.post(BUG_REPORTING_ENDPOINT, {
      category: category,
      subcategory: subcategory,
      device: device,
      description: description,
      attached_files: images,
    });
    const media_urls = response.data.media_urls;

    media_urls.map((url: any, i: number) => {
      return (async () => {
        if (images) {
          return await uploadRawMedia(images[i], url);
        }
      })();
    });

    setIsLoading(false);
    return true;
  } catch (error) {
    setIsLoading(false);
    return false;
  }
}

export {submitBugReport};
