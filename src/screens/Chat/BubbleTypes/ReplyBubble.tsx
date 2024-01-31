import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_NAME} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {renderTimeStamp} from '../BubbleUtils';
import DeletedReplyBubble from './Reply/DeletedReplyBubble';
import FileReplyBubble from './Reply/FileReplyBubble';
import ImageReplyBubble from './Reply/ImageReplyBubble';
import TextReplyBubble from './Reply/TextReplyBubble';
import VideoReplyBubble from './Reply/VideoReplyBubble';

/**
 * We get the message that needs to be shown, and the person who sent the message is the memberName.
 * We need to get the message that is being replied to from INSIDE the message object. If it is not group, then we just need 'You' or member name
 */
const DEFAULT_DELETED_MESSAGE: SavedMessageParams = {
  chatId: '000000000000000000000000000001',
  messageId: '000000000000000000000000000001',
  contentType: ContentType.deleted,
  data: {text: 'Message no longer exists'},
  timestamp: '0',
  sender: true,
};

const ReplyBubble = ({
  message,
  handlePress,
  handleLongPress,
  isGroup,
  dataHandler,
  memberName,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  isGroup: boolean;
  dataHandler: Group | DirectChat;
  memberName: string;
}) => {
  const [replyMessage, setReplyMessage] = useState<SavedMessageParams>({});
  const [replyMemberName, setReplyMemberName] = useState(memberName);

  const getReply = async () => {
    try {
      //If a reply bubble is being rendered, it implies the existence of the replyId, which in turn implies the existence of a message
      const messageData =
        (await getMessage(message.chatId, message.replyId!)) ||
        DEFAULT_DELETED_MESSAGE;
      setReplyMessage(messageData);

      if (isGroup && messageData?.memberId) {
        const name = (
          await (dataHandler as Group).getMember(messageData.memberId)
        )?.name;

        setReplyMemberName(name ? name : DEFAULT_NAME);
      } else if (replyMessage.memberId == null && isGroup) {
        setReplyMemberName('');
      }
      //If the chat is a DM, then name is already present in replyMember
    } catch (error) {
      //If there is no reply, it means that the message has been deleted.

      console.error('Error getting reply:', error);
    }
  };

  useEffect(() => {
    getReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayMemberName = isGroup
    ? replyMemberName != ''
      ? replyMemberName
      : ''
    : memberName;

  const getReplyBubble = (): ReactNode => {
    //This local check forces names to be updated when the replyMemberName state changes. Weird bug which requires this to be present

    switch (replyMessage.contentType) {
      case ContentType.deleted: {
        return <DeletedReplyBubble />;
      }
      case ContentType.text: {
        return (
          <TextReplyBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isOriginalSender={message.sender}
          />
        );
      }
      case ContentType.image: {
        return (
          <ImageReplyBubble
            message={replyMessage}
            memberName={displayMemberName}
            isOriginalSender={message.sender}
          />
        );
      }
      case ContentType.file: {
        return (
          <FileReplyBubble
            message={replyMessage}
            memberName={displayMemberName}
            isOriginalSender={message.sender}
          />
        );
      }
      case ContentType.video: {
        return (
          <VideoReplyBubble
            message={replyMessage}
            memberName={displayMemberName}
            isOriginalSender={message.sender}
          />
        );
      }
      default: {
      }
    }
  };

  const replyText = replyMessage?.data?.text ? replyMessage.data.text : '';

  return (
    <Pressable
      style={StyleSheet.compose(
        styles.textBubbleContainer,
        replyMessage.contentType === ContentType.video ||
          replyMessage.contentType === ContentType.image
          ? getMinimumMediaBubbleWidth(replyText)
          : {},
      )}
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
      {/*  Bubbles are responsible for their positioning inside the parent. Parent has no padding or default styling */}
      <View
        style={message.sender ? styles.receiverBubble : styles.senderBubble}>
        <View style={styles.receiverLine} />

        {getReplyBubble()}
      </View>

      {/* TODO add reply bubbles for other data types */}
      <View style={getBubbleLayoutStyle(message.data.text || '')}>
        <NumberlessLinkText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {message.data.text || ''}
        </NumberlessLinkText>

        {message.data.text.length < 27 && <View style={{flex: 1}} />}

        {renderTimeStamp(message)}
      </View>
    </Pressable>
  );
};

export default ReplyBubble;

const getBubbleLayoutStyle = (text: string) => {
  if (text.length > 27) {
    return styles.textBubbleColumnContainer;
  } else {
    return styles.textBubbleRowContainer;
  }
};

const getMinimumMediaBubbleWidth = (text: string): StyleProp<ViewStyle> => {
  if (text.length > 16) {
    return {minWidth: '100%'};
  } else if (text.length == 0) {
    return {minWidth: '50%'};
  } else {
    return {minWidth: '70%'};
  }
};

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  textBubbleColumnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  textBubbleRowContainer: {
    flexDirection: 'row',
    columnGap: 4,
    justifyContent: 'flex-end',
  },
  receiverLine: {
    width: 4,
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 2,
  },
  receiverBubble: {
    backgroundColor: '#B7B6B64D',
    marginBottom: 4,
    overflow: 'hidden',
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
  },
  senderBubble: {
    backgroundColor: '#AFCCE4',
    overflow: 'hidden',
    marginBottom: 4,
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
  },
});
