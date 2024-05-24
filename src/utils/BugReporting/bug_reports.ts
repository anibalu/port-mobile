import axios from 'axios';
import {BUG_REPORTING_ENDPOINT} from '@configs/api';

async function submitBugReport(
  category: string,
  subcategory: string,
  device: string,
  images: any,
  description: string,
  setIsLoading: Function,
) {
  try {
    setIsLoading(true);
    await axios.post(BUG_REPORTING_ENDPOINT, {
      category: category,
      subcategory: subcategory,
      device: device,
      description: description,
      attached_files: images,
    });
    setIsLoading(false);
    return true;
  } catch (error) {
    setIsLoading(false);
    return false;
  }
}

export {submitBugReport};
