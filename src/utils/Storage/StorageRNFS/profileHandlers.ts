import {profileDir} from '@configs/paths';
import RNFS from 'react-native-fs';
import {connectionFsSync} from '../../Synchronization';
import {FileAttributes} from '../interfaces';
import {getRelativeURI} from './sharedFileHandlers';

/**
 * Creates a profile directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the profile directory.
 */
async function makeProfileDir(): Promise<string> {
  const profileDirPath = RNFS.DocumentDirectoryPath + profileDir;
  const folderExists = await RNFS.exists(profileDirPath);
  if (folderExists) {
    return profileDirPath;
  } else {
    await RNFS.mkdir(profileDirPath);
    return profileDirPath;
  }
}

/**
 * makes a copy of the chosen profile picture in the profile dir.
 * @param {FileAttributes} file - file to make a copy of in profile dir
 * @returns {FileAttributes} - new destination of the profile picture.
 */
export async function moveProfilePictureToProfileDirRNFS(
  file: FileAttributes,
): Promise<FileAttributes> {
  const localProfDir = await makeProfileDir();
  const destinationPath = localProfDir + '/' + file.fileName;
  await RNFS.moveFile(file.fileUri, destinationPath);
  return {
    fileUri: getRelativeURI(destinationPath, 'doc'),
    fileName: file.fileName,
    fileType: file.fileType,
  };
}

export async function removeProfilePictureRNFS(
  file: FileAttributes,
  blocking: boolean = true,
) {
  const synced = async () => {
    await RNFS.unlink(file.fileUri);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}
