import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import Delete from '@assets/icons/DeleteIcon.svg';

export function MediaMessageActionsBar({
  determineDeleteModalDisplay,
  handleShare,
  handleSave,
}: {
  handleShare: () => void;
  determineDeleteModalDisplay: () => void;
  handleSave: () => void;
}): ReactNode {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'Share',
      light: require('@assets/light/icons/Share.svg').default,
      dark: require('@assets/dark/icons/Share.svg').default,
    },
    {
      assetName: 'DownloadIcon',
      light: require('@assets/light/icons/DownloadArrow.svg').default,
      dark: require('@assets/dark/icons/DownloadArrow.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Download = results.DownloadIcon;

  const Share = results.Share;
  return (
    <View
      style={
        isIOS
          ? {
              ...styles.parentContainer,
              paddingBottom: 20,
              marginBottom: -20,
              paddingHorizontal: 45,
            }
          : {
              ...styles.parentContainer,
              paddingHorizontal: 45,
            }
      }>
      <View style={styles.multiSelectedContainer}>
        <View style={styles.optionContainer}>
          <Pressable style={styles.optionBox} onPress={handleShare}>
            <Share height={24} />
            <NumberlessText
              textColor={Colors.text.primary}
              style={{marginTop: 5}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Share
            </NumberlessText>
          </Pressable>
        </View>
        <View style={styles.optionContainer}>
          <Pressable style={styles.optionBox} onPress={handleSave}>
            <Download height={24} />
            <NumberlessText
              textColor={Colors.text.primary}
              style={{marginTop: 5}}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Save
            </NumberlessText>
          </Pressable>
        </View>
        <View style={styles.optionContainer}>
          <Pressable
            style={styles.optionBox}
            onPress={determineDeleteModalDisplay}>
            <Delete height={24} />
            <NumberlessText
              style={{marginTop: 5}}
              textColor={PortColors.primary.red.error}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Delete
            </NumberlessText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styling = (Color: any) =>
  StyleSheet.create({
    parentContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: 10,
      paddingBottom: 10,
      backgroundColor: Color.primary.surface,
    },
    singleSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    multiSelectedContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    optionContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 6,
      paddingRight: 6,
    },
    optionBox: {
      width: 55,
      height: 55,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    optionText: {
      fontSize: 12,
    },
  });
