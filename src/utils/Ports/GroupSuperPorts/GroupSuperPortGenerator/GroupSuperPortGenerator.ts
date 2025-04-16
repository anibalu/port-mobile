import { GroupSuperportBundle } from "@utils/Ports/interfaces";
import { GroupSuperportData } from "@utils/Storage/DBCalls/ports/groupSuperPorts";

abstract class GroupSuperPortGenerator {
    abstract version: string;
    protected portData: GroupSuperportData;

    /**
     * Constructor for the GroupPortGenerator class.
     * @param portData - The port data to be used by the generator.
     */
    constructor(portData: GroupSuperportData) {
        this.portData = portData;
    }

    /**
     * Creates a new group superport.
     * @param groupId - The groupId to create the group superport for.
     * @param shouldRegenerate - Whether to regenerate the group superport.
     * @returns The created group superport data.
     */
    static async create(groupId: string, shouldRegenerate: boolean): Promise<GroupSuperportData | null> {
        console.log('creating new group superport', groupId, shouldRegenerate);
        return null;
    }

    /**
     * Gets the version of the group port generator.
     * @returns The version of the group port generator.
     */
    abstract getVersion(): string;

    /**
     * Gets the port data of the group superport generator.
     * @returns The port data of the group superport generator.
     */
    abstract getPort(): GroupSuperportData;

    /**
     * Pauses the group superport.
     */
    abstract pause(): Promise<void>;

    /**
     * Resumes the group superport.
     */
    abstract resume(): Promise<void>;

    /**
     * Get a shareable bundle.
     * @returns the shareable bundle.
     */
    abstract getShareableBundle(): Promise<GroupSuperportBundle>;

    /**
     * Get a shareable link.
     * @returns the shareable link.
     */
    abstract getShareableLink(): Promise<string>;

    /**
     * Clean up the group superport generator.
     */
    abstract clean(): Promise<void>;
}

export default GroupSuperPortGenerator;
