import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Cross from '@assets/icons/cross.svg';
import GenericInput from '@components/GenericInput';
import {GenericButton} from '@components/GenericButton';

const AddNew = ({
  selectedCategory,
  isEdit,
  addNewPreset,
  editExistingPresetName,
  setIsModalVisible,
  setSelectedCategory,
}) => {
  const [newPreset, setNewPreset] = useState(
    isEdit ? selectedCategory.name : '',
  );
  const [loading, setLoading] = useState(false);
  return (
    <View style={styles.modal}>
      <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.md}>
        {isEdit ? 'Edit preset' : 'Add new preset'}
      </NumberlessText>
      <Cross style={styles.icon} onPress={() => setIsModalVisible(p => !p)} />
      <GenericInput
        inputStyle={styles.nameInputStyle}
        text={newPreset}
        setText={setNewPreset}
        placeholder="Reddit circle"
        alignment="center"
        maxLength={16}
      />
      <GenericButton
        buttonStyle={styles.save}
        onPress={async () => {
          setLoading(true);
          isEdit
            ? editExistingPresetName(selectedCategory.presetId, newPreset)
            : addNewPreset(newPreset);
          setSelectedCategory(newPreset);
          setIsModalVisible(p => !p);
          setLoading(false);
        }}
        loading={loading}>
        Save
      </GenericButton>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: PortColors.primary.white,
    width: screen.width,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 25,
  },
  nameInputStyle: {
    paddingLeft: 10,
    height: 58,
    marginTop: 40,
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  save: {
    alignSelf: 'stretch',
    height: 60,
  },
});

export default AddNew;
