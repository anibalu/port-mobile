import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import store from '@store/appStore';
import {useNavigation} from '@react-navigation/native';
import {ToastType, useToast} from 'src/context/ToastContext';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import ContactBook from '@assets/icons/ContactBook.svg';
import InviteInfoBanner from '@assets/backgrounds/InviteInfoBanner.png';
import {safeModalCloseDuration} from '@configs/constants';
import {wait} from '@utils/Time';

interface InviteInfoProps {
  onClose: () => void;
  visible: boolean;
}

const InviteInfoBottomsheet = (props: InviteInfoProps) => {
  const Colors = DynamicColors();
  const navigation = useNavigation();
  const {showToast} = useToast();

  const onInviteClick = async () => {
    props.onClose();
    await wait(safeModalCloseDuration);
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

  return (
    <PrimaryBottomSheet
      bgColor="w"
      visible={props.visible}
      showClose={false}
      onClose={props.onClose}
      shouldAutoClose={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageBackground
            resizeMode="contain"
            source={InviteInfoBanner}
            style={StyleSheet.compose(styles.background, {
              backgroundColor: Colors.primary.surface,
            })}
          />
        </View>
        <NumberlessText
          style={{marginTop: PortSpacing.secondary.top}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}>
          What is a Port?
        </NumberlessText>
        <NumberlessText
          style={{
            marginTop: PortSpacing.tertiary.top,
            marginBottom: PortSpacing.secondary.bottom,
          }}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          A Port is a one-time use QR or link that is shared to form a new
          connection. {`\n\n`}A Port - unlike contact info - is not a unique
          identifier for you. Once a connection forms, the Port and the
          information it contains is unusable.
        </NumberlessText>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          buttonText={'Invite Now'}
          primaryButtonColor={'b'}
          disabled={false}
          onClick={onInviteClick}
          isLoading={false}
          Icon={ContactBook}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  imageContainer: {
    height: 253,
    borderRadius: PortSpacing.medium.uniform,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    height: 253,
    position: 'absolute',
    resizeMode: 'cover',
  },
});

export default InviteInfoBottomsheet;
