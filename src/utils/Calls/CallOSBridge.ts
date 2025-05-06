import uuid from 'react-native-uuid';

import DirectChat from '@utils/DirectChats/DirectChat';

import NativeCallHelperModule, {
  AcceptEventPayload,
  EndEventPayload,
} from '@specs/NativeCallHelperModule';

export function createCallId() {
  return uuid.v4().toString();
}

/**
 * Set up call state listeners using NativeEventEmitter
 * @param acceptanceCallback Function to call when the call is answered
 * @param endCallback Function to call when the call ends
 */
export async function setUpCallStateListeners(
  acceptanceCallback: (callId: string) => void,
  endCallback: (callId: string) => void,
) {
  NativeCallHelperModule.onAccept((event: AcceptEventPayload) => {
    acceptanceCallback(event.callUUID);
  });
  NativeCallHelperModule.onEnd((event: EndEventPayload) => {
    endCallback(event.callUUID);
  });
}

/**
 * Display the incoming call UI
 * @param chatId
 * @param callId
 * @param callRingTimeSeconds
 */
export async function displayIncomingCall(
  chatId: string,
  callId: string,
  callRingTimeSeconds: number,
) {
  // Fetch information to display
  const chat = new DirectChat(chatId);
  const {name} = await chat.getChatData();
  // This is an Android only feature, silently skips on iOS
  NativeCallHelperModule.displayIncomingCall(
    name || 'New contact',
    callId,
    callRingTimeSeconds,
  );
}
