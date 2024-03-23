import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LinkPreviewReplyBubble} from './ReplyBubbles/LinkPreviewReplyBubble';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import React, {ReactNode, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextReplyBubble} from './ReplyBubbles/TextReplyBubble';
import {
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  getReplyBubbleName,
} from './BubbleUtils';
import {ImageReplyBubble} from './ReplyBubbles/ImageReplyBubble';
import {VideoReplyBubble} from './ReplyBubbles/VideoReplyBubble';
import FileReplyBubble from './ReplyBubbles/FileReplyBubble';
import ContactReplyBubble from './ReplyBubbles/ContactReplyBubble';
import AudioReplyBubble from './ReplyBubbles/AudioReplyBubble';

export const ReplyBubble = ({
  message,
  isGroupChat,
}: {
  message: SavedMessageParams;
  isGroupChat: boolean;
}): ReactNode => {
  const [reply, setReply] = useState<SavedMessageParams | null>(null);
  const [memberName, setMemberName] = useState<string>('');
  useEffect(() => {
    (async () => {
      if (message.replyId) {
        const replied = await getMessage(message.chatId, message.replyId);
        if (replied) {
          setReply(replied);
          setMemberName(await getReplyBubbleName(replied, isGroupChat));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.container}>
      {reply ? (
        <ReplyExistsBubble reply={reply} memberName={memberName} />
      ) : (
        <View />
      )}
    </View>
  );
};

export const ReplyBubbleMessageBar = ({
  replyTo,
  isGroupChat,
}: {
  replyTo: SavedMessageParams | null | undefined;
  isGroupChat: boolean;
}): ReactNode => {
  const [reply, setReply] = useState<SavedMessageParams | null | undefined>(
    null,
  );
  const [memberName, setMemberName] = useState<string>('');
  useEffect(() => {
    (async () => {
      if (replyTo) {
        setReply(replyTo);
        setMemberName(await getReplyBubbleName(replyTo, isGroupChat));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyTo]);
  return (
    <View style={styles.container}>
      {reply ? (
        <ReplyExistsBubble reply={reply} memberName={memberName} />
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
  reply: SavedMessageParams;
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
  },
  childContainer: {
    width: '100%',
    padding: PortSpacing.tertiary.uniform,
  },
});
