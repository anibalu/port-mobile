import {generateRandomHexId} from '@utils/IdGenerator';
import * as storage from '@utils/Storage/crypto';
import {
  CryptoData,
  CryptoDataContactPort,
  CryptoDataMember,
  CryptoDataStrict,
} from '@utils/Storage/DBCalls/crypto';

import {hash} from './hash';
import {generateRad16} from './rad';
import * as x25519 from './x25519';

/**
 * Class responsible for cryptographic operations
 */
class CryptoDriver {
  private cryptoId: string | null;
  private cryptoData:
    | CryptoDataStrict
    | CryptoDataMember
    | CryptoDataContactPort
    | null;
  constructor(cryptoId: string | null = null) {
    this.cryptoId = cryptoId;
    this.cryptoData = null;
  }
  /**
   * Generates keys and updates storage if crypto id not present.
   */
  public async create(cryptoData: CryptoDataStrict | null = null) {
    if (!this.cryptoId) {
      const newCryptoId = generateRandomHexId();
      await storage.newCryptoEntry(newCryptoId);
      if (cryptoData) {
        await storage.updateCryptoData(newCryptoId, cryptoData);
        this.cryptoId = newCryptoId;
        this.cryptoData = cryptoData;
      } else {
        const keyPair = await x25519.generateKeys();
        await storage.updateCryptoData(newCryptoId, {
          privateKey: keyPair.privateKey,
          publicKey: keyPair.publicKey,
        });
        this.cryptoId = newCryptoId;
        this.cryptoData = {
          ...keyPair,
          sharedSecret: null,
          peerPublicKeyHash: null,
          rad: null,
        };
      }
    }
  }

  public async createForMember(cryptoData: CryptoDataMember) {
    const newCryptoId = generateRandomHexId();
    await storage.newCryptoEntry(newCryptoId);
    await storage.updateCryptoData(newCryptoId, cryptoData);
    this.cryptoId = newCryptoId;
    this.cryptoData = cryptoData;
  }

  public async createForContactPort(cryptoData: CryptoDataContactPort) {
    const newCryptoId = generateRandomHexId();
    await storage.newCryptoEntry(newCryptoId);
    await storage.updateCryptoData(newCryptoId, cryptoData);
    this.cryptoId = newCryptoId;
    this.cryptoData = cryptoData;
  }

  public async getData(): Promise<CryptoDataStrict> {
    this.cryptoId = this.checkCryptoIdNotNull();
    this.cryptoData = await this.loadKeys();
    return this.cryptoData;
  }

  public async getMemberData(): Promise<CryptoDataMember> {
    this.cryptoId = this.checkCryptoIdNotNull();
    this.cryptoData = await this.loadKeysForMember();
    return this.cryptoData;
  }

  public async getContactPortData(): Promise<CryptoDataContactPort> {
    this.cryptoId = this.checkCryptoIdNotNull();
    this.cryptoData = await this.loadKeysForContactPort();
    return this.cryptoData;
  }

