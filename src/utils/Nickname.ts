import RNFS from 'react-native-fs';
import { profilePath } from '../configs/paths';
import { JOIN_SCREEN_INPUT_LIMIT } from '../configs/constants';

export const saveNickname = async (nickname:string) => {
    //check size of nickname. If size > JOIN_SCREEN_INPUT_LIMIT, truncate.
    const newNickname = nickname.slice(0,JOIN_SCREEN_INPUT_LIMIT);
    try {
        const pathToFile = `${RNFS.DocumentDirectoryPath}/${profilePath}`;
        const isFile = await RNFS.exists(pathToFile);
        if (isFile) {
            const profileDataJSON = await RNFS.readFile(pathToFile, 'utf8');
            const profileData = JSON.parse(profileDataJSON);
            const newProfileData = {...profileData, ...{nickname:newNickname}};
            await RNFS.writeFile(pathToFile, JSON.stringify(newProfileData), 'utf8');
        } else {
            await RNFS.writeFile(pathToFile, JSON.stringify({nickname:newNickname}), 'utf8');
        }
        console.log(`Nickname saved successfully : ${newNickname}`);
        return 0;
    } catch (error) {
        console.log('Error saving nickname:', error);
        //if error is a JSON.parse error, we need to recreate profile file.
        return 1;
    }
};

export const readNickname = async () => {
    try {
        const pathToFile = `${RNFS.DocumentDirectoryPath}/${profilePath}`;
        const profileDataJSON = await RNFS.readFile(pathToFile, 'utf8');
        const profileData = JSON.parse(profileDataJSON);
        if (profileData.nickname) {
            return profileData.nickname;
        } else {
            throw new Error("No nickname found in profile file");
        }
    } catch (error) {
        console.log('Error reading nickname:', error);
        return 1;
    }
}