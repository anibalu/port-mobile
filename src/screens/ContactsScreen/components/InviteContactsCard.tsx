import React from 'react';
import {StyleSheet} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import GradientCard from '@components/Cards/GradientCard';
import {useColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Spacing} from '@components/spacingGuide';

import {checkAndAskContactPermission} from '@utils/AppPermissions';

import InviteContactsLogo from '@assets/dark/icons/InviteContacts.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

const InviteContactsCard = () => {
  const Colors = useColors();
  const navigation = useNavigation();
  const {showToast} = useToast();

  const onInviteClicked = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.navigate('PhoneContactList');
    } else {
      showToast(
        'To invite contacts, Port needs access to your contacts. You can enable this permission in your device settings.',
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
        Invite your favourite people to Port!
      </NumberlessText>
      <NumberlessText
        textColor={Colors.text.subtitle}
        fontWeight={FontWeight.rg}
        fontSizeType={FontSizeType.m}>
        Create Ports for your favourite phone contacts and invite them to Port.
      </NumberlessText>
      <PrimaryButton
        theme={Colors.theme}
        text="Invite phone contacts"
        onClick={onInviteClicked}
        isLoading={false}
        disabled={false}
      />
    </GradientCard>
  );
};

const styles = StyleSheet.create({
    gradientcard: {
      padding: Spacing.l,
      paddingVertical: Spacing.l,
      gap: Spacing.m,
    },
  });

export default InviteContactsCard;
