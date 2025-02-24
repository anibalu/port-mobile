import {isIOS} from '@components/ComponentUtils';
import DirectChat from '@utils/DirectChats/DirectChat';
import {NativeModules, PermissionsAndroid} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'react-native-uuid';

const {CallHelperModule} = NativeModules;

export function createCallId() {
  return uuid.v4().toString();
}

const callkeepOptions = {
  ios: {
    appName: 'Port',
    supportsDTMF: false,
    supportsHolding: false,
    supportsGrouping: false,
    supportsUngrouping: false,
    includesCallsInRecents: false,
    imageName: 'app_icon',
  },
  android: {
    // Little pop up to enable the calling notification.
    // Questionable as to whether this is necessary for self-managed mode
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: 'tech.numberless.port',
      channelName: 'Call foreground service',
      notificationTitle: 'Port is running in the background',
      // notificationIcon: 'Path to the resource icon of the notification',
    },
    selfManaged: true,
  },
};

/**
 * Set up callkeep so that OS UI can be displayed
 * @param acceptanceCallback Function to call when the call is answered from OS UI
 */
export async function setUpCallKeep(
  acceptanceCallback: (callId: string) => void,
  endCallback: (callId: string) => void,
) {
  if (!isIOS) {
    const callPermissionStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    );
    if (callPermissionStatus !== 'granted') {
      console.warn('User did not allow call permission');
      // Abort setting up CallKeep since the user declined the permission
      // It will get asked again when they re-launch the app;
      return;
    }
    await RNCallKeep.setup(callkeepOptions);
    RNCallKeep.registerAndroidEvents();

    // This section is a bit janky. Unsure why that is, but the showIncomingCallUi listener isn't always invoked.
    // As such, even though we put it here, we're primarily displaying it from displayIncomingCallOSUI.
    // We're operating in self managed mode, so we need to handle displaying
    // the high priority notification ourself.
    // This is alled after RNCallkeep.displayIncomingCall is used
    // RNCallKeep.addEventListener(
    //   'showIncomingCallUi',
    //   ({handle, callUUID, name}) => {
    //     // Leverage our native module to display a callstyle notification
    //     // TODO: make this an OS trap if possible, but that's posing some issues right now
    //     CallHelperModule.displayCallUI(handle, callUUID, () =>
    //       console.log('Displayed calling UI!!!'),
    //     );
    //   },
    // );
  } else {
    RNCallKeep.setSettings(callkeepOptions);
  }

  RNCallKeep.addEventListener('answerCall', ({callUUID}) => {
    acceptanceCallback(callUUID); // Should navigate to OngoingCall
  });
  RNCallKeep.addEventListener('endCall', ({callUUID}) => endCallback(callUUID));
  RNCallKeep.setAvailable(true);
}

/**
 * Ask the OS to display calling UI
 * @param chatId
 */
export async function displayIncomingCallOSUI(chatId: string, callId: string) {
  // Fetch information to display
  const chat = new DirectChat(chatId);
  const {name} = await chat.getChatData();
  if (!isIOS) {
    // This throws up a call style notification on Android.
    // The notification times out based on a value set in the native module
    CallHelperModule.displayCallUI(name || 'New contact', chatId, () =>
      console.log('Displayed calling UI!!!'),
    );
  } else {
    // iOS specific
    // APNS should have already displayed UI, we should just piggyback off of that
    RNCallKeep.updateDisplay(callId, name!, chatId);
  }
}

/**
 * Let the OS know that a call was accepted
 * @param callId the call that was accepted from within the app
 */
export function notifyOSOfCallAcceptance(callId: string) {
  RNCallKeep.answerIncomingCall(callId);
}

/**
 * Ask the UI to display outgoing call UI
 * @param chatId the chat that a call is being placed to
 * @param callId a random unique id for this call
 */
export async function placeOutgoingCallOSUI(chatId: string, callId: string) {
  const chat = new DirectChat(chatId);
  const {name} = await chat.getChatData();
  // Additional values are expected on iOS, which is why separate blocks are necessary
  if (isIOS) {
    RNCallKeep.startCall(
      callId,
      name || 'New contact',
      name || 'New contact',
      'generic',
      true,
    );
  } else {
    RNCallKeep.startCall(callId, name || 'New contact', name || 'New contact');
  }
}

/**
 * Reasons that we support for why a call was ended
 */
export enum CallEndReason {
  SELF_ENDED = 0,
  PEER_ENDED = 2,
  UNANSWERED = 3,
  SELF_MISSED = 6,
}

/**
 * End an ongoing call
 * @param callId The chat whose call has ended
 * @param reason Why did the call end
 * @returns void
 */
export function endCallOSUI(callId: string, reason: CallEndReason): void {
  if (CallEndReason.SELF_ENDED === reason) {
    RNCallKeep.endAllCalls(); // Super coarse due to laziness, will have to change
    // With improved multi-call capabilities
    return;
  }
  RNCallKeep.reportEndCallWithUUID(callId, reason);
}

/**
 * Reject an incoming call
 * @param callId the call being rejected
 */
export function rejectCallOSUI(callId: string) {
  RNCallKeep.rejectCall(callId);
}

/**
 * Get a list of events that occured before the JS bridge to native
 * threads were set up for communication, including that of calls
 * @returns A list of events that occured before the JS bridge was set up
 */
export async function getPreLaunchEvents() {
  if (!isIOS) {
    return [];
  }
  return await RNCallKeep.getInitialEvents();
}

export async function isCallCurrentlyActive(callId: string): Promise<boolean> {
  if (!isIOS) {
    return false;
  }
  const currentCalls = await RNCallKeep.getCalls();
  if (!currentCalls) {
    return false;
  }
  currentCalls.forEach(call => {
    if (call.callUUID === callId && call.hasConnected) {
      return true;
    }
  });
  return false;
}
