/**
 * This screen manages an ongoing call.
 */
import { PortSpacing, screen } from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { BackHandler, PermissionsAndroid, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { SafeAreaView } from '@components/SafeAreaView';
import { AppStackParamList } from '@navigation/AppStackTypes';
import WorkQueue from '@utils/WorkQueue';
import { generateISOTimeStamp } from '@utils/Time';
import Signaller from '@utils/Calls/Signaller';
import { CallWorkItem, CoordinatorWorkItem } from '@utils/Calls/CallWorkQueue';
import {
  CallEvents,
  PeerConnectionManager,
} from '@utils/Calls/PeerConnectionManager';
import { MediaStreamManager } from '@utils/Calls/MediaStreamManager';
import DirectChat from '@utils/DirectChats/DirectChat';
import { MediaStream } from 'react-native-webrtc';
import { DEFAULT_AVATAR, DEFAULT_PROFILE_AVATAR_INFO } from '@configs/constants';
import { CallEndReason } from '@utils/Calls/CallOSBridge';
import CallingTopBar from './Components/CallingTopBar';
import OutputOptionsModal from './Components/OutputOptionsModal';
import { useSelector } from 'react-redux';
import { SvgProps } from 'react-native-svg';
import MicrophoneOff from '@assets/dark/icons/MicOff.svg';
import MicrophoneOn from '@assets/dark/icons/MicOn.svg';
import SpeakerOn from '@assets/dark/icons/SpeakerOn.svg';
import SpeakerOff from '@assets/dark/icons/SpeakerOff.svg';
import Bluetooth from '@assets/dark/icons/Bluetooth.svg';
import VideoOn from '@assets/dark/icons/VideoOn.svg';
import VideoOff from '@assets/dark/icons/VideoOff.svg';
import ViewSwitch from '@assets/dark/icons/ViewSwitch.svg';
import EndCall from '@assets/dark/icons/EndCall.svg';
import { PeerStream, PeerVideoSize } from './Components/PeerStream';
import { MyStream, MyVideoSize } from './Components/MyStream';
import RNCallKeep, { AudioRoute } from 'react-native-callkeep';
import { useCallContext } from './CallContext';
import { FontSizeType } from '@components/NumberlessText';
import { FontType } from '@components/NumberlessText';
import CloseWhite from '@assets/icons/closeWhite.svg';
import { NumberlessText } from '@components/NumberlessText';
import { check, PERMISSIONS, PermissionStatus } from 'react-native-permissions';

type Props = NativeStackScreenProps<AppStackParamList, 'OngoingCall'>;

/**
 * A dummy dispatcher for the call work queue.
 */
function callWorkDispatcher(_state: string) {
  return generateISOTimeStamp();
}

async function checkPermissions() {
  const cameraStatus = await check(
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
  );

  const micStatus = await check(
    Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO
  );

  return (cameraStatus === 'granted') && (micStatus === 'granted');
}

/**
 * The state of the call
 */
export enum CallState {
  active = 1,
  disconnected = 2,
  connecting = 3,
  reconnecting = 4,
  cleaned = 5,
}

//state of the call UI
export interface CallUIState {
  peerMic: boolean;
  peerVideo: boolean;
  myMic: boolean;
  myVideo: boolean;
}

//initial state of the call UI
const callUIInitialState: CallUIState = {
  peerMic: false,
  peerVideo: false,
  myMic: true,
  myVideo: true,
};

//different call events that can be dispatched to the callUIStateReducer
export enum CallUIEvents {
  peer_mic_on = 'peer_mic_on',
  peer_mic_off = 'peer_mic_off',
  peer_video_on = 'peer_video_on',
  peer_video_off = 'peer_video_off',
  my_mic_on = 'my_mic_on',
  my_mic_off = 'my_mic_off',
  my_video_on = 'my_video_on',
  my_video_off = 'my_video_off',
}

//call UI state reducer
function callUIStateReducer(state: CallUIState, action: { type: CallUIEvents }) {
  switch (action.type) {
    case CallUIEvents.peer_mic_on:
      return { ...state, peerMic: true };
    case CallUIEvents.peer_mic_off:
      return { ...state, peerMic: false };
    case CallUIEvents.peer_video_on:
      return { ...state, peerVideo: true };
    case CallUIEvents.peer_video_off:
      return { ...state, peerVideo: false };
    case CallUIEvents.my_mic_on:
      return { ...state, myMic: true };
    case CallUIEvents.my_mic_off:
      return { ...state, myMic: false };
    case CallUIEvents.my_video_on:
      return { ...state, myVideo: true };
    case CallUIEvents.my_video_off:
      return { ...state, myVideo: false };
  }
}

function OngoingCall({ route, navigation }: Props) {
  // Get the chatId and callId from the route params
  const { chatId, callId, isVideoCall } = route.params;
  const { callState, dispatchCallAction } = useCallContext();
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(true);

  //styling variables
  const Colors = DynamicColors();
  const DarkColors = DynamicColors('dark');
  const styles = styling(Colors);

  // A listener for call UI state updates
  const [callUIState, dispatchCallUIState] = useReducer(
    callUIStateReducer,
    callUIInitialState,
  );

  // Work queue to schedule work items to be processed by various targets.
  const [callWorkQueue, _setCallWorkQueue] = useState<WorkQueue<CallWorkItem>>(
    new WorkQueue<CallWorkItem>(),
  );
  // A listener for the work queue
  const [workQueueListener, dispatchWorkQueueProcessing] = useReducer(
    callWorkDispatcher,
    '',
  );
  // Dispatch a work item to the work queue
  const dispatchWorkItem = async (callWorkItem: CallWorkItem) => {
    await callWorkQueue.enqueue(callWorkItem);
    dispatchWorkQueueProcessing();
  };

  // Signaller to handle signalling to setup the call.
  const [signaller, setSignaller] = useState<Signaller | undefined>(undefined);

  // Media stream manager to handle the user's media stream.
  const [mediaStreamManager, setMediaStreamManager] = useState<
    MediaStreamManager | undefined
  >(undefined);

  // Peer connection manager to handle the peer connection.
  const [peerConnectionManager, setPeerConnectionManager] = useState<
    PeerConnectionManager | undefined
  >(undefined);

  // The peer's media stream.
  const [peerStream, setPeerStream] = useState<MediaStream | undefined>(
    undefined,
  );

  // The user's media stream.
  const [myStream, setMyStream] = useState<MediaStream | undefined>(undefined);

  const profile = useSelector(state => state.profile.profile);

  // The profile name and display picture of the user.
  const { myProfilePicInfo } = useMemo(() => {
    return {
      myProfilePicInfo: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  // The profile name of the peer.
  const [peerName, setPeerName] = useState<string>('');

  // The profile avatar of the peer.
  const [peerAvatar, setPeerAvatar] = useState<string>(DEFAULT_AVATAR);

  // Controls modal used to select the output audiochannel.
  const [selectOutputAudioChannel, setSelectOutputAudioChannel] =
    useState(false);

  // The audio channel to use.
  const [audioChannels, setAudioChannels] = useState<AudioRoute[]>([]);

  // The selected audio channel.
  const [selectedAudioChannelType, setSelectedAudioChannelType] = useState<
    string | null
  >(null);

  // Whether the peer video is primary or secondary
  const [isPeerVideoPrimary, setIsPeerVideoPrimary] = useState<boolean>(true);

  // Prevent default back behavior on android
  useEffect(() => {
    const backAction = () => {
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);


  const getMyMediaStream = async () => {
    // Initialise media stream manager for my media stream
    try {
      const msm = new MediaStreamManager(isVideoCall);
      await msm.init();
      const myMediaStream = msm.getMediaStream();
      if (myMediaStream) {
        //check microphone and camera permissions
        const permissionsGranted = await checkPermissions();
        if (!permissionsGranted) {
          throw new Error('Microphone or camera permissions not granted');
        }
        return msm;
      }
      throw new Error('Failed to get my media stream');
    } catch (error) {
      console.error('Error getting my media stream: ', error);
      return undefined;
    }
  }

  const setupCall = async (msm: MediaStreamManager) => {
    try {
      RNCallKeep.setAudioRoute(callId, 'Speaker').then(() => {
        RNCallKeep.getAudioRoutes().then(routes => {
          setAudioChannels(routes as unknown as AudioRoute[]);
        });
      });
    } catch (error) {
      console.error('Error setting audio route: ', error);
    }
    try {
      // Get the chat data
      const chatData = await new DirectChat(chatId).getChatData();
      const lineId = chatData.lineId;
      setPeerName(chatData.name || '');
      setPeerAvatar(chatData.displayPic || DEFAULT_AVATAR);

      // Initialise signalling
      const s = new Signaller(lineId, dispatchWorkItem);
      setSignaller(s);

      // Set my media stream so that the self view can be rendered
      const myMediaStream = msm.getMediaStream();
      if (!myMediaStream) {
        throw new Error('Failed to get my media stream');
      }
      setMediaStreamManager(msm);
      setMyStream(myMediaStream);
      if (isVideoCall) {
        dispatchCallUIState({ type: CallUIEvents.my_video_on });
      }
      dispatchCallUIState({ type: CallUIEvents.my_mic_on });

      // Initialise peer connection manager for the peer's media stream
      const pc = new PeerConnectionManager(dispatchWorkItem);
      setPeerConnectionManager(pc);
      pc.init(myMediaStream);
    } catch (error) {
      console.error('Ending call due to error initializing call: ', error);
      endCall(CallEndReason.SELF_ENDED);
    }
  };

  /**
   * First time call initialization.
   */
  useEffect(() => {
    getMyMediaStream().then(msm => {
      if (msm) {
        setupCall(msm);
      } else {
        console.log('Failed to get my media stream. defaulting to requesting permissions screen.');
        setAllPermissionsGranted(false);
      }
    });
    //add the listener for the muted call action
    RNCallKeep.addEventListener(
      'didPerformSetMutedCallAction',
      ({ muted, callUUID }) => {
        console.log('Muted action: ', muted);
        if (callId !== callUUID) {
          // WE're muting a call that isn't on this screen...
          return;
        }
        if (muted) {
          micOff();
        } else {
          micOn();
        }
      },
    );

    //add the listener for audio route change
    RNCallKeep.addEventListener('didChangeAudioRoute', ({ output }) => {
      console.log('Audio route changed: ', output);
      RNCallKeep.getAudioRoutes().then(routes => {
        setAudioChannels(routes as unknown as AudioRoute[]);
      });
    });

    //remove the listener when the component unmounts
    return () => {
      RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
      RNCallKeep.removeEventListener('didChangeAudioRoute');
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //set the selected audio channel to the selected channel in the list
  useEffect(() => {
    const selectedChannel = audioChannels.find(
      channel => channel.selected === true,
    );
    if (selectedChannel) {
      setSelectedAudioChannelType(selectedChannel.type);
    }
  }, [audioChannels]);

  /**
   * Process a coordinator message
   * @param item The coordinator message
   */
  function processCoordinatorMessage(item: CoordinatorWorkItem) {
    switch (item) {
      case 'peer_connected':
        signaller?.cleanup();
        break;
      case 'peer_stream_track_update':
        const peerMediaStream = peerConnectionManager?.getMediaStream();
        if (peerMediaStream) {
          setPeerStream(peerMediaStream);
          const videoTrack = peerMediaStream.getVideoTracks()[0];
          if (videoTrack.enabled) {
            dispatchCallUIState({ type: CallUIEvents.peer_video_on });
          }
          const audioTrack = peerMediaStream.getAudioTracks()[0];
          if (audioTrack.enabled) {
            dispatchCallUIState({ type: CallUIEvents.peer_mic_on });
          }
        }
        break;
      case 'closed_signaller':
        // If the peer stream is not available, end the call.
        if (peerStream) {
          break;
        }
      // It is meant to fall through to the next case
      case 'peer_connection_ended':
        endCall(CallEndReason.PEER_ENDED);
        break;
      case 'peer_mic_turned_on':
        dispatchCallUIState({ type: CallUIEvents.peer_mic_on });
        break;
      case 'peer_mic_turned_off':
        dispatchCallUIState({ type: CallUIEvents.peer_mic_off });
        break;
      case 'peer_video_turned_on':
        dispatchCallUIState({ type: CallUIEvents.peer_video_on });
        break;
      case 'peer_video_turned_off':
        dispatchCallUIState({ type: CallUIEvents.peer_video_off });
        break;
    }
  }

  /**
   * End the call
   * @param reason The reason for ending the call
   */
  function endCall(reason: CallEndReason) {
    // Go back to the hometab
    signaller?.cleanup(); // Cleanup the signaller
    mediaStreamManager?.stopStreaming(); // Turn off my camera and microphone
    peerConnectionManager?.cleanup(); // Terminate the peer connection
    dispatchCallAction({ type: 'end_call', reason });
  }

  /**
   * Turn on the microphone
   */
  const micOn = () => {
    if (mediaStreamManager) {
      mediaStreamManager.setAudioStream(true);
      dispatchCallUIState({ type: CallUIEvents.my_mic_on });
      //emit call event over data channel
      peerConnectionManager?.sendEvent(CallEvents.micOn);
    }
  };

  /**
   * Turn off the microphone
   */
  const micOff = () => {
    if (mediaStreamManager) {
      mediaStreamManager.setAudioStream(false);
      dispatchCallUIState({ type: CallUIEvents.my_mic_off });
      //emit call event over data channel
      peerConnectionManager?.sendEvent(CallEvents.micOff);
    }
  };

  /**
   * Turn on the video
   */
  const videoOn = () => {
    if (mediaStreamManager) {
      mediaStreamManager.setVideoStream(true);
      dispatchCallUIState({ type: CallUIEvents.my_video_on });
      //emit call event over data channel
      peerConnectionManager?.sendEvent(CallEvents.videoOn);
    }
  };

  /**
   * Turn off the video
   */
  const videoOff = () => {
    if (mediaStreamManager) {
      mediaStreamManager.setVideoStream(false);
      dispatchCallUIState({ type: CallUIEvents.my_video_off });
      //emit call event over data channel
      peerConnectionManager?.sendEvent(CallEvents.videoOff);
    }
  };

  /**
   * Open the audio options modal
   */
  const openAudioOptions = async () => {
    const routes = await RNCallKeep.getAudioRoutes();
    setAudioChannels(routes as unknown as AudioRoute[]);
    setSelectOutputAudioChannel(true);
  };

  /**
   * Change the audio channel
   * @param newChannel The new audio channel
   */
  const changeAudioChannel = async (newChannel: string) => {
    await RNCallKeep.setAudioRoute(callId, newChannel);
    try {
      const routes = await RNCallKeep.getAudioRoutes();
      setAudioChannels(routes as unknown as AudioRoute[]);
    } catch (error) {
      console.error('Error getting audio routes: ', error);
    }
  };

  /**
   * Disconnect the call
   */
  const disconnectCall = () => {
    endCall(CallEndReason.SELF_ENDED);
  };

  /**
   * Toggle the view between peer and self
   */
  const toggleView = () => {
    setIsPeerVideoPrimary(!isPeerVideoPrimary);
  };

  /**
   * Switch my camera
   */
  const switchCamera = () => {
    try {
      mediaStreamManager?.switchCamera();
    } catch (error) {
      console.error('Error switching camera: ', error);
    }
  };

  // This useEffect responds to call state changes
  useEffect(() => {
    if (!callState) {
      // We no longer have an ongoing call
      navigation.popToTop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState]);

  /**
   * Add CallKeep listeners
   */
  useEffect(() => {
    // Add CallKeep listeners
    const onEndCall = (data: any) => {
      console.log('Call ended', data);
      // Handle call end logic
      endCall(CallEndReason.PEER_ENDED);
    };

    RNCallKeep.addEventListener('endCall', onEndCall);
    RNCallKeep.addEventListener(
      'didPerformSetMutedCallAction',
      ({ muted, callUUID }) => {
        console.log('Muted action: ', muted);
        if (callId !== callUUID) {
          // WE're muting a call that isn't on this screen...
          return;
        }
        if (muted) {
          micOff();
        } else {
          micOn();
        }
      },
    );

    // Cleanup function to remove listeners
    return () => {
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount and unmount

  /**
   * This block runs every time a new work item has been dispatched
   */
  useEffect(() => {
    (async () => {
      // Process every item in the work queue.
      // There may be more than one since we run up against
      // batching with react on frequent updates.
      let workItem = await callWorkQueue.dequeue();
      while (workItem) {
        switch (workItem.target) {
          case 'coordinator':
            // Process the coordinator message
            processCoordinatorMessage(workItem.item);
            break;
          case 'peerConnection':
            // Process the peer connection message
            peerConnectionManager?.processMessage(workItem.item);
            break;
          case 'signaller':
            // Process the signaller message
            signaller?.processMessage(workItem.item);
            break;
        }
        workItem = await callWorkQueue.dequeue();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workQueueListener]);

  return (
    <>
      <CustomStatusBar backgroundColor={DarkColors.primary.background} />
      <SafeAreaView
        removeOffset={true}
        style={{
          backgroundColor: DarkColors.primary.background,
        }}>
        {allPermissionsGranted ? (
          <View style={{ flex: 1 }}>
            {!isPeerVideoPrimary && myStream && callUIState.myVideo ? (
              <View style={{ flex: 1 }}>
                <MyStream
                  myStream={myStream}
                  myAvatar={myProfilePicInfo.uri}
                  callUIState={callUIState}
                  showAvatar={true}
                  myVideoSize={MyVideoSize.large}
                  onTop={false}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: screen.height - 200 - 90 - 16,
                    left: screen.width - 120 - 16,
                  }}>
                  <PeerStream
                    peerStream={peerStream}
                    peerAvatar={peerAvatar}
                    callUIState={callUIState}
                    peerVideoSize={PeerVideoSize.small}
                    onTop={true}
                  />
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <PeerStream
                  peerStream={peerStream}
                  peerAvatar={peerAvatar}
                  callUIState={callUIState}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: screen.height - 200 - 90 - 16,
                    left: screen.width - 120 - 16,
                  }}>
                  <MyStream
                    myStream={myStream}
                    myAvatar={myProfilePicInfo.uri}
                    callUIState={callUIState}
                  />
                </View>
              </View>
            )}
            {myStream && callUIState.myVideo && (
              <>
                <View style={{ flex: 1, position: 'absolute' }}>
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: screen.height - 200 - 90 - 16,
                      left: screen.width - 120 - 16,
                      height: 200,
                      width: 120,
                    }}
                    onPress={toggleView}
                  />
                </View>
                <TouchableOpacity
                  style={
                    isPeerVideoPrimary
                      ? { ...styles.viewSwitch, right: 16 + 8, bottom: 90 + 16 + 8 }
                      : { ...styles.viewSwitch, top: 90, right: 16 }
                  }
                  hitSlop={20}
                  onPress={switchCamera}
                  activeOpacity={0.5}>
                  <ViewSwitch width={20} height={20} />
                </TouchableOpacity>
              </>
            )}

            <CallingTopBar
              heading={peerName}
              callState={peerStream ? CallState.active : CallState.connecting}
              callUIState={callUIState}
            />
            <View style={styles.controlBar}>
              <BooleanControlButton
                isOn={callUIState.myVideo}
                onSwitchOn={videoOn}
                onSwitchOff={videoOff}
                onColor={Colors.primary.white}
                offColor={Colors.primary.genericGrey}
                OnIcon={VideoOn}
                OffIcon={VideoOff}
              />
              <BooleanControlButton
                isOn={callUIState.myMic}
                onSwitchOn={micOn}
                onSwitchOff={micOff}
                onColor={Colors.primary.genericGrey}
                offColor={Colors.primary.white}
                OnIcon={MicrophoneOn}
                OffIcon={MicrophoneOff}
              />
              <AudioChannelButton
                selectedChannelType={selectedAudioChannelType}
                onPress={async () => await openAudioOptions()}
              />
              <BooleanControlButton
                isOn={true}
                onSwitchOn={disconnectCall}
                onSwitchOff={disconnectCall}
                onColor={Colors.primary.red}
                offColor={Colors.primary.red}
                OnIcon={EndCall}
                OffIcon={EndCall}
              />
            </View>
            <OutputOptionsModal
              visible={selectOutputAudioChannel}
              onClose={() => setSelectOutputAudioChannel(false)}
              channels={audioChannels}
              onSelectChannel={changeAudioChannel}
            />
          </View>
        ) : (
          <View style={{
            flex: 1, justifyContent: 'center', alignItems: 'center', padding: PortSpacing.secondary.uniform,
          }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.closeButtonWrapper}>
              <CloseWhite width={24} height={24} />
            </Pressable>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              style={styles.text}>
              Please enable camera and microphone permissions to place a call.
            </NumberlessText>
          </View>
        )}

      </SafeAreaView>
    </>
  );
}

const BooleanControlButton = ({
  onSwitchOn = () => console.log('Button switch on'),
  onSwitchOff = () => console.log('Button switch off'),
  isOn,
  onColor,
  offColor,
  OnIcon,
  OffIcon,
}: {
  onSwitchOn?: () => void | Promise<void>;
  onSwitchOff?: () => void | Promise<void>;
  isOn: boolean;
  onColor: string;
  offColor: string;
  OnIcon: React.FC<SvgProps>;
  OffIcon: React.FC<SvgProps>;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <TouchableOpacity
      style={{ ...styles.button, backgroundColor: isOn ? onColor : offColor }}
      onPress={isOn ? onSwitchOff : onSwitchOn}>
      {isOn ? <OnIcon /> : <OffIcon />}
    </TouchableOpacity>
  );
};

const AudioChannelButton = ({
  onPress = () => {
    console.log('Audio output button pressed');
  },
  selectedChannelType,
}: {
  onPress?: () => void | Promise<void>;
  selectedChannelType: string | null;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <TouchableOpacity
      style={{
        ...styles.button,
        backgroundColor:
          selectedChannelType === 'Speaker'
            ? Colors.primary.white
            : Colors.primary.genericGrey,
      }}
      onPress={onPress}>
      {!selectedChannelType ? (
        <SpeakerOff />
      ) : selectedChannelType === 'Phone' ? (
        <SpeakerOff />
      ) : selectedChannelType === 'Speaker' ? (
        <SpeakerOn />
      ) : (
        <Bluetooth />
      )}
    </TouchableOpacity>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    controlBar: {
      height: 90,
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      width: screen.width,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
      paddingHorizontal: PortSpacing.primary.uniform,
    },
    peerstream: {
      width: 200,
      height: 200,
      right: 0,
      bottom: 100,
      position: 'absolute',
      zIndex: 1,
    },
    topbar: {
      position: 'absolute',
      top: 60,
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      width: screen.width,
      paddingVertical: 10,
    },
    button: {
      height: 50,
      width: 50,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewSwitch: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      width: 40,
      height: 40,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonWrapper: {
      position: 'absolute',
      top: PortSpacing.intermediate.top,
      right: PortSpacing.intermediate.right,
    },
    text: {
      color: color.primary.white,
    },
  });

export default OngoingCall;
