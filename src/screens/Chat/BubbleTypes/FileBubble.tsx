import {default as File, default as FileIcon} from '@assets/icons/FileClip.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
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
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}): ReactNode {
  const [fileURI, setFileURI] = useState<string | undefined>();
  useEffect(() => {
    if ((message.data as LargeDataParams).fileUri) {
      setFileURI('file://' + (message.data as LargeDataParams).fileUri);
    }
  }, [message]);
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = () => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (
      selectedMessagesSize === SelectedMessagesSize.empty &&
      fileURI != undefined
    ) {
      FileViewer.open(fileURI, {
        showOpenWithDialog: true,
      });
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
            <FileIcon />
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
              <File />
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
