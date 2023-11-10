import RNFS from 'react-native-fs';
import {
  groupDisplayPicAttributesPath,
  groupsDataPath,
  groupsInfoDirPath,
} from '../../../configs/paths';
import {connectionFsSync} from '../../Synchronization';
import {GroupInfo} from '../../Groups/interfaces';
import {initialiseChatIdDirAsync} from './messagesHandlers';
import {FileAttributes} from '../sharedFile';

const DEFAULT_ENCODING = 'utf8';

async function getGroupInfoDir(groupId: string): Promise<string> {
  const groupDirPath = await initialiseChatIdDirAsync(groupId);
  const path = groupDirPath + groupsInfoDirPath;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}
/**
 * Retrieves the path to the groupInfo file inside the group chat directory.
 * This function ensures the group directory exists.
 * @returns {Promise<string>} The path to the groupInfo fil
 */
async function getGroupInfoPath(groupId: string): Promise<string> {
  const groupDirPath = await getGroupInfoDir(groupId);
  return groupDirPath + groupsDataPath;
}

/**
 * Overwrites group file with new info
 * @param {GroupInfo} group - the group information to overwrite witih
 */
async function writeGroupInfoAsync(group: GroupInfo) {
  const pathToFile = await getGroupInfoPath(group.groupId);
  await RNFS.writeFile(pathToFile, JSON.stringify(group), DEFAULT_ENCODING);
}
/**
 * Reads group info from group file
 * @param {string} groupId - group id of the group to be fetched
 * @throws {Error} If there is no group info.
 * @returns {GroupInfo} - group info read from file.
 */
async function readGroupInfoAsync(groupId: string) {
  const pathToFile = await getGroupInfoPath(groupId);
  const group: GroupInfo = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return group;
}

/**
 * saves group info to file
 * @param {GroupInfo} group - group info to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.

 */
export async function saveGroupInfoRNFS(
  group: GroupInfo,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeGroupInfoAsync(group);
    };
    await connectionFsSync(synced);
  } else {
    await writeGroupInfoAsync(group);
  }
}

/**
 * reads group info from file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @param {string} groupId - group id of the group to be fetched
 * @throws {Error} If there is no profile info.
 * @returns {GroupInfo} - group info saved in file
 */
export async function getGroupInfoRNFS(
  blocking: boolean = false,
  groupId: string,
): Promise<GroupInfo> {
  if (blocking) {
    const synced = async () => {
      return await readGroupInfoAsync(groupId);
    };
    return await connectionFsSync(synced);
  } else {
    return await readGroupInfoAsync(groupId);
  }
}

/**
 * Retrieves the path to the display pic attributes file inside the group chat directory.
 * This function ensures the group chat directory exists.
 * @param {string} groupId - groupId of the group.
 * @returns {Promise<string>} The path to the group display pic attributes file.
 */
async function getGroupDisplayPicAttributesPath(
  groupId: string,
): Promise<string> {
  const groupDirPath = await getGroupInfoDir(groupId);
  return groupDirPath + groupDisplayPicAttributesPath;
}

/**
 * Retrieves group display pic attributes in diplay pic attributes file.
 * @param {string} groupId - groupId of the group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} If there is no display picture.
 * @returns {Promise<FileAttributes>} The display pic attributes.
 */
export async function readGroupDisplayPicAttributesRNFS(
  groupId: string,
  blocking: boolean = false,
): Promise<FileAttributes> {
  const synced = async () => {
    const pathToFile = await getGroupDisplayPicAttributesPath(groupId);
    const displayPicFile: FileAttributes = JSON.parse(
      await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
    );
    return displayPicFile;
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}

/**
 * makes a copy of the chosen display picture in the group chat dir.
 * @param {string} groupId - groupId of the group.
 * @param {FileAttributes} file - file to make a copy of in group chat dir
 * @returns {string} - new destination of the display picture.
 */
async function copyDisplayPicture(groupId: string, file: FileAttributes) {
  const groupDirPath = await getGroupInfoDir(groupId);
  const destinationPath = groupDirPath + '/' + file.fileName;
  await RNFS.copyFile(file.fileUri, destinationPath);
  return destinationPath;
}

/**
 * writes group display picture attributes to file.
 * @param {string} groupId - groupId of the group.
 * @param {FileAttributes} file - display picture file attributes
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function writeGroupDisplayPicAttributesRNFS(
  groupId: string,
  file: FileAttributes,
  blocking: boolean = false,
) {
  const synced = async () => {
    deleteGroupDisplayPicRNFS(groupId, false);
    const pathToFile = await getGroupDisplayPicAttributesPath(groupId);
    const newFile: FileAttributes = {
      fileUri: await copyDisplayPicture(groupId, file),
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
 * deletes group display picture.
 * @param {string} groupId - groupId of the group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteGroupDisplayPicRNFS(
  groupId: string,
  blocking: boolean = false,
) {
  const synced = async () => {
    const groupDirPath = await getGroupInfoDir(groupId);
    const files = await RNFS.readDir(groupDirPath);
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
