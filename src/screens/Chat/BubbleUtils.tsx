import Sending from '@assets/icons/sending.svg';
import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {MessageStatus, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getTimeStamp} from '@utils/Time';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export function renderTimeStamp(message: SavedMessageParams) {
  if (message.messageStatus === MessageStatus.sent || !message.sender) {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        textColor={
          message.sender
            ? PortColors.text.messageBubble.senderTimestamp
            : PortColors.text.messageBubble.receiverTimestamp
        }
        style={styles.timeStampContainer}>
        {getTimeStamp(message.timestamp)}
      </NumberlessText>
    );
  } else if (message.messageStatus === MessageStatus.failed) {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.xs}
        fontType={FontType.md}
        style={styles.timeStampContainer}
        textColor={PortColors.text.delete}>
        Failed to send message
      </NumberlessText>
    );
  } else {
    return (
      <View style={styles.timeStampContainer}>
        <Sending />
      </View>
    );
  }
}

/**
 * Handles operations for when any media object is pressed in chat.
 * @param fileURI
 * @param onFailure
 */
export const handleMediaOpen = (
  fileURI: string | undefined | null,
  onUndefined: () => void,
  onError: () => void,
) => {
  if (fileURI != undefined && fileURI != null) {
    FileViewer.open(getSafeAbsoluteURI(fileURI, 'doc'), {
      showOpenWithDialog: true,
    }).catch(e => {
      console.log('Error opening file: ', e);
      onError();
    });
  } else {
    onUndefined();
  }
};

export function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

export function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
  isReply: boolean,
) {
  return (
    <View style={{alignSelf: 'flex-start', marginBottom: 2}}>
      {shouldRender ? (
        isReply && isSender ? (
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.sb}
            ellipsizeMode="tail"
            numberOfLines={1}
            textColor={PortColors.text.messageBubble.profileName}>
            You
          </NumberlessText>
        ) : (
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.sb}
            ellipsizeMode="tail"
            numberOfLines={1}
            textColor={PortColors.text.messageBubble.profileName}>
            {name}
          </NumberlessText>
        )
      ) : isSender && isReply ? (
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.sb}
          numberOfLines={1}
          ellipsizeMode="tail"
          textColor={PortColors.text.messageBubble.profileName}>
          You
        </NumberlessText>
      ) : (
        <View />
      )}
    </View>
  );
}

/**
 * Handles rendering of both Image and Video reply bubble components.
 * @param memberName
 * @param message
 * @param mediaURI
 * @param type - Video or Image
 * @returns
 */
export const renderMediaReplyBubble = (
  memberName: string,
  message: SavedMessageParams,
  mediaURI: string | undefined | null,
  type: 'Video' | 'Image',
) => {
  return (
    <View style={styles.mediaReplyContainer}>
      <View
        style={{
          flexDirection: 'column',
          marginRight: 22,
        }}>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
          true,
        )}
        <View
          style={{
            marginRight: 8,
          }}>
          {/* TODO add in text that can was attached to the message */}
          <NumberlessLinkText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {type}
          </NumberlessLinkText>
        </View>
      </View>
      {mediaURI != undefined && mediaURI != null ? (
        <Image
          source={{uri: mediaURI}}
          style={{
            height: 60, // Set the maximum height you desire
            width: 60, // Set the maximum width you desire
            borderRadius: 16,
          }}
        />
      ) : (
        <View
          style={{
            height: 60, // Set the maximum height you desire
            width: 60, // Set the maximum width you desire
            borderRadius: 16,
            backgroundColor: PortColors.primary.black,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  timeStampContainer: {
    flexDirection: 'column',
    alignSelf: 'flex-end',
  },
  mediaReplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
});
