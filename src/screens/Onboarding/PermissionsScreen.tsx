/**
 * This screens informs a user of the permissions the App requires.
 * screen id: 2
 */
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import Next from '@assets/navigation/nextButton.svg';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useEffect} from 'react';
import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';

import Notification from '@assets/icons/notificationBell.svg';
import Call from '@assets/icons/call.svg';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {processName} from '@utils/Profile';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PermissionsScreen'
>;

function PermissionsScreen({route, navigation}: Props) {
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
      <SafeAreaView style={styles.basicContainer}>
        <ScrollView
          //   style={styles.container}
          contentContainerStyle={{
            justifyContent: 'space-between',
            flex: 1,
            // backgroundColor: 'red',
          }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.contentBox}>
              <NumberlessRegularText style={styles.titleText}>
                Allow basic permissions to get{'\n'} started with
                <NumberlessBoldText> Ports</NumberlessBoldText>
              </NumberlessRegularText>
              <NumberlessRegularText style={styles.bodyText}>
                We need the following permissions to help you use the our app
                with complete ownership.{'\n\n'}You could restrict them if you
                feel so.
              </NumberlessRegularText>
              <View style={{flexDirection: 'row', width: '80%', marginTop: 40}}>
                <View
                  style={{
                    backgroundColor: PortColors.primary.blue.app,
                    width: 48,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                  }}>
                  <Notification />
                </View>
                <View style={{flexDirection: 'column', marginLeft: 16}}>
                  <NumberlessMediumText>Notifications</NumberlessMediumText>
                  <NumberlessRegularText>
                    Get notified of events like a message response or new port
                    opening.
                  </NumberlessRegularText>
                </View>
              </View>
              <View style={{flexDirection: 'row', width: '80%', marginTop: 40}}>
                <View
                  style={{
                    backgroundColor: PortColors.primary.blue.app,
                    width: 48,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                  }}>
                  <Call />
                </View>
                <View style={{flexDirection: 'column', marginLeft: 16}}>
                  <NumberlessMediumText>Calls</NumberlessMediumText>
                  <NumberlessRegularText>
                    Go beyond your testing and chat{'\n'}with your contact on
                    Port.
                  </NumberlessRegularText>
                </View>
              </View>
            </View>
            <GenericButton
              onPress={() =>
                navigation.navigate('SetupUser', {
                  name: processName(route.params.name),
                })
              }
              Icon={Next}
              buttonStyle={styles.nextButtonContainer}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

export default PermissionsScreen;

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
    alignItems: 'center',
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
    ...FontSizes[17].regular,
    color: PortColors.primary.black,
    marginBottom: 10,
    marginTop: 92,
    textAlign: 'center',
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
  bodyText: {
    marginTop: 50,
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
  nextButtonContainer: {
    backgroundColor: PortColors.primary.blue.app,
    height: 65,
    width: 65,
    marginRight: 25,
    marginBottom: 28,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});
