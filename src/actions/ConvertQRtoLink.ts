import {postBundle} from '../utils/bundles';

export async function convertQRtoLink(bundleData: string) {
  const bundleId = await postBundle(bundleData);
  if (bundleId) {
    const url = 'https://it.numberless.tech/connect?bundleId=' + bundleId;
    return url;
  }
  return '';
}
