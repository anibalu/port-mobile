import RNFS from 'react-native-fs';
import {tokenPath} from '../../../configs/paths';
import {SavedServerAuthToken} from '../../ServerAuth/interfaces';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';
const pathToFile = RNFS.DocumentDirectoryPath + `${tokenPath}`;

/**
 * checks if token file exists
 * @returns {boolean} - whether file exists
 */
async function checkSavedTokenAsync(): Promise<boolean> {
  const isFile = await RNFS.exists(pathToFile);
  return isFile;
}

/**
 * reads token file and returns token
 * @throws {Error} - If token file doesn't exist
 * @returns {SavedServerAuthToken} - the token saved to file
 */
async function readTokenAsync(): Promise<SavedServerAuthToken> {
  const isToken = await checkSavedTokenAsync();
  if (isToken) {
    const savedToken: SavedServerAuthToken = JSON.parse(
      await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
    );
    return savedToken;
  }
  throw new Error('TokenNotFoundError');
}

/**
 * saves token to file
 * @param {SavedServerAuthToken} savedToken - token to save
 */
async function saveTokenAsync(savedToken: SavedServerAuthToken) {
  await RNFS.writeFile(
    pathToFile,
    JSON.stringify(savedToken),
    DEFAULT_ENCODING,
  );
}

/**
 * reads the token file and returns the token
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} - If token file doesn't exist
 * @returns {SavedServerAuthToken} - token read from file
 */
export async function readAuthTokenRNFS(
  blocking: boolean = false,
): Promise<SavedServerAuthToken> {
  if (blocking) {
    const synced = async () => {
      return await readTokenAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readTokenAsync();
  }
}

/**
 * saves token to file
 * @param {SavedServerAuthToken} savedToken - token to be saved to file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveAuthTokenRNFS(
  savedToken: SavedServerAuthToken,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await saveTokenAsync(savedToken);
    };
    await connectionFsSync(synced);
  } else {
    await saveTokenAsync(savedToken);
  }
}
