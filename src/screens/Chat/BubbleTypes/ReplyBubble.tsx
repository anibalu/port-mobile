import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Sending from '../../../../assets/icons/sending.svg';
import {NumberlessRegularText} from '../../../components/NumberlessText';
import {extractMemberInfo} from '../../../utils/Groups';
import {
  ContentType,
  SavedMessageParams,
  SendStatus,
} from '../../../utils/Messaging/interfaces';
import {getMessage} from '../../../utils/Storage/messages';
import {getTimeStamp} from '../../../utils/Time';
import FileBubble from './FileBubble';
import ImageBubble from './ImageBubble';
import TextBubble from './TextBubble';
import VideoBubble from './VideoBubble';

/**
 * We get the message that needs to be shown, and the person who sent the message is the memberName.
 * We need to get the message that is being replied to from INSIDE the message object. If it is not group, then we just need 'You' or member name
 */

export default function ReplyBubble({
  message,
  handlePress,
  handleLongPress,
  isGroup,
  groupInfo,
  memberName,
}: {
  message: SavedMessageParams;
  handlePress: any;
  isGroup: boolean;
  handleLongPress: any;
  groupInfo: any;
  memberName: string;
}) {
  const [replyMessage, setReplyMessage] = useState<SavedMessageParams>({});

  const getReply = async () => {
    try {
      setReplyMessage(await getMessage(message.chatId, message.replyId));
    } catch (error) {
      console.error('Error getting reply:', error);
    }
  };

  useEffect(() => {
    getReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBubble = () => {
    const isSelf = replyMessage.memberId == null;

    const replyMemberName = isSelf
      ? ''
      : isGroup
      ? extractMemberInfo(groupInfo, replyMessage.memberId).name
      : memberName;

    switch (replyMessage.contentType) {
      case ContentType.text: {
        return (
          <TextBubble
            message={replyMessage}
            memberName={replyMemberName}
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
            memberName={replyMemberName}
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
            memberName={replyMemberName}
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
            memberName={replyMemberName}
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
          replyMessage.sender ? styles.senderBubble : styles.receiverBubble
        }>
        <View
          style={replyMessage.sender ? styles.senderLine : styles.receiverLine}
        />
        <View style={styles.textMessage}>{getBubble()}</View>
      </View>

      {/* TODO add reply bubbles for other data types */}
      <NumberlessRegularText style={styles.replyMessage}>
        {message.data.text}
      </NumberlessRegularText>
      <View style={styles.timeStampContainer}>
        {message.sendStatus === SendStatus.success || !message.sender ? (
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTimeStamp(message.timestamp)}
            </NumberlessRegularText>
          </View>
        ) : (
          <View>
            {message.sendStatus === SendStatus.journaled ? (
              <View>
                <Sending />
              </View>
            ) : (
              <View>
                {true ? (
                  <View>
                    <Sending />
                  </View>
                ) : (
                  <View>
                    <NumberlessRegularText style={styles.failedStamp}>
                      {'failed'}
                    </NumberlessRegularText>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  senderLine: {
    width: 4,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 2,
  },
  receiverLine: {
    width: 4,
    backgroundColor: '#547CEF',
    marginBottom: 5,
    borderRadius: 2,
  },
  textMessage: {
    paddingLeft: 10,
  },
  receiverBubble: {
    backgroundColor: '#AFCCE4',
    padding: 5,
    marginLeft: -12,
    marginRight: -10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
  },
  senderBubble: {
    backgroundColor: '#B7B6B64D',
    padding: 5,
    marginLeft: -12,
    marginRight: -10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
  },
  replyMessage: {
    color: 'black',
    marginTop: 10,
    fontSize: 15,
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: '#868686',
  },
  failedStamp: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  text: {
    color: '#000000',
  },
});
