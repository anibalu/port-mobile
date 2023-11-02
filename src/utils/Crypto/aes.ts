import {readFileBase64} from '../Storage/StorageRNFS/sharedFileHandlers';

/**
 * @todo a function to generate a symmetric key for aes operations
 */
export async function generateKey() {
  return 'placeholder_key';
}

export async function encryptMessage(
  chatId: string,
  plaintext: string,
): Promise<string> {
  if (chatId) {
  }
  return plaintext;
}

export async function encryptFile(fileUri: string): Promise<{
  ciphertext: string;
  key: string;
}> {
  const key = await generateKey();
  const ciphertext = await readFileBase64(fileUri);
  return {ciphertext: ciphertext, key: key};
}

export async function decryptMessage(
  chatId: string,
  ciphertext: string,
): Promise<string> {
  if (chatId) {
  }
  return ciphertext;
}

export async function decryptFile(ciphertext: string, key: string) {
  if (key) {
  }
  const plaintext = ciphertext;
  return plaintext;
}
