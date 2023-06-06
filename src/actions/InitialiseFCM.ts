import {getFCMToken, patchFCMToken} from '../utils/messaging';

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

export async function initialiseFCM(setloaderText: SetStateFunction<string>) {
  setloaderText('setting up FCM');
  const tokenFCM = await getFCMToken();
  const response = await patchFCMToken(tokenFCM);
  if (response === null) {
    return false;
  }
  return true;
}
