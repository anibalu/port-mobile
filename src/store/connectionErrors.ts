/**
 * A reducer for the errors that occur when reading and using a Port.
 */

export enum ConnectionErrorType {
  EXPIRED_PORT = 'EXPIRED_PORT',
  PAUSED_PORT = 'PAUSED_PORT',
  CONNECTION_ALREADY_EXISTS = 'CONNECTION_ALREADY_EXISTS',
}

export type ConnectionError = {
  error: string;
  errorCode: ConnectionErrorType;
};

type ConnectionErrorAction = 
  | { type: ConnectionErrorType.EXPIRED_PORT; payload: { error?: string } }
  | { type: ConnectionErrorType.PAUSED_PORT; payload: { error?: string } }
  | { type: ConnectionErrorType.CONNECTION_ALREADY_EXISTS; payload: { error?: string } }
  | { type: 'RESET_CONNECTION_ERRORS' };

export default function connectionErrors(
  state: ConnectionError | null = null, 
  action: ConnectionErrorAction
): ConnectionError | null {
  switch (action.type) {
    case ConnectionErrorType.EXPIRED_PORT:
      return {
        error: action.payload.error || '',
        errorCode: ConnectionErrorType.EXPIRED_PORT,
      };
    case ConnectionErrorType.PAUSED_PORT:
      return {
        error: action.payload.error || '',
        errorCode: ConnectionErrorType.PAUSED_PORT,
      };
    case ConnectionErrorType.CONNECTION_ALREADY_EXISTS:
      return {
        error: action.payload.error || '',
        errorCode: ConnectionErrorType.CONNECTION_ALREADY_EXISTS,
      };
    case 'RESET_CONNECTION_ERRORS':
      return null;
    default:
      return state;
  }
}
