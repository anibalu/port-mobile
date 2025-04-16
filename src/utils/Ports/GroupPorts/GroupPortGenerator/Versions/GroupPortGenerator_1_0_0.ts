import { BUNDLE_ID_PREPEND_LINK } from "@configs/api";
import { IDEAL_UNUSED_PORTS_NUMBER, ORG_NAME } from "@configs/constants";

import { jsonToUrl } from "@utils/JsonToUrl";
import { getBundleId } from "@utils/Ports/APICalls";
import { GroupBundle } from "@utils/Ports/interfaces";
import { GroupPortData } from "@utils/Storage/DBCalls/ports/groupPorts";
import { BundleTarget } from "@utils/Storage/DBCalls/ports/interfaces";
import { getGroupData } from "@utils/Storage/group";
import * as storageGroupPorts from '@utils/Storage/groupPorts';
import { generateISOTimeStamp, getExpiryTimestamp } from "@utils/Time";
import { expiryOptions } from "@utils/Time/interfaces";

import * as APICalls from '../APICalls';
import GroupPortGenerator from "../GroupPortGenerator";




const GROUP_PORT_GENERATOR_VERSION = '1.0.0';

class GroupPortGenerator_1_0_0 extends GroupPortGenerator {
    version: string = GROUP_PORT_GENERATOR_VERSION;

    /**
     * Gets an unused group port for a particular group
     * @param groupId - group Id of group
     * @returns - port Id of unused group port
     * @throws - error if we could not fetch an unused group port.
     * The primary reason for this error would be a lack of an internet connection.
     */
    static async getUnusedGroupPort(groupId: string): Promise<string> {
        const unusedPort = await storageGroupPorts.getUnusedGroupPort(groupId);
        if (!unusedPort.portId ||
            unusedPort.remainingPorts < IDEAL_UNUSED_PORTS_NUMBER) {
            // make an api call to fetch new group ports
            await GroupPortGenerator_1_0_0.fetchNewGroupPorts(groupId);
            if (!unusedPort.portId) {
                const newUnusedPort = await storageGroupPorts.getUnusedGroupPort(groupId);
                if (!newUnusedPort.portId) {
                    throw new Error('NoAvailabeUnusedGroupPort');
                }
                return newUnusedPort.portId;
            }
            return unusedPort.portId;
        }
        return unusedPort.portId;
    }

    /**
     * Fetches new group ports from the server and saves them to storage.
     * @param groupId - group Id of group
     */
    static async fetchNewGroupPorts(groupId: string): Promise<void> {
        try {
            const portIds = await APICalls.getNewGroupPorts(groupId);
            await storageGroupPorts.newGroupPorts(groupId, portIds);
        } catch (error) {
            console.log('Error getting new ports: ', error);
        }
    }

    /**
     * Creates a new group port.
     * @param groupId - The groupId to create the group port for.
     * @returns The created group port data.
     */
    static async create(groupId: string): Promise<GroupPortData | null> {
        try {
            const groupData = await getGroupData(groupId);
            if (!groupData) {
                throw new Error('NoSuchGroup');
            }
            // gets new group port Id
            const portId = await GroupPortGenerator_1_0_0.getUnusedGroupPort(groupId);
            const currentTimestamp = generateISOTimeStamp();
            const expiryTimestamp = getExpiryTimestamp(currentTimestamp, expiryOptions[4]);

            const portData: GroupPortData = {
                portId: portId,
                groupId: groupId,
                version: GROUP_PORT_GENERATOR_VERSION,
                usedOnTimestamp: currentTimestamp,
                expiryTimestamp: expiryTimestamp,
            };
            //update port with new info
            await storageGroupPorts.updateGroupPortData(portId, portData);
            return portData;

        } catch (error) {
            console.log('Error creating group port: ', error);
            return null;
        }
    }

    /**
     * Gets the version of the group port generator.
     * @returns The version of the group port generator.
     */
    getVersion(): string {
        return this.version;
    }

    /**
     * Gets the port data of the group port generator.
     * @returns The port data of the group port generator.
     */
    getPort(): GroupPortData {
        return this.portData;
    }

    /**
     * Get a shareable bundle.
     * @returns the shareable bundle.
     */
    async getShareableBundle(): Promise<GroupBundle> {
        const groupData = await getGroupData(this.portData.groupId);
        if (!groupData) {
            throw new Error('NoSuchGroup');
        }
        const bundle: GroupBundle = {
            portId: this.portData.portId,
            version: this.portData.version,
            org: ORG_NAME,
            target: BundleTarget.group,
            name: groupData.name,
            description: groupData.description,
        }
        return bundle;
    }

    /**
     * Get a shareable link.
     * @returns the shareable link.
     */
    async getShareableLink(): Promise<string> {
        if (this.portData.bundleId) {
            const bundleId =
                this.portData.bundleId.substring(0, 7) === 'link://'
                    ? this.portData.bundleId.replace('link://', '') //to handle older methods of storing bundleId.
                    : this.portData.bundleId;
            return BUNDLE_ID_PREPEND_LINK + bundleId;
        }
        //Else create a new shortened link, store it and return it.
        //If that fails, construct the port data as a link.
        const bundle = await this.getShareableBundle();
        try {
            const bundleId = await getBundleId(JSON.stringify(bundle));
            await storageGroupPorts.updateGroupPortData(this.portData.portId, {
                bundleId: bundleId,
            });
            this.portData = { ...this.portData, bundleId: bundleId };
            return BUNDLE_ID_PREPEND_LINK + bundleId;
        } catch (error) {
            console.log('Error getting shareable link: ', error);
            //If that fails, construct the port data as a link.
            const longLink = jsonToUrl(bundle as any);
            if (!longLink) {
                throw new Error('Error getting shareable link');
            }
            return longLink;
        }
    }

    /**
     * Clean up the group port generator.
     */
    async clean(): Promise<void> {
        try {
            // deletes port data from storage
            await storageGroupPorts.deleteGroupPort(this.portData.portId);
        } catch (error) {
            console.log('Error deleting generated port: ', error);
        }
    }
}

export default GroupPortGenerator_1_0_0;
