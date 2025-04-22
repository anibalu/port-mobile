/**
 * A reducer for the errors that occur when reading and using a Port.
 */

export enum ConnectionErrorType {
  INVALID_PORT = 'INVALID_PORT',
  EXPIRED_PORT = 'EXPIRED_PORT',
  PAUSED_PORT = 'PAUSED_PORT',
  CONNECTION_ALREADY_EXISTS = 'CONNECTION_ALREADY_EXISTS',
  NO_ERROR = 'NO_ERROR',
}

export type ConnectionError = {
  error: string;
  errorCode: ConnectionErrorType;
};

type ConnectionErrorAction = 
  | { type: ConnectionErrorType.INVALID_PORT; payload: { error?: string } }
  | { type: ConnectionErrorType.EXPIRED_PORT; payload: { error?: string } }
  | { type: ConnectionErrorType.PAUSED_PORT; payload: { error?: string } }
  | { type: ConnectionErrorType.CONNECTION_ALREADY_EXISTS; payload: { error?: string } }
  | { type: ConnectionErrorType.NO_ERROR; payload: { error?: string } };


const initialState = {
  error: '',
  errorCode: ConnectionErrorType.NO_ERROR,
};

export default function connectionErrors(
  state: ConnectionError = initialState, 
  action: ConnectionErrorAction
): ConnectionError | null {
  switch (action.type) {
    case ConnectionErrorType.INVALID_PORT:
      return {
        error: action.payload.error || '',
        errorCode: ConnectionErrorType.INVALID_PORT,
      };
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
    case ConnectionErrorType.NO_ERROR:
      return {
        error: action.payload.error || '',
        errorCode: ConnectionErrorType.NO_ERROR,
      };
    default:
      return state;
  }
}
