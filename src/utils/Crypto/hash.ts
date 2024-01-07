import {hashSHA256} from '@numberless/react-native-numberless-crypto';

/**
 * hashes a given string using sha 256
 * @param toHash - string to hash
 * @returns 64 character hex encoded hash
 */

export async function hash(toHash: string) {
  return await hashSHA256(toHash);
}
