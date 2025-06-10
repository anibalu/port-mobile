import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { useColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

import { createAndSaveBackup, createAndUploadBackup } from '@utils/Backup';
import { setBackupTime } from '@utils/Profile';
import { getChatTileTimestamp } from '@utils/Time';

import { ToastType, useToast } from 'src/context/ToastContext';

import AddPasswordCard from './components/AddPasswordCard';
import ExportBackup from './components/ExportBackup';


type Props = NativeStackScreenProps<AppStackParamList, 'CreateBackupScreen'>;

const CreateBackupScreen = ({ navigation }: Props) => {

  const { showToast } = useToast();

  //user added password
  const [password, setPassword] = useState('');

  //loading state
  const [isCloudExporting, setIsCloudExporting] = useState(false);
  const [isLocalExporting, setIsLocalExporting] = useState(false);

  //colors and styles
  const color = useColors();
  const styles = styling(color);

  //password validation
  const isPasswordValid = useMemo(() => {
    const trimmedPassword = password.trim();
    return trimmedPassword.length >= 8 && !trimmedPassword.includes(' ');
  }, [password]);

  //export backup function
  const exportBackup = async () => {
    if (!isPasswordValid) {
      showToast('Password must be at least 8 characters long and must not contain spaces.', ToastType.error);
      return;
    }
    setIsCloudExporting(true);
    try {
      await createAndUploadBackup(password);
      await setBackupTime();
      showToast('Cloud backup created successfully', ToastType.success);
      setPassword('');
    } catch (error: any) {
      console.error('Backup failed:', error);
    } finally {
      setIsCloudExporting(false);
    }
  };

  const exportLocalBackup = async () => {
    if (!isPasswordValid) {
      showToast('Password must be at least 8 characters long and must not contain spaces.', ToastType.error);
      return;
    }
    setIsLocalExporting(true);
    try {
      await createAndSaveBackup(password);
      await setBackupTime();
      showToast('Local backup created successfully', ToastType.success);
      setPassword('');
    } catch (error: any) {
      console.error('Backup failed:', error);
    } finally {
      setIsLocalExporting(false);
    }
  };

  const profile = useSelector(state => state.profile.profile);
  const { lastBackupTime } = useMemo(() => {
    return {
      lastBackupTime: profile?.lastBackupTime || null,
    };
  }, [profile]);

  return (
    <>
      <CustomStatusBar theme={color.theme} backgroundColor={color.background} />
      <SafeAreaView backgroundColor={color.background}>
        <GenericBackTopBar
          onBackPress={() => navigation.goBack()}
          theme={color.theme}
          backgroundColor={color.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <View style={{ gap: Spacing.m, marginBottom: Spacing.l }}>
            <NumberlessText
              textColor={color.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {'Create a backup'}
            </NumberlessText>
            <NumberlessText
              textColor={color.text.title}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              (Last backup: {lastBackupTime ? getChatTileTimestamp(lastBackupTime) : <NumberlessText textColor={color.red} fontWeight={FontWeight.rg} fontSizeType={FontSizeType.l}>Never</NumberlessText>})
            </NumberlessText>
            <NumberlessText
              textColor={color.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              Create a secure encrypted backup of your conversations and data so you can restore them if you change devices or reinstall the app.
            </NumberlessText>
          </View>
          <AddPasswordCard
            password={password}
            setPassword={setPassword}
          />
          {isPasswordValid && <ExportBackup
            onCloudExport={exportBackup}
            onLocalExport={exportLocalBackup}
            isCloudExporting={isCloudExporting}
            isLocalExporting={isLocalExporting}
          />}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      marginBottom: Spacing.l,
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    label: {
      fontSize: 16,
      color: colors.text.title,
      marginBottom: Spacing.s,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.stroke,
      borderRadius: 8,
      padding: Spacing.m,
      fontSize: 16,
      color: colors.text.title,
      backgroundColor: colors.background1,
    },
    displayContainer: {
      marginTop: Spacing.xl,
    },
    displayText: {
      fontSize: 16,
      color: colors.text.body,
      marginTop: Spacing.s,
    },
    buttonContainer: {
      marginTop: Spacing.xl,
      width: '100%',
      alignItems: 'center',
    },
    successText: {
      color: 'green',
      marginTop: Spacing.s,
      textAlign: 'center',
    },
    errorText: {
      color: 'red',
      marginTop: Spacing.s,
      textAlign: 'center',
    },
  });

export default CreateBackupScreen;
