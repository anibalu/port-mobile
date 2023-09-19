/**
 * Paths to profile info
 * @param profileDir - path to directory where profile information is stored
 * @param profileDataPath - path to where general profile info is store
 */
export const profileDir = '/profile';
export const profileDataPath = '/data.json';

/**
 * Paths to connections info
 * @param connectionsPath - path to where the info is stored about all the connections
 */
export const connectionsPath = '/connections.json';

/**
 * Paths to connection links
 * @param linksDir - path to directory where connections links are stored
 * @param lineLinkspath - path to where the line connections links are stored.
 */
export const linksDir = '/links';
export const lineLinksPath = '/line.json';

/**
 * Paths to token
 * @param tokenPath - path to where the token is stored.
 */
export const tokenPath = '/token.json';

/**
 * Paths to generated bundles
 * @param generatedBundlesPath - path to where the generated bundles get stored
 */
export const generatedBundlesPath = '/generatedBundles.json';

/**
 * Paths to read bundles
 * @param readBundlesPath - path to where the read bundles get stored
 */
export const readBundlesPath = '/readBundles.json';

/**
 * @param conversationsDir - path where the actual conversation sub-folders and journal is stored
 */
export const conversationsDir = '/conversations';

/**
 * Paths to journaled messages
 * @param messageJournalDir - path to directory where the journaled messages are stored (this directory is inside conversations directory)
 * @param messageJournalPath - path to where the journaled messages are stored
 */
export const messageJournalDir = '/journal';
export const messageJournalPath = '/journaled.txt';

/**
 * Paths to messages and media
 * @param messagesDir - path to directory where the messages are stored (this directory is inside conversations directory within the respective lineId directory)
 * @param mediaDir - path to directory where the media are stored (this directory is inside conversations directory within the respective lineId directory)
 * @param filesDir - path to directory where the files are stored (this directory is inside conversations directory within the respective lineId directory)
 */
export const messagesDir = '/messages';
export const mediaDir = '/media';
export const filesDir = '/files';

//path to temporary dir
export const tempDir = '/temp';
