import axios from 'axios';
import {LINE_MANAGEMENT_RESOURCE} from '../../configs/api';
import {getConnections} from '../Connections';
import {ConnectionInfo, ConnectionType} from '../Connections/interfaces';
import {getToken} from '../ServerAuth';

/**
 * Attempts to initiate a new direct chat using a lineLink Id.
 * @param {string} connectionLink - lineLink Id used to initiate a new direct chat
 * @throws {Error} - If there is an error generating chat Id.
 * @returns {Promise<string | null>} - based on whether direct chat creation succeeds on the server.
 */
export async function AttemptNewDirectChat(
  connectionLink: string,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(LINE_MANAGEMENT_RESOURCE, {
    token: token,
    lineLinkId: connectionLink,
  });
  if (response.data.newLine !== undefined) {
    const chatId: string = response.data.newLine;
    return chatId;
  }
  throw new Error('APIError');
}

export async function AttemptNewDirectChatFromSuperport(
  superportId: string,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(LINE_MANAGEMENT_RESOURCE, {
    token: token,
    lineSuperportId: superportId,
  });
  if (response.data.newLine !== undefined) {
    const chatId: string = response.data.newLine;
    return chatId;
  }
  throw new Error('APIError');
}

/**
 * Retrieves all direct chats
 */
export async function getDirectChats(): Promise<ConnectionInfo[]> {
  const connections = await getConnections();
  return connections.filter(
    connection => connection.connectionType === ConnectionType.direct,
  );
}
