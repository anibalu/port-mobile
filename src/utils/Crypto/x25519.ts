import NativeCryptoModule from '@specs/NativeCryptoModule';
type KeyPair = {
  privateKey: string;
  publicKey: string;
};
/**
 * generator for x25519 key pair in hex encoded format
 * @returns {KeyPair} - hex encoded public key and private key
 */
export function generateKeys(): KeyPair {
  return JSON.parse(NativeCryptoModule.generateX25519Keypair());
}

/**
 * derives shared secret using private key and peer's public key
 * @param privateKey - user's private key
 * @param peerPublicKey - peer's public key
 * @returns - hex encoded shared secret key
 */
export function deriveSharedSecret(
  privateKey: string,
  peerPublicKey: string,
): string {
  const sharedSecret = NativeCryptoModule.deriveX25519Secret(
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
export function encrypt(plaintext: string, sharedSecret: string): string {
  const ciphertext = NativeCryptoModule.aes256Encrypt(plaintext, sharedSecret);
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
export function decrypt(ciphertext: string, sharedSecret: string): string {
  const plaintext = NativeCryptoModule.aes256Decrypt(ciphertext, sharedSecret);
  if (plaintext === 'error') {
    throw new Error('Error decrypting ciphertext');
  }
  return plaintext;
}
