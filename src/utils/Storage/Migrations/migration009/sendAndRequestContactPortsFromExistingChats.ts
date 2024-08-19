import {getDirectChats} from '@utils/DirectChats';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';

export async function sendAndRequestContactPortsFromExistingChats() {
  const chats = await getDirectChats();
  for (let index = 0; index < chats.length; index++) {
    const chat = chats[index];
    const sender = new SendMessage(
      chat.chatId,
      ContentType.contactPortBundle,
      {},
    );
    sender.send();
    const sender2 = new SendMessage(
      chat.chatId,
      ContentType.contactPortRequest,
      {},
    );
    sender2.send();
  }
}
