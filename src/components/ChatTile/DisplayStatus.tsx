/**
 * Displays the appropriate status indicator based on the read status of the message.
 *
 * @param {Object} props - The properties object.
 * @param {MessageStatus} props.readStatus - The read status of the message.
 * @returns {ReactNode} - The JSX element representing the message status indicator.
 */

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import Failure from '@assets/icons/statusIndicators/failure.svg';
import {default as Journaled} from '@assets/icons/statusIndicators/sending.svg';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {ChatTileProps} from './ChatTile';

//Converts the new message count to a display string, with '999+' for counts over 999.
function displayNumber(newMsgCount: number): string {
  if (newMsgCount > 999) {
    return '999+';
  }
  return newMsgCount.toString();
}

const MessageStatusIndicator = ({readStatus}: {readStatus: MessageStatus}) => {
  const svgArray = [
    {
      assetName: 'Read',
      light: require('@assets/light/icons/Read.svg').default,
      dark: require('@assets/dark/icons/Read.svg').default,
    },
    {
      assetName: 'Delivered',
      light: require('@assets/light/icons/Received.svg').default,
      dark: require('@assets/dark/icons/Received.svg').default,
    },
    {
      assetName: 'Sent',
      light: require('@assets/light/icons/Sent.svg').default,
      dark: require('@assets/icons/statusIndicators/sent.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Read = results.Read;
  const Sent = results.Sent;
  const Delivered = results.Delivered;
  if (!readStatus) {
    return <Delivered />;
  }
  switch (readStatus) {
    case MessageStatus.journaled:
      return <Journaled />;
    case MessageStatus.read:
      return <Read />;
    case MessageStatus.sent:
      return <Sent />;
    case MessageStatus.failed:
      return <Failure />;
    default:
      return <></>;
  }
};

export default function DisplayStatus({
  newMessage,
}: {
  newMessage: ChatTileProps;
}): ReactNode {
  if (
    newMessage.text === '' ||
    newMessage.recentMessageType === ContentType.deleted
  ) {
    return <></>;
  }
  const Colors = DynamicColors();
  const styles = styling(Colors);

  // Display the new message count if the read status is new and the count is greater than 0
  if (newMessage.readStatus === MessageStatus.latest) {
    if (newMessage.newMessageCount > 0) {
      return (
        <View style={styles.statusWrapper}>
          <View style={styles.new}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.primaryWhite}
              numberOfLines={1}
              allowFontScaling={false}>
              {displayNumber(newMessage.newMessageCount)}
            </NumberlessText>
          </View>
        </View>
      );
    } else {
      return <View style={styles.emptyView} />;
    }
  } else {
    // Display the message status indicator for other read statuses
    return (
      <View style={styles.indicatorContainer}>
        <View>
          <MessageStatusIndicator readStatus={newMessage.readStatus} />
        </View>
      </View>
    );
  }
}

const styling = (colors: any) =>
  StyleSheet.create({
    new: {
      backgroundColor: colors.primary.accent,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      minWidth: 20,
    },
    statusWrapper: {
      paddingRight: PortSpacing.secondary.right,
      paddingTop: 4,
      paddingLeft: PortSpacing.tertiary.left,
    },
    indicatorContainer: {
      paddingRight: PortSpacing.secondary.right,
      paddingTop: 4,
      paddingLeft: PortSpacing.tertiary.left,
    },
    emptyView: {
      paddingRight: PortSpacing.secondary.right,
      paddingTop: 4,
    },
  });
