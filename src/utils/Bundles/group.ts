import {getGroupConnectionLink} from '../ConnectionLinks/group';
import {ConnectionType} from '../Connections/interfaces';
import {getGroupInfo} from '../Storage/group';
import {generateISOTimeStamp} from '../Time';
import {GroupConnectionBundle} from './interfaces';

export async function generateGroupConnectionBundle(
  groupId: string,
): Promise<GroupConnectionBundle> {
  const linkId = await getGroupConnectionLink(groupId, true);
  const groupInfo = await getGroupInfo(groupId, true);
  if (linkId === null) {
    throw new Error('out of links');
  } else {
    const bundle: GroupConnectionBundle = {
      org: 'numberless.tech',
      timestamp: generateISOTimeStamp(),
      connectionType: ConnectionType.group,
      version: '1.0.0',
      data: {
        linkId: linkId,
        name: groupInfo.name,
        description: groupInfo.description,
      },
    };
    return bundle;
  }
}
