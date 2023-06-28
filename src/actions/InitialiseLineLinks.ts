import {getNewLineLinksAsync, saveLineLinksAsync} from '../utils/linelinks';
import {connectionFsSync} from '../utils/syncronization';

type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

//userKeys, userId and shared secret generation
export async function initialiseLineLinks(
  setloaderText: SetStateFunction<string>,
): Promise<boolean> {
  const synced = async () => {
    //getting line links
    setloaderText('Retrieving connection instruments...');
    const lineLinks = await getNewLineLinksAsync();
    if (lineLinks === null) {
      return false;
    }
    console.log('5. line links: ', lineLinks);
    await saveLineLinksAsync(lineLinks);
    return true;
  };
  return await connectionFsSync(synced);
}
