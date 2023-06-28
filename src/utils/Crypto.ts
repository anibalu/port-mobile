import {
  updateProfile,
  profile,
  readProfileAsync,
  updateProfileAsync,
} from '../utils/Profile';
import {
  createKeyPair,
  generateSharedSecret,
} from '@numberless/react-native-numberless-crypto';
import {connectionFsSync} from './syncronization';

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
  const synced = async () => {
    const profileData: profile = await readProfileAsync();
    if (profileData.privKey && profileData.pubKey) {
      const keys: keys = {
        privKey: profileData.privKey,
        pubKey: profileData.pubKey,
      };
      return keys;
    } else {
      const keyString: string = await createKeyPair();
      const keys: keys = JSON.parse(keyString);
      await updateProfileAsync(keys);
      return keys;
    }
  };
  return await connectionFsSync(synced);
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
