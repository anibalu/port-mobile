import {getConnections} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';

/**
 * Retrieves all direct chats
 */
export async function getDirectChats(): Promise<ConnectionInfo[]> {
  const connections = await getConnections();
  return connections.filter(
    connection =>
      connection.connectionType === ChatType.direct &&
      connection.authenticated === true &&
      connection.disconnected === false,
  );
}
