import * as Nickname from '../utils/Nickname';

export interface profile {
  nickname?: string;
}

export const joinApp = async (input: profile) => {
  //adds nickname
  if (input.nickname) {
    const response = await Nickname.saveNickname(input.nickname);
    return response;
  }
  return 1;
};
