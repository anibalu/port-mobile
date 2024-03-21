import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import SimpleCard from './SimpleCard';
import EditIcon from '@assets/icons/PencilBlue.svg';

const EditableInputCard = ({
  text,
  setOpenModal,
  placeholder = 'Enter a name',
}: {
  text: string;
  setOpenModal: (openModal: boolean) => void;
  placeholder?: string;
}) => {
  return (
    <SimpleCard style={styles.mainContainer}>
      <Pressable style={styles.cardWrapper} onPress={() => setOpenModal(true)}>
        {text === '' ? (
          <Text
            style={{
              fontFamily: FontType.rg,
              fontSize: FontSizeType.m,
              fontWeight: getWeight(FontType.rg),
              color: PortColors.primary.grey.medium,
              flex: 1,
            }}>
            {placeholder}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: FontType.rg,
              fontSize: FontSizeType.m,
              fontWeight: getWeight(FontType.rg),
              color: PortColors.title,
              flex: 1,
            }}>
            {text}
          </Text>
        )}
        <EditIcon height={20} width={20} />
      </Pressable>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  cardWrapper: {
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: PortSpacing.secondary.uniform,
    flexDirection: 'row',
    backgroundColor: PortColors.primary.white,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default EditableInputCard;
