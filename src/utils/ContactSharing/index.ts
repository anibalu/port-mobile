import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {saveMessage} from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';
import * as storage from '@utils/Storage/contactSharing';
import {ContactSharingMap} from './interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import DirectChat from '@utils/DirectChats/DirectChat';
import {generateBundle} from '@utils/Ports';
import {BundleTarget, PortBundle} from '@utils/Ports/interfaces';
import {expiryOptions} from '@utils/Time/interfaces';

export async function requestToShareContact(map: ContactSharingMap) {
  //create bundle map
  await storage.newContactSharingEntry(map);
  //send request message
  const destinationChat = new DirectChat(map.destination);
  const destinationChatData = await destinationChat.getChatData();
  const sourceChat = new DirectChat(map.source);
  const sourceChatData = await sourceChat.getChatData();
  const sendBundleRequest = new SendMessage(
    map.source,
    ContentType.contactBundleRequest,
    {destinationName: destinationChatData.name},
  );
  await sendBundleRequest.send();
  const savedMessage: SavedMessageParams = {
    chatId: map.destination,
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: `You are trying to share ${sourceChatData.name}'s contact. Contact will be shared if you are authorised`,
    },
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);
}

export async function respondToShareContactRequest(
  requester: string,
  destinationName?: string | null,
) {
  //save info message
  const savedMessage: SavedMessageParams = {
    chatId: requester,
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: `Contact has requested to connect you with ${
        destinationName ? destinationName : 'someone'
      }. Your contact will be shared if they are authorised`,
    },
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);
  //check if permissions exist

  const chatPermisson = await getChatPermissions(requester, ChatType.direct);
  //if permissions exist, send bundle

  if (chatPermisson.contactSharing) {
    const requesterChat = new DirectChat(requester);
    const requesterChatData = await requesterChat.getChatData();
    const label = `Via ${requesterChatData.name}`;

    const bundle = await generateBundle(
      BundleTarget.direct,
      null,
      label,
      expiryOptions[0],
      'shared://' + requester,
    );
    const sender = new SendMessage(
      requester,
      ContentType.contactBundleResponse,
      {...bundle},
    );
    await sender.send();
    //save info message for success
    const savedMessage: SavedMessageParams = {
      chatId: requester,
      messageId: generateRandomHexId(),
      contentType: ContentType.info,
      data: {
        info: 'Your contact shared successfully',
      },
      sender: true,
      timestamp: generateISOTimeStamp(),
    };
    await saveMessage(savedMessage);
  } else {
    //else send denial

    // send denial message
    const sender = new SendMessage(
      requester,
      ContentType.contactBundleDenialResponse,
      {},
    );
    await sender.send();
    //save info message for denial
    const savedMessage: SavedMessageParams = {
      chatId: requester,
      messageId: generateRandomHexId(),
      contentType: ContentType.info,
      data: {
        info: 'Request denied because you have disabled contact sharing permissions',
      },
      sender: true,
      timestamp: generateISOTimeStamp(),
    };
    await saveMessage(savedMessage);
  }
}

export async function relayContactBundle(source: string, bundle: PortBundle) {
  const destinations = await storage.getEntriesForSource(source);
  if (destinations.length > 0) {
    const destination = destinations[0].destination;
    await storage.deleteContactSharingEntry({source, destination});
    const sender = new SendMessage(destination, ContentType.contactBundle, {
      ...bundle,
      goToChatId: source,
    });
    await sender.send();
  }
}

export async function handleContactShareDenial(source: string) {
  const maps = await storage.getEntriesForSource(source);
  const sourceChat = new DirectChat(source);
  const sourceChatData = await sourceChat.getChatData();
  //save info message for denial

  const savedMessage: SavedMessageParams = {
    chatId: source,
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: `${sourceChatData.name} has denied contact sharing request`,
    },
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);

  if (maps.length > 0) {
    for (let index = 0; index < maps.length; index++) {
      const destination = maps[index].destination;
      await storage.deleteContactSharingEntry({source, destination});
      const savedMessage: SavedMessageParams = {
        chatId: destination,
        messageId: generateRandomHexId(),
        contentType: ContentType.info,
        data: {
          info: `${sourceChatData.name} has denied contact sharing request`,
        },
        sender: true,
        timestamp: generateISOTimeStamp(),
      };
      await saveMessage(savedMessage);
    }
  }
}
