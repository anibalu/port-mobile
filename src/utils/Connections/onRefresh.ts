import {bundleTargetToChatType, getReadPorts} from '@utils/Ports';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {hasExpired} from '@utils/Time';
import {defaultFolderId, defaultPermissionsId} from '@configs/constants';
import {ChatTileProps} from '@components/ChatTile/ChatTile';
import {
  getAllConnectionsInFocus,
  getConnectionsByFolder,
  getNewMessageCount,
} from '@utils/Storage/connections';

/**
 * Loads up connections and unread in home screen.
 * @returns - connections and unread in home screen.
 */
export async function loadHomeScreenConnections() {
  try {
    // fetch all connections
    const fetchedConnections = await getAllConnectionsInFocus();
    // fetch all read ports
    const fetchedReadPorts = (await getReadPorts()).map(port => {
      const readPortChatTile: ChatTileProps = {
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
      };
      return readPortChatTile;
    });
    const newArray = fetchedReadPorts.concat(fetchedConnections);
    console.log('loaded up connections');
    return {connections: newArray, unread: 0};
  } catch (error) {
    console.error('Error loading connections: ', error);
    return {connections: [], unread: 0};
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
