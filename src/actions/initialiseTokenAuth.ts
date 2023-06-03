import {getToken} from '../utils/Token';

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

//userKeys, userId and shared secret generation
export async function initialiseTokenAuth(
  setloaderText: SetStateFunction<string>,
): Promise<boolean> {
  //token authentication testing
  setloaderText('setting up token authentication...');
  const token = await getToken();
  if (token === null) {
    setloaderText('Failure in retrieving valid token...');
    return false;
  }
  console.log('4. valid token: ', token);
  return true;
}
