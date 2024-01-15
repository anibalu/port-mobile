import Download from '@assets/icons/Download.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  renderMediaReplyBubble,
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
//import store from '@store/appStore';

const imageDimensions = 0.7 * screen.width - 40;

export default function ImageBubble({
  message,
  handlePress,
  handleDownload,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleDownload: (x: string) => Promise<void>;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}) {
  const [messageURI, setMessageURI] = useState<string | null>();
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  useEffect(() => {
    if ((message.data as LargeDataParams).fileUri) {
      setMessageURI((message.data as LargeDataParams).fileUri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, message.data, (message.data as LargeDataParams).fileUri]);

  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.messageId);
    setStartedManualDownload(false);
  };

  const handlePressFunction = () => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (selectedMessagesSize === SelectedMessagesSize.empty) {
      if (messageURI) {
        FileViewer.open(messageURI, {
          showOpenWithDialog: true,
        });
      } else {
        triggerDownload();
      }
    }
  };

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        renderMediaReplyBubble(memberName, message, messageURI, 'Image')
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}
          {startedManualDownload ? (
            <Loader />
          ) : (
            renderDisplay(messageURI, message.data as LargeDataParams)
          )}

          {(message.data as LargeDataParams).text ? (
            <View
              style={{
                marginTop: 8,
                marginHorizontal: 8,
              }}>
              <NumberlessLinkText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                {(message.data as LargeDataParams).text || ''}
              </NumberlessLinkText>
            </View>
          ) : null}
        </>
      )}
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

const Loader = () => {
  return (
    <View
      style={StyleSheet.compose(styles.image, {
        backgroundColor: PortColors.primary.black,
        justifyContent: 'center',
        alignItems: 'center',
      })}>
      <ActivityIndicator size={'large'} color={PortColors.primary.white} />
    </View>
  );
};

// Conditions:
// - if thumbnail exists
// - if shouldDownload is true and no thumbnail exists
// - if shouldDownload is false on and no thumbnail exists
const renderDisplay = (
  messageURI: string | undefined | null,
  data: LargeDataParams,
) => {
  if (messageURI) {
    return (
      messageURI != undefined && (
        <Image source={{uri: 'file://' + messageURI}} style={styles.image} />
      )
    );
  }

  //If we're here, this means that thumbnail is undefined and is on autodownload
  if (data.shouldDownload) {
    return <Loader />;
  }
  //If we're here, this means no thumbnail and no autodownload
  if (!data.shouldDownload) {
    return (
      <>
        <View
          style={StyleSheet.compose(styles.image, {
            backgroundColor: PortColors.primary.black,
          })}
        />
        <Download
          style={{
            position: 'absolute',
            top: 0.37 * screen.width - 40,
            left: 0.37 * screen.width - 40,
          }}
        />
      </>
    );
  }
};

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  image: {
    height: imageDimensions, // Set the maximum height you desire
    width: imageDimensions, // Set the maximum width you desire
    borderRadius: 16,
  },
});
