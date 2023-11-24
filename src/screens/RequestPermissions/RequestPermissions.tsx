/**
 * This screens informs a user of the permissions the App requires.
 * screen id: 2
 */
import {BackButton} from '@components/BackButton';
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import Notification from '@assets/permissions/notifications.svg';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CustomStatusBar} from '@components/CustomStatusBar';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'RequestPermissions'
>;

function RequestPermissions({navigation}: Props) {
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.basicContainer}>
        <View style={styles.container}>
          <View style={styles.contentBox}>
            <BackButton
              style={styles.topBarContainer}
              onPress={() => navigation.navigate('Welcome')}
            />
            <NumberlessBoldText style={styles.titleText}>
              Permissions we need to make your experience better
            </NumberlessBoldText>
            <NumberlessRegularText style={styles.bodyText1}>
              We only ask for the following permissions to make your App
              experience better. They are not essential and you can choose to
              decline them when the pop up appears.
            </NumberlessRegularText>
            <View style={styles.permissionBox}>
              <Notification
                width={21}
                height={21}
                style={styles.notificationIcon}
              />
              <NumberlessMediumText>Notifications</NumberlessMediumText>
            </View>
            <NumberlessRegularText style={styles.bodyText1}>
              We need this permission to send you notifications.
            </NumberlessRegularText>
          </View>
          <View style={styles.continueBox}>
            <NumberlessRegularText style={styles.bodyText2}>
              You can always modify permissions in your phone's app settings
              later on.
            </NumberlessRegularText>
            <GenericButton
              onPress={() => navigation.navigate('Onboarding')}
              textStyle={styles.buttonText}
              buttonStyle={styles.button}>
              Continue
            </GenericButton>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

export default RequestPermissions;

const styles = StyleSheet.create({
  basicContainer: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentBox: {
    flexDirection: 'column',
    width: '100%',
  },
  topBarContainer: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 51,
    alignItems: 'flex-start',
    paddingLeft: '6%',
  },
  titleText: {
    ...FontSizes[24].bold,
    marginBottom: 10,
    marginTop: 10,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  bodyText1: {
    marginBottom: 30,
    marginTop: 20,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  permissionBox: {
    flexDirection: 'row',
    paddingLeft: '8%',
  },
  notificationIcon: {
    marginRight: 20,
  },
  bodyText2: {
    marginBottom: 30,
    paddingRight: '8%',
    paddingLeft: '8%',
  },
  continueBox: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginBottom: '10%',
    backgroundColor: PortColors.primary.blue.app,
    width: '85%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...FontSizes[17].medium,
    color: '#FFFFFF',
  },
});
