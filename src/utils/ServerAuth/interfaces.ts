export interface ServerAuthChallenge {
  challenge: string;
}

export interface ServerAuthToken {
  ad: string;
  nonce: string;
  secret: string;
}

export interface SavedServerAuthToken {
  timestamp: string;
  token: ServerAuthToken;
}

export interface SolvedAuthChallenge {
  ciphertext: string;
  nonce: string;
  associatedData: string;
}
