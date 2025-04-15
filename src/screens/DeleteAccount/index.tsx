import React, {useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import { Height, Spacing } from '@components/spacingGuide';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import {rootNavigationRef} from '@navigation/rootNavigation';

import store from '@store/appStore';

import permanentlyDeleteAccount from '@utils/AccountDeletion';

import AlertIcon from '@assets/icons/ErrorAlert.svg';


const DELETION_TEXT = 'DELETE';

type Props = NativeStackScreenProps<AppStackParamList, 'DeleteAccount'>;

enum DeletionState {
  uninitiated,
  ongoing,
  completed,
}

const DeleteAccount = ({navigation}: Props) => {
  const [deletionConfirmationText, setDeletionConfirmationText] =
    useState<string>('');
  const [deletionState, setDeletionState] = useState<DeletionState>(
    DeletionState.uninitiated,
  );
  const Colors = useColors();
  const styles = styling(Colors);
  const inputRef = useRef(null);

  const deleteAccount = async () => {
    if(inputRef.current){
      inputRef.current.blur();
    }
    setDeletionState(DeletionState.ongoing);
    try {
      await permanentlyDeleteAccount();
      setDeletionState(DeletionState.completed);
      store.dispatch({
        type: 'DELETE_PROFILE',
        payload: {},
      });
      if (rootNavigationRef.isReady()) {

        rootNavigationRef.reset({
          index: 0,
          routes: [
            {
              name: 'OnboardingStack',
              params: {
                screen: 'Welcome',
              },
            },
          ],
        });
      }
    } catch (e) {
      console.error('[ACCOUNT DELETION] failed', e);
      setDeletionState(DeletionState.uninitiated);
    }
  };
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.surface}
      />
      <GestureSafeAreaView style={styles.screen}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.goBack()}
          title="Delete Account"
        />

        <View style={styles.content}>
          <SimpleCard style={styles.card}>
            <AlertIcon style={{alignSelf: 'center'}} />
            <NumberlessText
              style={{alignSelf: 'center'}}
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
              textColor={Colors.text.title}>
              This will invalidate any back-ups you have created and delete account info, profile and all of your messages.
            </NumberlessText>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
              textColor={Colors.text.subtitle}>
              To confirm deletion, please type '{DELETION_TEXT}' below
            </NumberlessText>
            <TextInput
              style={{
                color: Colors.text.title,
                borderWidth: 0.5,
                borderColor: Colors.stroke,
                borderRadius: 16,
                padding:Spacing.s,
                height: Height.inputBar
              }}
              ref={inputRef}
              placeholderTextColor={Colors.text.subtitle}
              placeholder={"Type 'DELETE' here"}
              onChangeText={setDeletionConfirmationText}
              defaultValue=""
              maxLength={32}
            />
          </SimpleCard>
        </View>
        <View style={styles.button}>
          <PrimaryButton
          theme={Colors.theme}
            text="Delete Account"
            onClick={deleteAccount}
            // We disable the button if the confirmation text isn't a case-insensitive
            // match
            disabled={
              DELETION_TEXT.toLowerCase() !==
              deletionConfirmationText.toLocaleLowerCase()
            }
            isLoading={DeletionState.ongoing === deletionState}
          />
        </View>
      
      </GestureSafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: Colors.black,
    },
    content: {
      flex: 1,
      flexDirection: 'column',
      alignContent: 'flex-start',
      padding: Spacing.s,
      paddingTop:Spacing.xl,
      gap: Spacing.s,
      backgroundColor: Colors.background,
    },
    card: {
      padding: Spacing.l,
      gap: Spacing.l,
      paddingVertical: Spacing.l,
      borderWidth: 0.5,
      borderColor: Colors.red,
    },
    successcard: {
      padding:Spacing.s,
      gap: Spacing.m,
      paddingVertical:Spacing.m,
      alignItems: 'center',
    },
    button: {
      padding:Spacing.s,
      backgroundColor: Colors.background,
      paddingVertical: Spacing.l,
    },
  });

export default DeleteAccount;
