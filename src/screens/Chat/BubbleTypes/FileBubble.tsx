import Download from '@assets/icons/Download.svg';
import {default as FileIcon} from '@assets/icons/FileClip.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {
  handleMediaOpen,
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';

/**
 * @param message, message object
 * @param handlePress
 * @param handleLongPress
 * @param memberName
 * @param isReply, defaults to false, used to handle reply bubbles
 * @returns {ReactNode} file bubble component
 */
export default function FileBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  handleDownload,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  handleDownload: (x: string) => Promise<void>;
  isReply?: boolean;
}): ReactNode {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const {mediaDownloadError} = useErrorModal();
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
      handleMediaOpen(
        (message.data as LargeDataParams).fileUri,
        triggerDownload,
        mediaDownloadError,
      );
    }
  };
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#FEB95A',
              width: 39,
              height: 39,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {(message.data as LargeDataParams).fileUri != null ? (
              <FileIcon />
            ) : (
              <Download />
            )}
          </View>
          <View style={{marginLeft: 12}}>
            {renderProfileName(
              shouldRenderProfileName(memberName),
              memberName,
              message.sender,
              isReply,
            )}

            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={{marginTop: 3, marginRight: 20}}>
              File
            </NumberlessText>
          </View>
        </View>
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          <View style={styles.fileBox}>
            <View style={styles.fileClip}>
              {startedManualDownload ? (
                <ActivityIndicator
                  size={'small'}
                  color={PortColors.primary.white}
                />
              ) : (message.data as LargeDataParams).fileUri != null ? (
                <FileIcon />
              ) : (
                <Download />
              )}
            </View>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              style={{
                marginHorizontal: 10,
                width: 0.7 * screen.width - 100,
                overflow: 'hidden',
              }}
              fontType={FontType.md}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {(message.data as LargeDataParams).fileName}
            </NumberlessText>
          </View>
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

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  fileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fileClip: {
    height: 60,
    width: 60,
    borderRadius: 16,
    backgroundColor: PortColors.primary.yellow.dull,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