  /**
   * returns crypto id if present. throw error otherwise.
   * @returns crypto id if present
   */
  public getCryptoId(): string {
    return this.checkCryptoIdNotNull();
  }
  /**
   * updates crypto data. after update, crypto data must have private key, public key and shared secret.
   * @param update - update to crypto data.
   */
  public async updateCryptoData(update: CryptoData) {
    this.cryptoId = this.checkCryptoIdNotNull();
    await storage.updateCryptoData(this.cryptoId, update);
    this.cryptoData = await this.loadKeys();
  }
  public async updatePeerPublicKeyHashAndRad(hash: string, rad: string) {
    await this.updateCryptoData({peerPublicKeyHash: hash, rad: rad});
  }
  public async updateRad(rad: string) {
    await this.updateCryptoData({rad: rad});
  }
  public async updateSharedSecret(peerPublicKey: string) {
    this.cryptoData = await this.loadKeys();
    const sharedSecret = x25519.deriveSharedSecret(
      this.cryptoData.privateKey,
      peerPublicKey,
    );
    await this.updateCryptoData({sharedSecret: sharedSecret});
  }
  public async getPeerPublicKeyHash() {
    this.cryptoData = await this.loadKeys();
    if (this.cryptoData.peerPublicKeyHash) {
      return this.cryptoData.peerPublicKeyHash;
    }
    return null;
  }
  public async getPublicKeyHash() {
    this.cryptoData = await this.loadKeys();
    return await hash(this.cryptoData.publicKey);
  }
  public async getRad() {
    this.cryptoData = await this.loadKeys();
    if (this.cryptoData.rad) {
      return this.cryptoData.rad;
    } else {
      const newRad = await generateRad16();
      await this.updateRad(newRad);
      this.cryptoData = await this.loadKeys();
      return newRad;
    }
  }
  public async getPublicKey() {
    this.cryptoData = await this.loadKeys();
    return this.cryptoData.publicKey;
  }
  public async deleteCryptoData() {
    try {
      this.cryptoId = this.checkCryptoIdNotNull();
      await storage.deleteCryptoData(this.cryptoId);
      this.cryptoId = null;
      this.cryptoData = null;
    } catch (error) {
      console.log('Crypto data already deleted');
      this.cryptoId = null;
      this.cryptoData = null;
    }
  }
  /**
   * encrypts plaintext
   * @param plaintext
   * @returns - encrypted url-safe base64 encoded string
   */
  public async encrypt(plaintext: string): Promise<string> {
    this.cryptoData = await this.loadKeys();
    if (this.cryptoData && this.cryptoData.sharedSecret) {
      return x25519.encrypt(plaintext, this.cryptoData.sharedSecret);
    }
    throw new Error('NoSharedSecret');
  }
  /**
   * decrypts ciphertext
   * @param ciphertext - encrypted url-safe base64 encoded string
   * @returns decrypted plaintext
   */
  public async decrypt(ciphertext: string): Promise<string> {
    this.cryptoData = await this.loadKeys();
    if (this.cryptoData && this.cryptoData.sharedSecret) {
      return x25519.decrypt(ciphertext, this.cryptoData.sharedSecret);
    }
    throw new Error('NoSharedSecret');
  }
  private checkCryptoIdNotNull(): string {
    if (this.cryptoId) {
      return this.cryptoId;
    }
    throw new Error('CryptoIdNull');
  }
  /**
   * Loads validated keys to be able to perform crypto graphic operations
   */
  private async loadKeys(): Promise<CryptoDataStrict> {
    this.cryptoId = this.checkCryptoIdNotNull();
    return this.validateCryptoData(await storage.getCryptoData(this.cryptoId));
  }

  private async loadKeysForMember(): Promise<CryptoDataMember> {
    this.cryptoId = this.checkCryptoIdNotNull();
    return (await storage.getCryptoData(this.cryptoId)) as CryptoDataMember;
  }

  private async loadKeysForContactPort(): Promise<CryptoDataContactPort> {
    this.cryptoId = this.checkCryptoIdNotNull();
    return (await storage.getCryptoData(
      this.cryptoId,
    )) as CryptoDataContactPort;
  }

  /**
   * makes sure crypto data has essential cryptographic information
   * @param cryptoData crypto data to validate
   * @returns validated crypto data
   */
  private validateCryptoData(cryptoData: CryptoData): CryptoDataStrict {
    if (cryptoData.privateKey && cryptoData.publicKey) {
      return cryptoData as CryptoDataStrict;
    }
    if (cryptoData.sharedSecret) {
      cryptoData.privateKey = 'NA';
      cryptoData.publicKey = 'NA';
      return cryptoData as CryptoDataStrict;
    }
    throw new Error('CryptoDataIncomplete');
  }
}

export default CryptoDriver;
