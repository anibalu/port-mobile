import Delete from '@assets/icons/DeleteIcon.svg';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortColors, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

export function MediaMessageActionsBar({
  determineDeleteModalDisplay,
  handleShare,
}: {
  handleShare: () => void;
  determineDeleteModalDisplay: () => void;
}): ReactNode {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'Share',
      light: require('@assets/icons/ShareBold.svg').default,
      dark: require('@assets/icons/Share.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

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
            <Share />
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
          <Pressable
            style={styles.optionBox}
            onPress={determineDeleteModalDisplay}>
            <Delete />
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
      paddingLeft: 10,
      paddingRight: 10,
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
