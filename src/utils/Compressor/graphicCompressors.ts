import {Image, Video} from 'react-native-compressor';

export const compressImage = async (
  filePath: string,
  onFail: () => void,
  onProgressChanged?: (progress: number) => {},
): Promise<string | undefined> => {
  try {
    const result = await Image.compress(filePath, {
      progressDivider: 10,
      downloadProgress: onProgressChanged,
    });
    console.log('Image compressed');
    return result;
  } catch (e) {
    console.log('Error compressing image:', e);
    onFail();
    return undefined;
  }
};

export const compressVideo = async (
  filePath: string,
  onFail: () => void,
  onProgressChanged?: (progress: number) => {},
): Promise<string | undefined> => {
  try {
    const result = await Video.compress(filePath, {
      progressDivider: 10,
      downloadProgress: onProgressChanged,
    });

    console.log('Video compressed');

    return result;
  } catch (e) {
    console.log('Error compressing video:', e);
    onFail();
    return undefined;
  }
};
