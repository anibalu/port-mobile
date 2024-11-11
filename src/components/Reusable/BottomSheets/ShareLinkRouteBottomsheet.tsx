/**
 * Responsible for showing route to sharing a one-time port link, either phone contacts or outside
 */

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {safeModalCloseDuration} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS} from '@components/ComponentUtils';

import {useNavigation} from '@react-navigation/native';
import SecondaryButton from '../LongButtons/SecondaryButton';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {wait} from '@utils/Time';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import {ToastType, useToast} from 'src/context/ToastContext';

const ShareLinkRouteBottomsheet = ({
  visible,
  onClose,
  onShareLinkClicked,
  isLoadingLink,
}: {
  isLoadingLink: boolean;
  visible: boolean;
  onClose: () => void;
  onShareLinkClicked: () => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  const svgArray = [
    {
      assetName: 'Contact',
      light: require('@assets/light/icons/media/Contact.svg').default,
      dark: require('@assets/dark/icons/media/Contact.svg').default,
    },
    {
      assetName: 'ShareIcon',
      light: require('@assets/light/icons/Share.svg').default,
      dark: require('@assets/dark/icons/Share.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const ShareIcon = results.ShareIcon;
  const Contact = results.Contact;
  const {showToast} = useToast();

  const onShareWithPhoneContacts = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      onClose();
      wait(safeModalCloseDuration);
      navigation.navigate('PhoneContactList');
    } else {
      onClose();
      showToast(
        'Please allow access to your contacts in order to continue. This can be changed in your Settings.',
        ToastType.error,
      );
    }
    setIsLoading(false);
  };

  const onShareLink = async () => {
    await onShareLinkClicked();
  };

  return (
    <PrimaryBottomSheet showClose={false} visible={visible} onClose={onClose}>
      <View style={styles.mainWrapper}>
        <SecondaryButton
          untrimmedText={true}
          buttonText="Share with phone contact"
          onClick={onShareWithPhoneContacts}
          secondaryButtonColor="black"
          Icon={Contact}
          iconSize="s"
          isLoading={isLoading}
        />
        <SecondaryButton
          untrimmedText={true}
          buttonText="Share on other platform"
          onClick={onShareLink}
          secondaryButtonColor="black"
          Icon={ShareIcon}
          iconSize="s"
          isLoading={isLoadingLink}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    gap: PortSpacing.secondary.uniform,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
});

export default ShareLinkRouteBottomsheet;
