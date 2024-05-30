import React from 'react';
import {StyleSheet, View} from 'react-native';
import FileIcon from '@assets/icons/FileClip.svg';
import {MediaEntry} from '@utils/Media/interfaces';
import {getDateStamp} from '@utils/Time';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';

export default function FileTile({
  mediaItem,
  selectedMedia,
}: {
  mediaItem: MediaEntry;
  selectedMedia: MediaEntry[];
}) {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const getMediaType = (input: string): string | undefined => {
    const segments = input.split('.');
    if (segments.length >= 2) {
      const result = segments[segments.length - 1].trim().substring(0, 5);
      return result === '' ? undefined : result.toUpperCase();
    } else {
      return undefined;
    }
  };

  return (
    <>
      <View style={styles.fileContainer}>
        <FileIcon color={Colors.primary.background} width="24" height="24" />
        <NumberlessText
          fontSizeType={FontSizeType.xs}
          fontType={FontType.md}
          textColor={Colors.text.primary}>
          {getMediaType(mediaItem.name)}
        </NumberlessText>
      </View>
      <View style={styles.fileInfoConatiner}>
        <NumberlessText
          fontSizeType={FontSizeType.l}
          fontType={FontType.md}
          textColor={Colors.text.primary}>
          {mediaItem.name}
        </NumberlessText>
      </View>
      <View>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={Colors.text.subtitle}>
          {getDateStamp(mediaItem.createdOn)}
        </NumberlessText>
      </View>

      {selectedMedia.includes(mediaItem) && (
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={Colors.text.primary}
          style={styles.countBadge}>
          {selectedMedia.indexOf(mediaItem) + 1}
        </NumberlessText>
      )}
    </>
  );
}

const styling = (color: any) =>
  StyleSheet.create({
    fileContainer: {
      backgroundColor: '#FEB95A',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 60,
      height: '100%',
      gap: 1,
      borderRadius: 12,
      padding: 3,
    },
    fileInfoConatiner: {
      flexDirection: 'column',
      gap: 1,
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    container: {
      flexDirection: 'column',
      paddingHorizontal: 21,
      width: '100%',
      marginTop: 12,
    },
    countBadge: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      textAlign: 'center',
      textAlignVertical: 'center',
      backgroundColor: color.primary.accent,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    countText: {
      color: 'white',
      fontWeight: 'bold',
      alignSelf: 'center',
    },
  });
