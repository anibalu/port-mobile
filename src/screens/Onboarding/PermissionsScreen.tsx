/**
 * This screens informs a user of the permissions the App requires and requests those permissions
 */
import Microphone from '@assets/icons/MicrophoneOutline.svg';
import Notification from '@assets/icons/NotificationOutline.svg';
import Camera from '@assets/icons/CameraOutline.svg';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
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
import {BackHandler, StyleSheet, View} from 'react-native';
import {
  checkCameraPermission,
  checkRecordingPermission,
  checkSavingImagesPermission,
} from '@utils/AppPermissions';
import {SafeAreaView} from '@components/SafeAreaView';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PermissionsScreen'
>;

function PermissionsScreen({route, navigation}: Props): ReactNode {
  //state of notification permission
  const [isNotifPermissionGranted, setIsNotifPermissionGranted] =
    useState(false);
  //state of camera permission
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  //state of audio permission
  const [isRecordingPermissionGranted, setIsRecordingPermissionGranted] =
    useState(false);

  const [isSavingImagesPermissionGranted, setIsSavingImagesPermissionGranted] =
    useState(false);

  //setup notification channels for the app. this also requests permissions.
  const setupNotificationChannels = async () => {
    // Needed for iOS
    await notifee.requestPermission();
    // Needed for Android
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  };

  //checks if notification permission is granted
  async function checkNotificationPermission() {
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
      setIsNotifPermissionGranted(true);
    } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
      setIsNotifPermissionGranted(false);
    }
  }

  //checks if all permissions are granted on screen load.
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        await setupNotificationChannels();
        await checkCameraPermission(setIsCameraPermissionGranted);
        await checkRecordingPermission(setIsRecordingPermissionGranted);
        await checkSavingImagesPermission(setIsSavingImagesPermissionGranted);
        await checkNotificationPermission();
      } catch (error) {
        console.log('Error occurred during setup:', error);
      }
    };

    setupPermissions();
  }, []);

  //If all permissions are granted, automatically go to next screen where your profile gets setup.
  useEffect(() => {
    if (
      isRecordingPermissionGranted &&
      isCameraPermissionGranted &&
      isSavingImagesPermissionGranted &&
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
    isSavingImagesPermissionGranted,
    route.params.name,
    route.params.avatar,
    navigation,
  ]);

  //Stops you from going back
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
      <SafeAreaView style={{backgroundColor: PortColors.primary.white}}>
        <View style={styles.container}>
          <NumberlessText
            fontType={FontType.sb}
            fontSizeType={FontSizeType.xl}
            style={{
              textAlign: 'center',
              paddingHorizontal: PortSpacing.secondary.uniform,
            }}>
            Allow basic permissions
          </NumberlessText>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={PortColors.primary.grey.bold}
            style={{
              textAlign: 'center',
              marginTop: PortSpacing.secondary.uniform,
              paddingHorizontal: PortSpacing.secondary.uniform,
            }}>
            We need these permissions to enhance your app experience and offer
            great features. You can limit them according to your preference.
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
                Get notified for events such as new messages
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
                Send voice notes and more in your chats.
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
                Capture and share media, scan QR codes, and more.
              </NumberlessText>
            </View>
          </View>
          <View style={{flex: 1}} />
          <View style={styles.buttonContainer}>
            <PrimaryButton
              disabled={false}
              isLoading={false}
              buttonText={'Next'}
              primaryButtonColor={'b'}
              onClick={() => {
                navigation.navigate('SetupUser', {
                  name: processName(route.params.name),
                  avatar: route.params.avatar,
                });
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

export default PermissionsScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingTop: PortSpacing.primary.top,
    backgroundColor: PortColors.primary.white,
  },
  blockWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: PortSpacing.intermediate.top,
    marginHorizontal: PortSpacing.intermediate.uniform,
  },
  textColumnWrapper: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginBottom: PortSpacing.secondary.bottom,
  },
});
