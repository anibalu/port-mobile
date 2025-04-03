/**
 * This screen displays information about an incoming call and allows the user to choose
 * Whether to answer or decline it.
 */
import {isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {AppState, StyleSheet, TouchableOpacity, View} from 'react-native';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useInsetChecks} from '@components/DeviceUtils';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import DirectChat from '@utils/DirectChats/DirectChat';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {DEFAULT_AVATAR, DEFAULT_NAME, TOPBAR_HEIGHT} from '@configs/constants';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {useCallContext} from './CallContext';
import {
  getPreLaunchEvents,
  isCallCurrentlyActive,
  getAndroidCallAnswerInfo,
} from '@utils/Calls/CallOSBridge';

type Props = NativeStackScreenProps<AppStackParamList, 'IncomingCall'>;

function IncomingCall({route, navigation}: Props) {
  const {chatId, callId, isVideoCall} = route.params;
  const Colors = DynamicColors();
  const DarkColors = DynamicColors('dark');

  const styles = styling(Colors);
  const inset = useSafeAreaInsets();
  const {hasIosBottomNotch} = useInsetChecks();
  // State variables for a user-digestable representation of a caller
  const [profileName, setProfileName] = useState<string>(DEFAULT_NAME);
  const [profilePicture, setProfilePicture] = useState<string>(DEFAULT_AVATAR);

  const {dispatchCallAction, callState} = useCallContext();

  /** Styling */
  const svgArray = [
    {
      assetName: 'PortIcon',
      light: require('@assets/branding/PortText.svg').default,
      dark: require('@assets/branding/PortText.svg').default,
    },
    {
      assetName: 'BackIcon',
      light: require('@assets/dark/icons/navigation/ArrowLeft.svg').default,
      dark: require('@assets/dark/icons/navigation/ArrowLeft.svg').default,
    },
    {
      assetName: 'EndCall',
      light: require('@assets/dark/icons/Calling/EndCall.svg').default,
      dark: require('@assets/dark/icons/Calling/EndCall.svg').default,
    },
    {
      assetName: 'AcceptCall',
      light: require('@assets/dark/icons/Calling/AcceptCall.svg').default,
      dark: require('@assets/dark/icons/Calling/AcceptCall.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const PortIcon = results.PortIcon;
  const EndCall = results.EndCall;
  const AcceptCall = results.AcceptCall;

  /**
   * Get pre launch events and process things based on them
   * @returns Whether an action was taken
   */
  const processIOSPreLaunchEvents = async (): Promise<boolean> => {
    const preLaunchEvents = await getPreLaunchEvents();
    for (let i = 0; i < preLaunchEvents.length; i++) {
      const {data, name} = preLaunchEvents[i];
      switch (name) {
        case 'RNCallKeepPerformAnswerCallAction':
          if (data.callUUID === callId) {
            dispatchCallAction({
              type: 'answer_call',
              initiatedVideoCall: isVideoCall,
            });
            return true;
          }
          break;
        case 'RNCallKeepPerformEndCallAction':
          if (data.callUUID === callId) {
            dispatchCallAction({type: 'decline_call'});
            return true;
          }
      }
    }
    return false;
  };

  const processAndroidPreLaunchEvents = async (): Promise<boolean> => {
    const callAnswerInfo = await getAndroidCallAnswerInfo();
    console.log('[ANDROID PRE LAUNCH EVENTS]', callAnswerInfo, callId);
    if (callAnswerInfo?.callId === callId) {
      if (callAnswerInfo?.intentResult === 'Answer') {
        dispatchCallAction({
          type: 'answer_call',
          initiatedVideoCall: isVideoCall,
        });
        return true;
      } else if (callAnswerInfo?.intentResult === 'Decline') {
        dispatchCallAction({type: 'decline_call'});
        return true;
      }
    }
    return false;
  };

  const appState = useRef(AppState.currentState);

  /**
   * Setup background or foreground operations according to app state.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      //If app has come to the foreground.
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        //run android pre launch events
        processAndroidPreLaunchEvents();
      }

      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up the incoming call
  useEffect(() => {
    (async () => {
      // Set up the UI to represent the caller
      const chatHandler = new DirectChat(chatId);
      const chatData = await chatHandler.getChatData();
      setProfileName(chatData.name || DEFAULT_NAME);
      setProfilePicture(chatData.displayPic || DEFAULT_AVATAR);
      if (!isIOS) {
        // Process pre-launch events, important on android
        if (await processAndroidPreLaunchEvents()) {
          // An action was taken, so quit the rest of the processing
          return;
        }
      } else {
        // Check if the call has already been answered. Important on the iOS
        // Backgrounded state
        if (await isCallCurrentlyActive(callId)) {
          console.log(
            'Call was answered from the host UI before this screen was even rendered',
          );
          dispatchCallAction({
            type: 'answer_call',
            initiatedVideoCall: isVideoCall,
          });
          return;
        }
        // Process pre-launch events, important on iOS killed state
        if (await processIOSPreLaunchEvents()) {
          // An action was taken, so quit the rest of the processing
          return;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This useEffect subscribes to callState and navigates based on answering and declining calls
  useEffect(() => {
    if (!callState) {
      // The call ended for some reason, so we remove the screen from the stack
      navigation.pop();
      return;
    }
    if (callState.callState === 'answered') {
      // We're on the wrong screen, navigate to the ongoing call screen with appropriate props
      navigation.replace('OngoingCall', {
        callId,
        chatId,
        isVideoCall: isVideoCall,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState]);

  return (
    <>
      <CustomStatusBar backgroundColor={DarkColors.primary.background} />
      <SafeAreaView
        removeOffset={true}
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: DarkColors.primary.background,
          paddingBottom: hasIosBottomNotch ? inset.bottom : 0,
        }}>
        <View style={styles.topbar}>
          <PortIcon height={22} />
        </View>
        <View style={styles.main}>
          <AvatarBox profileUri={profilePicture} avatarSize="l" />
          <NumberlessText
            style={{
              textAlign: 'center',
              marginTop: 8,
            }}
            numberOfLines={1}
            textColor={Colors.primary.white}
            ellipsizeMode="tail"
            fontType={FontType.md}
            fontSizeType={FontSizeType.xl}>
            {profileName}
          </NumberlessText>
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              dispatchCallAction({type: 'decline_call'});
            }}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              width: screen.width / 2,
            }}>
            <EndCall />
            <NumberlessText
              style={{color: Colors.primary.red, marginTop: 8}}
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Decline
            </NumberlessText>
          </TouchableOpacity>
          {/* Answer the call */}
          <TouchableOpacity
            onPress={() => {
              dispatchCallAction({
                type: 'answer_call',
                initiatedVideoCall: isVideoCall,
              });
            }}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              width: screen.width / 2,
            }}>
            <AcceptCall />
            <NumberlessText
              style={{color: Colors.primary.green, marginTop: 8}}
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Accept
            </NumberlessText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styling = (_color: any) =>
  StyleSheet.create({
    container: {
      width: screen.width,
      height: 150,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    topbar: {
      width: screen.width,
      height: TOPBAR_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    main: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default IncomingCall;
