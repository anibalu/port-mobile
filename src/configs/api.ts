export const WEBSOCKET_URL =
  process.env.WEBSOCKET_URL || 'wss://dev.numberless.tech/ws';
const BASE_URL = process.env.BASE_URL || 'https://dev.numberless.tech';
const REPORTING_RESOURCE = BASE_URL + '/report';
export const LINE_MESSAGE_REPORTING_RESOURCE = REPORTING_RESOURCE + '/line';
export const GROUP_MESSAGE_REPORTING_RESOURCE = REPORTING_RESOURCE + '/group';
const MANAGEMENT_BASE_URL = BASE_URL + '/management';
const MESSAGING_BASE_URL = BASE_URL + '/messaging';
export const INITIAL_POST_MANAGEMENT_RESOURCE = MANAGEMENT_BASE_URL + '/user';
export const AUTH_SERVER_CHALLENGE_RESOURCE = BASE_URL + '/auth/user';
export const PERMISSION_MANAGEMENT_URL = MANAGEMENT_BASE_URL + '/permissions';
export const LINE_LINKS_MANAGEMENT_RESOURCE =
  MANAGEMENT_BASE_URL + '/line-links';
export const LINE_SUPERPORT_MANAGEMENT_RESOURCE =
  MANAGEMENT_BASE_URL + '/superport/line';
export const LINE_MANAGEMENT_RESOURCE = MANAGEMENT_BASE_URL + '/line';
export const LINE_RETRY_URL = LINE_MANAGEMENT_RESOURCE + '/retry';
export const DIRECT_MESSAGING_RESOURCE = MESSAGING_BASE_URL + '/line';
export const BUNDLE_MANAGEMENT_RESOURCE = MANAGEMENT_BASE_URL + '/bundle';
export const LARGE_FILE_PRESIGNED_URL_RESOURCE = BASE_URL + '/multimedia';
export const GROUP_MANAGEMENT_RESOURCE = MANAGEMENT_BASE_URL + '/group';
export const GROUP_LINKS_MANAGEMENT_RESOURCE =
  MANAGEMENT_BASE_URL + '/group-links';
export const GROUP_MESSAGING_RESOURCE = MESSAGING_BASE_URL + '/message';
export const QUEUE_GET_URL = MESSAGING_BASE_URL + '/queue';
export const BUG_REPORTING_ENDPOINT = BASE_URL + '/bugs';
export const BUNDLE_ID_PREPEND_LINK = 'https://porting.me/?bundleId=';
