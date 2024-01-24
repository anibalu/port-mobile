import {FileAttributes} from '@utils/Storage/interfaces';

export const NAME_LENGTH_LIMIT = 30;
export const PAGINATION_LIMIT = 30;
export const ARTIFICIAL_LOADER_INTERVAL = 300;
export const TOKEN_VALIDITY_INTERVAL = 4 * 60 * 1000;
export const IDEAL_UNUSED_PORTS_NUMBER = 5;
export const DEFAULT_NAME = 'Numberless';

export const BUNDLE_VALIDITY_INTERVAL = 24 * 60 * 60 * 1000;
export const ERROR_MODAL_VALIDITY_TIMEOUT = 3000;
export const SELECTED_MESSAGES_LIMIT = 20;
export const START_OF_TIME = '2023-11-30T09:47:11Z';
export const MESSAGE_DATA_MAX_LENGTH = 2048;

//UI Definitions for elements
export const TOPBAR_HEIGHT = 56;
export const BOTTOMBAR_HEIGHT = 75;
export const BOTTOMBAR_ICON_SIZE = 24;
export const AVATAR_ARRAY = [
  'avatar://1',
  'avatar://2',
  'avatar://3',
  'avatar://4',
  'avatar://5',
  'avatar://6',
  'avatar://7',
  'avatar://8',
  'avatar://9',
  'avatar://10',
  'avatar://11',
  'avatar://12',
  'avatar://13',
  'avatar://14',
  'avatar://15',
];
export const DEFAULT_AVATAR = AVATAR_ARRAY[0];
export const DEFAULT_PROFILE_AVATAR_INFO: FileAttributes = {
  fileUri: 'avatar://1',
  fileName: '1',
  fileType: 'avatar',
};
export const MAX_PERMISSION_PRESETS = 5;
export const SHARED_FILE_SIZE_LIMIT_IN_BYTES = 10000000; //10MB limit
export const FILE_ENCRYPTION_KEY_LENGTH = 160;
