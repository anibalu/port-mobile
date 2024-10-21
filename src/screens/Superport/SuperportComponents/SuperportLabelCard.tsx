import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import DynamicColors from '@components/DynamicColors';

const SuperportLabelCard = ({
  title,
  subtitle,
  label,
  setOpenModal,
  placeholder,
  onLabelInputClick,
}: {
  title: string;
  subtitle: string;
  label: string | number | null;
  setOpenModal: (p: boolean) => void;
  placeholder: string;
  onLabelInputClick: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
        gap: PortSpacing.secondary.bottom,
      }}>
      <View style={styles.headngWrapper}>
        <NumberlessText
          style={{
            color: Colors.text.primary,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.l}>
          {title}
        </NumberlessText>
        <View style={{marginTop: PortSpacing.tertiary.bottom}}>
          <NumberlessText
            style={{color: Colors.text.subtitle}}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            {subtitle}
          </NumberlessText>
        </View>
      </View>
      <Pressable pointerEvents="box-only" onPress={onLabelInputClick}>
        <EditableInputCard
          setOpenModal={setOpenModal}
          text={label}
          placeholder={placeholder}
        />
      </Pressable>
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    errorContainer: {
      position: 'absolute',
      top: -PortSpacing.intermediate.top,
      left: 0,
      color: color.primary.red,
      paddingLeft: PortSpacing.tertiary.left,
      paddingTop: 2,
    },
    inputcard: {
      borderWidth: 1,
      borderColor: color.primary.red,
      borderRadius: 16,
      overflow: 'hidden',
    },
    headngWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  });

export default SuperportLabelCard;
