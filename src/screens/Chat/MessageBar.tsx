import {PortSpacing, screen} from '@components/ComponentUtils';
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
  useMemo,
  useRef,
  useState,
} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {OpenGraphParser} from 'react-native-opengraph-kit';
import {extractLink} from '@components/MessageBubbles/BubbleUtils';
import LinkPreview from './LinkPreview';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import VoiceRecorder from './MessageBarComponents/VoiceRecorder';
import TextComponent from './MessageBarComponents/TextComponent';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MessageBar = ({
  ifTemplateExists,
}: {
  ifTemplateExists?: TemplateParams; //if template is selected from templates screen
}): ReactNode => {
  const {chatId, isGroupChat, replyToMessage, clearEverything} =
    useChatContext();
  const {MessageDataTooBigError} = useErrorModal();

  const [text, setText] = useState('');

  // this runs if a template exists.
  // If a template has been selected, we want to populate message bar
  // with it and allow the user to edit it if need be.
  useMemo(() => {
    if (ifTemplateExists) {
      setText(ifTemplateExists.template);
    }
  }, [ifTemplateExists]);

  const [openGraphData, setOpenGraphData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<boolean>(
    replyToMessage ? false : true,
  );

  const inputRef = useRef(null);

  useEffect(() => {
    if (replyToMessage) {
      setShowPreview(false);
    }
    if (inputRef?.current && replyToMessage != undefined) {
      inputRef.current.focus();
    }
  }, [replyToMessage]);

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
    if (!replyToMessage) {
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
    }
  }, [hasLink, url, openGraphData, fetchData, replyToMessage]);

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

  // animation for sliding in
  // of voice recorder component
  const slideAnim = useSharedValue(screen.width);

  const slideInStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: slideAnim.value}],
    };
  });

  //
  useEffect(() => {
    if (microphoneClicked) {
      slideAnim.value = withTiming(0);
    } else {
      slideAnim.value = withTiming(screen.width);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneClicked]);
  const [emojiSelected, setEmojiSelected] = useState('');
  // to render emojis in text input correctly
  const [counter, setCounter] = useState(0);
  useMemo(() => {
    // if emoji is selected,
    // add it to text
    if (emojiSelected) {
      setText(text + emojiSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  return (
    <View>
      <View style={styles.textInputContainer}>
        <View>
          {replyToMessage && (
            <View style={styles.topElementWrapper}>
              <ReplyBubbleMessageBar replyTo={replyToMessage} />
              <Pressable
                onPress={clearEverything}
                hitSlop={24}
                style={styles.buttonWrapper}>
                <PlusIcon height={18} width={18} style={styles.plus} />
              </Pressable>
            </View>
          )}

          {!replyToMessage && showPreview && (
            <View style={styles.topElementWrapper}>
              <View style={styles.linkPreviewWrapper}>
                <LinkPreview
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  link={url}
                  loading={loading}
                  data={openGraphData}
                />
              </View>
            </View>
          )}

          {microphoneClicked ? (
            <Animated.View
              style={[styles.voiceRecorderContainer, slideInStyle]}>
              <VoiceRecorder
                chatId={chatId}
                setMicrophoneClicked={setMicrophoneClicked}
              />
            </Animated.View>
          ) : (
            <TextComponent
              chatId={chatId}
              isGroupChat={isGroupChat}
              replyToMessage={replyToMessage}
              setText={setText}
              text={text}
              inputRef={inputRef}
              onPressSend={onPressSend}
              setMicrophoneClicked={setMicrophoneClicked}
              showPreview={showPreview}
              setCounter={setCounter}
              setEmojiSelected={setEmojiSelected}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    textInputContainer: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      width: '100%',
      paddingTop: PortSpacing.tertiary.top,
      paddingBottom: PortSpacing.secondary.bottom,
      alignItems: 'center',
      borderTopColor: colors.primary.stroke,
      borderTopWidth: 1,
    },
    topElementWrapper: {
      marginLeft: PortSpacing.secondary.left,
      backgroundColor: colors.primary.surface2,
      paddingHorizontal: 8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      width: screen.width - 70,
      paddingTop: 8,
    },
    linkPreviewWrapper: {
      backgroundColor: colors.primary.background,
      borderRadius: 16,
    },
    buttonWrapper: {
      position: 'absolute',
      top: 12,
      right: 12,
      borderRadius: 12,
      backgroundColor: colors.primary.surface,
    },
    plus: {
      transform: [{rotate: '45deg'}],
      height: 6,
      width: 6,
    },
    voiceRecorderContainer: {
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
    },
  });

export default memo(MessageBar);
