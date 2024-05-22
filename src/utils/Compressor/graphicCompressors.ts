import {
  shouldCompress,
  moveToTmp,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Image, Video} from 'react-native-compressor';

/**
 * Compress image if above threshhold. If not don't compress.
 * @param filePath - absolute filepath of image to compress
 * @param fileName - file name of file
 * @returns - absolute file path of new file in tmp directory
 */
export const compressImage = async (
  filePath: string,
  fileName: string = 'image',
): Promise<string | undefined | null> => {
  try {
    const shouldBeCompressed = await shouldCompress(filePath);
    if (shouldBeCompressed) {
      const result = await Image.compress(filePath, {});
      return result;
    } else {
      return await moveToTmp(filePath, fileName);
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
  fileName: string = 'video',
): Promise<string | undefined | null> => {
  try {
    const shouldBeCompressed = await shouldCompress(filePath);
    if (shouldBeCompressed) {
      const result = await Video.compress(filePath, {});
      return result;
    } else {
      return await moveToTmp(filePath, fileName);
    }
  } catch (e) {
    console.log('Error compressing video:', e);
    return null;
  }
};
