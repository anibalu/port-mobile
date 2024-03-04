import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import SimpleCard from './SimpleCard';
import EditIcon from '@assets/icons/PencilBlue.svg';

const EditableInputCard = ({
  text,
  setOpenModal,
}: {
  text: string;

  setOpenModal: (openModal: boolean) => void;
}) => {
  return (
    <SimpleCard
      style={{height: 50, justifyContent: 'center', alignItems: 'center'}}>
      <Pressable style={styles.cardWrapper} onPress={() => setOpenModal(true)}>
        <Text
          style={{
            fontFamily: FontType.rg,
            fontSize: FontSizeType.m,
            fontWeight: getWeight(FontType.rg),
            color: PortColors.title,
          }}>
          {text}
        </Text>
        <EditIcon height={20} width={20} />
      </Pressable>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 12,
    paddingHorizontal: PortSpacing.secondary.uniform,
    flexDirection: 'row',
    backgroundColor: PortColors.primary.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screen.width - PortSpacing.primary.uniform,
  },
});

export default EditableInputCard;
