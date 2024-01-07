import {getConnections} from '../Connections';
import {ConnectionInfo, ChatType} from '../Connections/interfaces';

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
