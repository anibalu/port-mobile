import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import InviteContact from '@assets/icons/InviteContactOrange.svg';
import ContactBook from '@assets/icons/ContactBook.svg';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ContactListPlaceholder = () => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const navigation = useNavigation();

  const onInviteContacts = () => {
    navigation.navigate('PhoneContactList');
  };
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.iconWrapper}>
        <InviteContact height={32} width={32} />
      </View>
      <View style={styles.textContainer}>
        <NumberlessText
          textColor={Colors.text.primary}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.xl}>
          Invite contacts to Port
        </NumberlessText>
        <NumberlessText
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.l}>
          Invite the people you want to connect with to join Port. Start
          building your inner circle now.
        </NumberlessText>
      </View>
      <PrimaryButton
        disabled={false}
        buttonText="Invite now"
        isLoading={false}
        onClick={onInviteContacts}
        primaryButtonColor="p"
        Icon={ContactBook}
        iconSize="s"
      />
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    iconWrapper: {
      backgroundColor: colors.lowAccentColors.orange,
      padding: PortSpacing.medium.uniform,
      borderRadius: PortSpacing.tertiary.uniform,
    },
    textContainer: {
      gap: 4,
      marginVertical: PortSpacing.intermediate.uniform,
    },
    cardWrapper: {
      margin: PortSpacing.secondary.uniform,
      padding: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.secondary.uniform,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary.stroke,
      backgroundColor: colors.primary.surface,
    },
  });

export default ContactListPlaceholder;
