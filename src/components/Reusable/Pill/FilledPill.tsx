import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
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
  if (value) {
    return (
      <Pressable
        style={StyleSheet.compose(styles.pill, {
          backgroundColor:
            selectedPill && selectedPill.folderId === value.folderId
              ? PortColors.primary.blue.app
              : PortColors.primary.white,
          borderColor:
            selectedPill && selectedPill.folderId === value.folderId
              ? PortColors.primary.white
              : PortColors.stroke,
          borderWidth: 1,
        })}
        onPress={onClickOfPill}>
        <NumberlessText
          style={{
            color:
              selectedPill && selectedPill.folderId === value.folderId
                ? PortColors.primary.white
                : PortColors.subtitle,
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
            ? PortColors.primary.blue.app
            : PortColors.primary.white,
          borderColor: !selectedPill
            ? PortColors.primary.white
            : PortColors.stroke,
          borderWidth: 1,
        })}
        onPress={onClickOfPill}>
        <NumberlessText
          style={{
            color: !selectedPill
              ? PortColors.primary.white
              : PortColors.subtitle,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          All Chats
        </NumberlessText>
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  pill: {
    marginRight: PortSpacing.tertiary.right,
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
    borderRadius: 12,
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'row',
  },
});
export default FilledPill;
