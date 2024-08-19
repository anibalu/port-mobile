import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

const FilledPill = ({
  value,
  onClick,
  selectedPill,
}: {
  value: FolderInfo | null;
  onClick: (value: FolderInfo | null) => void;
  selectedPill: FolderInfo | null;
}) => {
  const onClickOfPill = () => {
    onClick(value);
  };
  const Colors = DynamicColors();
  const styles = styling(Colors);
  if (value) {
    return (
      <Pressable
        style={StyleSheet.compose(styles.pill, {
          backgroundColor:
            selectedPill && selectedPill.folderId === value.folderId
              ? Colors.primary.accent
              : Colors.primary.surface,
          borderColor:
            selectedPill && selectedPill.folderId === value.folderId
              ? Colors.primary.stroke
              : Colors.primary.stroke,
          borderWidth: 1,
        })}
        onPress={onClickOfPill}>
        <NumberlessText
          style={{
            color:
              selectedPill && selectedPill.folderId === value.folderId
                ? Colors.primary.white
                : Colors.text.subtitle,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          {value.name}
        </NumberlessText>
      </Pressable>
    );
  } else {
    return (
      <Pressable
        style={StyleSheet.compose(styles.pill, {
          backgroundColor: !selectedPill
            ? Colors.primary.accent
            : Colors.primary.surface,
          borderColor: !selectedPill ? 'transparent' : Colors.primary.stroke,
          borderWidth: 1,
        })}
        onPress={onClickOfPill}>
        <NumberlessText
          style={{
            color: !selectedPill ? Colors.primary.white : Colors.text.subtitle,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          All Chats
        </NumberlessText>
      </Pressable>
    );
  }
};

const styling = (color: any) =>
  StyleSheet.create({
    pill: {
      marginRight: PortSpacing.tertiary.right,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 12,
      backgroundColor: color.primary.grey,
      flexDirection: 'row',
    },
  });
export default FilledPill;
