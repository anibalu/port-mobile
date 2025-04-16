import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { ContactPortData } from "@utils/Storage/DBCalls/ports/contactPorts";

abstract class SharedContactPortGenerator {
  abstract version: string;
  protected portData: ContactPortData;

  /**
   * Constructor for the SharedContactPortGenerator class.
   * @param portData - The port data to be used by the generator.
   */
  constructor(portData: ContactPortData) {
    this.portData = portData;
  }

  /**
   * Creates a new shared contact port.
   * @param pairHash - The pair hash to create the contact port for.
   * @param folderId - The folder ID to create the contact port in.
   * @param permissions - The permissions for the contact port.
   * @returns The created contact port data.
   */
  static async create(pairHash: string, folderId: string, permissions: PermissionsStrict): Promise<ContactPortData | null> {
    console.log('Creating new shared contact port', pairHash, folderId, permissions);
    return null;
  }

  /**
   * Gets the version of the contact port generator.
   * @returns The version of the contact port generator.
   */
  abstract getVersion(): string;

  /**
   * Gets the port data of the contact port generator.
   * @returns The port data of the contact port generator.
   */
  abstract getPort(): ContactPortData;

  /**
   * Accepts a ticket for the contact port.
   * @param ticketId - The ID of the ticket to accept.
   * @param chatId - The ID of the chat to accept the ticket for.
   */
  abstract acceptTicket(ticketId: string, chatId: string): Promise<void>;

  /**
   * Gets the shareable bundle of the contact port.
   * @returns The shareable bundle of the contact port.
   */
  abstract getShareableBundle(): Promise<DirectContactPortBundle>;

  /**
   * Pauses the contact port.
   */
  abstract pause(): Promise<void>;

  /**
   * Resumes the contact port.
   */
  abstract resume(): Promise<void>;

  /**
   * Cleans the contact port.
   */
  abstract clean(): Promise<void>;

  /**
   * Uses the contact port.
   */
  abstract use(lineId: string, pairHash: string, introMessage: any): Promise<void>;
}

export default SharedContactPortGenerator;