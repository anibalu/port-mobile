import {defaultFolderId, defaultPermissionsId} from '@configs/constants';

import {TileProps} from '@screens/Home/Tile';

import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {bundleTargetToChatType, getReadPorts} from '@utils/Ports';
import {
  getConnections,
  getConnectionsByFolder,
  getNewMessageCount,
} from '@utils/Storage/connections';
import {hasExpired} from '@utils/Time';

const noop = () => {};

/**
 * Loads up connections and unread in home screen.
 * @returns - connections and unread in home screen.
 */
export async function loadHomeScreenConnections(): Promise<TileProps[]> {
  try {
    console.log('Loading home screen connections');
    // fetch all connections
    const fetchedConnections: TileProps[] = (
      await getConnections()
    ).map(item => {
      return {...item, isReadPort: false, setSelectedPortProps: noop};
    });
    // fetch all read ports
    const fetchedReadPorts: TileProps[] = (await getReadPorts()).map(port => {
      const readPortChatTile = {
        chatId: port.portId,
        connectionType: bundleTargetToChatType(port.target),
        name: port.name,
        recentMessageType: ContentType.newChat,
        readStatus: MessageStatus.latest,
        authenticated: false,
        timestamp: port.usedOnTimestamp,
        newMessageCount: 0,
        folderId: defaultFolderId,
        isReadPort: true,
        expired: hasExpired(port.expiryTimestamp),
        //we add dummy values for typescript correctness.
        folderName: 'Default',
        disconnected: false,
        permissionsId: defaultPermissionsId,
        pairHash: '',
        routingId: '',
        setSelectedPortProps: noop,
      };
      return readPortChatTile;
    });
    console.log('loaded up connections');
    return fetchedReadPorts.concat(fetchedConnections);
  } catch (error) {
    console.error('Error loading connections: ', error);
    return [];
  }
}

/**
 * Loads up connections and unread in folder screen.
 * @param folderId
 * @returns - connections and unread in folder screen.
 */
export async function loadFolderScreenConnections(folderId: string) {
  try {
    // fetch all connections
    const fetchedConnections = await getConnectionsByFolder(folderId);
    const unread = await getNewMessageCount(folderId);
    console.log('loaded up folder connections');
    return {connections: fetchedConnections, unread: unread};
  } catch (error) {
    console.error('Error loading connections: ', error);
    return {connections: [], unread: 0};
  }
}
