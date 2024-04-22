import {linePairHash} from './linePairHash';

export default async function migration003() {
  await linePairHash();
}
