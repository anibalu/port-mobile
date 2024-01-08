import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import Group from '@utils/Groups/Group';
import {renderTimeStamp} from '../BubbleUtils';
import FileBubble from './FileBubble';
import ImageBubble from './ImageBubble';
import TextBubble from './TextBubble';
import VideoBubble from './VideoBubble';
import DirectChat from '@utils/DirectChats/DirectChat';
import {DEFAULT_NAME} from '@configs/constants';

/**
 * We get the message that needs to be shown, and the person who sent the message is the memberName.
 * We need to get the message that is being replied to from INSIDE the message object. If it is not group, then we just need 'You' or member name
 */

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
  isGroup: boolean;
  handleLongPress: any;
  dataHandler: Group | DirectChat;
  memberName: string;
}) => {
  const [replyMessage, setReplyMessage] = useState<SavedMessageParams>({});
  const [replyMemberName, setReplyMemberName] = useState(memberName);

  const getReply = async () => {
    try {
      //If a reply bubble is being rendered, it implies the existence of the replyId, which in turn implies the existence of a message
      const messageData = await getMessage(message.chatId, message.replyId!);
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

  const getBubble = () => {
    //This local check forces names to be updated when the replyMemberName state changes. Weird bug which requires this to be present
    const displayMemberName = isGroup
      ? replyMemberName != ''
        ? replyMemberName
        : ''
      : memberName;
    switch (replyMessage.contentType) {
      case ContentType.text: {
        return (
          <TextBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isReply={true}
          />
        );
      }
      case ContentType.image: {
        return (
          <ImageBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isReply={true}
          />
        );
      }
      case ContentType.file: {
        return (
          <FileBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isReply={true}
          />
        );
      }
      case ContentType.video: {
        return (
          <VideoBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isReply={true}
          />
        );
      }
      default: {
      }
    }
  };

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
      <View
        style={
          replyMessage.sender ? styles.receiverBubble : styles.senderBubble
        }>
        <View
          style={replyMessage.sender ? styles.senderLine : styles.receiverLine}
        />
        <View style={styles.textMessage}>{getBubble()}</View>
      </View>

      {/* TODO add reply bubbles for other data types */}
      <View style={{paddingHorizontal: 8}}>
        <NumberlessLinkText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {message.data.text}
        </NumberlessLinkText>
      </View>
      {renderTimeStamp(message)}
    </Pressable>
  );
};

export default ReplyBubble;

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
  },
  senderLine: {
    width: 4,
    backgroundColor: PortColors.primary.white,
    borderRadius: 2,
  },
  receiverLine: {
    width: 4,
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 2,
  },
  textMessage: {
    paddingLeft: 10,
  },
  receiverBubble: {
    backgroundColor: '#B7B6B64D',
    paddingHorizontal: 7,
    paddingVertical: 7,
    marginBottom: 4,
    alignSelf: 'stretch',
    borderRadius: 10,
    flexDirection: 'row',
  },
  senderBubble: {
    backgroundColor: '#AFCCE4',
    paddingHorizontal: 5,
    paddingVertical: 7,
    marginBottom: 4,
    alignSelf: 'stretch',
    borderRadius: 10,
    flexDirection: 'row',
  },
});
