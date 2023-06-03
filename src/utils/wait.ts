import {ARTIFICIAL_LOADER_INTERVAL} from '../configs/constants';
//if you want to add artificial wait anywhere
export const wait = async (delay: number = ARTIFICIAL_LOADER_INTERVAL) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};
