import RNFS from 'react-native-fs';
import {
  profileDataPath,
  profileDir,
  profilePicAttributesPath,
} from '../../../configs/paths';
import {ProfileInfo} from '../../Profile/interfaces';
import {connectionFsSync} from '../../Synchronization';
import {FileAttributes} from '../sharedFile';

const DEFAULT_ENCODING = 'utf8';

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
 * Retrieves the path to the profile data file inside the profile directory.
 * This function ensures the profile directory exists.
 * @returns {Promise<string>} The path to the profile data file.
 */
async function getProfileDataPath(): Promise<string> {
  const profileDirPath = await makeProfileDir();
  return profileDirPath + profileDataPath;
}

/**
 * Retrieves the path to the profile pic attributes file inside the profile directory.
 * This function ensures the profile directory exists.
 * @returns {Promise<string>} The path to the profile pic attributes file.
 */
async function getProfilePicAttributesPath(): Promise<string> {
  const profileDirPath = await makeProfileDir();
  return profileDirPath + profilePicAttributesPath;
}

/**
 * Overwrites profile file with new info
 * @param {ProfileInfo} profile - the profile information to overwrite witih
 */
async function writeProfileInfoAsync(profile: ProfileInfo) {
  const pathToFile = await getProfileDataPath();
  await RNFS.writeFile(pathToFile, JSON.stringify(profile), DEFAULT_ENCODING);
}
/**
 * Reads profile info from profile file
 * @throws {Error} If there is no profile info.
 * @returns {ProfileInfo} - profile info read from file.
 */
async function readProfileInfoAsync() {
  const pathToFile = await getProfileDataPath();
  const profile: ProfileInfo = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return profile;
}

/**
 * saves profile info to file
 * @param {ProfileInfo} profile - profile info to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfileInfoRNFS(
  profile: ProfileInfo,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeProfileInfoAsync(profile);
    };
    await connectionFsSync(synced);
  } else {
    await writeProfileInfoAsync(profile);
  }
}

/**
 * reads profile info from file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} If there is no profile info.
 * @returns {ProfileInfo} - profile info saved in file
 */
export async function getProfileInfoRNFS(
  blocking: boolean = false,
): Promise<ProfileInfo> {
  if (blocking) {
    const synced = async () => {
      return await readProfileInfoAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readProfileInfoAsync();
  }
}

/**
 * Retrieves profile pic attributes in profile pic attributes file.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} If there is no profile picture.
 * @returns {Promise<FileAttributes>} The profile pic attributes.
 */
export async function readProfilePicAttributesRNFS(
  blocking: boolean = false,
): Promise<FileAttributes> {
  const synced = async () => {
    const pathToFile = await getProfilePicAttributesPath();
    const profilePicFile: FileAttributes = JSON.parse(
      await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
    );
    return profilePicFile;
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}

/**
 * makes a copy of the chosen profile picture in the profile dir.
 * @param {FileAttributes} file - file to make a copy of in profile dir
 * @returns {string} - new destination of the profile picture.
 */
async function copyProfilePicture(file: FileAttributes) {
  const localProfDir = await makeProfileDir();
  const destinationPath = localProfDir + '/' + file.fileName;
  await RNFS.copyFile(file.fileUri, destinationPath);
  return destinationPath;
}

/**
 * writes profile picture attributes to file.
 * @param {FileAttributes} file - profile picture file attributes
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function writeProfilePicAttributesRNFS(
  file: FileAttributes,
  blocking: boolean = false,
) {
  const synced = async () => {
    deleteProfilePictureRNFS(false);
    const pathToFile = await getProfilePicAttributesPath();
    const newFile: FileAttributes = {
      fileUri: await copyProfilePicture(file),
      fileName: file.fileName,
      fileType: file.fileType,
    };
    await RNFS.writeFile(pathToFile, JSON.stringify(newFile), DEFAULT_ENCODING);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * deletes profile picture.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteProfilePictureRNFS(blocking: boolean = false) {
  const synced = async () => {
    const localProfileDir = await makeProfileDir();
    const files = await RNFS.readDir(localProfileDir);
    const filteredFiles = files.filter(file => file.name !== 'data.json');
    for (let index = 0; index < filteredFiles.length; index++) {
      await RNFS.unlink(filteredFiles[index].path);
    }
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}
