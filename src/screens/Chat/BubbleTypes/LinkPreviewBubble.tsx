import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {
  LinkParams,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React, {ReactNode, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {
  TEXT_OVERFLOW_LIMIT,
  getEmojiSize,
  hasOnlyEmojis,
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';

export default function LinkPreviewBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isOriginalSender?: boolean;
}): ReactNode {
  const text = (message.data as TextParams).text;
  const data = message.data as LinkParams;
  const {description, title, linkUri} = data;

  const [showEmojiBubble, setShowEmojiBubble] = useState<boolean>(false);

  useEffect(() => {
    if (text.length <= 6) {
      setShowEmojiBubble(hasOnlyEmojis(text));
    }
  }, [text]);

  return (
    <Pressable
      style={styles.textBubbleColumnContainer}
      onPress={() => {
        handlePress(message.messageId);
      }}
      onLongPress={() => {
        handleLongPress(message.messageId);
      }}>
      {renderProfileName(
        shouldRenderProfileName(memberName),
        memberName,
        message.sender,
        false,
        isOriginalSender,
      )}
      <View style={getBubbleLayoutStyle(text || '', data, message)}>
        <View style={styles.previewContainer}>
          {(message.data as LinkParams).fileUri && (
            <Image
              resizeMode="contain"
              source={{
                uri: getSafeAbsoluteURI(
                  (message.data as LinkParams).fileUri!,
                  'doc',
                ),
              }}
              style={styles.previewImage}
            />
          )}
          {(description || title) && (
            <View style={{paddingVertical: 8, paddingHorizontal: 12, gap: 4}}>
              {title && (
                <NumberlessText
                  numberOfLines={2}
                  textColor={PortColors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {title}
                </NumberlessText>
              )}
              {description && (
                <NumberlessText
                  textColor={PortColors.text.primary}
                  fontSizeType={FontSizeType.s}
                  numberOfLines={1}
                  fontType={FontType.rg}>
                  {description}
                </NumberlessText>
              )}

              {linkUri && (
                <NumberlessText
                  textColor={PortColors.text.secondary}
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}>
                  {linkUri}
                </NumberlessText>
              )}
            </View>
          )}
        </View>
        {showEmojiBubble ? (
          <NumberlessText
            fontSizeType={getEmojiSize(text)}
            fontType={FontType.rg}>
            {text || ''}
          </NumberlessText>
        ) : (
          <NumberlessLinkText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {text || ''}
          </NumberlessLinkText>
        )}
        {renderTimeStamp(message)}
      </View>
    </Pressable>
  );
}

const getBubbleLayoutStyle = (text: string, data: any) => {
  const showEmojiBubble = hasOnlyEmojis(text);
  if (showEmojiBubble || data) {
    return styles.textBubbleColumnContainer;
  } else if (text.length > TEXT_OVERFLOW_LIMIT) {
    return styles.textBubbleColumnContainer;
  } else {
    return styles.textBubbleRowContainer;
  }
};

const styles = StyleSheet.create({
  previewContainer: {
    borderRadius: 12,
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 8,
    justifyContent: 'center',
  },
  textBubbleColumnContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  previewImage: {
    minWidth: 220,
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  textBubbleRowContainer: {
    flexDirection: 'row',
    columnGap: 4,
    justifyContent: 'center',
  },
});
