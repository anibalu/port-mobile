/**
 * This component is responsible for allowing a user to change their name.
 * It renders a bottom sheet with an input field for the name and a save button.
 *
 * Props:
 * 1. name: string - the initial user name.
 * 2. setName: (name: string) => void - function to update the user name state.
 * 3. title?: string - the title displayed at the top of the bottom sheet.
 * 4. description?: string - additional text description displayed above the input field.
 * 5. onSave?: (name?: string) => void - function to handle saving the new name.
 * 6. onClose?: () => void - function to handle closing the bottom sheet.
 * 7. visible: boolean - determines whether the bottom sheet is visible.
 * 8. loading?: boolean - optional prop to show loading state in the save button (default: false).
 * 9. placeholderText?: string - placeholder for the input field (default: 'Name').
 * 10. keyboardType?: KeyboardTypeOptions - defines the keyboard type for the input field (default: 'ascii-capable').
 *
 * Usage:
 * The `EditName` component is typically used in scenarios where a user needs to update any label be it their profile name or superport name.
 */

import React, {useMemo, useState} from 'react';
import {Keyboard, KeyboardTypeOptions, StyleSheet, View} from 'react-native';

import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';

import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';

import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';

import PrimaryBottomSheet from './PrimaryBottomSheet';


const EditName = ({
  loading = false,
  visible,
  onClose,
  onSave = () => {},
  name,
  setName,
  title,
  description,
  placeholderText = 'Name',
  keyboardType = 'ascii-capable',
}: {
  loading?: boolean;
  visible: boolean;
  onClose?: () => void;
  onSave?: (name?: string) => void;
  name: string;
  setName?: (name: string) => void;
  title?: string;
  description?: string;
  placeholderText?: string;
  keyboardType?: KeyboardTypeOptions;
}) => {
  const [newName, setNewName] = useState<string>(name);
  useMemo(() => {
    setNewName(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, visible]);

  const onSavePress = () => {
    const trimmedName = newName.trim();
    setName?.(trimmedName);
    onSave?.(trimmedName);
    Keyboard.dismiss();
    onClose?.();
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
            keyboardType={keyboardType}
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
          isLoading={loading}
          disabled={
            name !== newName &&
            newName &&
            newName.trim().length >= MIN_NAME_LENGTH
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
