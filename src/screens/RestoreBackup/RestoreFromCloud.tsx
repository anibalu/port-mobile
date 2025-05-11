import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
// TODO: Implement restore backup functionality
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import { OnboardingStackParamList } from '@navigation/OnboardingStack/OnboardingStackTypes';
import { rootNavigationRef } from '@navigation/rootNavigation';

import { restoreBackupFromCache } from '@utils/Backup';
import { initialiseFCM } from '@utils/Messaging/PushNotifications/fcm';
import runMigrations from '@utils/Storage/Migrations';

import { ToastType, useToast } from 'src/context/ToastContext';

import RecoverFromPasswordCard from './components/RecoverFromPasswordCard';


// NOTE: This screen name might need adjustment in the relevant navigator if 'RestoreBackup' is now used elsewhere.
// Consider renaming it, e.g., 'RestoreFromCloudPassword', and update the navigator accordingly.
type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'RestoreFromCloud'
>;

const RestoreFromCloud = ({ navigation, route }: Props) => {
  // Renamed component
  // Add navigation prop
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColors();
  const styles = styling(colors);

  const {showToast} = useToast();

  // Get backupFilePath from route params
  const { backupFilePath, localBackup } = route.params;

  const isPasswordValid = useMemo(() => {
    const trimmedPassword = password.trim();
    return trimmedPassword.length >= 8 && !trimmedPassword.includes(' ');
  }, [password]);

  const restoreBackup = async () => {
    setIsLoading(true);
    if (!isPasswordValid) {
      showToast('Please enter a valid password', ToastType.error);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true); // Set loading false only on error
      await restoreBackupFromCache(backupFilePath, password);
      // Navigate home after success
      // TODO: Verify this navigation works correctly in the context of where this screen will be used.
      await runMigrations();
      //can be run asynchronously
      initialiseFCM();
      if (rootNavigationRef.isReady()) {
        rootNavigationRef.reset({
          index: 0,
          routes: [
            {
              name: 'AppStack',
              params: {
                screen: 'DefaultPermissionsScreen',
                params: { isFromOnboarding: true },
              },
            },
          ],
        });
      }
      // No need to setIsLoading(false) here as we are navigating away
    } catch (error: any) {
      console.error('Restore failed:', error);
      setIsLoading(false); // Set loading false only on error
      showToast(localBackup ? 'You entered an incorrect password or chose an invalid backup file' : 'You entered an incorrect password or chose an invalid cloud backup', ToastType.error);
    }
  };

  return (
    <>
      <CustomStatusBar theme={colors.theme} backgroundColor={colors.background} />
      <SafeAreaView backgroundColor={colors.background}>
        <GenericBackTopBar
          onBackPress={() => navigation.goBack()}
          theme={colors.theme}
          backgroundColor={colors.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
        <View style={{ gap: Spacing.m, marginBottom: Spacing.l }}>
            <NumberlessText
              textColor={colors.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {localBackup ? 'Restore from your local backup' : 'Restore from your cloud backup'}
            </NumberlessText>
            <NumberlessText
              textColor={colors.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              Use your backup password to restore your account.
            </NumberlessText>
          </View>
          <RecoverFromPasswordCard
            password={password}
            setPassword={setPassword}
          />
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            theme={colors.theme}
            text="Restore account"
            disabled={!isPasswordValid}
            isLoading={isLoading}
            onClick={restoreBackup}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    footer: {
      backgroundColor: colors.surface,
      padding: Spacing.l,
    },
    foundItText: {
      color: '#FFFFFF',
    },
  });

// Renamed export
export default RestoreFromCloud;
