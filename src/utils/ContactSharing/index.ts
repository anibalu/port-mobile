import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {saveMessage} from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';
import {generateBundle} from '@utils/Ports';
import {BundleTarget, PortBundle} from '@utils/Ports/interfaces';
import {expiryOptions} from '@utils/Time/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import * as messageStorage from '@utils/Storage/messages';
import DirectChat from '@utils/DirectChats/DirectChat';

export interface ContactShareRequest {
  source: string;
  approved: boolean;
  destinationChatId: string;
}

export interface GenerateContactBundle {
  approvedMessageId: string;
  requester: string;
  destinationName: string;
  source?: string | null;
}

/**
 * util used to send a bundle request to the source
 * and save a message in destination chat
  @param source: source chatid
  @param approved: whether or not contact bundle request is approved
  @param destinationChatId: destination chatid;
 */
export async function requestContactBundleToShare(
  request: ContactShareRequest,
) {
  const destination = new DirectChat(request.destinationChatId);
  const destinationName = (await destination.getChatData()).name;
  const infoMessageId = generateRandomHexId();
  // send bundle request to source
  const sendBundleRequest = new SendMessage(
    request.source,
    ContentType.contactBundleRequest,
    {
      destinationName: destinationName,
      approved: false,
      destinationChatId: request.destinationChatId,
      infoMessageId: infoMessageId,
    },
  );
  await sendBundleRequest.send();
  // save a message on destination chat
  // saying source might have contact sharing disabled.
  const savedMessage: SavedMessageParams = {
    chatId: request.destinationChatId,
    messageId: infoMessageId,
    contentType: ContentType.contactBundleRequestInfo,
    data: {
      source: request.source,
    },
    sender: true,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);
}

/**
 * util used to respond to a contact sharinf request. Check's if permissions are on.
 * @param requester requester chatid
 * @param destinationName
 * @param source source chat id
 * @param approvedMessageId contact bundle request message id that will get approved
 */
export async function respondToShareContactRequest(
  requester: string,
  destinationName: string,
  source?: string | null,
  approvedMessageId?: string | null,
) {
  //check if permissions exist
  const chatPermisson = await getChatPermissions(requester, ChatType.direct);

  //if permissions exist, generate a bundle
  if (chatPermisson.contactSharing) {
    await generateBundleForContactSharing({
      approvedMessageId: approvedMessageId,
      destinationName: destinationName,
      requester: requester,
      source,
    });
  }
}

/**
 * util used to generate a port bundle and send it to the requester
 * @param  approvedMessageId: contact bundle request message id that will get approved
   @param requester requester chatid;
   @param destinationName
   @param approved to mark contact bundle request as approved
   @param source source chatid
 */
export async function generateBundleForContactSharing(
  data: GenerateContactBundle,
) {
  // update the message to approved.
  // generate a port bundle

  const bundle = await generateBundle(
    BundleTarget.direct,
    null,
    data.destinationName,
    expiryOptions[0],
    'shared://' + data.requester,
  );

  const sender = new SendMessage(
    data.requester,
    ContentType.contactBundleResponse,
    {
      bundle: bundle,
      approvedMessageId: data.approvedMessageId,
      source: data.source,
    },
  );
  await sender.send();

  await messageStorage.updateMessageData(
    data.requester,
    data.approvedMessageId,
    {
      destinationName: data.destinationName,
      approved: true,
    },
  );
}

/**
 * util to send the bundle to destination chat
 * @param requester requester chatid
 * @param bundle
 * @param approvedMessageId approvedMessageId to find the destination chatid
 * @param source source chatid
 */
export async function relayContactBundle(
  requester: string,
  bundle: PortBundle,
  approvedMessageId: string,
  source: string,
) {
  const msg = await messageStorage.getMessage(requester, approvedMessageId);

  const chatId = msg?.data?.destinationChatId;

  const infoMessageId = msg?.data?.infoMessageId;
  const sender = new SendMessage(chatId, ContentType.contactBundle, {
    bundle,
    createdChatId: source,
  });
  await sender.send();

  await messageStorage.updateMessageData(msg?.chatId, msg?.messageId, {
    destinationName: msg?.data?.destinationName,
    approved: true,
  });

  // get the info message sent to destination chat id and update it to shared = true
  await messageStorage.updateMessageData(chatId, infoMessageId, {
    shared: true,
  });
}
