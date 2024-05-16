export interface ServerAuthChallenge {
  challenge: string;
}

export type ServerAuthToken = string;

export interface SavedServerAuthToken {
  timestamp: string;
  token: ServerAuthToken;
}

export interface SolvedAuthChallenge {
  signedChallenge: string;
}
