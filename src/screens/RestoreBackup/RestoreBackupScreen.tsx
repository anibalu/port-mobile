import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { errorCodes, isErrorWithCode, keepLocalCopy, pick, types } from '@react-native-documents/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useColors } from '@components/colorGuide';
import { isIOS } from '@components/ComponentUtils';
import { CustomStatusBar } from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import { OnboardingStackParamList } from '@navigation/OnboardingStack/OnboardingStackTypes';

import { downloadBackupFromCloud } from '@utils/Backup';
import { getFileNameFromUri } from '@utils/Storage/StorageRNFS/sharedFileHandlers';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'RestoreBackup'>;

const RestoreBackupScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const styles = styling(colors);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const svgArray = [
    {
      assetName: 'GoogleLogo',
      light: require('@assets/icons/GoogleSmall.svg').default,
      dark: require('@assets/icons/GoogleSmall.svg').default,
    },
    {
      assetName: 'BackupIllustration',
      light: require('@assets/miscellaneous/backupBackground.svg').default,
      dark: require('@assets/miscellaneous/backupBackground.svg').default,
    },
  ];
  const svgResults = useSVG(svgArray, colors.theme);
  const GoogleLogo = svgResults.GoogleLogo;
  const BackupIllustration = svgResults.BackupIllustration;

  const onGoogleRestore = async () => {
    console.log('Attempting Google Restore...');
    setIsGoogleLoading(true);
    try {
      //cache the backup file and return the path.
      const backupFilePath = await downloadBackupFromCloud();
      console.log('Backup downloaded to:', backupFilePath);
      setIsGoogleLoading(false);
      navigation.navigate('RestoreFromCloud', { backupFilePath });
    } catch (error: any) {
      console.error('Failed to download backup from cloud storage:', error);
      Alert.alert(
        'Download Failed',
        `Could not download backup from Cloud Storage. Please ensure you have a backup saved and try again`,
      );
      setIsGoogleLoading(false);
    }
  };

  const onLocalRestore = async() => {
    setIsLocalLoading(true);
    try {
      const [file] = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,      // single-file pick
      })
      console.log('Picked file URI:', file.uri)
      console.log('Name & size:', file.name, file.size)
  
      const copyResult = await keepLocalCopy({
        destination: 'cachesDirectory',
        files: [{
          uri: file.uri,
          fileName: file.name || 'backupFile',
          convertVirtualFileToType: file.type || undefined,
        }],
      })
      console.log('Local copy:', copyResult[0].localUri);
      if (copyResult[0].localUri) {
        const fileContentBase64 = await RNFS.readFile(copyResult[0].localUri, 'base64');
        // Define a local path to save the downloaded backup
        const localBackupPath = RNFS.CachesDirectoryPath + `/${getFileNameFromUri(file.uri)}`;

        // Write the base64 decoded content to the local file
        await RNFS.writeFile(localBackupPath, fileContentBase64, 'base64');
        await RNFS.unlink(copyResult[0].localUri);
        console.log(`Backup file downloaded successfully to: ${localBackupPath}`);
        setIsLocalLoading(false);
        navigation.navigate('RestoreFromCloud', { backupFilePath: localBackupPath, localBackup: true });
      }
    } catch (err: any) {
      // User cancelled document picker
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log('User cancelled document picker')
      } else {
        console.error('Document pick error:', err)
      }
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <>
      <CustomStatusBar
        theme={colors.theme}
        backgroundColor={colors.background}
      />
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
              {'Restore your account'}
            </NumberlessText>
            <NumberlessText
              textColor={colors.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              If you have ever backed up your Port account to your drive or have
              a local backup file, you can restore it here.
            </NumberlessText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <BackupIllustration width={200} height={150} />
          </View>
          <View
            style={{
              gap: Spacing.s,
              marginTop: Spacing.m,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessText
              style={{ textAlign: 'center', marginBottom: Spacing.l }}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.s}
              textColor={colors.text.title}>
              By restoring your account, you acknowledge that you have read and
              agree to our{' '}
              <NumberlessText
                onPress={() =>
                  Linking.openURL(
                    'https://portmessenger.com/TermsAndConditions',
                  )
                }
                fontWeight={FontWeight.rg}
                fontSizeType={FontSizeType.s}
                textColor={colors.purple}>
                Terms
              </NumberlessText>{' '}
              and{' '}
              <NumberlessText
                fontWeight={FontWeight.rg}
                onPress={() =>
                  Linking.openURL('https://portmessenger.com/PrivacyPolicy')
                }
                fontSizeType={FontSizeType.s}
                textColor={colors.purple}>
                Privacy Policy
              </NumberlessText>
              .
            </NumberlessText>
            <PrimaryButton
              text={isIOS ? 'Restore from iCloud' : 'Restore from Google Drive'}
              onClick={onGoogleRestore}
              isLoading={isGoogleLoading}
              disabled={false}
              theme={colors.theme}
              Icon={isIOS ? undefined : GoogleLogo}
              textStyle={{ fontSize: FontSizeType.m, fontWeight: FontWeight.md }}
            />
            <NumberlessText
              textColor={colors.text.title}
              fontSizeType={FontSizeType.s}
              fontWeight={FontWeight.sb}>
              Or
            </NumberlessText>
            <SecondaryButton
              text="Restore from a local backup"
              onClick={onLocalRestore}
              isLoading={isLocalLoading}
              disabled={false}
              theme={colors.theme}
              textStyle={{ fontSize: FontSizeType.m, fontWeight: FontWeight.md }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styling = (_colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
  });

export default RestoreBackupScreen;
