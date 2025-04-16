import { GroupBundle } from "@utils/Ports/interfaces";
import { GroupPortData } from "@utils/Storage/DBCalls/ports/groupPorts";

abstract class GroupPortGenerator {
    abstract version: string;
    protected portData: GroupPortData;

    /**
     * Constructor for the GroupPortGenerator class.
     * @param portData - The port data to be used by the generator.
     */
    constructor(portData: GroupPortData) {
        this.portData = portData;
    }

    /**
     * Fetches new group ports from the server and saves them to storage.
     */
    static async fetchNewGroupPorts(groupId: string): Promise<void> {
        console.log('fetching new group ports', groupId);
    }

    /**
     * Creates a new group port.
     * @param groupId - The groupId to create the group port for.
     * @returns The created group port data.
     */
    static async create(groupId: string): Promise<GroupPortData | null> {
        console.log('creating new group port', groupId);
        return null;
    }

    /**
     * Gets the version of the group port generator.
     * @returns The version of the group port generator.
     */
    abstract getVersion(): string;

    /**
     * Gets the port data of the group port generator.
     * @returns The port data of the group port generator.
     */
    abstract getPort(): GroupPortData;

    /**
     * Get a shareable bundle.
     * @returns the shareable bundle.
     */
    abstract getShareableBundle(): Promise<GroupBundle>;

    /**
     * Get a shareable link.
     * @returns the shareable link.
     */
    abstract getShareableLink(): Promise<string>;

    /**
     * Clean up the group port generator.
     */
    abstract clean(): Promise<void>;
}

export default GroupPortGenerator;
