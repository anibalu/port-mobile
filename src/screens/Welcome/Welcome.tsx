/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import PortLogoWelcomeScreen from '@assets/miscellaneous/PortLogoWelcomeScreen.svg';
import {isIOS, PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import ScannerGreen from '@assets/icons/ScannerDarkGreen.svg';
import RightChevron from '@assets/dark/icons/navigation/AngleRight.svg';
import LinkSafron from '@assets/icons/LinkDeepSafron.svg';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import OptionWithLogoAndChevron from '@components/Reusable/OptionButtons/OptionWithLogoAndChevron';
import {OnboardingStackParamList} from '@navigation/OnboardingStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import store from '@store/appStore';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Storage/RNSecure/secureProfileHandler';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useInsetChecks} from '@components/DeviceUtils';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

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
  const onPressStandardOnboarding = async () => {
    const profileExists = await profileCheck();
    if (!profileExists) {
      navigation.push('OnboardingSetupScreen');
    }
  };

  //what happens when the user presses "Received a Port Link".
  const onPressCustomOnboardingWithLink = async () => {
    const profileExists = await profileCheck();
    if (!profileExists) {
      navigation.push('CreateConnection', {type: 'link'});
    }
  };

  //what happens when the user presses "Received a Port QR".
  const onPressCustomOnboardingWithQR = async () => {
    const profileExists = await profileCheck();
    if (!profileExists) {
      navigation.push('CreateConnection', {type: 'QR'});
    }
  };

  const onBackupPress = () => {
    navigation.push('RestoreAccount');
  };
  const Colors = DynamicColors();
  const DarkColors = DynamicColors('dark');

  const styles = styling(Colors);
  const inset = useSafeAreaInsets();
  const {hasIosBottomNotch} = useInsetChecks();

  return (
    <>
      <CustomStatusBar backgroundColor={DarkColors.primary.background} />
      <SafeAreaView
        removeOffset={true}
        style={{
          backgroundColor: DarkColors.primary.background,
          paddingBottom: hasIosBottomNotch ? inset.bottom : 0,
        }}>
        <View style={styles.container}>
          <View style={styles.greeting}>
            {isIOS ? (
              <PortLogoWelcomeScreen width={screen.height} />
            ) : (
              <PortLogoWelcomeScreen width={screen.height} />
            )}
          </View>
          <SimpleCard style={styles.buttonContainer}>
            <NumberlessText
              style={{textAlign: 'center'}}
              textColor={Colors.primary.white}
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}>
              Welcome to Port
            </NumberlessText>
            <View style={{gap: PortSpacing.tertiary.uniform}}>
              <PrimaryButton
                isLoading={false}
                primaryButtonColor="p"
                buttonText={'Get Started'}
                disabled={false}
                onClick={onPressStandardOnboarding}
              />
              <PrimaryButton
                isLoading={false}
                primaryButtonColor="w"
                buttonText={'Restore from backup'}
                disabled={false}
                onClick={onBackupPress}
              />
            </View>
          </SimpleCard>
          <View
            style={{
              width: '100%',
              marginVertical: PortSpacing.intermediate.uniform,
              gap: 4,
              flexDirection: 'column',
            }}>
            <OptionWithLogoAndChevron
              backgroundColor={Colors.lowAccentColors.darkGreen}
              theme={'dark'}
              IconRight={RightChevron}
              IconLeft={ScannerGreen}
              title={'Received a Port QR code?'}
              subtitle={'Scan it to form a connection'}
              onClick={onPressCustomOnboardingWithQR}
            />
            <LineSeparator
              fromContactBubble={true}
              borderColor={DarkColors.primary.surface2}
            />
            <OptionWithLogoAndChevron
              backgroundColor={Colors.lowAccentColors.orange}
              theme={'dark'}
              IconRight={RightChevron}
              IconLeft={LinkSafron}
              title={'Received a Port link?'}
              subtitle={'Click it again or paste it here to form a connection'}
              onClick={onPressCustomOnboardingWithLink}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styling = (color: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: screen.height,
      width: screen.width,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: PortSpacing.secondary.uniform,
      backgroundColor: color.primary.defaultdark,
    },
    greeting: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      flexDirection: 'column',
      borderWidth: 0.5,
      borderColor: '#61616B',
      backgroundColor: 'transparent',
      width: '100%',
      gap: PortSpacing.intermediate.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
  });

export default Welcome;
