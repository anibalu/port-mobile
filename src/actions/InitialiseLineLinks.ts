import {getNewLineLinks} from '../utils/linelinks';

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

//userKeys, userId and shared secret generation
export async function initialiseLineLinks(
  setloaderText: SetStateFunction<string>,
): Promise<boolean> {
  //getting line links
  setloaderText('Retrieving connection instruments...');
  const lineLinks = await getNewLineLinks();
  if (lineLinks === null) {
    return false;
  }
  console.log('5. line links: ', lineLinks);
  return true;
}
