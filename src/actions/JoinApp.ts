import {updateProfile, profile} from '../utils/Profile';

//adds nickname
export async function joinApp(input: profile): Promise<void> {
  if (input.nickname) {
    await updateProfile(input);
  } else {
    throw new Error('NoNicknameError');
  }
}
