import Download from '@assets/icons/Download.svg';
import {default as FileIcon} from '@assets/icons/FileThinWhite.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {CircleSnail} from 'react-native-progress';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {
  TEXT_OVERFLOW_LIMIT,
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
    setTimeout(() => {
      setStartedManualDownload(false);
    }, 300);
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

  const getBubbleLayoutStyle = (text: string) => {
    if (text.length > TEXT_OVERFLOW_LIMIT) {
      return styles.videoBubbleColumnContainer;
    } else {
      return styles.videoBubbleRowContainer;
    }
  };

  const text = (message.data as LargeDataParams).text;

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: PortColors.primary.yellow.dull,
              width: 35,
              height: 35,

              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FileIcon height={22} width={22} />
          </View>
          <View style={{marginLeft: 12}}>
            {renderProfileName(
              shouldRenderProfileName(memberName),
              memberName,
              message.sender,
              isReply,
              message.sender,
            )}

            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              style={{marginTop: 3, marginRight: 20}}>
              {message.data.text || 'File'}
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
            message.sender,
          )}

          <View style={styles.fileBox}>
            <View style={styles.fileClip}>
              <FileIcon />
            </View>
            <View
              style={{
                flexDirection: 'column',
                paddingHorizontal: 6,
              }}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  style={{
                    maxWidth:
                      (message.data as LargeDataParams).fileUri != null
                        ? 0.7 * screen.width - 100
                        : 0.38 * screen.width - 20,
                    paddingTop: 7,
                    marginRight:
                      (message.data as LargeDataParams).fileUri == null ||
                      startedManualDownload
                        ? 20
                        : 10,
                    overflow: 'hidden',
                  }}
                  fontType={FontType.rg}
                  ellipsizeMode="tail"
                  numberOfLines={2}>
                  {(message.data as LargeDataParams).fileName}
                </NumberlessText>
                {(message.data as LargeDataParams).fileUri == null &&
                  (startedManualDownload ? (
                    <View style={{alignSelf: 'center'}}>
                      <CircleSnail
                        color={PortColors.primary.blue.app}
                        duration={500}
                      />

                      {/* <CrossIcon
                        style={{
                          position: 'absolute',
                          left: 3,
                          top: 3,
                        }}
                      /> */}
                    </View>
                  ) : (
                    <View style={styles.downloadIconWrapper}>
                      <Download height={14} width={14} />
                    </View>
                  ))}
              </View>
              {text == undefined || (text == '' && renderTimeStamp(message))}
            </View>
          </View>

          {text ? (
            <View style={getBubbleLayoutStyle(text)}>
              <View>
                <NumberlessLinkText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}
                  numberOfLines={0}>
                  {text}
                </NumberlessLinkText>
              </View>
              {renderTimeStamp(message)}
            </View>
          ) : null}
        </>
      )}
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
  downloadIconWrapper: {
    padding: 7,
    borderRadius: 40,
    height: 28,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fileClip: {
    height: 60,
    width: 60,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: PortColors.primary.blue.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  videoBubbleColumnContainer: {
    paddingTop: 4,
    flexDirection: 'column',

    paddingHorizontal: 6,
    alignSelf: 'stretch',

    //Padding bottom is less, as item has additonal wrapping for it inside messageBubble.tsx
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  videoBubbleRowContainer: {
    paddingTop: 4,
    flexDirection: 'row',
    columnGap: 4,
    paddingHorizontal: 6,

    alignSelf: 'stretch',
    //Padding bottom is less, as item has additonal wrapping for it inside messageBubble.tsx
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
});
