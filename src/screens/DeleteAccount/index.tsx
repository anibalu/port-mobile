import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';
import { rootNavigationRef } from '@navigation/rootNavigation';

import permanentlyDeleteAccount from '@utils/AccountDeletion';
import { deleteProfile } from '@utils/Profile';
import { clearTokenCache } from '@utils/ServerAuth';

import AlertIcon from '@assets/icons/ErrorAlert.svg';


const DELETION_TEXT = 'DELETE';

type Props = NativeStackScreenProps<AppStackParamList, 'DeleteAccount'>;

enum DeletionState {
  uninitiated,
  ongoing,
  completed,
}

const DeleteAccount = ({ navigation }: Props) => {
  const [deletionConfirmationText, setDeletionConfirmationText] =
    useState<string>('');
  const [deletionState, setDeletionState] = useState<DeletionState>(
    DeletionState.uninitiated,
  );
  const Colors = useColors();
  const styles = styling(Colors);

  const deleteAccount = async () => {
    setDeletionState(DeletionState.ongoing);
    try {
      await permanentlyDeleteAccount();
      setDeletionState(DeletionState.completed);
      //clear the profile from store, cache and storage
      await deleteProfile();
      //clear cached token
      await clearTokenCache();
      if (rootNavigationRef.isReady()) {
        rootNavigationRef.reset({
          index: 0,
          routes: [
            {
              name: 'ReOpenApp',
            },
          ],
        });
      }
    } catch (e) {
      console.error('[ACCOUNT DELETION] failed', e);
      setDeletionState(DeletionState.uninitiated);
    }
  };

  const buttonDisabled = DELETION_TEXT.toLowerCase() !==
    deletionConfirmationText.toLocaleLowerCase()
  return (
    <>
      <CustomStatusBar theme={Colors.theme} backgroundColor={Colors.background} />
      <SafeAreaView backgroundColor={Colors.background}>
        <GenericBackTopBar
          onBackPress={() => navigation.goBack()}
          theme={Colors.theme}
          backgroundColor={Colors.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <View style={{ gap: Spacing.m, marginBottom: Spacing.xl }}>
            <NumberlessText
              textColor={Colors.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {'Delete Account'}
            </NumberlessText>
          </View>
          <SimpleCard style={styles.card}>
            <AlertIcon style={{ alignSelf: 'center' }} />
            <NumberlessText
              style={{ alignSelf: 'center' }}
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.rg}
              textColor={Colors.text.title}>
              This will invalidate any back-ups you have created and delete account info, profile and all of your messages.
            </NumberlessText>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.rg}
              textColor={Colors.text.subtitle}>
              To confirm deletion, please type '{DELETION_TEXT}' below
            </NumberlessText>
            <SimpleInput
              placeholderText={"Type 'DELETE' here"}
              setText={setDeletionConfirmationText}
              text={deletionConfirmationText}
              maxLength={32}
            />
          </SimpleCard>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            isLoading={DeletionState.ongoing === deletionState}
            theme={Colors.theme}
            text={'Delete Account'}
            disabled={buttonDisabled}
            onClick={deleteAccount}
            color={Colors.red}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
    },
    card: {
      padding: Spacing.l,
      gap: Spacing.l,
      paddingVertical: Spacing.l,
      borderWidth: 0.5,
      borderColor: Colors.red,
    },
    successcard: {
      padding: Spacing.s,
      gap: Spacing.m,
      paddingVertical: Spacing.m,
      alignItems: 'center',
    },
    button: {
      paddingHorizontal: Spacing.m,
      backgroundColor: Colors.background,
      paddingVertical: Spacing.l,
    },
    disabledButton: {
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
      height: 50,
      opacity: 0.5,
      backgroundColor: Colors.red
    },
    footer: {
      backgroundColor: Colors.surface,
      padding: Spacing.l,
      flexDirection: 'row',
    },

  });

export default DeleteAccount;
