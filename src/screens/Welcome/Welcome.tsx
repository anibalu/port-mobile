/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import GradientCard from '@components/Cards/GradientCard';
import { useThemeColors } from '@components/colorGuide';
import { isIOS, screen } from '@components/ComponentUtils';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
// import OptionWithLogoAndChevron from '@components/Options/OptionWithLogoAndChevron';
import { SafeAreaView } from '@components/SafeAreaView';
// import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing, Width } from '@components/spacingGuide';

import { OnboardingStackParamList } from '@navigation/OnboardingStack/OnboardingStackTypes';

// import LinkSafron from '@assets/icons/LinkDeepSafron.svg';
// import ScannerGreen from '@assets/icons/ScannerDarkGreen.svg';
import PortLogoWelcomeScreen from '@assets/miscellaneous/PortLogoWelcomeScreen.svg';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

function Welcome({ navigation }: Props) {
  console.log('[Rendering Welcome Screen]');

  //what happens when the user presses "get started".
  const onPressStandardOnboarding = async () => {
    navigation.navigate('OnboardingSetupScreen', {});
  };

  //what happens when the user presses "Received a Port Link".
  const _onPressCustomOnboardingWithLink = async () => {
    navigation.push('OnboardingLinkInput');
  };

  //what happens when the user presses "Received a Port QR".
  const _onPressCustomOnboardingWithQR = async () => {
    navigation.push('OnboardingQRScanner');
  };

  const onBackupPress = () => {
    navigation.push('RestoreAccount');
  };
  const colors = useThemeColors('dark');

  const styles = styling(colors);

  return (
    <>
      <CustomStatusBar
        theme={colors.theme}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        backgroundColor={colors.background}
        modifyNavigationBarColor={true}
        bottomNavigationBarColor={colors.background}>
        <View style={styles.container}>
          <View style={styles.greeting}>
            {isIOS ? (
              <PortLogoWelcomeScreen width={screen.height} />
            ) : (
              <PortLogoWelcomeScreen width={screen.height} />
            )}
          </View>
          <GradientCard style={styles.buttonContainer} forceTheme={'dark'}>
            <NumberlessText
              style={{ textAlign: 'center' }}
              textColor={colors.white}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.xl}>
              Welcome to Port
            </NumberlessText>
            <View style={{ gap: Spacing.s }}>
              <PrimaryButton
                theme={'dark'}
                isLoading={false}
                color={colors.purple}
                text={'Get Started'}
                disabled={false}
                onClick={onPressStandardOnboarding}
                textStyle={{
                  fontSize: FontSizeType.l,
                  fontWeight: FontWeight.md,
                }}
              />
              <PrimaryButton
                theme={'dark'}
                isLoading={false}
                color={colors.white}
                text={'Restore from backup'}
                disabled={false}
                onClick={onBackupPress}
                textStyle={{
                  fontSize: FontSizeType.l,
                  fontWeight: FontWeight.md,
                }}
              />
            </View>
          </GradientCard>
          {/* <View */}
          {/*   style={{ */}
          {/*     width: '100%', */}
          {/*     marginVertical: Spacing.xl, */}
          {/*     gap: Spacing.xs, */}
          {/*     flexDirection: 'column', */}
          {/*   }}> */}
          {/*   <OptionWithLogoAndChevron */}
          {/*     IconLeftParentStyle={{ */}
          {/*       backgroundColor: colors.lowAccentColors.darkGreen, */}
          {/*     }} */}
          {/*     forceTheme={'dark'} */}
          {/*     IconLeft={ScannerGreen} */}
          {/*     title={'Received a Port QR code?'} */}
          {/*     subtitle={'Scan it to form a chat'} */}
          {/*     onClick={onPressCustomOnboardingWithQR} */}
          {/*   /> */}
          {/*   <LineSeparator forceTheme={'dark'} /> */}
          {/*   <OptionWithLogoAndChevron */}
          {/*     IconLeftParentStyle={{ */}
          {/*       backgroundColor: colors.lowAccentColors.orange, */}
          {/*     }} */}
          {/*     forceTheme={'dark'} */}
          {/*     IconLeft={LinkSafron} */}
          {/*     title={'Received a Port link?'} */}
          {/*     subtitle={'Click it again or paste it here to form a chat'} */}
          {/*     onClick={onPressCustomOnboardingWithLink} */}
          {/*   /> */}
          {/* </View> */}
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
      paddingHorizontal: Spacing.l,
      backgroundColor: color.background,
      paddingBottom: Spacing.xl,
    },
    greeting: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      flexDirection: 'column',
      gap: Spacing.xl,
      paddingVertical: Spacing.l,
      paddingHorizontal: Spacing.l,
      width: Width.screen - 2 * Spacing.l,
    },
  });

export default Welcome;
