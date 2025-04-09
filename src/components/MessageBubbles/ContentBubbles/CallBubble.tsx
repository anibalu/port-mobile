import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {checkTimeout} from '@utils/Time';

import {RenderTimeStamp} from '../BubbleUtils';

export const CallBubble = ({message}: {message: LoadedMessage}): ReactNode => {
  const [canJoinCall, setCanJoinCall] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

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

  useEffect(() => {
    try {
      // Check if call is within last 30 seconds
      const canJoin =
        message.data.receiver &&
        !message.data.endTime &&
        checkTimeout(message.data.startTime, 30 * 1000); // 30 seconds
      setCanJoinCall(canJoin);
      setCallEnded(message.data.endTime ? true : false);
    } catch (error) {
      console.error('Error checking call timeout: ', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.mtime]);

  return (
    <Pressable style={styles.container}>
      <View style={styles.contentContainer}>
        <CallIcon width={20} height={20} />
        <NumberlessText
          fontType={FontType.md}
          fontSizeType={FontSizeType.m}
          textColor={Colors.text.primary}>
          {canJoinCall
            ? 'Incoming call'
            : callEnded
            ? 'Call ended'
            : 'Missed call'}
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
