/**
 * This screens informs a user of the permissions the App requires and requests those permissions
 */
import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {processName} from '@utils/Profile';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {ReactNode, useEffect, useState} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PermissionsScreen'
>;

function PermissionsScreen({route, navigation}: Props): ReactNode {
  //state of notification permission
  const [isNotifPermissionGranted, setIsNotifPermissionGranted] =
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
        await checkNotificationPermission();
      } catch (error) {
        console.log('Error occurred during setup:', error);
      }
    };

    setupPermissions();
  }, []);

  //If all permissions are granted, automatically go to next screen where your profile gets setup.
  useEffect(() => {
    if (isNotifPermissionGranted) {
      navigation.navigate('SetupUser', {
        name: processName(route.params.name),
        avatar: route.params.avatar,
      });
    }
  }, [
    isNotifPermissionGranted,
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

  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'Notification',
      light: require('@assets/light/icons/NotificationOutline.svg').default,
      dark: require('@assets/dark/icons/NotificationOutline.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Notification = results.Notification;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <View style={styles.container}>
          <NumberlessText
            fontType={FontType.sb}
            fontSizeType={FontSizeType.xl}
            textColor={Colors.text.primary}
            style={{
              textAlign: 'center',
              paddingHorizontal: PortSpacing.secondary.uniform,
            }}>
            Allow basic permissions
          </NumberlessText>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}
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
                textColor={Colors.text.primary}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.l}>
                Notifications
              </NumberlessText>
              <NumberlessText
                fontType={FontType.rg}
                style={{marginTop: 2}}
                textColor={Colors.primary.darkgrey}
                fontSizeType={FontSizeType.s}>
                Get notified for events such as new messages
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
