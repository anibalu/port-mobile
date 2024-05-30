import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import EditIcon from '@assets/icons/PencilAccent.svg';
import DynamicColors from '@components/DynamicColors';

const NumberPill = ({
  value,
  onClick,
  isCustom = false,
  connectionLimit,
  setOpenUsageLimitsModal,
}: {
  value: number;
  onClick: (value: number) => void;
  isCustom?: boolean;
  connectionLimit: number;
  setOpenUsageLimitsModal: (x: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <Pressable
      style={connectionLimit === value ? styles.activePill : styles.pill}
      onPress={() => {
        if (isCustom) {
          setOpenUsageLimitsModal(true);
        } else {
          onClick(value);
        }
      }}>
      <NumberlessText
        style={{
          color:
            connectionLimit === value
              ? Colors.primary.accent
              : Colors.text.subtitle,
        }}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        {isCustom
          ? value == 0 || value !== connectionLimit
            ? '+ Custom'
            : value
          : value}
      </NumberlessText>
      {isCustom && !(value == 0 || value !== connectionLimit) && (
        <EditIcon width={16} height={16} style={{marginLeft: 3}} />
      )}
    </Pressable>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    pill: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 8,
      backgroundColor: color.primary.lightgrey,
      flexDirection: 'row',
    },
    activePill: {
      paddingHorizontal: 15,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: color.primary.white,
      flexDirection: 'row',
      borderColor: color.primary.accent,
      borderWidth: 1,
    },
  });
export default NumberPill;
