/**
 * This component is responsible for allowing a user to change their name.
 * It takes the following props:
 * 1. name: - initial user name
 * 2. setName - set user name function
 * 3. title - bottomsheet title
 * 4. onSave - on save function to save new profile pic attributes
 * 5. onClose - on close function for bottom sheet
 * 6. visible - to determine if bottom sheet should be visible
 */

import React, {useMemo, useState} from 'react';
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
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

const EditName = ({
  visible,
  onClose,
  onSave = () => {},
  name,
  setName,
  title,
  description,
  placeholderText = 'Name',
}: {
  visible: boolean;
  onClose?: () => void;
  onSave?: () => void;
  name: string;
  setName: (name: string) => void;
  title?: string;
  description?: string;
  placeholderText?: string;
}) => {
  const [newName, setNewName] = useState<string>(name);
  useMemo(() => {
    setNewName(name);
  }, [name]);

  const onSavePress = () => {
    setName(newName);
    onSave();
    Keyboard.dismiss();
  };

  const Colors = DynamicColors();

  return (
    <PrimaryBottomSheet
      showClose={true}
      bgColor="g"
      visible={visible}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        {description && (
          <View
            style={{width: '100%', marginBottom: PortSpacing.secondary.bottom}}>
            <NumberlessText
              style={{color: Colors.text.subtitle}}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {description}
            </NumberlessText>
          </View>
        )}
        <View style={{marginBottom: PortSpacing.secondary.bottom}}>
          <SimpleInput
            placeholderText={placeholderText}
            maxLength={NAME_LENGTH_LIMIT}
            text={newName}
            setText={setNewName}
            bgColor="w"
          />
        </View>
        <PrimaryButton
          buttonText={'Save'}
          primaryButtonColor={'b'}
          isLoading={false}
          disabled={
            name !== newName && newName.trim().length >= MIN_NAME_LENGTH
              ? false
              : true
          }
          onClick={onSavePress}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    marginTop: PortSpacing.secondary.top,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
  },
});

export default EditName;
