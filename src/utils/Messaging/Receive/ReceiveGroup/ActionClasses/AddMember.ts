import store from '@store/appStore';
import GroupReceiveAction from '../GroupReceiveAction';
import {updateNewMember} from '@utils/Groups';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getProfileName} from '@utils/Profile';

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
    await updateNewMember(this.chatId, this.content.newMember);
    //send your name
    const sender = new SendMessage(this.chatId, ContentType.name, {
      name: await getProfileName(),
    });
    await sender.send();
  }
}

export default AddMember;
