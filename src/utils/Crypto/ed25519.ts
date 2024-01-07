import {
  generateEd25519Keys,
  signMessageEd25519,
} from '@numberless/react-native-numberless-crypto';

export async function generateKeys() {
  return await generateEd25519Keys();
}

export async function signMessage(message: string, privateKey: string) {
  return await signMessageEd25519(message, privateKey);
}
