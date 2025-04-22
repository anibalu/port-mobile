import NativeCryptoModule from '@specs/NativeCryptoModule';

export function generateKeys() {
  return JSON.parse(NativeCryptoModule.generateEd25519Keypair());
}

export function signMessage(message: string, privateKey: string) {
  return NativeCryptoModule.ed25519SignMessage(message, privateKey);
}
