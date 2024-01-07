import {PortColors, screen} from '@components/ComponentUtils';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Cross from '@assets/icons/cross.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {GenericButton} from '@components/GenericButton';

const DeleteModal = ({setIsDeleteModalVisible, deletePreset}) => {
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.modal}>
      <Cross
        style={styles.icon}
        onPress={() => setIsDeleteModalVisible(p => !p)}
      />
      <NumberlessText
        style={styles.heading}
        fontSizeType={FontSizeType.l}
        fontType={FontType.md}>
        Are you sure you want to delete this preset ?
      </NumberlessText>
      <NumberlessText
        style={styles.text}
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}>
        Note : On deleting presets the users/groups under this preset will
        retain their permission customizations of the deleted preset.
      </NumberlessText>
      <GenericButton
        buttonStyle={styles.button}
        onPress={async () => {
          setLoading(true);
          await deletePreset();
          setIsDeleteModalVisible(p => !p);
          setLoading(false);
        }}
        loading={loading}>
        Delete
      </GenericButton>
    </View>
  );
};
const styles = StyleSheet.create({
  modal: {
    backgroundColor: PortColors.primary.white,
    width: screen.width,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopStartRadius: 32,
    borderTopEndRadius: 32,
  },
  icon: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginBottom: 10,
  },
  heading: {
    textAlign: 'center',
  },
  text: {
    color: PortColors.primary.red.error,
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: PortColors.primary.red.error,
    width: '90%',
    marginTop: 30,
  },
});

export default DeleteModal;
