import {FILE_ENCRYPTION_KEY_LENGTH} from '@configs/constants';
import {
  deleteFile,
  initialiseEncryptedTempFile,
  removeFilePrefix,
} from '../Storage/StorageRNFS/sharedFileHandlers';
import * as numberlessCrypto from '@numberless/react-native-numberless-crypto';
import RNFS from 'react-native-fs';

export async function encryptFile(inputFilePath: string) {
  const encryptedFilePath = await initialiseEncryptedTempFile();
  try {
    const key = await numberlessCrypto.encryptFile(
      removeFilePrefix(inputFilePath),
      encryptedFilePath,
    );
    if (key.length !== FILE_ENCRYPTION_KEY_LENGTH) {
      throw new Error(key);
    }
    return {key: key, encryptedFilePath: encryptedFilePath};
  } catch (error) {
    console.log('Error encrypting file: ', error);
    await deleteFile(encryptedFilePath);
    throw new Error('FileEncryptionError');
  }
}

export async function decryptFile(
  encryptedFilePath: string,
  decryptedFilePath: string,
  key: string,
) {
  try {
    await RNFS.writeFile(decryptedFilePath, '');
    console.log('initial file created');
    const response = await numberlessCrypto.decryptFile(
      encryptedFilePath,
      decryptedFilePath,
      key,
    );
    if (response !== 'success') {
      throw new Error(response);
    }
  } catch (error) {
    await RNFS.unlink(decryptedFilePath);
    console.log('Error decrypting file: ', error);
    throw new Error('Error decrypting file');
  }
}
