/**
 * This screen allows a user to add a name and select a profile picture.
 * Currently not being used
 */
import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from '@components/SafeAreaView';
import DynamicColors from '@components/DynamicColors';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import store from '@store/appStore';
import InviteOnboardingArtwork from '@assets/miscellaneous/inviteOnboardingArtwork.svg';
import TertiaryButton from '@components/Reusable/LongButtons/TertiaryButton';
import ContactBook from '@assets/icons/ContactBook.svg';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {ToastType, useToast} from 'src/context/ToastContext';

type Props = NativeStackScreenProps<AppStackParamList, 'InviteFriends'>;

function InviteFriends({navigation}: Props) {
  const {showToast} = useToast();
  const onInviteClick = async () => {
    console.log('Sup');
    const granted = await checkAndAskContactPermission();
    if (granted) {
      store.dispatch({
        type: 'SHOW_INVITE_SCREEN',
        payload: false,
      });
      navigation.navigate('PhoneContactList');
    } else {
      // TODO: Open bottom sheet
      // Show a Toast to the user clarifying they can't invite contacts without permissions
      showToast(
        'Please allow access to your contacts in order to continue. This can be changed in your Settings.',
        ToastType.error,
      );
    }
  };

  const onSkipClick = () => {
    store.dispatch({
      type: 'SHOW_INVITE_SCREEN',
      payload: false,
    });
    navigation.navigate('HomeTab');
  };

  const Colors = DynamicColors();
  const styles = styling();

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.background} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <View style={styles.container}>
          <View style={styles.mainText}>
            <NumberlessText
              style={{
                textAlign: 'center',
                paddingHorizontal: PortSpacing.secondary.uniform,
              }}
              textColor={Colors.text.primary}
              fontType={FontType.sb}
              fontSizeType={FontSizeType.xl}>
              Port is better with your favorite people!
            </NumberlessText>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              style={{
                marginTop: PortSpacing.secondary.uniform,
                paddingHorizontal: PortSpacing.secondary.uniform,
              }}
              textColor={Colors.text.subtitle}>
              Invite your contacts over and discover the joy of conversations
              that are uninterrupted by spam, unwanted pings, and personalised
              just for you.
            </NumberlessText>
          </View>
          <InviteOnboardingArtwork
            width={screen.width - PortSpacing.primary.uniform}
          />
          <View style={styles.buttonContainer}>
            <PrimaryButton
              buttonText={'Invite Now'}
              primaryButtonColor={'b'}
              disabled={false}
              onClick={onInviteClick}
              isLoading={false}
              Icon={ContactBook}
            />
            <TertiaryButton
              tertiaryButtonColor="b"
              buttonText={'Maybe Later'}
              disabled={false}
              onClick={onSkipClick}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styling = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: PortSpacing.primary.top,
    },
    mainText: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    buttonContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginBottom: PortSpacing.secondary.bottom,
    },
  });

export default InviteFriends;
