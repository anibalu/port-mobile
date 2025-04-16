import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import {selectFiles} from '@utils/Files';
import {generateRandomHexId} from '@utils/IdGenerator';
import {initialiseFCM} from '@utils/Messaging/PushNotifications/fcm';
import { Port } from '@utils/Ports/SingleUsePorts/Port';
import {updateBackupTime} from '@utils/Profile';
import {blockUser, getAllBlockedUsers} from '@utils/Storage/blockUsers';
import {addConnection, getConnections} from '@utils/Storage/connections';
import {addContactPort, getAllContactPorts} from '@utils/Storage/contactPorts';
import {addContact, getContacts} from '@utils/Storage/contacts';
import {GroupMemberEntry} from '@utils/Storage/DBCalls/groupMembers';
import {addFolderEntry, getAllFolders} from '@utils/Storage/folders';
import {addGroup, getAllGroups} from '@utils/Storage/group';
import {getAllGroupMembers, newMember} from '@utils/Storage/groupMembers';
import {addLine, getLines} from '@utils/Storage/lines';
import {ProfileInfo} from '@utils/Storage/RNSecure/secureProfileHandler';
import {addSuperport, getAllSuperports} from '@utils/Storage/superPorts';
import {generateISOTimeStamp} from '@utils/Time';


import {addCryptoEntry, getAllCryptoData} from '../Storage/crypto';
import {addPermissionEntry, getAllPermissions} from '../Storage/permissions';
import {getProfileInfo, saveProfileInfo} from '../Storage/profile';

const BACKUP_VERSION = '20240412'; // Write as date to guesstimate when the backup code was written
const sectionSplitMagic = '\n<---SECTION SPLIT--->\n'; // TODO Debt: need to account for and escape this sequence across sections
const tableSplitMagic = '\n<---TABLE SPLIT--->\n'; // TODO Debt: need to account for and escape this sequence across tables
type tableOpt =
  | 'connections'
  | 'permissions'
  | 'crypto'
  | 'lines'
  | 'folders'
  | 'blockedUsers'
  | 'superPorts'
  | 'contacts'
  | 'contactPorts'
  | 'groups'
  | 'groupMembers';
const tablesToSertialize: tableOpt[] = [
  'connections',
  'permissions',
  'crypto',
  'lines',
  'folders',
  'blockedUsers',
  'superPorts',
  'contacts',
  'contactPorts',
  'groups',
  'groupMembers',
];

/**
 * This interface is never actually used, but outlines everything needed to serialize a table
 */
// eslint-disable-next-line
interface serializationData {
  columns: string[];
  booleanColumns: string[];
  inserter: () => Promise<void>;
  ennumerator: () => Promise<void>;
}
const tableSerializationData = {
  connections: {
    columns: [
      'chatId',
      'connectionType',
      'recentMessageType',
      'readStatus',
      'timestamp',
      'pairHash',
      'routingId',
      'folderId',
      'name',
    ],
    booleanColumns: [],
    inserter: addConnection,
    ennumerator: getConnections,
  },
  crypto: {
    columns: [
      'cryptoId',
      'peerPublicKeyHash',
      'privateKey',
      'publicKey',
      'rad',
      'sharedSecret',
    ],
    booleanColumns: [],
    inserter: addCryptoEntry,
    ennumerator: getAllCryptoData,
  },
  permissions: {
    columns: [
      'autoDownload',
      'contactSharing',
      'disappearingMessages',
      'displayPicture',
      'notifications',
      'permissionsId',
      'readReceipts',
      'focus',
    ],
    booleanColumns: [
      'autoDownload',
      'contactSharing',
      'displayPicture',
      'notifications',
      'readReceipts',
      'focus',
    ],
    inserter: addPermissionEntry,
    ennumerator: getAllPermissions,
  },
  lines: {
    columns: [
      'authenticated',
      'cryptoId',
      'disconnected',
      'lineId',
      'permissionsId',
    ],
    booleanColumns: ['authenticated', 'disconnected'],
    inserter: addLine,
    ennumerator: getLines,
  },
  folders: {
    columns: ['folderId', 'name', 'permissionsId'],
    booleanColumns: [],
    inserter: addFolderEntry,
    ennumerator: getAllFolders,
  },
  blockedUsers: {
    columns: ['pairHash', 'name', 'blockTimestamp'],
    booleanColumns: [],
    inserter: blockUser,
    ennumerator: getAllBlockedUsers,
  },
  superPorts: {
    columns: [
      'portId',
      'version',
      'label',
      'usedOnTimestamp',
      'createdOnTimestamp',
      'channel',
      'cryptoId',
      'connectionsLimit',
      'connectionsMade',
      'folderId',
      'paused',
    ],
    booleanColumns: ['paused'],
    inserter: addSuperport,
    ennumerator: getAllSuperports,
  },
  contacts: {
    columns: ['pairHash', 'name', 'notes', 'connectedOn', 'connectionSource'],
    booleanColumns: [],
    inserter: addContact,
    ennumerator: getContacts,
  },
  contactPorts: {
    columns: [
      'portId',
      'pairHash',
      'owner',
      'version',
      'usedOnTimestamp',
      'createdOnTimestamp',
      'cryptoId',
      'connectionsMade',
      'folderId',
      'paused',
    ],
    booleanColumns: ['owner', 'paused'],
    inserter: addContactPort,
    ennumerator: getAllContactPorts,
  },
  groups: {
    columns: [
      'groupId',
      'name',
      'joinedAt',
      'description',
      'amAdmin',
      'selfCryptoId',
      'permissionsId',
      'groupPictureKey',
      'initialMemberInfoReceived',
      'disconnected',
    ],
    booleanColumns: ['disconnected', 'amAdmin', 'initialMemberInfoReceived'],
    inserter: addGroup,
    ennumerator: getAllGroups,
  },
  groupMembers: {
    columns: [
      'memberId',
      'groupId',
      'pairHash',
      'joinedAt',
      'cryptoId',
      'isAdmin',
      'deleted',
    ],
    booleanColumns: ['isAdmin', 'deleted'],
    inserter: (x: GroupMemberEntry) => newMember(x.groupId, x),
    ennumerator: getAllGroupMembers,
  },
};

