/**
 * This screens informs a user of the permissions the App requires.
 * screen id: 2
 */
import Microphone from '@assets/icons/MicrophoneOutline.svg';
import Notification from '@assets/icons/NotificationOutline.svg';
import Camera from '@assets/icons/CameraOutline.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import {onboardingStylesheet} from './NameScreen';
import {
  checkCameraPermission,
  checkRecordingPermission,
} from '@utils/AppPermissions';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PermissionsScreen'
>;

function PermissionsScreen({route, navigation}: Props): ReactNode {
  const [isNotifPermissionGranted, setIsNotifPermissionGranted] =
    useState(false);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  const [isRecordingPermissionGranted, setIsRecordingPermissionGranted] =
    useState(false);

  const setupNotificationChannels = async () => {
    // Needed for iOS
    await notifee.requestPermission();
    // Needed for Android
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  };

  async function checkNotificationPermission() {
    const settings = await notifee.getNotificationSettings();

    if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
      setIsNotifPermissionGranted(true);
    } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
      setIsNotifPermissionGranted(false);
    }
  }

  useEffect(() => {
    const setupPermissions = async () => {
      try {
        await setupNotificationChannels();
        await checkCameraPermission(setIsCameraPermissionGranted);
        await checkRecordingPermission(setIsRecordingPermissionGranted);
        await checkNotificationPermission();
      } catch (error) {
        console.log('Error occurred during setup:', error);
      }
    };

    setupPermissions();
  }, []);

  useEffect(() => {
    if (
      isRecordingPermissionGranted &&
      isCameraPermissionGranted &&
      isNotifPermissionGranted
    ) {
      navigation.navigate('SetupUser', {
        name: processName(route.params.name),
        avatar: route.params.avatar,
      });
    }
  }, [
    isRecordingPermissionGranted,
    isCameraPermissionGranted,
    isNotifPermissionGranted,
    route.params.name,
    route.params.avatar,
    navigation,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return null;
      },
    );

    navigation.addListener('beforeRemove', e => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
    });

    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />

      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        keyboardVerticalOffset={isIOS ? -24 : undefined}
        style={onboardingStylesheet.scrollViewContainer}>
        <NumberlessText
          fontType={FontType.sb}
          fontSizeType={FontSizeType.xl}
          style={{textAlign: 'center', width: 242}}>
          Optionally allow basic permissions
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={PortColors.primary.grey.bold}
          style={styles.descWrapper}>
          We need the following permissions to improve your app experience and
          curate great features. You can restrict them if you want to.
        </NumberlessText>
        <View style={styles.blockWrapper}>
          <Notification width={24} height={24} />

          <View style={styles.textColumnWrapper}>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.l}>
              Notifications
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              style={{marginTop: 2}}
              textColor={PortColors.primary.grey.bold}
              fontSizeType={FontSizeType.s}>
              Get notified of events like a new message
            </NumberlessText>
          </View>
        </View>
        <View style={styles.blockWrapper}>
          <Microphone width={24} height={24} />

          <View style={styles.textColumnWrapper}>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.l}>
              Microphone
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              style={{marginTop: 2}}
              textColor={PortColors.primary.grey.bold}
              fontSizeType={FontSizeType.s}>
              Send voice notes on your chats and much more.
            </NumberlessText>
          </View>
        </View>
        <View style={styles.blockWrapper}>
          <Camera width={24} height={24} />

          <View style={styles.textColumnWrapper}>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.l}>
              Camera
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              style={{marginTop: 2}}
              textColor={PortColors.primary.grey.bold}
              fontSizeType={FontSizeType.s}>
              Take and send pictures and videos, scan QR codes and more.
            </NumberlessText>
          </View>
        </View>
        <View style={{flex: 1}} />
        <GenericButton
          onPress={() => {
            navigation.navigate('SetupUser', {
              name: processName(route.params.name),
              avatar: route.params.avatar,
            });
          }}
          textStyle={styles.buttonText}
          buttonStyle={styles.nextButtonContainer}>
          Next
        </GenericButton>
      </KeyboardAvoidingView>
    </>
  );
}

export default PermissionsScreen;

const styles = StyleSheet.create({
  blockWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 24,
  },
  descWrapper: {
    marginTop: 21,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  nextButtonContainer: {
    marginBottom: 32,
    backgroundColor: PortColors.primary.blue.app,
    height: 50,
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    width: screen.width - 32,
    justifyContent: 'center',
  },
  buttonText: {
    color: PortColors.primary.white,
    fontSize: 16,
  },
  textColumnWrapper: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
});
