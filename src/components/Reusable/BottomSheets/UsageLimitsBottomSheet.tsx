/**
 * This component is responsible for allowing a user to change usage limits.
 * It takes the following props:
 * 1. newLimit: - initial limit set
 * 2. setNewLimit - set new user limit function
 * 3. title - bottomsheet title
 * 4. onSave - on save function to save new user limit
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
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

const UsageLimitsBottomSheet = ({
  visible,
  onClose,
  onSave = () => {},
  newLimit,
  title,
  description,
  connectionsMade,
  newLimitLoading,
}: {
  visible: boolean;
  onClose?: () => void;
  onSave?: (newLocalLimit: number) => void;
  newLimit: number;
  title: string;
  description?: string;
  connectionsMade: number;
  newLimitLoading: boolean;
}) => {
  const [newLocalLimit, setNewLocalLimit] = useState<string>(
    newLimit.toString(),
  );
  useMemo(() => {
    setNewLocalLimit(newLimit.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newLimit, newLimitLoading]);

  const handleTextChange = (text: string) => {
    // Remove non-numeric characters using regular expression
    const numericValue = text.replace(/[^0-9]/g, '');
    setNewLocalLimit(numericValue);
  };
  const onSavePress = async () => {
    Keyboard.dismiss();
    onSave(parseInt(newLocalLimit));
  };

  const Colors = DynamicColors();

  return (
    <PrimaryBottomSheet
      bgColor="g"
      showClose={true}
      visible={visible}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        <View
          style={{width: '100%', marginBottom: PortSpacing.secondary.bottom}}>
          {description && (
            <NumberlessText
              style={{
                color: Colors.text.subtitle,
                marginBottom: PortSpacing.secondary.bottom,
              }}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {description}
            </NumberlessText>
          )}
          <SimpleInput
            placeholderText="Set number of connections"
            maxLength={NAME_LENGTH_LIMIT}
            text={newLocalLimit}
            setText={handleTextChange}
            bgColor="w"
            keyboardType="numeric"
          />
          {connectionsMade >= parseInt(newLocalLimit) && (
            <NumberlessText
              textColor={PortColors.primary.red.error}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.s}>
              Connection limit has to be a value greater than connections made.
            </NumberlessText>
          )}
        </View>

        <PrimaryButton
          buttonText={'Save'}
          primaryButtonColor={'b'}
          isLoading={newLimitLoading}
          disabled={
            connectionsMade >= parseInt(newLocalLimit) ||
            newLocalLimit === '' ||
            parseInt(newLocalLimit) === newLimit
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

export default UsageLimitsBottomSheet;
