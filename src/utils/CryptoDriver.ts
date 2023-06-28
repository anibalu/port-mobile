export class CryptoDriver {
  private keyFile: string;
  constructor(keyFile: string = 'default') {
    this.keyFile = keyFile;
  }
  //initialise and load key file.
  async initialiseCrypto() {
    if (this.keyFile === 'default') {
      //create key file and save key file name
      //populate with initial keys
      //load keys
    } else {
      //load keys
    }
  }
  async encryptString(plaintext: string) {
    //initialise crypto
    return plaintext;
  }
  async decryptString(ciphertext: string) {
    //initialise crypto
    return ciphertext;
  }
  async getPubKey() {
    //get pubkeys saved during bundle creation
  }
  async savePeerKey() {
    //save peer key received
  }
}
