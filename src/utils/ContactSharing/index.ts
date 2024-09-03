import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContactBundleParams,
  ContactBundleRequestParams,
  ContentType,
  MessageStatus,
} from '@utils/Messaging/interfaces';
import {saveMessage} from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';
import {generateBundle} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {expiryOptions} from '@utils/Time/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import * as messageStorage from '@utils/Storage/messages';
import DirectChat from '@utils/DirectChats/DirectChat';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';

export interface ContactShareRequest {
  source: string; //chat id of contact from whom a port is being requested
  approved: boolean; //whether source has approved request
  destinationChatId: string; //chat id of contact to whom a port needs to be forwarded.
}

export interface GenerateContactBundle {
  approvedMessageId: string;
  requester: string;
  destinationName: string;
}

/**
 * util used to send a bundle request to the source
 * and save a message in destination chat
 * @param request an object describing the attributes requried to make a contact bundle request.
 */
export async function requestContactBundleToShare(
  request: ContactShareRequest,
) {
  const destination = new DirectChat(request.destinationChatId);
  //get name of the destination contact
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
  const savedMessage: LineMessageData = {
    chatId: request.destinationChatId,
    messageId: infoMessageId,
    contentType: ContentType.contactBundleRequestInfo,
    data: {
      source: request.source,
    },
    sender: true,
    timestamp: generateISOTimeStamp(),
    messageStatus: MessageStatus.sent,
  };
  await saveMessage(savedMessage);
}

/**
 * util used to respond to a contact sharing request. Check's if permissions are on.
 * @param requester requester chatid
 * @param destinationName
 * @param source source chat id
 * @param approvedMessageId contact bundle request message id that will get approved
 */
export async function approveContactShareIfPermitted(
  requester: string,
  destinationName: string,
  messageIdToSeekApproval: string,
) {
  //check if permissions exist
  const chatPermisson = await getChatPermissions(requester, ChatType.direct);

  //if permissions exist, generate a bundle
  if (chatPermisson.contactSharing) {
    await approveContactShareOnce({
      approvedMessageId: messageIdToSeekApproval,
      destinationName: destinationName,
      requester: requester,
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
export async function approveContactShareOnce(data: GenerateContactBundle) {
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
  sourceOfBundle: string,
  bundle: PortBundle,
  approvedMessageId: string,
  approver: string,
) {
  const msg = await messageStorage.getMessage(
    sourceOfBundle,
    approvedMessageId,
  );
  if (!msg) {
    throw new Error('ApprovedMessageNotFound');
  }
  if ((msg.data as ContactBundleParams).accepted) {
    throw new Error('ContactSharingRequestAlreadyApproved');
  }
  const data = msg.data as ContactBundleRequestParams;
  const destinationChatId = data.destinationChatId as string;

  const infoMessageId = data.infoMessageId;
  if (!infoMessageId) {
    throw new Error('infoMessageNotFound');
  }
  const sender = new SendMessage(destinationChatId, ContentType.contactBundle, {
    bundle,
    createdChatId: approver,
  });
  await sender.send();

  await messageStorage.updateMessageData(sourceOfBundle, msg.messageId, {
    ...data,
    approved: true,
  });

  const infoMsg = await messageStorage.getMessage(
    destinationChatId,
    infoMessageId,
  );
  if (!infoMsg) {
    throw new Error('infoMessageCouldNotBeFetched');
  }
  // get the info message sent to destination chat id and update it to shared = true
  await messageStorage.updateMessageData(destinationChatId, infoMessageId, {
    ...infoMsg.data,
    shared: true,
  });
}
