import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LinkPreviewReplyBubble} from './ReplyBubbles/LinkPreviewReplyBubble';
import {ContentType} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextReplyBubble} from './ReplyBubbles/TextReplyBubble';
import {MIN_WIDTH_REPLY, REPLY_MEDIA_HEIGHT} from './BubbleUtils';
import {ImageReplyBubble} from './ReplyBubbles/ImageReplyBubble';
import {VideoReplyBubble} from './ReplyBubbles/VideoReplyBubble';
import FileReplyBubble from './ReplyBubbles/FileReplyBubble';
import ContactReplyBubble from './ReplyBubbles/ContactReplyBubble';
import AudioReplyBubble from './ReplyBubbles/AudioReplyBubble';
import {LoadedMessage, ReplyContent} from '@utils/Storage/DBCalls/lineMessage';
import {useChatContext} from '@screens/DirectChat/ChatContext';

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
  replyTo: LoadedMessage;
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
        <View style={styles.childContainer}>
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
    borderRadius: 16,
  },
  childContainer: {
    width: '100%',
    padding: PortSpacing.tertiary.uniform,
  },
});
