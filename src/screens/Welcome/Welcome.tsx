/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * screen id: 1
 */
import Logo from '@assets/miscellaneous/portBranding.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GenericButton} from '@components/GenericButton';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import {loadConnectionsToStore} from '@utils/Connections';
import pullBacklog from '@utils/Messaging/pullBacklog';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'RequestPermissions'
>;

function Welcome({navigation}: Props) {
  const profileCheck = async (): Promise<boolean> => {
    try {
      const result = await checkProfileCreated();
      if (result === ProfileStatus.created) {
        await loadConnectionsToStore();
        await pullBacklog();
        store.dispatch({
          type: 'ONBOARDING_COMPLETE',
          payload: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error checking profile:', error);
      return false;
    }
  };

  //On login, as an edge case we do a profile check to ensure that a user who has logged in before doesnt end up at onboaring
  useEffect(() => {
    profileCheck();
  }, []);

  const onPress = async () => {
    const profileExists = await profileCheck();
    if (!profileExists) {
      navigation.navigate('NameScreen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.blue.app}
      />
      <View style={styles.greeting}>
        <Logo height={175} />
      </View>
      <GenericButton
        onPress={onPress}
        textStyle={styles.buttonText}
        buttonStyle={styles.button}>
        Get started
      </GenericButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: PortColors.primary.blue.app,
  },
  greeting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginBottom: 32,
    backgroundColor: PortColors.primary.white,
    height: 60,
    flexDirection: 'row',
    borderRadius: 16,
    alignItems: 'center',
    width: screen.width - 38,
    justifyContent: 'center',
  },
  buttonText: {
    color: PortColors.primary.blue.app,
  },
});

export default Welcome;
