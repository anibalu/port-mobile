import {DEFAULT_NAME} from '@configs/constants';
import {generateDirectConnectionBundle} from '@utils/Bundles/direct';
import {DirectConnectionBundle} from '@utils/Bundles/interfaces';
import {getConnection} from '@utils/Connections';
import {generateRandomHexId} from '@utils/Messaging/idGenerator';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {sendMessage} from '@utils/Messaging/sendMessage';
import {addNewBundleMap, getChatIdforBundleId} from '@utils/Storage/bundleMap';
import {saveMessage} from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';

export async function requestContactShareBundle(
  fromChatId: string,
  toChatId: string,
) {
  //create bundle map
  const bundleId = generateRandomHexId();
  await addNewBundleMap({bundleId: bundleId, chatId: toChatId});
  //send request message
  await sendMessage(fromChatId, {
    contentType: ContentType.contactBundleRequest,
    data: {bundleId: bundleId},
  });
  //save info message
  const savedMessage1: SavedMessageParams = {
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: 'You requested to share their contact',
    },
    chatId: fromChatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  const savedMessage2: SavedMessageParams = {
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: 'You are trying to share a contact. Contact will be shared if you are authorised',
    },
    chatId: toChatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage1);
  await saveMessage(savedMessage2);
}

export async function provideContactShareBundle(
  requester: string,
  bundleId: string,
) {
  //check if requester has permission
  const connection = await getConnection(requester);
  if (connection.permissions.contactSharing?.toggled) {
    //if yes, generate bundle
    const bundle = await generateDirectConnectionBundle(
      'via ' + connection.name,
      bundleId,
      requester,
    );
    //send bundle to requester
    await sendMessage(requester, {
      contentType: ContentType.contactBundleResponse,
      data: {...bundle},
    });
    //save info message
    const savedMessage: SavedMessageParams = {
      messageId: generateRandomHexId(),
      contentType: ContentType.info,
      data: {
        info: 'You shared a contact bundle that connects to you',
      },
      chatId: requester,
      sender: true,
      timestamp: generateISOTimeStamp(),
    };
    await saveMessage(savedMessage);
  }
}

export async function relayContactShareBundle(
  fromChatId: string,
  bundle: DirectConnectionBundle,
) {
  //respond to getting a valid bundle
  const savedMessage: SavedMessageParams = {
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: 'You received a contact bundle to share',
    },
    chatId: fromChatId,
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);
  //find right person
  const toChatId = await getChatIdforBundleId(bundle.data.bundleId || '');
  if (toChatId !== null) {
    const connection = await getConnection(fromChatId);
    //send bundle to right person
    await sendMessage(toChatId, {
      contentType: ContentType.contactBundle,
      data: {...bundle, fromName: connection.name || DEFAULT_NAME},
    });
  }
}
