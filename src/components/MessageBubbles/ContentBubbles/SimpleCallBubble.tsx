import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RenderTimeStamp} from '../BubbleUtils';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

export const CallBubble = ({message}: {message: LoadedMessage}): ReactNode => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  // SVG setup for call icon
  const svgArray = [
    {
      assetName: 'CallIcon',
      light: require('@assets/light/icons/media/Calling.svg').default,
      dark: require('@assets/dark/icons/media/Calling.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CallIcon = results.CallIcon;

  return (
    <Pressable style={styles.container}>
      <View style={styles.contentContainer}>
        <CallIcon width={20} height={20} />
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.m}
          textColor={Colors.text.primary}>
          Call Received
        </NumberlessText>
      </View>
      <RenderTimeStamp message={message} />
    </Pressable>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: PortSpacing.tertiary.uniform,
    },
    textContainer: {
      gap: PortSpacing.tertiary.uniform,
    },
    joinButton: {
      backgroundColor: colors.primary.accent,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
  });
