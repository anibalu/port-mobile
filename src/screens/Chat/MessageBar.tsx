import {PortSpacing} from '@components/ComponentUtils';
import {ReplyBubbleMessageBar} from '@components/MessageBubbles/ReplyBubble';
import {generateRandomHexId} from '@utils/IdGenerator';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType, LinkParams} from '@utils/Messaging/interfaces';
import {downloadImageToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
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
  View,
  ViewStyle,
} from 'react-native';

import {OpenGraphParser} from 'react-native-opengraph-kit';
import {extractLink} from '@components/MessageBubbles/BubbleUtils';
import LinkPreview from './LinkPreview';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import PopUpActions from './MessageBarComponents/PopUpActions';
import VoiceRecorder from './MessageBarComponents/VoiceRecorder';
import TextComponent from './MessageBarComponents/TextComponent';

const MessageBar = (): ReactNode => {
  const {chatId, isGroupChat, replyToMessage, clearEverything} =
    useChatContext();
  const {MessageDataTooBigError} = useErrorModal();

  const [text, setText] = useState('');

  const [openGraphData, setOpenGraphData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<boolean>(
    replyToMessage ? false : true,
  );

  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (replyToMessage) {
      setShowPreview(false);
    }
    if (inputRef?.current && replyToMessage != undefined) {
      inputRef.current.focus();
    }
  }, [replyToMessage]);
  const rotationValue = useRef(new Animated.Value(0)).current;

  // Interpolate the rotation value to determine the degree of rotation
  const rotateInterpolation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // to toggle between whether popupbar is shown or not
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
  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{rotate: rotateInterpolation}],
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

  const onPressSend = () => {
    // if link is present in text
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
      // if its a normal text
      sendText();
    }
  };

  // to track if microphone was clicked, to render between audio recording bar or text bar
  const [microphoneClicked, setMicrophoneClicked] = useState(false);

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const PlusIcon = results.PlusIcon;

  return (
    <View style={{flexDirection: 'column'}}>
      <View style={styles.textInputContainer}>
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
                <ReplyBubbleMessageBar replyTo={replyToMessage} />
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

          {microphoneClicked ? (
            <VoiceRecorder
              chatId={chatId}
              setMicrophoneClicked={setMicrophoneClicked}
            />
          ) : (
            <TextComponent
              togglePopUp={togglePopUp}
              replyToMessage={replyToMessage}
              animatedStyle={animatedStyle}
              setText={setText}
              text={text}
              inputRef={inputRef}
              onPressSend={onPressSend}
              setMicrophoneClicked={setMicrophoneClicked}
            />
          )}
        </View>
      </View>
      {isPopUpVisible && (
        <PopUpActions
          chatId={chatId}
          togglePopUp={togglePopUp}
          isGroupChat={isGroupChat}
        />
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    textInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginLeft: PortSpacing.tertiary.uniform,
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
    textInput: {},
  });

export default memo(MessageBar);
