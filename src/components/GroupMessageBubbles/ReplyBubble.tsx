import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LinkPreviewReplyBubble} from './ReplyBubbles/LinkPreviewReplyBubble';
import {ContentType} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TextReplyBubble} from './ReplyBubbles/TextReplyBubble';
import {MIN_WIDTH_REPLY, REPLY_MEDIA_HEIGHT} from './BubbleUtils';
import {ImageReplyBubble} from './ReplyBubbles/ImageReplyBubble';
import {VideoReplyBubble} from './ReplyBubbles/VideoReplyBubble';
import FileReplyBubble from './ReplyBubbles/FileReplyBubble';
import AudioReplyBubble from './ReplyBubbles/AudioReplyBubble';
import {
  GroupReplyContent,
  LoadedGroupMessage,
} from '@utils/Storage/DBCalls/groupMessage';
import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';
import {useChatContext} from '@screens/GroupChat/ChatContext';

export const ReplyBubble = ({reply}: {reply: GroupReplyContent}): ReactNode => {
  const {onTargetPress, selectionMode} = useChatContext();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        reply &&
        !selectionMode &&
        onTargetPress(reply.messageId, reply.timestamp)
      }
      style={styles.container}>
      {reply ? (
        <ReplyExistsBubble
          reply={reply}
          memberName={
            reply.sender ? 'You' : reply.name || DEFAULT_GROUP_MEMBER_NAME
          }
        />
      ) : (
        <View />
      )}
    </TouchableOpacity>
  );
};

export const ReplyBubbleMessageBar = ({
  replyTo,
}: {
  replyTo: LoadedGroupMessage;
}): ReactNode => {
  return (
    <View style={styles.container}>
      {replyTo ? (
        <ReplyExistsBubble
          reply={replyTo as GroupReplyContent}
          memberName={
            replyTo.sender ? 'You' : replyTo.name || DEFAULT_GROUP_MEMBER_NAME
          }
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
  reply: GroupReplyContent;
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
    borderRadius: 12,
  },
  childContainer: {
    width: '100%',
    padding: PortSpacing.tertiary.uniform,
  },
});
