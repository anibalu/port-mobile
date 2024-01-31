import {default as FileIcon} from '@assets/icons/FileThinWhite.svg';
import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  renderProfileName,
  shouldRenderProfileName,
} from '@screens/Chat/BubbleUtils';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

/**
 * @param message, message object
 * @param handlePress
 * @param handleLongPress
 * @param memberName
 * @param isReply, defaults to false, used to handle reply bubbles
 * @returns {ReactNode} file bubble component
 */
export default function FileReplyBubble({
  message,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;

  memberName: string;
  isOriginalSender?: boolean;
}): ReactNode {
  const text = (message.data as LargeDataParams).text || '';
  const fileName = (message.data as LargeDataParams).fileName;
  return (
    <View style={styles.textBubbleContainer}>
      <View style={{flexDirection: 'row', padding: 8, alignItems: 'center'}}>
        <View
          style={{
            backgroundColor: PortColors.primary.yellow.dull,
            width: 35,
            height: 35,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FileIcon height={22} width={22} />
        </View>
        <View style={{marginLeft: 12}}>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            true,
            isOriginalSender,
          )}

          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            numberOfLines={3}
            style={{marginTop: 3, marginRight: text.length > 24 ? 40 : 0}}>
            {text || fileName || 'File'}
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
