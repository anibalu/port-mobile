import {DEFAULT_NICKNAME, NICKNAME_LENGTH_LIMIT} from '../configs/constants';
import {trimWhiteSpace} from './text';

//check size of nickname. If size > JOIN_SCREEN_INPUT_LIMIT, truncate.
export const nicknameTruncate = (nickname: string) => {
  const newNickname = nickname.slice(0, NICKNAME_LENGTH_LIMIT);
  return newNickname;
};

export const processNickname = (rawNickname: string) => {
  const trimmedNickname = trimWhiteSpace(rawNickname);
  let savedNickName = DEFAULT_NICKNAME;
  if (trimmedNickname !== '') {
    savedNickName = trimmedNickname;
  }
  return nicknameTruncate(savedNickName);
};
