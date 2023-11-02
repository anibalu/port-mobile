import RNFS from 'react-native-fs';
import {cryptoDir} from '../../../configs/paths';
import {ChatCrypto} from '../../Crypto/interfaces';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';

/**
 * Creates a crypto directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the crypto directory.
 */
async function makeCryptoDirAsync(): Promise<string> {
  const cryptoDirPath = RNFS.DocumentDirectoryPath + `${cryptoDir}`;
  const folderExists = await RNFS.exists(cryptoDirPath);
  if (folderExists) {
    return cryptoDirPath;
  } else {
    await RNFS.mkdir(cryptoDirPath);
    return cryptoDirPath;
  }
}

/**
 * Creates a chat crypto directory if it doesn't exist inside crypto directory and returns the path to it.
 * @returns {Promise<string>} The path to the chat crypto directory.
 */
async function initialiseChatIdCryptoDirAsync(chatId: string): Promise<string> {
  const cryptoDirPath = await makeCryptoDirAsync();
  const path = cryptoDirPath + '/' + chatId;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}

/**
 * Create chat crypto info file inside chat crypto dir.
 * @returns {Promise<string>} The path to the crypto data file for the chat.
 */
async function initialiseCryptoFileAsync(chatId: string) {
  const cryptoPath =
    (await initialiseChatIdCryptoDirAsync(chatId)) + '/data.json';
  if (await RNFS.exists(cryptoPath)) {
    return cryptoPath;
  }
  await RNFS.writeFile(cryptoPath, JSON.stringify({}), DEFAULT_ENCODING);
  return cryptoPath;
}

/**
 * Overwrites crypto file with new data
 * @param {ChatCrypto} chatCrypto - the crypto information to overwrite witih
 */
async function writeCryptoInfoAsync(chatId: string, chatCrypto: ChatCrypto) {
  const pathToFile = await initialiseCryptoFileAsync(chatId);
  const cryptoData = await readCryptoInfoAsync(chatId);
  await RNFS.writeFile(
    pathToFile,
    JSON.stringify({...cryptoData, ...chatCrypto}),
    DEFAULT_ENCODING,
  );
}

/**
 * Reads crypto file and return data
 * @param {string} chatId - the chat crypto file to read.
 * @returns {ChatCrypto} - crypto data in file.
 */
async function readCryptoInfoAsync(chatId: string) {
  const pathToFile = await initialiseCryptoFileAsync(chatId);
  const cryptoData: ChatCrypto = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return cryptoData;
}

/**
 * saves crypto data to file
 * @param {string} chatId - chat id for a chat.
 * @param {ChatCrypto} chatCrypto - crypto data to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveChatCryptoRNFS(
  chatId: string,
  chatCrypto: ChatCrypto,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeCryptoInfoAsync(chatId, chatCrypto);
    };
    await connectionFsSync(synced);
  } else {
    await writeCryptoInfoAsync(chatId, chatCrypto);
  }
}

/**
 * reads crypto data from file
 * @param {string} chatId - chat id for a chat.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false
 * @returns {ChatCrypto} - crypto data saved in file
 */
export async function getChatCryptoRNFS(
  chatId: string,
  blocking: boolean = false,
): Promise<ChatCrypto> {
  if (blocking) {
    const synced = async () => {
      return await readCryptoInfoAsync(chatId);
    };
    return await connectionFsSync(synced);
  } else {
    return await readCryptoInfoAsync(chatId);
  }
}
