import {rad, rad16} from '@numberless/react-native-numberless-crypto';

/**
 * generates random string of desired byte size
 * @param length length of rad bytes requried
 * @returns hex encoded rad of length = 2*length
 */
export async function generateRad(length: number) {
  const generatedRad = await rad(length);
  if (generatedRad === 'error') {
    throw new Error('Error in generating RAD');
  }
  return generatedRad;
}

/**
 * @returns 32 character hex encoded random string
 */
export async function generateRad16() {
  const generatedRad = await rad16();
  if (generatedRad === 'error') {
    throw new Error('Error in generating RAD16');
  }
  return generatedRad;
}
