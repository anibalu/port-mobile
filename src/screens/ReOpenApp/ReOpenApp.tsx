/**
 * This welcome screen shows Port branding and greets the user the first time they open the app.
 * UI is updated to latest spec for both android and ios
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@components/colorGuide';
import { isIOS, screen } from '@components/ComponentUtils';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing, Width } from '@components/spacingGuide';

import PortLogoWelcomeScreen from '@assets/miscellaneous/PortLogoWelcomeScreen.svg';

function ReOpenApp() {
  console.log('[Rendering ReOpenApp Screen]');

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
          <NumberlessText
            style={{ textAlign: 'center', marginHorizontal: Spacing.l, marginBottom: Spacing.s}}
            textColor={colors.boldAccentColors.darkGreen}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.l}>
            Port account deleted successfully. 
          </NumberlessText>
          <NumberlessText
            style={{ textAlign: 'center', marginBottom: Spacing.l, marginHorizontal: Spacing.l}}
            textColor={colors.text.subtitle}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.l}>
            Please quit and re-open the app to create a new account.
          </NumberlessText>
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

export default ReOpenApp;
