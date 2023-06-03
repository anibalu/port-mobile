import {updateProfile, readProfile, profile} from '../utils/Profile';
import {
  createKeyPair,
  generateSharedSecret,
} from '@numberless/react-native-numberless-crypto';

export interface keys {
  privKey: string;
  pubKey: string;
}

export interface sharedSecret {
  sharedSecret: string;
}

export interface cipher {
  ciphertext: string;
  nonce: string;
  associatedData: string;
}

export async function getUserKeys(): Promise<keys> {
  const profileData: profile = await readProfile();
  if (profileData.privKey && profileData.pubKey) {
    const keys: keys = {
      privKey: profileData.privKey,
      pubKey: profileData.pubKey,
    };
    return keys;
  } else {
    const keyString: string = await createKeyPair();
    const keys: keys = JSON.parse(keyString);
    await updateProfile(keys);
    return keys;
  }
}

export async function getSharedSecret(
  privKey: string,
  peerPubKey: string,
): Promise<sharedSecret> {
  const sh: string = await generateSharedSecret(privKey, peerPubKey);
  const sharedSecret: sharedSecret = JSON.parse(sh);
  await updateProfile(sharedSecret);
  return sharedSecret;
}
