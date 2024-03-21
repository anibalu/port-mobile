import {checkBundleValidity} from '@utils/Ports';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import * as API from './APICalls';

interface urlObject {
  url: string | null;
}

/**
 *
 * @param urlObj , url to be processed
 * @returns bundle if successful, undefined on failure
 */
export async function handleDeepLink(
  urlObj: urlObject,
): Promise<
  PortBundle | GroupBundle | DirectSuperportBundle | GroupSuperportBundle
> {
  const synced = async () => {
    const url = urlObj.url;
    console.log('URL is: ', url);
    if (url) {
      let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params: any = {},
        match: any;
      while ((match = regex.exec(url))) {
        params[match[1]] = match[2];
      }
      const bundleId = params.bundleId;
      const bundle = await API.getBundle(bundleId);
      return bundle;
    }
    return undefined;
  };
  const raw = await synced();
  if (raw) {
    const bundle = checkBundleValidity(raw);
    return bundle;
  }
  throw new Error('raw url is undefined');
}
