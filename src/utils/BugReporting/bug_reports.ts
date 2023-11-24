import axios from 'axios';
import {BUG_REPORTING_ENDPOINT} from '../../configs/api';
import {uploadRawMedia} from '../Messaging/largeData';

async function submitBugReport(
  category: string,
  subcategory: string,
  device: string,
  images: any,
  description: string,
  setisModalError: Function,
  setIsLoading: Function,
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
    const keys = media_urls.map((url: any, i: number) => {
      return (async () => {
        setIsLoading(false);
        return await uploadRawMedia(images[i], url);
      })();
    });
    setisModalError(false);
    setIsLoading(false);
    return {
      created_bug_id: response.data.created_bug_id,
      media_urls: keys,
    };
  } catch (error) {
    setisModalError(true);
    setIsLoading(false);
  }
}

export {submitBugReport};
