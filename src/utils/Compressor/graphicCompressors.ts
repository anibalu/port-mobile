import {FILE_COMPRESSION_THRESHOLD} from '@configs/constants';
import {moveToTmp} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Image, Video} from 'react-native-compressor';
import RNFS from 'react-native-fs';

/**
 * Checks if a file is over the compression threshold to trigger compression
 * @param filePath - absolute file path of the media being considered for compression
 * @returns - whether compression is required.
 */
export async function shouldCompress(filePath: string) {
  const fileStat = await RNFS.stat(filePath);
  if (fileStat.size > FILE_COMPRESSION_THRESHOLD) {
    return true;
  } else {
    return false;
  }
}

/**
 * Compress image if above threshhold. If not don't compress.
 * @param filePath - absolute filepath of image to compress
 * @param fileName - file name of file
 * @returns - absolute file path of new file in tmp directory
 */
export const compressImage = async (
  filePath: string,
): Promise<string | undefined | null> => {
  try {
    const shouldBeCompressed = await shouldCompress(filePath);
    if (shouldBeCompressed) {
      const result = await Image.compress(filePath, {});
      return result;
    } else {
      return await moveToTmp(filePath);
    }
  } catch (e) {
    console.log('Error compressing image:', e);
    return null;
  }
};

/**
 * Compress video if above threshhold. If not don't compress.
 * @param filePath - absolute filepath of video to compress
 * @param fileName - file name of file
 * @returns - absolute file path of new file in tmp directory
 */
export const compressVideo = async (
  filePath: string,
): Promise<string | undefined | null> => {
  try {
    const shouldBeCompressed = await shouldCompress(filePath);
    if (shouldBeCompressed) {
      const result = await Video.compress(filePath, {});
      return result;
    } else {
      return await moveToTmp(filePath);
    }
  } catch (e) {
    console.log('Error compressing video:', e);
    return null;
  }
};
