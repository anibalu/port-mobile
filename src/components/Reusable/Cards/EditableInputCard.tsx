import {PortSpacing} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import SimpleCard from './SimpleCard';
import EditIcon from '@assets/icons/PencilAccent.svg';
import DynamicColors from '@components/DynamicColors';

const EditableInputCard = ({
  text,
  setOpenModal,
  placeholder = 'Enter a name',
}: {
  text: string;
  setOpenModal: (openModal: boolean) => void;
  placeholder?: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <SimpleCard style={styles.mainContainer}>
      <Pressable style={styles.cardWrapper} onPress={() => setOpenModal(true)}>
        {text === '' ? (
          <Text
            style={{
              fontFamily: FontType.rg,
              fontSize: FontSizeType.m,
              fontWeight: getWeight(FontType.rg),
              color: Colors.primary.mediumgrey,
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
              color: Colors.primary.mainelements,
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

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: colors.primary.surface2,
    },
    cardWrapper: {
      borderRadius: 12,
      flex: 1,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

export default EditableInputCard;
