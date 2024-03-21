import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

const FolderPill = ({
  value,
  onClick,
  selectedFolder,
}: {
  value: FolderInfo;
  onClick: (x: FolderInfo) => void;
  selectedFolder: FolderInfo;
}) => {
  return (
    <Pressable
      style={
        selectedFolder.folderId === value.folderId
          ? styles.activePill
          : styles.pill
      }
      onPress={() => onClick(value)}>
      <NumberlessText
        style={{
          color:
            selectedFolder === value
              ? PortColors.primary.blue.app
              : PortColors.subtitle,
        }}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        {value.name}
      </NumberlessText>
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
export default FolderPill;
