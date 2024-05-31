import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {ReplyBubbleMessageBar} from '@components/MessageBubbles/ReplyBubble';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {generateRandomHexId} from '@utils/IdGenerator';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType, LinkParams} from '@utils/Messaging/interfaces';
import {
  downloadImageToMediaDir,
  moveToTmp,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {FileAttributes} from '@utils/Storage/interfaces';
import {formatDuration} from '@utils/Time';
import {debounce} from 'lodash';
import React, {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {OpenGraphParser} from 'react-native-opengraph-kit';
import {useAudioPlayerContext} from 'src/context/AudioPlayerContext';
import ProgressBar from '../../components/Reusable/Loaders/ProgressBar';
import BlinkingDot from './BlinkingDot';
import {extractLink} from '@components/MessageBubbles/BubbleUtils';
import LinkPreview from './LinkPreview';
import AmplitudeBars from './Recording';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {useMicrophonePermission} from 'react-native-vision-camera';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const MESSAGE_INPUT_TEXT_WIDTH = screen.width - 111;
/**
 * Renders the bottom input bar for a chat.
 * @param chatId , active chat
 * @param isGroupChat
 * @param replyTo, message being replied to
 * @param setReplyTo, setter for the same
 * @param name, name of the sender themselves
 * @param groupInfo
 * @param chatId
 * @returns {ReactNode}, message bar that handles all inputs
 */
const MessageBar = (): ReactNode => {
  const {chatId, isGroupChat, replyToMessage, clearEverything} =
    useChatContext();
  const navigation = useNavigation<any>();
  const rotationValue = useRef(new Animated.Value(0)).current;
  const {MessageDataTooBigError} = useErrorModal();

  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [openGraphData, setOpenGraphData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<boolean>(
    replyToMessage ? false : true,
  );

  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const [openRecord, setOpenRecord] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (replyToMessage) {
      setShowPreview(false);
    }
    if (inputRef?.current && replyToMessage != undefined) {
      inputRef.current.focus();
    }
  }, [replyToMessage]);

  const togglePopUp = (): void => {
    setPopUpVisible(!isPopUpVisible);

    // Rotate animation
    Animated.timing(rotationValue, {
      toValue: isPopUpVisible ? 0 : 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: false, // false because 'rotate' is not supported by native driver
    }).start();
  };

  // Interpolate the rotation value to determine the degree of rotation
  const rotateInterpolation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{rotate: rotateInterpolation}],
  };

  const onChangeText = (newText: string): void => {
    setText(newText);
  };

  const sendText = async (): Promise<void> => {
    setShowPreview(false);
    setOpenGraphData(null);
    const processedText = text.trim();
    if (processedText !== '') {
      setText('');
      //send text message
      clearEverything();
      const sender = new SendMessage(
        chatId,
        ContentType.text,
        {text: processedText},

        replyToMessage ? replyToMessage.messageId : null,
      );
      try {
        await sender.send();
      } catch (error) {
        MessageDataTooBigError();
      }
    }
  };

  const sendLinkText = async (): Promise<void> => {
    setShowPreview(false);
    const processedText = text.trim();
    setText('');
    clearEverything();
    const fileName = generateRandomHexId();
    const fileUri = await downloadImageToMediaDir(
      chatId,
      fileName,
      openGraphData['og:image'] || openGraphData.image || null,
    );
    const dataObj: LinkParams = {
      title: openGraphData['og:title'] || openGraphData.title || null,
      description:
        openGraphData['og:description'] || openGraphData.description || null,
      fileUri: fileUri,
      linkUri: url,
      fileName: fileName,
      text: processedText,
      mediaId: fileUri ? generateRandomHexId() : undefined,
    };
    //send link message
    setOpenGraphData(null);
    const sender = new SendMessage(
      chatId,
      ContentType.link,
      dataObj,
      replyToMessage ? replyToMessage.messageId : null,
    );
    await sender.send();
  };

  const goToConfirmation = (lst: any[]) => {
    if (lst.length > 0) {
      navigation.navigate('GalleryConfirmation', {
        selectedMembers: [{chatId: chatId}],
        shareMessages: lst,
        isChat: true,
        isGroupChat: isGroupChat,
      });
    }
    togglePopUp();
  };

  const onImagePressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 6,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };

        const msg = {
          contentType: ContentType.image,
          data: {...file},
        };
        fileList.push(msg);
      }
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onVideoPressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'video',
        includeBase64: false,
        selectionLimit: 6,
      });
      const fileList = [];
      //videos are selected
      const selected: Asset[] = response.assets || [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //video is sent
        const msg = {
          contentType: ContentType.video,
          data: {...file},
        };
        fileList.push(msg);
      }
      goToConfirmation(fileList);
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onFilePressed = async (): Promise<void> => {
    try {
      const selected: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.pdf,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.zip,
        ],
        //We need to copy documents to a directory locally before sharing on newer Android.
        ...(!isIOS && {copyTo: 'cachesDirectory'}),
      });
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].fileCopyUri
            ? selected[index].fileCopyUri
            : selected[index].uri,
          fileType: selected[index].type || '',
          fileName: selected[index].name || '',
        };
        //file is sent
        const msg = {
          contentType: ContentType.file,
          data: {...file},
        };
        fileList.push(msg);
      }
      //send file message
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const hasLink: string | null = extractLink(text.toLocaleLowerCase());

  useEffect(() => {
    if (hasLink) {
      setUrl(hasLink);
      setShowPreview(replyToMessage ? false : true);
    } else {
      setShowPreview(false);
      setOpenGraphData(null);
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLink, text]);

  const fetchData = useCallback(async () => {
    if (url) {
      setOpenGraphData(null);
      setLoading(true);
      try {
        const dataPromise = OpenGraphParser.extractMeta(url);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 2000),
        );
        const data = await Promise.race([dataPromise, timeoutPromise]);
        setOpenGraphData(data[0]);
      } catch (error) {
        console.log('Error fetching Open Graph data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    const debouncedFetchData = debounce(fetchData, 1000);
    if (url && !openGraphData) {
      debouncedFetchData();
    } else if (
      openGraphData &&
      openGraphData.url.toLowerCase() !== url.toLowerCase()
    ) {
      debouncedFetchData();
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [hasLink, url, openGraphData, fetchData]);

  const onLinkSend = () => {
    if (
      showPreview &&
      openGraphData &&
      (openGraphData.title ||
        openGraphData.description ||
        openGraphData['og:title'] ||
        openGraphData['og:description'])
    ) {
      sendLinkText();
    } else {
      onButtonPress();
    }
  };

  useEffect(() => {
    //   to make the view disappear in 2 seconds
    const timer = setTimeout(() => {
      setOpenRecord(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [openRecord]);

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    audio,
    duration,
    onStartPlay,
    onStopPlayer,
    onStartRecord,
    onStopRecord,
    deleteRecording,
    setAudio,
    currentlyPlaying,
  } = useAudioPlayerContext();
  const [playTime, setPlayTime] = useState(formatDuration(duration));

  // sets isRecording as true and starts re cording
  const recordVoice = () => {
    setIsRecording(true);
    onStartRecord();
  };

  const debouncedRecordVoice = debounce(recordVoice, 300);

  useEffect(() => {
    setPlayTime(formatDuration(duration));
  }, [duration]);

  const onSendRecording = async () => {
    setIsSending(true);
    resetPlayer();
    //Android to iOS requires .mp4, as Android AAC will not play on iOS
    //iOS to Android requires .aac, as iOS .m4a/.mp4 won't play on Android.
    const ext = isIOS ? '.aac' : '.mp4';
    const fileName = generateRandomHexId() + ext;
    console.log('audio dir', audio);
    if (!audio) {
      throw new Error('No audio location');
    }
    const newData = {
      chatId,
      fileName: fileName,
      fileUri: await moveToTmp(audio, fileName),
      fileType: isIOS ? 'audio/aac' : 'audio/mp4',
      duration: duration,
    };
    onStopRecord();
    const sender = new SendMessage(chatId, ContentType.audioRecording, newData);
    await sender.send();

    setIsSending(false);
  };

  const resetPlayer = () => {
    setIsRecording(false);
    setHasRecorded(false);
    setProgress(0);
    setIsPlaying(false);
  };
  const {hasPermission, requestPermission} = useMicrophonePermission();

  const onButtonLongPress = async () => {
    // if text is entered, we dont need long press
    if (text.length > 0) {
      return;
    }
    // await checkAndGrantRecordingPermission(setIsRecordingPermissionGranted);
    if (!hasPermission) {
      await requestPermission();
      return;
    }
    if (hasPermission) {
      // if audio already exists, we dont need long press
      if (!isRecording && hasRecorded && audio) {
        return;
      }
      debouncedRecordVoice();
    }
  };

  const onButtonPressOut = async () => {
    if (text.length > 0) {
      return;
    }
    if (hasRecorded && !isRecording) {
      return;
    }
    if (audio) {
      onStopRecord();
    }
    setIsRecording(false);
    if (audio) {
      setHasRecorded(true);
    } else {
      setHasRecorded(false);
    }
  };

  const onButtonPress = async () => {
    try {
      if (text.length > 0) {
        setOpenRecord(false);
        sendText();
        return;
      } else if (audio) {
        onSendRecording();
        setAudio(null);
        deleteRecording();
      } else {
        setOpenRecord(true);
      }
    } catch (error) {
      console.log('send press error', error);
    }
  };

  const startPlay = () => {
    setIsPlaying(p => !p);
    onStartPlay(setProgress, setPlayTime);
  };

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    //If the active player changes
    if (currentlyPlaying) {
      //If the changed value is not the same as the message, it means that the message has to be reset.
      if (currentlyPlaying !== audio) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlyPlaying]);

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
    {
      assetName: 'CameraIcon',
      light: require('@assets/light/icons/media/Camera.svg').default,
      dark: require('@assets/dark/icons/media/Camera.svg').default,
    },
    {
      assetName: 'VideoIcon',
      light: require('@assets/light/icons/media/Video.svg').default,
      dark: require('@assets/dark/icons/media/Video.svg').default,
    },
    {
      assetName: 'FileIcon',
      light: require('@assets/light/icons/media/Files.svg').default,
      dark: require('@assets/dark/icons/media/Files.svg').default,
    },
    {
      assetName: 'ImageIcon',
      light: require('@assets/light/icons/media/Gallery.svg').default,
      dark: require('@assets/dark/icons/media/Gallery.svg').default,
    },
    {
      assetName: 'ContactIcon',
      light: require('@assets/light/icons/media/Contact.svg').default,
      dark: require('@assets/dark/icons/media/Contact.svg').default,
    },
    {
      assetName: 'PauseIcon',
      light: require('@assets/light/icons/voicenotes/Pause.svg').default,
      dark: require('@assets/dark/icons/voicenotes/Pause.svg').default,
    },
    {
      assetName: 'PlayIcon',
      light: require('@assets/light/icons/voicenotes/Play.svg').default,
      dark: require('@assets/dark/icons/voicenotes/Play.svg').default,
    },
    {
      assetName: 'DeleteIcon',
      light: require('@assets/light/icons/Delete.svg').default,
      dark: require('@assets/dark/icons/Delete.svg').default,
    },
    {
      assetName: 'MicrophoneIcon',
      light: require('@assets/icons/MicrophoneFilled.svg').default,
      dark: require('@assets/icons/MicrophoneFilled.svg').default,
    },
    {
      assetName: 'SendIcon',
      light: require('@assets/icons/navigation/WhiteArrowUp.svg').default,
      dark: require('@assets/icons/navigation/WhiteArrowUp.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const PlusIcon = results.PlusIcon;
  const CameraIcon = results.CameraIcon;
  const VideoIcon = results.VideoIcon;
  const FileIcon = results.FileIcon;
  const ImageIcon = results.ImageIcon;
  const ContactIcon = results.ContactIcon;
  const DeleteIcon = results.DeleteIcon;
  const PauseIcon = results.PauseIcon;
  const PlayIcon = results.PlayIcon;
  const MicrophoneIcon = results.MicrophoneIcon;
  const SendIcon = results.SendIcon;

  return (
    <View style={{flexDirection: 'column'}}>
      <View style={styles.textInputContainer}>
        {openRecord && (
          <View style={styles.recordingmodal}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}>
              Hold to record
            </NumberlessText>
          </View>
        )}

        <View
          style={StyleSheet.compose(
            styles.textInput,
            replyToMessage
              ? {
                  flexDirection: 'column',
                  flex: 1,
                  marginRight: 4,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }
              : {
                  flexDirection: 'column',
                  flex: 1,
                  marginRight: 4,
                },
          )}>
          {replyToMessage && (
            <View style={styles.replyContainer}>
              <View style={styles.replyContainerStyle}>
                <ReplyBubbleMessageBar
                  replyTo={replyToMessage}
                  isGroupChat={isGroupChat}
                />
              </View>
              <Pressable
                onPress={clearEverything}
                hitSlop={24}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  borderRadius: 12,
                  backgroundColor: Colors.primary.surface,
                }}>
                <PlusIcon
                  height={18}
                  width={18}
                  style={{transform: [{rotate: '45deg'}], height: 6, width: 6}}
                />
              </Pressable>
            </View>
          )}

          {url && (
            <LinkPreview
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              link={url}
              loading={loading}
              data={openGraphData}
            />
          )}

          {/* this is the case where audio is being recorded */}
          {isRecording && !hasRecorded && (
            <View style={styles.whilerecordingbar}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <BlinkingDot />
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  style={{color: '#C9C9C9', marginLeft: 8, marginRight: 20}}>
                  Recording
                </NumberlessText>

                <AmplitudeBars />
              </View>
              <NumberlessText
                style={{color: Colors.text.primary}}
                fontSizeType={FontSizeType.l}
                fontType={FontType.rg}>
                {formatDuration(duration)}
              </NumberlessText>
            </View>
          )}
          {/* this is the case where audio has been recorded */}
          {!isRecording && hasRecorded && audio && (
            <View style={styles.recordingbar}>
              {isPlaying ? (
                <Pressable
                  onPress={() => {
                    setIsPlaying(false);
                    onStopPlayer();
                  }}
                  hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}>
                  <PauseIcon style={{marginRight: 8}} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={startPlay}
                  hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}>
                  <PlayIcon style={{marginRight: 8}} />
                </Pressable>
              )}
              <ProgressBar progress={progress} setIsPlaying={setIsPlaying} />
              <NumberlessText
                style={{
                  color: Colors.text.subtitle,
                }}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                {playTime}
              </NumberlessText>

              <DeleteIcon
                style={{marginTop: -3, marginLeft: 3}}
                onPress={() => {
                  deleteRecording();
                  resetPlayer();
                  setAudio(null);
                }}
              />
            </View>
          )}
          {/* this is the case where audio recording doesnt exist */}
          {!isRecording && !hasRecorded && (
            <View
              style={StyleSheet.compose(
                styles.textInput,
                replyToMessage
                  ? {
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                    }
                  : {},
              )}>
              <Animated.View style={[styles.plus, animatedStyle]}>
                <Pressable onPress={togglePopUp}>
                  <PlusIcon height={24} width={24} />
                </Pressable>
              </Animated.View>

              <View style={styles.textBox}>
                <TextInput
                  style={styles.inputText}
                  ref={inputRef}
                  textAlign="left"
                  multiline
                  placeholder={isFocused ? '' : 'Type your message here'}
                  placeholderTextColor={Colors.primary.mediumgrey}
                  onChangeText={onChangeText}
                  value={text}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>
          )}
          {/* this is the case where audio button is clicked for less than a second */}
          {!isRecording && hasRecorded && audio === null && (
            <View
              style={StyleSheet.compose(
                styles.textInput,
                replyToMessage
                  ? {borderTopLeftRadius: 0, borderTopRightRadius: 0}
                  : {},
              )}>
              <Animated.View style={[styles.plus, animatedStyle]}>
                <Pressable onPress={togglePopUp}>
                  <PlusIcon height={24} width={24} />
                </Pressable>
              </Animated.View>

              <View style={styles.textBox}>
                <TextInput
                  style={styles.inputText}
                  ref={inputRef}
                  textAlign="left"
                  multiline
                  placeholder={isFocused ? '' : 'Type your message here'}
                  placeholderTextColor={Colors.primary.mediumgrey}
                  onChangeText={onChangeText}
                  value={text}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>
          )}
        </View>
        <GenericButton
          iconSizeRight={
            text.length > 0 || (!isRecording && hasRecorded && audio) ? 14 : 20
          }
          buttonStyle={
            isRecording
              ? styles.recording
              : isSending
              ? StyleSheet.compose(styles.send, {paddingTop: 18})
              : styles.send
          }
          IconRight={
            text.length > 0 || (!isRecording && hasRecorded && audio)
              ? SendIcon
              : MicrophoneIcon
          }
          loading={isSending}
          onLongPress={onButtonLongPress}
          onPressOut={onButtonPressOut}
          onPress={onLinkSend}
        />
      </View>
      {isPopUpVisible && (
        <View style={styles.popUpContainer}>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionBox}
              onPress={() => {
                navigation.navigate('CaptureMedia', {
                  chatId: chatId,
                  isGroupChat: isGroupChat,
                });
                togglePopUp();
              }}>
              <CameraIcon />
            </Pressable>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Camera
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onImagePressed}>
              <ImageIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              textColor={Colors.text.primary}
              fontType={FontType.rg}>
              Images
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onVideoPressed}>
              <VideoIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              textColor={Colors.text.primary}
              fontType={FontType.rg}>
              Videos
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onFilePressed}>
              <FileIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              textColor={Colors.text.primary}
              fontType={FontType.rg}>
              Files
            </NumberlessText>
          </View>
          {!isGroupChat && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={() => {
                  togglePopUp();
                  navigation.navigate('ShareContact', {chatId: chatId});
                }}>
                <ContactIcon />
              </Pressable>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                textColor={Colors.text.primary}
                style={{textAlign: 'center'}}
                fontType={FontType.rg}>
                Contact
              </NumberlessText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    popUpContainer: {
      flexDirection: 'row',
      paddingTop: 20,
      flexWrap: 'wrap',
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      justifyContent: 'space-between',
      marginHorizontal: 10,
    },
    textInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginHorizontal: PortSpacing.tertiary.uniform,
      paddingBottom: PortSpacing.tertiary.bottom,
    },
    replyContainerStyle: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: 12,
      minHeight: PortSpacing.primary.uniform,
      backgroundColor: colors.primary.background,
    },
    replyContainer: {
      width: '100%',
      paddingHorizontal: 4,
      paddingTop: 4,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
    },
    textInput: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      borderRadius: 20,
      alignItems: 'center',
    },
    recordingbar: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      width: screen.width - 63,
      borderRadius: 24,
      height: 40,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    whilerecordingbar: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      width: screen.width - 73,
      borderRadius: 24,
      height: 40,
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },

    recordingmodal: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#D8CCF9',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: 70,
      left: screen.width / 2 - 70,
    },
    plus: {
      width: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    send: {
      width: 40,
      height: 40,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button.black,
    },
    recording: {
      width: 50,
      height: 50,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button.black,
    },
    textBox: {
      width: MESSAGE_INPUT_TEXT_WIDTH,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    inputText: {
      width: '97%',
      maxHeight: 110,
      height: undefined,
      minHeight: 40,
      color: colors.text.primary,
      //Remove additional padding on Android
      ...(!isIOS && {paddingBottom: 0, paddingTop: 0}),
      overflow: 'hidden',
      alignSelf: 'stretch',
      paddingRight: 5,
      borderRadius: 0,
      justifyContent: 'center',
      backgroundColor: colors.primary.surface,
      fontFamily: FontType.rg,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
      ...(isIOS && {paddingTop: 9}),
    },
    optionContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: 70,
      height: 100,
    },
    optionBox: {
      width: 60,
      height: 60,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      backgroundColor: colors.primary.surface2,
    },
  });

export default memo(MessageBar);
