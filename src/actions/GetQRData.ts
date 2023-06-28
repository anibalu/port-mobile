import {generateLineBundle} from '../utils/bundles';

export async function getQRData() {
  const bundle = await generateLineBundle();
  if (bundle === null) {
    return null;
  }
  return JSON.stringify(bundle);
}
