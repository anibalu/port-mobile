import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {FolderInfo} from '@utils/Storage/DBCalls/folders';

const FolderPill = ({
  value,
  onClick,
  selectedFolder,
}: {
  value: FolderInfo;
  onClick: (x: FolderInfo) => void;
  selectedFolder: FolderInfo;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
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
            selectedFolder.folderId === value.folderId
              ? Colors.primary.accent
              : Colors.text.subtitle,
        }}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        {value.name}
      </NumberlessText>
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
export default FolderPill;
