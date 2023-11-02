import {
  createKeyPair,
  generateSharedSecret,
} from '@numberless/react-native-numberless-crypto';
import {KeyPair, SharedSecret} from './interfaces';

/**
 * returns x25519 key pair as url-safe base64 encoded strings.
 * @returns {KeyPair} - generated x25519 key pair as url-safe base64 encoded strings.
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyString: string = await createKeyPair();
  const keyPair: KeyPair = JSON.parse(keyString);
  return keyPair;
}

/**
 * Calculates the DH shared secret of two x25519 keys.
 * @param {string} privKey - user's private key in url-safe base64 encoding
 * @param {string} peerPubKey - peer's public key in url-safe base64 encoding
 * @returns {SharedSecret} - calculated shared secret in url-safe base64 encoding
 */
export async function generateSharedKey(
  privKey: string,
  peerPubKey: string,
): Promise<SharedSecret> {
  const sh: string = await generateSharedSecret(privKey, peerPubKey);
  const sharedSecret: SharedSecret = JSON.parse(sh);
  return sharedSecret;
}

/**
 * @todo a function to generate a random nonce compatible with x25519 operations
 */
export async function generateRandomNonce() {
  return 'placeholder_nonce';
}

/**
 * PEM encodes a public key which is already in the form of a url-safe base64 encoded string.
 * @param {string} pubKey -  public key in the form of a url-safe base64 encoded string.
 * @returns - a PEM encoded public key
 */
export function publicKeyPEMencode(pubKey: string) {
  const pemKey =
    '-----BEGIN PUBLIC KEY-----\n' + pubKey + '\n-----END PUBLIC KEY-----\n';
  return pemKey;
}

/**
 * decodes a PEM encoded public key into a url-safe base64 encoded version.
 * @param {string} pemKey - publik key in PEM encoding
 * @returns - a url-safe base64 encoded public key.
 */
export function publicKeyPEMdecode(pemKey: string) {
  return pemKey.slice(27, -26);
}
