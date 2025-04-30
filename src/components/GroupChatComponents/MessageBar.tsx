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

import {debounce} from 'lodash';
import {OpenGraphParser} from 'react-native-opengraph-kit';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {extractLink} from '@components/GroupMessageBubbles/BubbleUtils';
import {ReplyBubbleMessageBar} from '@components/GroupMessageBubbles/ReplyBubble';
import { Spacing, Width } from '@components/spacingGuide';

import {useChatContext} from '@screens/GroupChat/ChatContext';
import {
  GroupMessageBarActionsType,
  useMessageBarActionsContext,
} from '@screens/GroupChat/ChatContexts/GroupMessageBarActions';

import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType, LinkParams} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import {downloadImageToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {ToastType, useToast} from 'src/context/ToastContext';

import LinkPreview from './LinkPreview';
import TextComponent from './MessageBarComponents/TextComponent';
import VoiceRecorder from './MessageBarComponents/VoiceRecorder';

const MessageBar = ({
  ifTemplateExists,
}: {
  ifTemplateExists?: TemplateParams; //if template is selected from templates screen
}): ReactNode => {
  const {
    chatId,
    replyToMessage,
    setReplyToMessage,
    clearEverything,
    text,
    setText,
    setMessageToEdit,
    messageToEdit,
  } = useChatContext();
  const {showToast} = useToast();

  const {messageBarAction, dispatchMessageBarAction} =
    useMessageBarActionsContext();

  useEffect(() => {
    if (GroupMessageBarActionsType.None === messageBarAction.action) {
      return;
    }
    if (GroupMessageBarActionsType.Reply === messageBarAction.action) {
      setReplyToMessage(messageBarAction.message);
    }
    if (GroupMessageBarActionsType.Edit === messageBarAction.action) {
      // TODO: remove this dependence on pageY and height when it definitely doesn't need it
      setMessageToEdit({
        message: messageBarAction.message,
        pageY: 0,
        height: 0,
      });
    }
    // Reset the message action since it has been consumed
    dispatchMessageBarAction({action: GroupMessageBarActionsType.None});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageBarAction]);

  // this runs if a template exists.
  // If a template has been selected, we want to populate message bar
  // with it and allow the user to edit it if need be.
  useMemo(() => {
    if (ifTemplateExists) {
      setText(ifTemplateExists.template);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const onSendEditedMessagee = async () => {
    const processedText = text.trim();
    if (processedText !== '') {
      setText('');
      //send text message
      clearEverything();
      const sender = new SendMessage(chatId, ContentType.editedMessage, {
        editedText: processedText,
        messageIdToEdit: messageToEdit?.message.messageId,
      });
      try {
        await sender.send();
        setMessageToEdit(null);
        setText('');
      } catch (error) {
        showToast('Your message was too long', ToastType.error);
      }
    }
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
        showToast('Your message was too long', ToastType.error);
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
      // if its an edited message
      if (messageToEdit?.message) {
        onSendEditedMessagee();
      } else {
        // if its a normal text

        sendText();
      }
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


  useMemo(() => {
    // close microphone tab is reply bubble is visible
    if (replyToMessage) {
      setMicrophoneClicked(false);
    }
  }, [replyToMessage]);

  return (
    <View style={styles.textInputContainer}>
      <View>
        {replyToMessage && (
          <View style={styles.topElementWrapper}>
            <View style={styles.replyWrapper}>
              <ReplyBubbleMessageBar replyTo={replyToMessage} />
              <Pressable
                onPress={clearEverything}
                hitSlop={24}
                style={styles.buttonWrapper}>
                <PlusIcon height={18} width={18} style={styles.plus} />
              </Pressable>
            </View>
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

        {microphoneClicked && !messageToEdit && (
          <Animated.View style={[styles.voiceRecorderContainer, slideInStyle]}>
            <VoiceRecorder
              chatId={chatId}
              setMicrophoneClicked={setMicrophoneClicked}
            />
          </Animated.View>
        )}

        {!microphoneClicked && (
          <TextComponent
            chatId={chatId}
            replyToMessage={replyToMessage}
            setText={setText}
            text={text}
            inputRef={inputRef}
            onPressSend={onPressSend}
            setMicrophoneClicked={setMicrophoneClicked}
            showPreview={showPreview}
          />
        )}
      </View>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    textInputContainer: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      width: Width.screen,
      paddingTop: Spacing.s,
      paddingBottom: isIOS ? Spacing.xl : Spacing.l,
      alignItems: 'center',
      borderTopColor: colors.primary.stroke,
      borderTopWidth: 1,
    },
    topElementWrapper: {
      backgroundColor: colors.primary.surface2,
      paddingHorizontal: Spacing.xs,
      marginLeft: Spacing.s,
      marginRight: Spacing.s + 40 + Spacing.xs,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: Spacing.xs,
    },
    linkPreviewWrapper: {
      backgroundColor: colors.primary.background,
      borderRadius: 16,
    },
    buttonWrapper: {
      position: 'absolute',
      top: 6,
      right: 6,
      borderRadius: 12,
      backgroundColor: colors.primary.surface,
    },
    replyWrapper: {
      overflow: 'hidden',
      borderRadius: 16,
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
