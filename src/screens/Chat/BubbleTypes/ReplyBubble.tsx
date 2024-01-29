import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {
  ContentType,
  LargeDataParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_NAME} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {MediaText, renderTimeStamp} from '../BubbleUtils';
import DeletedReplyContainer from '../ReplyContainers/DeletedReplyContainer';
import FileBubble from './FileBubble';
import TextBubble from './TextBubble';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

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

  const getBubble = () => {
    //This local check forces names to be updated when the replyMemberName state changes. Weird bug which requires this to be present

    switch (replyMessage.contentType) {
      case ContentType.deleted: {
        return <DeletedReplyContainer />;
      }
      case ContentType.text: {
        return (
          <TextBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            isReply={true}
            isOriginalSender={message.sender}
          />
        );
      }
      case ContentType.image: {
        return (
          <View
            style={{
              maxWidth: '95%',
              flexDirection: 'row',
              marginVertical: -6,
            }}>
            <MediaText
              memberName={memberName}
              message={message}
              text={(replyMessage.data as LargeDataParams).text}
              type="Image"
            />
            {(replyMessage.data as LargeDataParams).fileUri != undefined &&
            (replyMessage.data as LargeDataParams).fileUri != null ? (
              <Image
                source={{
                  uri: getSafeAbsoluteURI(
                    (replyMessage.data as LargeDataParams).fileUri!,
                    'doc',
                  ),
                }}
                style={{
                  height: 75, // Set the maximum height you desire
                  width: 75, // Set the maximum width you desire

                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,

                  right: -4,
                }}
              />
            ) : (
              <View
                style={{
                  height: 75, // Set the maximum height you desire
                  width: 75, // Set the maximum width you desire

                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,

                  right: -4,
                }}
              />
            )}
          </View>
        );
      }
      case ContentType.file: {
        return (
          <FileBubble
            message={replyMessage}
            memberName={displayMemberName}
            handlePress={handlePress}
            handleDownload={async () => {}}
            handleLongPress={handleLongPress}
            isReply={true}
          />
        );
      }
      case ContentType.video: {
        return (
          <View
            style={{
              maxWidth: '95%',
              flexDirection: 'row',
              height: 45,
              maxHeight: 75,
              marginVertical: -6,
            }}>
            <MediaText
              memberName={memberName}
              message={message}
              text={(replyMessage.data as LargeDataParams).text}
              type="Video"
            />
            {(replyMessage.data as LargeDataParams).previewUri != undefined &&
            (replyMessage.data as LargeDataParams).previewUri != null ? (
              <Image
                source={{
                  uri: getSafeAbsoluteURI(
                    (replyMessage.data as LargeDataParams).previewUri!,
                    'cache',
                  ),
                }}
                style={{
                  height: 75, // Set the maximum height you desire
                  width: 75, // Set the maximum width you desire

                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,

                  right: -4,
                }}
              />
            ) : (
              <View
                style={{
                  height: 75, // Set the maximum height you desire
                  width: 75, // Set the maximum width you desire

                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,

                  right: -4,
                }}
              />
            )}
          </View>
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
        style={message.sender ? styles.receiverBubble : styles.senderBubble}>
        <View style={styles.receiverLine} />
        <View
          style={{
            paddingHorizontal: 5,
            paddingVertical: 7,
          }}>
          {getBubble()}
        </View>
      </View>

      {/* TODO add reply bubbles for other data types */}
      <View
        style={{
          marginHorizontal: 4,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 4,
        }}>
        <NumberlessLinkText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {message.data.text}
        </NumberlessLinkText>
        {renderTimeStamp(message)}
      </View>
    </Pressable>
  );
};

export default ReplyBubble;

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    marginHorizontal: -4,
    marginTop: -4,
  },
  receiverLine: {
    width: 4,
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 2,
    marginRight: 8,
  },
  receiverBubble: {
    backgroundColor: '#B7B6B64D',

    marginBottom: 4,
    overflow: 'hidden',
    alignSelf: 'stretch',
    borderRadius: 10,
    flexDirection: 'row',
  },
  senderBubble: {
    backgroundColor: '#AFCCE4',

    overflow: 'hidden',
    marginBottom: 4,
    alignSelf: 'stretch',
    borderRadius: 10,
    flexDirection: 'row',
  },
});
