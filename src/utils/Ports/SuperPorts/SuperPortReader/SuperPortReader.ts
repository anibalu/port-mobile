import {defaultFolderId} from '@configs/constants';

abstract class SuperPortReader {
  abstract version: string;
  protected portData: any;

  constructor(portData: any) {
    (this.constructor as typeof SuperPortReader).validate(portData);
    this.portData = portData;
  }

  static validateBundle(bundleData: any) {
    console.log('Validating read super port bundle data: ', bundleData);
  }

  static validate(portData: any) {
    console.log('Validating read super port data: ', portData);
  }

  /**
   * util to accept the port bundle received
   * @param bundleData bundle data received
   * @param folderId of the chat
   */
  static async accept(bundleData: any, folderId: string = defaultFolderId) {
    console.log(
      'accepting read super port bundle data: ',
      bundleData,
      folderId,
    );
  }

  /**
   * Forms a chat
   */
  abstract use(): Promise<void>;
}

export default SuperPortReader;
