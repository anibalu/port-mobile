import {
  LargeDataParams,
  MessageStatus,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {
  FILE_BUBBLE_HEIGHT,
  handleDownload,
  handleMediaOpen,
} from '../BubbleUtils';
import {useErrorModal} from 'src/context/ErrorModalContext';
import SmallLoader from '@components/Reusable/Loaders/SmallLoader';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import Download from '@assets/icons/Download.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TextBubble} from './TextBubble';
import UploadSend from '@assets/icons/UploadSend.svg';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';
import {getMedia} from '@utils/Storage/media';

export const FileBubble = ({
  message,
  handlePress,
  handleLongPress,
  handleRetry,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  handleRetry: (message: SavedMessageParams) => void;
}): ReactNode => {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const onRetryClick = async (messageObj: SavedMessageParams) => {
    setLoadingRetry(true);
    await handleRetry(messageObj);
    setLoadingRetry(false);
  };
  const {mediaDownloadError} = useErrorModal();
  const download = async () => {
    try {
      await handleDownload(message.chatId, message.messageId);
    } catch (error) {
      console.log('Error downloading media', error);
      mediaDownloadError();
    }
  };
  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await download();
    setStartedManualDownload(false);
  };
  const handlePressFunction = () => {
    const selectionMode = handlePress(message.messageId);
    if (!selectionMode) {
      handleMediaOpen(imageUri, triggerDownload, mediaDownloadError);
    }
  };
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const fileType = (string: string): string => {
    const lastIndex = string.lastIndexOf('.');
    if (lastIndex === -1 || lastIndex === string.length - 1) {
      return '';
    }
    return string.substring(lastIndex + 1);
  };

  useEffect(() => {
    setShowRetry(message.messageStatus === MessageStatus.unsent);
    setLoadingRetry(message.messageStatus === MessageStatus.sent);
  }, [message]);

  const svgArray = [
    {
      assetName: 'FileIcon',
      light: require('@assets/light/icons/File.svg').default,
      dark: require('@assets/dark/icons/File.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const FileIcon = results.FileIcon;
  const Colors = DynamicColors();

  useEffect(() => {
    (async () => {
      const mediaInfo = await getMedia(message.data?.mediaId);
      if (mediaInfo) {
        const image = mediaInfo.filePath;
        setImageUri(image);
      } else {
        setImageUri((message.data as LargeDataParams).fileUri);
      }
    })();
  }, [message]);

  return (
    <View>
      <Pressable
        style={StyleSheet.compose(styles.textContainerRow, {
          backgroundColor: Colors.primary.lightgrey,
        })}
        onPress={handlePressFunction}
        onLongPress={handleLongPressFunction}>
        <View style={styles.fileBox}>
          <View style={styles.fileClip}>
            <FileIcon />
          </View>
          <View style={styles.fileContentWrapper}>
            <View style={styles.filenameWrapper}>
              <View style={styles.textWrapper}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}
                  textColor={Colors.text.primary}
                  ellipsizeMode="tail"
                  numberOfLines={2}>
                  {(message.data as LargeDataParams).fileName}
                </NumberlessText>
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  ellipsizeMode="tail"
                  numberOfLines={2}>
                  {fileType((message.data as LargeDataParams).fileName)}
                </NumberlessText>
              </View>
              <View style={styles.loaderContainer}>
                {showRetry ? (
                  <>
                    {loadingRetry ? (
                      <View>
                        <ActivityIndicator
                          size={'small'}
                          color={PortColors.primary.blue.app}
                        />
                      </View>
                    ) : (
                      <Pressable
                        style={{
                          marginRight: 4,
                          padding: PortSpacing.tertiary.uniform,
                          borderRadius: 50,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(61, 61, 61, 0.30)',
                        }}
                        onPress={() => onRetryClick(message)}>
                        <UploadSend width={16} height={16} />
                      </Pressable>
                    )}
                  </>
                ) : (
                  <>
                    {imageUri == null &&
                      (startedManualDownload ? (
                        <View style={{alignSelf: 'center'}}>
                          <SmallLoader />
                        </View>
                      ) : (
                        <View style={styles.downloadIconWrapper}>
                          <Download height={14} width={14} />
                        </View>
                      ))}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
      <View style={{paddingTop: 4}}>
        <TextBubble message={message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainerRow: {
    flexDirection: 'row',
    height: FILE_BUBBLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  filenameWrapper: {
    flex: 1,
    gap: PortSpacing.secondary.uniform,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileContentWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: PortSpacing.tertiary.right,
  },
  textWrapper: {
    paddingBottom: 6,
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingTop: 7,
    overflow: 'hidden',
  },
  fileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  loaderContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileClip: {
    height: FILE_BUBBLE_HEIGHT,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIconWrapper: {
    padding: 7,
    borderRadius: 40,
    height: 28,
    alignSelf: 'center',
    backgroundColor: PortColors.primary.body,
  },
});
