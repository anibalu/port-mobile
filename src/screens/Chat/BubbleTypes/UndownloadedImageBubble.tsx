import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Sending from '@assets/icons/sending.svg';
import Download from '@assets/icons/Download.svg';
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import ImageReplyContainer from '../ReplyContainers/ImageReplyContainer';
import {PortColors, screen} from '@components/ComponentUtils';

export default function UndownloadedImageBubble({
  message,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = () => {
    setIsLoading(true);
  };
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <ImageReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          <View>
            {renderProfileName(
              shouldRenderProfileName(memberName),
              memberName,
              message.sender,
              isReply,
            )}
          </View>
          <View style={styles.image}>
            {isLoading ? <ActivityIndicator /> : <Download />}
          </View>
        </>
      )}
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

function renderTimeStamp(message: SavedMessageParams) {
  if (message.sendStatus === SendStatus.success || !message.sender) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessRegularText style={styles.timeStamp}>
          {getTimeStamp(message.timestamp)}
        </NumberlessRegularText>
      </View>
    );
  } else if (message.sendStatus === SendStatus.failed) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessItalicText style={styles.failedStamp}>
          failed
        </NumberlessItalicText>
      </View>
    );
  } else {
    return (
      <View style={styles.timeStampContainer}>
        <Sending />
      </View>
    );
  }
}

function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
  isReply: boolean,
) {
  return (
    <View>
      {shouldRender ? (
        <NumberlessMediumText>{name}</NumberlessMediumText>
      ) : isSender && isReply ? (
        <NumberlessMediumText>You</NumberlessMediumText>
      ) : (
        <View />
      )}
    </View>
  );
}

const viewWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
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
    color: PortColors.primary.grey.dark,
  },
  failedStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.medium,
  },
  text: {
    color: '#000000',
  },
  replyImage: {
    height: 65,
    width: 65,

    borderRadius: 16,
  },
  replyImageContainer: {
    width: 0.7 * viewWidth - 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
  image: {
    height: 0.7 * screen.width - 40, // Set the maximum height you desire
    width: 0.7 * screen.width - 40, // Set the maximum width you desire
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: PortColors.primary.black,
    paddingLeft: 15,
    paddingBottom: 15,
  },
});
