import {DEFAULT_NICKNAME} from '../configs/constants';
import {updateProfile, profile} from '../utils/Profile';
import {trimWhiteSpace} from '../utils/text';

//adds nickname
export async function joinApp(input: profile): Promise<void> {
  if (input.nickname) {
    const trimmedNickname = trimWhiteSpace(input.nickname);
    let savedNickName = DEFAULT_NICKNAME;
    if (trimmedNickname !== '') {
      savedNickName = trimmedNickname;
    }
    await updateProfile({nickname: savedNickName});
  } else {
    throw new Error('NoNicknameError');
  }
}