/**
 * Filter a list of entries to only include columns relevant for backups
 * @param tableName
 * @param data
 * @returns
 */
function applyColumnMask(tableName: tableOpt, data: any[]): any[] {
  const outBuf: any[] = [];
  data.forEach((entry: any) => {
    const maskedEntry: any = {};
    tableSerializationData[tableName].columns.forEach((column: string) => {
      maskedEntry[column] = entry[column];
    });
    outBuf.push(maskedEntry);
  });
  return outBuf;
}

/**
 * Serialized database section
 * @returns string
 */
async function serializedDatabaseSection() {
  // TODO Debt: clean this up to use a list instead
  let tableOrderHeader = '';
  const tableCSVList: string[] = [];
  for (let i = 0; i < tablesToSertialize.length; i++) {
    const tableName = tablesToSertialize[i];
    console.log(tableName);
    const tableData = await tableSerializationData[tableName].ennumerator();
    const tableCSV = Papa.unparse(applyColumnMask(tableName, tableData));
    tableOrderHeader += tableName + '\n';
    tableCSVList.push(tableCSV);
  }
  tableOrderHeader = tableOrderHeader.slice(0, -1); // Strip out last newline
  const dataList = [tableOrderHeader].concat(tableCSVList);
  const serializedTables = dataList.join(tableSplitMagic);
  return serializedTables;
}

async function serializeProfileInfo() {
  return JSON.stringify(await getProfileInfo());
}

/**
 * Load profile metadata from a string
 * @param profilestr
 */
async function deserializeProfileData(profilestr: string) {
  const profile = JSON.parse(profilestr) as ProfileInfo;
  await saveProfileInfo(profile);
}

/**
 * Populate a serializable table from a csv
 * @param tableName
 * @param tableCSV
 * @returns
 */
async function populateTable(tableName: tableOpt, tableCSV: string) {
  console.log(tableName, tableCSV);
  if (!tableSerializationData[tableName]) {
    console.warn('[BACKUP] invalid table option in populateTable, skipping');
    return;
  }
  const parsedData = Papa.parse(tableCSV, {
    header: true,
  }).data;
  console.log(parsedData);
  // Rewrite boolean columns as proper booleans
  parsedData.forEach((entry: any) => {
    tableSerializationData[tableName].booleanColumns.forEach(column => {
      if (entry[column] === 'true') {
        entry[column] = true;
      } else if (entry[column] === 'false') {
        entry[column] = false;
      }
    });
  });

  const insertIntoTable = tableSerializationData[tableName].inserter;
  parsedData.forEach(async (entry: any) => {
    await insertIntoTable(entry);
  });
}

/**
 * Load up an account from a backup
 * @param onSuccess
 * @param onFailure
 * @returns
 */
export async function readSecureDataBackup(
  onSuccess: () => any,
  onFailure: () => any,
) {
  try {
    const selections = await selectFiles();
    const selected = selections[0];
    if (!selected) {
      console.warn('[BACKUP] no file selected');
      onFailure();
      return;
    }
    const path = selected.fileUri;

    let backup: string | null;
    try {
      backup = await RNFS.readFile(path, 'utf8');
    } catch (e) {
      console.error('[BACKUP] file not found');
      onFailure();
      return;
    }
    if (!backup) {
      onFailure();
      return;
    }
    const sections: string[] = backup.split(sectionSplitMagic);
    const profileData = sections[1] as string;
    await deserializeProfileData(profileData);
    const dbData = sections[2] as string;
    const dbOrder = dbData.split(tableSplitMagic)[0].split('\n') as tableOpt[];
    const dbCSVs = dbData.split(tableSplitMagic).slice(1) as string[];
    for (let i = 0; i < dbOrder.length; i++) {
      await populateTable(dbOrder[i], dbCSVs[i]);
    }
    await Port.generator.fetchNewPorts();
    try {
      await initialiseFCM();
    } catch (e) {
      console.warn(
        '[BACKUP] Could not finish initialize FCM (This is expected on iOS emulators): ',
        e,
      );
    }
    onSuccess();
    return;
  } catch (error) {
    console.warn('[BACKUP] failed: ', error);
    onFailure();
    return;
  }
}

/**
 * Create a backup for a user's account and connections
 */
export async function createSecureDataBackup() {
  const backupFileName = `/portBackup-${generateRandomHexId()}.txt`;
  const path = RNFS.CachesDirectoryPath + backupFileName;

  const header =
    'Port data backup file\n' +
    'Created on: ' +
    generateISOTimeStamp() +
    '\n' +
    'backup version: ' +
    BACKUP_VERSION +
    '\n';
  const profileInfo = await serializeProfileInfo();
  const dbCSV = await serializedDatabaseSection();

  const finalStr = [header, profileInfo, dbCSV].join(sectionSplitMagic);

  await RNFS.writeFile(path, finalStr, 'utf8');
  const shareContent = {
    title: 'Save your backup file ',
    filename: backupFileName,
    url: 'file://' + path,
  };
  try {
    const shareResult = await Share.open(shareContent);
    if (shareResult.success) {
      updateBackupTime(generateISOTimeStamp());
    }
  } catch (e) {
    console.warn('[BACKUP] user did not save backup');
  }
}
