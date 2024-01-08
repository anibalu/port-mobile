/**
 * This screens informs a user of the permissions the App requires.
 * screen id: 2
 */
import Next from '@assets/navigation/nextButton.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, useEffect} from 'react';
import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';
import notifee from '@notifee/react-native';
import Call from '@assets/icons/call.svg';
import Notification from '@assets/icons/notificationBell.svg';
import {PortColors} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {processName} from '@utils/Profile';
import {onboardingStylesheet} from './NameScreen';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PermissionsScreen'
>;

function PermissionsScreen({route, navigation}: Props): ReactNode {
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

      <ScrollView
        style={{backgroundColor: PortColors.primary.white}}
        contentContainerStyle={onboardingStylesheet.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.xl}
          style={{textAlign: 'center'}}>
          Allow basic permissions to get{'\n'} started with
          <NumberlessText
            fontType={FontType.sb}
            fontSizeType={FontSizeType.xl}
            textColor={PortColors.text.title}>
            {' '}
            Ports
          </NumberlessText>
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={PortColors.text.secondary}
          style={{marginTop: 50, textAlign: 'center'}}>
          We need the following permissions to help you use the our app with
          complete ownership.{'\n\n'}You could restrict them if you feel so.
        </NumberlessText>
        <View style={styles.blockWrapper}>
          <View style={styles.iconWrapper}>
            <Notification />
          </View>
          <View style={styles.textColumnWrapper}>
            <NumberlessText
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Notifications
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              style={{marginTop: 2}}
              textColor={PortColors.text.secondary}
              fontSizeType={FontSizeType.m}>
              Get notified of events like a message response or new port
              opening.
            </NumberlessText>
          </View>
        </View>
        <View style={styles.blockWrapper}>
          <View style={styles.iconWrapper}>
            <Call />
          </View>
          <View style={styles.textColumnWrapper}>
            <NumberlessText
              fontType={FontType.md}
              fontSizeType={FontSizeType.l}>
              Calls
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              style={{marginTop: 2}}
              textColor={PortColors.text.secondary}
              fontSizeType={FontSizeType.m}>
              Go beyond your testing and chat{'\n'}with your contact on Port.
            </NumberlessText>
          </View>
        </View>
        <GenericButton
          onPress={async () => {
            // Needed for iOS
            await notifee.requestPermission();

            // Needed for Android
            await notifee.createChannel({
              id: 'default',
              name: 'Default Channel',
            });

            navigation.navigate('SetupUser', {
              name: processName(route.params.name),
            });
          }}
          IconLeft={Next}
          buttonStyle={onboardingStylesheet.nextButtonContainer}
        />
      </ScrollView>
    </>
  );
}

export default PermissionsScreen;

const styles = StyleSheet.create({
  iconWrapper: {
    backgroundColor: PortColors.primary.blue.app,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  blockWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  textColumnWrapper: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 16,
  },
});
