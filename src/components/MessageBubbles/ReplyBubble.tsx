import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {useChatContext} from '@screens/DirectChat/ChatContext';

import {ContentType} from '@utils/Messaging/interfaces';
import {
  LineMessageData,
  ReplyContent,
} from '@utils/Storage/DBCalls/lineMessage';

import {MIN_WIDTH_REPLY, REPLY_MEDIA_HEIGHT} from './BubbleUtils';
import AudioReplyBubble from './ReplyBubbles/AudioReplyBubble';
import ContactReplyBubble from './ReplyBubbles/ContactReplyBubble';
import FileReplyBubble from './ReplyBubbles/FileReplyBubble';
import {ImageReplyBubble} from './ReplyBubbles/ImageReplyBubble';
import {LinkPreviewReplyBubble} from './ReplyBubbles/LinkPreviewReplyBubble';
import {TextReplyBubble} from './ReplyBubbles/TextReplyBubble';
import {VideoReplyBubble} from './ReplyBubbles/VideoReplyBubble';


export const ReplyBubble = ({reply}: {reply: ReplyContent}): ReactNode => {
  const {name} = useChatContext();
  return (
    <View style={styles.container}>
      {reply ? (
        <ReplyExistsBubble
          reply={reply}
          memberName={reply.sender ? 'You' : name}
        />
      ) : (
        <View />
      )}
    </View>
  );
};

export const ReplyBubbleMessageBar = ({
  replyTo,
}: {
  replyTo: LineMessageData;
}): ReactNode => {
  const {name} = useChatContext();
  return (
    <View style={styles.container}>
      {replyTo ? (
        <ReplyExistsBubble
          reply={replyTo as ReplyContent}
          memberName={replyTo.sender ? 'You' : name}
        />
      ) : (
        <View />
      )}
    </View>
  );
};

/**
 * Extend supported content types to support more types of reply bubbles.
 */
const ReplyExistsBubble = ({
  reply,
  memberName,
}: {
  reply: ReplyContent;
  memberName: string;
}): ReactNode => {
  const Colors = DynamicColors();

  switch (reply.contentType) {
    case ContentType.text:
      return <TextReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.image:
      return <ImageReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.link:
      return <LinkPreviewReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.video:
      return <VideoReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.file:
      return <FileReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.contactBundle:
      return <ContactReplyBubble reply={reply} memberName={memberName} />;
    case ContentType.audioRecording:
      return <AudioReplyBubble reply={reply} memberName={memberName} />;
    default:
      return (
        <View
          style={StyleSheet.compose(styles.childContainer, {
            backgroundColor: Colors.primary.surface,
          })}>
          <NumberlessText
            style={{color: PortColors.primary.body}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            This message no longer exists
          </NumberlessText>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: REPLY_MEDIA_HEIGHT,
    minWidth: MIN_WIDTH_REPLY,
    overflow: 'hidden',
    borderRadius: 12,
  },
  childContainer: {
    width: '100%',
    padding: PortSpacing.tertiary.uniform,
    minHeight: REPLY_MEDIA_HEIGHT,
  },
});
