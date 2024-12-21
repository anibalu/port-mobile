import {PortColors, PortSpacing} from '@components/ComponentUtils';
import React, {useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import permanentlyDeleteAccount from '@utils/AccountDeletion';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import AlertIcon from '@assets/icons/ErrorAlert.svg';
import ProfileDeletionBlurView from '@components/Reusable/BlurView/ProfileDeletionBlurView';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';

const DELETION_TEXT = 'DELETE ACCOUNT';

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
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const inputRef = useRef(null);
  const [modalClose, setModalClose] = useState(false);

  const deleteAccount = async () => {
    inputRef.current.blur();
    setDeletionState(DeletionState.ongoing);
    try {
      await permanentlyDeleteAccount();
      setModalClose(true);
      setDeletionState(DeletionState.completed);
    } catch (e) {
      setModalClose(false);
      console.error('[ACCOUNT DELETION] failed', e);
      setDeletionState(DeletionState.uninitiated);
    }
  };
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.surface}
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
              fontType={FontType.rg}
              textColor={Colors.text.primary}>
              By deleting your account you will lose all your connections, lose
              all messages and media you have sent or received and your backups
              will be invalidated.
            </NumberlessText>
            <NumberlessText
              style={{alignSelf: 'center'}}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}>
              To confirm that you understand the risks, please type '
              {DELETION_TEXT}' below.
            </NumberlessText>
            <TextInput
              style={{
                color: Colors.text.primary,
                borderWidth: 0.5,
                borderColor: Colors.primary.stroke,
                borderRadius: 16,
                paddingHorizontal: PortSpacing.tertiary.uniform,
              }}
              ref={inputRef}
              placeholderTextColor={Colors.text.placeholder}
              placeholder={DELETION_TEXT}
              onChangeText={setDeletionConfirmationText}
              defaultValue=""
              maxLength={32}
            />
          </SimpleCard>
        </View>
        <View style={styles.button}>
          <PrimaryButton
            buttonText="Delete Account"
            onClick={deleteAccount}
            primaryButtonColor="r"
            // We disable the button if the confirmation text isn't a case-insensitive
            // match
            disabled={
              DELETION_TEXT.toLowerCase() !==
              deletionConfirmationText.toLocaleLowerCase()
            }
            isLoading={DeletionState.ongoing === deletionState}
          />
        </View>
        {DeletionState.completed === deletionState && modalClose && (
          <ProfileDeletionBlurView modalClose={modalClose} />
        )}
      </GestureSafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: PortColors.primary.black,
    },
    content: {
      flex: 1,
      flexDirection: 'column',
      alignContent: 'flex-start',
      padding: PortSpacing.tertiary.uniform,
      gap: PortSpacing.primary.uniform,
      backgroundColor: Colors.primary.background,
    },
    card: {
      padding: PortSpacing.tertiary.uniform,
      gap: PortSpacing.medium.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      borderWidth: 0.5,
      borderColor: Colors.primary.red,
    },
    successcard: {
      padding: PortSpacing.tertiary.uniform,
      gap: PortSpacing.medium.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
      alignItems: 'center',
    },
    button: {
      padding: PortSpacing.tertiary.uniform,
      backgroundColor: Colors.primary.background,
      paddingVertical: PortSpacing.secondary.uniform,
    },
  });

export default DeleteAccount;
