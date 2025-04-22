import NativeCryptoModule from '@specs/NativeCryptoModule';

/**
 * generates random string of desired byte size
 * @param length length of rad bytes requried
 * @returns hex encoded rad of length = 2*length
 */
export async function generateRad(length: number) {
  const generatedRad = NativeCryptoModule.randHex(length);
  if (generatedRad === 'error') {
    throw new Error('Error in generating RAD');
  }
  return generatedRad;
}

/**
 * @returns 32 character hex encoded random string
 */
export async function generateRad16() {
  return generateRad(16);
}
