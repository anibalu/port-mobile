import React from 'react';
import {StyleSheet} from 'react-native';
import InviteContactsLogo from '@assets/dark/icons/InviteContacts.svg';
import GradientCard from '@components/Cards/GradientCard';
import {Spacing} from '@components/spacingGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@components/colorGuide';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import {ToastType, useToast} from 'src/context/ToastContext';

const InviteContactsCard = () => {
  const Colors = useColors();
  const styles = styling(Colors);
  const navigation = useNavigation();
  const {showToast} = useToast();

  const onInviteClicked = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.push('PhoneContactList');
    } else {
      showToast(
        'Please allow access to your contacts in order to continue. This can be changed in your Settings.',
        ToastType.error,
      );
    }
  };
  return (
    <GradientCard style={styles.gradientcard}>
      <InviteContactsLogo style={{alignSelf: 'center'}} />
      <NumberlessText
        textColor={Colors.text.title}
        fontSizeType={FontSizeType.l}
        fontWeight={FontWeight.md}>
        Your favourite people, just one invite away!
      </NumberlessText>
      <NumberlessText
        textColor={Colors.text.subtitle}
        fontWeight={FontWeight.rg}
        fontSizeType={FontSizeType.m}>
        Once someone accepts your invite, they will appear here as your Port
        connections.
      </NumberlessText>
      <PrimaryButton
        theme={Colors.theme}
        text="Invite now!"
        onClick={onInviteClicked}
        isLoading={false}
        disabled={false}
      />
    </GradientCard>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    gradientcard: {
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: Colors.stroke,
      padding: Spacing.l,
      paddingVertical: Spacing.l,
      gap: Spacing.m,
      backgroundColor: Colors.surface,
    },
  });

export default InviteContactsCard;
