import { BUNDLE_ID_PREPEND_LINK } from "@configs/api";
import { ORG_NAME } from "@configs/constants";

import { jsonToUrl } from "@utils/JsonToUrl";
import { getBundleId } from "@utils/Ports/APICalls";
import { GroupSuperportBundle } from "@utils/Ports/interfaces";
import { GroupSuperportData } from "@utils/Storage/DBCalls/ports/groupSuperPorts";
import { BundleTarget } from "@utils/Storage/DBCalls/ports/interfaces";
import { getGroupData } from "@utils/Storage/group";
import * as storageGroupSuperPorts from '@utils/Storage/groupSuperPorts';

import * as API from '../APICalls';
import GroupSuperPortGenerator from "../GroupSuperPortGenerator";

const GROUP_SUPERPORT_GENERATOR_VERSION = '1.0.0';

class GroupSuperPortGenerator_1_0_0 extends GroupSuperPortGenerator {
    version: string = GROUP_SUPERPORT_GENERATOR_VERSION;

    /**
     * Creates a new group superport.
     * @param groupId - The groupId to create the group superport for.
     * @param shouldRegenerate - Whether to regenerate the group superport.
     * @returns The created group superport data.
     */
    static async create(groupId: string, shouldRegenerate: boolean): Promise<GroupSuperportData | null> {
        try {
            // check if there is an existing group superport
            const existingGroupSuperport = await storageGroupSuperPorts.getGroupSuperportData(groupId);
            if (existingGroupSuperport) {
                if (!shouldRegenerate) {
                    // if we are not regenerating, return the existing group superport
                    return existingGroupSuperport;
                } else {
                    // if we are regenerating, delete the existing group superport
                    // and create a new one as usual
                    await (new GroupSuperPortGenerator_1_0_0(existingGroupSuperport)).clean();
                }
            }
            const groupData = await getGroupData(groupId);
            if (!groupData) {
                throw new Error('NoSuchGroup');
            }
            // gets new group superport Id
            const portId = await API.getNewGroupSuperPort(groupId);

            const portData: GroupSuperportData = {
                portId: portId,
                groupId: groupId,
                version: GROUP_SUPERPORT_GENERATOR_VERSION,
                paused: false,
            };
            //update port with new info
            await storageGroupSuperPorts.addGroupSuperport(portData);
            return portData;
        } catch (error) {
            console.log('Error creating group super port: ', error);
            return null;
        }
    }

    /**
     * Gets the version of the group superport generator.
     * @returns The version of the group superport generator.
     */
    getVersion(): string {
        return this.version;
    }

    /**
     * Gets the port data of the group superport generator.
     * @returns The port data of the group superport generator.
     */
    getPort(): GroupSuperportData {
        return this.portData;
    }

    /**
     * Pause a group superport.
     */
    async pause(): Promise<void> {
        //paused associated group superport
        await API.pauseGroupSuperport(
            this.portData.portId,
            this.portData.groupId,
        );
        //pause group superport locally
        await storageGroupSuperPorts.pauseGroupSuperport(this.portData.portId);
        this.portData = { ...this.portData, paused: true };
    }

    /**
     * Resume a paused group superport.
     */
    async resume() {
        //resume a paused group superport
        await API.resumeGroupSuperport(
            this.portData.portId,
            this.portData.groupId,
        );
        //resume a paused group superport locally
        await storageGroupSuperPorts.unpauseGroupSuperport(this.portData.portId);
        this.portData = { ...this.portData, paused: false };
    }

    /**
     * Get a shareable bundle.
     * @returns the shareable bundle.
     */
    async getShareableBundle(): Promise<GroupSuperportBundle> {
        const groupData = await getGroupData(this.portData.groupId);
        if (!groupData) {
            throw new Error('NoSuchGroup');
        }
        const bundle: GroupSuperportBundle = {
            portId: this.portData.portId,
            version: this.portData.version,
            org: ORG_NAME,
            target: BundleTarget.superportGroup,
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
            return BUNDLE_ID_PREPEND_LINK + this.portData.bundleId;
        }
        //Else create a new shortened link, store it and return it.
        //If that fails, construct the port data as a link.
        const bundle = await this.getShareableBundle();
        try {
            const bundleId = await getBundleId(JSON.stringify(bundle), true);
            await storageGroupSuperPorts.updateGroupSuperportData(this.portData.portId, {
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
        // api call to delete the group superport
        await API.deleteGroupSuperport(this.portData.portId, this.portData.groupId);
        // deletes port data from storage
        await storageGroupSuperPorts.deleteGroupSuperPortData(this.portData.portId);
    }
}

export default GroupSuperPortGenerator_1_0_0;
