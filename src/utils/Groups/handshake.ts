import {
  addNewGroup,
  attemptJoinGroup,
  getInitialGroupMembersInfo,
} from '../Groups';
import {BundleReadResponse, GroupConnectionBundle} from '../Bundles/interfaces';
import {ContentType} from '../Messaging/interfaces';
import {getProfileName} from '../Profile';
import {generateISOTimeStamp} from '../Time';
import SendMessage from '@utils/Messaging/Send/SendMessage';

/**
 * Actions performed when a group connection bundle is read.
 * @param {GroupConnectionBundle} bundle - group connection bundle that is read.
 * @returns {Promise<BundleReadResponse>} - based on whether actions succeeded or failed or encountered a format error. If failed becuase of network reasons, actions need to be triggered again.
 */
export async function handshakeActionsG1(
  bundle: GroupConnectionBundle,
): Promise<BundleReadResponse> {
  try {
    //try creating a chatId by posting the direct connection link id.
    const {groupId, members}: {groupId: string; members: string[]} =
      await attemptJoinGroup(bundle.data.linkId);
    //if group info received, save new group.
    await addNewGroup({
      groupId: groupId,
      name: bundle.data.name || '',
      description: bundle.data.description || '',
      joinedAt: generateISOTimeStamp(),
      amAdmin: false,
      members: getInitialGroupMembersInfo(members),
    });
    const sender = new SendMessage(groupId, ContentType.name, {
      name: await getProfileName(),
    });
    await sender.send();
    return BundleReadResponse.success;
  } catch (error) {
    console.log('Network issue in joining group', error);
    //if network issue, try again later.
    return BundleReadResponse.networkError;
  }
}
