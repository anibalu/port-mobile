import {keys, getUserKeys, getSharedSecret} from '../utils/Crypto';
import {getUserIdAndServerKey} from '../utils/Profile';

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

//userKeys, userId and shared secret generation
export async function initialiseUserCrypto(
  setloaderText: SetStateFunction<string>,
): Promise<boolean> {
  setloaderText('Generating user keys...');
  const userKeys: keys = await getUserKeys();
  console.log('1. key pair: ', userKeys);
  setloaderText('Retrieving server public keys...');
  const response = await getUserIdAndServerKey(userKeys.pubKey);
  if (response === null) {
    setloaderText('Failure in retrieving server public keys...');
    return false;
  }
  console.log('2. user id: ', response);
  setloaderText('Establishing shared secrets...');
  const secret = await getSharedSecret(userKeys.privKey, response.serverKey);
  console.log('3. shared secret: ', secret);
  return true;
}
