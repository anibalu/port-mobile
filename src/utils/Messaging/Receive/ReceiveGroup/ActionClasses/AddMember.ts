import store from '@store/appStore';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {deriveSharedSecret} from '@utils/Crypto/x25519';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getProfileName} from '@utils/Profile';
import {generateISOTimeStamp} from '@utils/Time';
import GroupReceiveAction from '../GroupReceiveAction';

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
    const groupData = await groupHandler.getData();

    const driver = new CryptoDriver(groupData!.selfCryptoId);
    const driverData = await driver.getData();
    const sharedSecret = await deriveSharedSecret(
      driverData.privateKey,
      this.content.pubkey,
    );
    const memberCryptoDriver = new CryptoDriver();
    await memberCryptoDriver.createForMember({
      sharedSecret: sharedSecret,
    });

    await groupHandler.addGroupMember({
      memberId: this.content.newMember,
      name: null,
      joinedAt: generateISOTimeStamp(),
      cryptoId: memberCryptoDriver.getCryptoId(),
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
