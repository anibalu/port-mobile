import {
  generateX25519Keys,
  deriveX25519SharedSecret,
  encryptWithX25519SharedSecret,
  decryptWithX25519SharedSecret,
  KeyPair,
} from '@numberless/react-native-numberless-crypto';

/**
 * generator for x25519 key pair in hex encoded format
 * @returns {KeyPair} - hex encoded public key and private key
 */
export async function generateKeys(): Promise<KeyPair> {
  return await generateX25519Keys();
}

/**
 * derives shared secret using private key and peer's public key
 * @param privateKey - user's private key
 * @param peerPublicKey - peer's public key
 * @returns - hex encoded shared secret key
 */
export async function deriveSharedSecret(
  privateKey: string,
  peerPublicKey: string,
): Promise<string> {
  const sharedSecret = await deriveX25519SharedSecret(
    privateKey,
    peerPublicKey,
  );
  if (sharedSecret === 'error') {
    throw new Error('Error generating shared secret');
  }
  return sharedSecret;
}

/**
 * encrypts using AES CBC with random initialisation vector
 * @param plaintext - plaintext to encrypt
 * @param sharedSecret - shared key
 * @returns - ciphertext as a url-safe base64 encoded string
 */
export async function encrypt(
  plaintext: string,
  sharedSecret: string,
): Promise<string> {
  const ciphertext = await encryptWithX25519SharedSecret(
    plaintext,
    sharedSecret,
  );
  if (ciphertext === 'error') {
    throw new Error('Error encrypting plaintext');
  }
  return ciphertext;
}

/**
 * decrypts AES CBC with random initialisation vector
 * @param ciphertext - ciphertext as a url-safe base64 encoded string to decrypt
 * @param sharedSecret - shared key
 * @returns - plaintext as a string
 */
export async function decrypt(
  ciphertext: string,
  sharedSecret: string,
): Promise<string> {
  const plaintext = await decryptWithX25519SharedSecret(
    ciphertext,
    sharedSecret,
  );
  if (plaintext === 'error') {
    throw new Error('Error decrypting ciphertext');
  }
  return plaintext;
}
