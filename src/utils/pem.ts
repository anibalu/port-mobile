export function publicKeyPEMencode(pubKey: string) {
  const pemKey =
    '-----BEGIN PUBLIC KEY-----\n' + pubKey + '\n-----END PUBLIC KEY-----\n';
  return pemKey;
}

export function parsePEMPublicKey(pemKey: string) {
  return pemKey.slice(27, -26);
}
