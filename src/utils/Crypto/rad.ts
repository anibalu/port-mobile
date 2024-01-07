import {rad, rad16} from '@numberless/react-native-numberless-crypto';

/**
 * generates random string of desired byte size
 * @param length length of rad bytes requried
 * @returns hex encoded rad of length = 2*length
 */

export async function generateRad(length: number) {
  return await rad(length);
}
/**
 * @returns 32 character hex encoded random string
 */

export async function generateRad16() {
  return await rad16();
}
