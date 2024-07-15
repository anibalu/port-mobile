import ImageResizer from '@bam.tech/react-native-image-resizer';
import {PREVIEW_PICTURE_DIMENSIONS} from '@configs/constants';
import {ContentType} from '@utils/Messaging/interfaces';
import {
  moveToLargeFileDir,
  moveToTmp,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as Thumbnail from 'react-native-create-thumbnail';

export interface PreviewConfig {
  chatId?: string;
  url: string; //absolute path of the image being resized
  cacheName?: string;
  dimensions?: number; //defaults to PREVIEW_PICTURE_DIMENSIONS
}

/**
 * Creates a version of an image that's resized down in tmp directory.
 * @param config - preview config.
 * @returns - absolute path of the resized picture in tmp directory.
 */
async function createImagePreview(
  config: PreviewConfig,
): Promise<{path: string; name: string}> {
  const response = await ImageResizer.createResizedImage(
    config.url,
    config.dimensions || PREVIEW_PICTURE_DIMENSIONS,
    config.dimensions || PREVIEW_PICTURE_DIMENSIONS,
    'JPEG',
    100,
    0,
    null,
    undefined,
    {
      mode: 'cover',
      onlyScaleDown: false,
    },
  );
  if (!response.path) {
    throw new Error('Image preview generation failed');
  }
  let fileName = response.name;
  if (config.cacheName) {
    fileName = config.cacheName + '.JPEG';
  }
  const newPath = await moveToTmp(response.path);
  if (!newPath) {
    throw new Error('Image preview generation failed at move to tmp');
  }
  return {path: newPath, name: fileName};
}

/**
 * Creates a thumbnail of a video that's resized down in the tmp directory.
 * @param config - preview config.
 * @returns - absolute path of the thumbnail in tmp directory.
 */
async function createVideoPreview(
  config: PreviewConfig,
): Promise<{path: string; name: string}> {
  const output = await Thumbnail.createThumbnail(config as Thumbnail.Config);
  if (!output.path) {
    throw new Error('Video preview generation failed');
  }
  const newConfig = {
    ...config,
    url: output.path,
  };
  return await createImagePreview(newConfig);
}

/**
 * Generates a preview image given an image or video.
 * @param inputType - content type of input.
 * @param config - preview generation config.
 * @returns - if config has chatId, relative path of the preview image in the chat's media directory.
 * else, absolute path of preview image in tmp directory.
 */
export async function createPreview(
  inputType: ContentType,
  config: PreviewConfig,
): Promise<string | undefined> {
  try {
    let preview;
    if (
      inputType === ContentType.image ||
      inputType === ContentType.displayImage
    ) {
      preview = await createImagePreview(config);
    } else if (inputType === ContentType.video) {
      preview = await createVideoPreview(config);
    }
    if (!preview) {
      return preview;
    } else {
      if (config.chatId) {
        return await moveToLargeFileDir(
          config.chatId,
          preview.path,
          preview.name,
          ContentType.image,
          true,
        );
      } else {
        return preview.path;
      }
    }
  } catch (error) {
    console.log('Error generating preview: ', error);
    return undefined;
  }
}
