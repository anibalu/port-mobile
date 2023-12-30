import Download from '@assets/icons/Download.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import ImageReplyContainer from '../ReplyContainers/ImageReplyContainer';

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
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          <View style={styles.image}>
            {isLoading ? <ActivityIndicator /> : <Download />}
          </View>
        </>
      )}
      {!isReply && renderTimeStamp(message)}
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
