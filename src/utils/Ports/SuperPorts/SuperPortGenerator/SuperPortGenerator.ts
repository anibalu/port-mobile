import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';

abstract class SuperPortGenerator {
  abstract version: string;
  protected portData: SuperportData;

  /**
   * Constructor for the SuperPortGenerator class.
   * @param portData - The port data to be used by the generator.
   */
  constructor(portData: SuperportData) {
    this.portData = portData;
  }

  /**
   * Create a superport.
   * @param label - name of the superport.
   * @param limit - limit of the superport.
   * @param permissions - permissions of the superport.
   * @returns the superport data.
   */
  static async create(
    label: string,
    limit: number,
    folderId: string,
    permissions: PermissionsStrict,
  ): Promise<SuperportData | null> {
    console.log('creating new super port', limit, label, folderId, permissions);
    return null;
  }

  /**
   * Gets port data
   * @returns  port data
   */
  abstract getPort(): SuperportData;

  /**
   * Updates name of superport
   * @param name of superport
   */
  abstract updateSuperPortName(name: string): Promise<void>;

  /**
   * Updates limit of superport
   * @param limit of superport
   */
  abstract updateSuperPortLimit(limit: number): Promise<void>;

  /**
   * Updates permissions of superport
   * @param permissions of superport
   */
  abstract updateSuperPortPermissions(
    permissions: PermissionsStrict,
  ): Promise<void>;

  /**
   * Get a shareable bundle.
   * @param name to share with the superport
   * @returns the shareable bundle.
   */
  abstract getShareableBundle(name: string): Promise<DirectSuperportBundle>;

  /**
   * Get a shareable link.
   * @param name to share with the superport
   * @returns the shareable link.
   */
  abstract getShareableLink(name: string): Promise<string>;

  /**
   * Pause a superport.
   */
  abstract pause(): Promise<void>;

  /**
   * Resume a paused superport.
   */
  abstract resume(): Promise<void>;

  /**
   * Delete a superport's data from storage.
   */
  abstract clean(): Promise<void>;
}

export default SuperPortGenerator;
