import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import SimpleInput from '../Inputs/SimpleInput';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {MIN_NAME_LENGTH, NAME_LENGTH_LIMIT} from '@configs/constants';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS} from '@components/ComponentUtils';

const EditName = ({
  visible,
  onClose,
  onSave,
  name,
  setName,
  title,
}: {
  visible: boolean;
  onClose?: () => void;
  onSave: () => void;
  name: string;
  setName: (name: string) => void;
  title?: string;
}) => {
  const [newName, setNewName] = useState<string>(name);

  const onSavePress = () => {
    setName(newName);
    onSave();
    Keyboard.dismiss();
  };

  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        <View style={{marginBottom: PortSpacing.secondary.bottom}}>
          <SimpleInput
            placeholderText="Name"
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
    marginTop: 24,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
  },
});

export default EditName;
