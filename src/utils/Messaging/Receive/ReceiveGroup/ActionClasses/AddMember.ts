import store from '@store/appStore';
import GroupReceiveAction from '../GroupReceiveAction';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getProfileName} from '@utils/Profile';
import Group from '@utils/Groups/Group';
import {generateISOTimeStamp} from '@utils/Time';

class AddMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    store.dispatch({
      type: 'NEW_CONNECTION',
      payload: {
        chatId: this.chatId,
        connectionLinkId: this.receiveTime,
      },
    });
    //add new member to member list
    const groupHandler = new Group(this.chatId);
    await groupHandler.addGroupMember({
      memberId: this.content.newMember,
      name: null,
      joinedAt: generateISOTimeStamp(),
      cryptoId: null,
      isAdmin: false,
    });
    //send your name
    const sender = new SendMessage(this.chatId, ContentType.name, {
      name: await getProfileName(),
    });
    await sender.send();
  }
}

export default AddMember;
