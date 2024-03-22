import {default as AudioThin} from '@assets/icons/Audiothin.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  renderProfileName,
  shouldRenderProfileName,
} from '@screens/Chat/BubbleUtils';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {formatDuration} from '@utils/Time';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

/**
 * @param message, message object
 * @param handlePress
 * @param handleLongPress
 * @param memberName
 * @param isReply, defaults to false, used to handle reply bubbles
 * @returns {ReactNode} audio bubble component
 */
export default function AudioReplyBubble({
  message,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;

  memberName: string;
  isOriginalSender?: boolean;
}): ReactNode {
  const durationTime = message?.data?.duration;
  return (
    <View style={styles.textBubbleContainer}>
      <View style={{padding: 8}}>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
          true,
          isOriginalSender,
        )}
        <View
          style={{flexDirection: 'row', marginTop: 4, alignItems: 'center'}}>
          <AudioThin height={22} width={22} />

          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            numberOfLines={3}
            style={{marginLeft: 2, marginTop: -2, marginRight: 85}}>
            Voice notes ({formatDuration(durationTime)})
          </NumberlessText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: '100%',
    justifyContent: 'center',
  },
});
