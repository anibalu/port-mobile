import {checkBundleValidity} from '@utils/Ports';
import {
  DirectContactPortBundle,
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import * as API from './APICalls';
import {urlToJson} from '@utils/JsonToUrl';
interface urlObject {
  url: string;
}

/**
 *
 * @param urlObj , url to be processed
 * @returns bundle if successful, undefined on failure
 */
export async function getBundleFromLink(
  urlObj: urlObject,
): Promise<
  | PortBundle
  | GroupBundle
  | DirectSuperportBundle
  | GroupSuperportBundle
  | DirectContactPortBundle
> {
  const synced = async () => {
    const url = urlObj.url;
    const jsonUrlObj = urlToJson(url);
    if (url) {
      const regex = /[?&]([^=#]+)=([^&#]*)/g;
      const params: any = {};
      let match: any;
      while ((match = regex.exec(url))) {
        params[match[1]] = match[2];
      }
      const bundleId = params.bundleId;
      if (bundleId) {
        const bundle = await API.getBundle(bundleId);
        return bundle;
      } else {
        return jsonUrlObj;
      }
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
