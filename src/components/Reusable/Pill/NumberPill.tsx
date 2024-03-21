import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import EditIcon from '@assets/icons/PencilBlue.svg';

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
              ? PortColors.primary.blue.app
              : PortColors.subtitle,
        }}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        {isCustom ? (value == 0 ? '+ Custom' : value) : value}
      </NumberlessText>
      {isCustom && value > 0 && (
        <EditIcon width={16} height={16} style={{marginLeft: 3}} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
    borderRadius: 8,
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'row',
  },
  activePill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: PortColors.background,
    flexDirection: 'row',
    borderColor: PortColors.primary.blue.app,
    borderWidth: 1,
  },
});
export default NumberPill;
