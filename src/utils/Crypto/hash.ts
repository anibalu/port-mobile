import NativeCryptoModule from 'src/specs/NativeCryptoModule';

/**
 * hashes a given string using sha 256
 * @param toHash - string to hash
 * @returns 64 character hex encoded hash
 */

export function hash(toHash: string) {
  return  NativeCryptoModule.hashSHA256(toHash);
}
