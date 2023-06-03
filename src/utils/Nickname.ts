import {NICKNAME_LENGTH_LIMIT} from '../configs/constants';

//check size of nickname. If size > JOIN_SCREEN_INPUT_LIMIT, truncate.
export const nicknameTruncate = (nickname: string) => {
  const newNickname = nickname.slice(0, NICKNAME_LENGTH_LIMIT);
  return newNickname;
};
