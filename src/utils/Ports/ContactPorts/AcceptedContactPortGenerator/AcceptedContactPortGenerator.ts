import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { AcceptedContactPortData } from "@utils/Storage/DBCalls/ports/contactPorts";

abstract class AcceptedContactPortGenerator {
  abstract version: string;
  protected portData: AcceptedContactPortData;

  /**
   * Constructor for the AcceptedContactPortGenerator class.
   * @param portData - The port data to be used by the generator.
   */
  constructor(portData: AcceptedContactPortData) {
    this.portData = portData;
  }

  /**
   * Validates the contact port bundle
   * @param bundleData - The contact port bundle data to validate.
   * @returns The validated contact port bundle.
   * @throws {Error} If the bundle data is invalid.
   */
  static validateBundle(bundleData: any): DirectContactPortBundle {
    console.log('Validating accepted contact port bundle', bundleData);
    throw new Error('Bundle validation is handled in the version specific classes');
  }

  /**
   * Creates a new accepted contact port.
   * @param pairHash - The pair hash to create the contact port for.
   * @param bundleData - The contact port bundle data to create the contact port from.
   * @returns The created contact port data.
   */
  static async create(pairHash: string, bundleData: DirectContactPortBundle): Promise<AcceptedContactPortData | null> {
    console.log('Creating new accepted contact port', pairHash, bundleData);
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
  abstract getPort(): AcceptedContactPortData;

  /**
   * Gets the shareable bundle of the contact port.
   * @returns The shareable bundle of the contact port.
   */
  abstract getShareableBundle(): Promise<DirectContactPortBundle>;

  /**
   * Gets the shareable link of the contact port.
   * @returns The shareable link of the contact port.
   */
  abstract getShareableLink(): Promise<string>;

  /**
   * Cleans the contact port.
   */
  abstract clean(): Promise<void>;
}

export default AcceptedContactPortGenerator;

