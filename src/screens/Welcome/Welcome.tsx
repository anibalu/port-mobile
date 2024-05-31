/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import Logo from '@assets/miscellaneous/portBranding.svg';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'RequestPermissions'
>;

function Welcome({navigation}: Props) {
  //On login, as an edge case we do a profile check to ensure that a user who has logged in before doesnt end up at onboaring
  const profileCheck = async (): Promise<boolean> => {
    try {
      const result = await checkProfileCreated();
      if (result === ProfileStatus.created) {
        //lets profile store know that onboarding is complete
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
  useEffect(() => {
    profileCheck();
  }, []);

  //what happens when the user presses "get started".
  const onPress = async () => {
    const profileExists = await profileCheck();
    if (!profileExists) {
      navigation.navigate('NameScreen');
    }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.defaultdark} />
      <SafeAreaView style={styles.container}>
        <View style={styles.greeting}>
          <Logo width={screen.width} />
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            isLoading={false}
            primaryButtonColor="w"
            buttonText={'Get Started'}
            disabled={false}
            onClick={onPress}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styling = (color: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: color.primary.defaultdark,
    },
    greeting: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      width: '100%',
      paddingBottom: PortSpacing.primary.bottom,
      paddingLeft: PortSpacing.secondary.left,
      paddingRight: PortSpacing.secondary.right,
    },
  });

export default Welcome;
