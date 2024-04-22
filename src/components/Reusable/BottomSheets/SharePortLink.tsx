/**
 * Responsible for sharing a one-time port link
 */

import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {PortBundle} from '@utils/Ports/interfaces';
import {updateGeneratedPortLabel} from '@utils/Ports';
import Share from 'react-native-share';
import {useNavigation} from '@react-navigation/native';

const SharePortLink = ({
  visible,
  onClose,
  userName,
  contactName,
  setContactName,
  title,
  description,
  linkData,
  qrData,
}: {
  visible: boolean;
  onClose: () => void;
  userName: string;
  contactName: string;
  setContactName: (name: string) => void;
  title?: string;
  description?: string;
  linkData: string | null;
  qrData: string | null;
}) => {
  const [newName, setNewName] = useState<string>(contactName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const onEnterContactName = async () => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      setContactName(newName);
      if (qrData && linkData) {
        const bundle: PortBundle = JSON.parse(qrData);
        await updateGeneratedPortLabel(bundle.portId, newName);
        const shareContent = {
          title: `Share a one-time use link with ${newName}`,
          message:
            `Click the link to connect with ${userName} on Port.\n` + linkData,
        };
        await Share.open(shareContent);
      }
      setIsLoading(false);
      onClose();
      navigation.goBack();
    } catch (error) {
      console.log('Error sharing link to contact', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        {description && (
          <View
            style={{width: '100%', marginBottom: PortSpacing.secondary.bottom}}>
            <NumberlessText
              style={{color: PortColors.subtitle}}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {description}
            </NumberlessText>
          </View>
        )}
        <View style={{marginBottom: PortSpacing.secondary.bottom}}>
          <SimpleInput
            placeholderText="Contact name"
            maxLength={NAME_LENGTH_LIMIT}
            text={newName}
            setText={setNewName}
            bgColor="w"
          />
        </View>
        <PrimaryButton
          buttonText={'Share'}
          primaryButtonColor={'b'}
          isLoading={isLoading}
          disabled={newName.trim().length >= MIN_NAME_LENGTH ? false : true}
          onClick={onEnterContactName}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 24,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
  },
});

export default SharePortLink;
