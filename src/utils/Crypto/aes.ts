import {readFileBase64} from '../Storage/StorageRNFS/sharedFileHandlers';

async function generateSymmetricKey() {
  return 'placeholder_key';
}

export async function encryptFile(fileUri: string): Promise<{
  ciphertext: string;
  key: string;
}> {
  const key = await generateSymmetricKey();
  const ciphertext = await readFileBase64(fileUri);
  return {ciphertext: ciphertext, key: key};
}

export async function decryptFile(ciphertext: string, key: string) {
  if (key) {
  }
  const plaintext = ciphertext;
  return plaintext;
}
