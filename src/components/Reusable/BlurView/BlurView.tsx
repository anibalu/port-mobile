import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import BubbleFocusOptions from '@components/MessageBubbles/BubbleFocusOptions';
import {MessageBubble} from '@components/MessageBubbles/MessageBubble';
import {RenderReactionBar} from '@components/MessageBubbles/Reactions';

import MessageBar from '@screens/Chat/MessageBar';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {useSelectionContext} from '@screens/DirectChat/ChatContexts/SelectedMessages';

import {
  ContentType,
  UnReactableMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {wait} from '@utils/Time';

const BlurViewModal = () => {
  const {
    onCleanCloseFocus,
    isConnected,
    messageToEdit,
    setMessageToEdit,
    setText,
  } = useChatContext();
  const {selectedMessages, selectedMessageLayout, setSelectedMessages} =
    useSelectionContext();
  const messageObj = selectedMessages[0];
  const isDeleted = messageObj.contentType === ContentType.deleted;

  const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
  const TOPBAR_HEIGHT = 68;
  const REACTIONBAR_HEIGHT = isDeleted ? 0 : TOPBAR_HEIGHT;
  const TOP_OFFSET_INITIAL =
    STATUSBAR_HEIGHT + TOPBAR_HEIGHT + REACTIONBAR_HEIGHT;
  const TOP_OFFSET = isIOS ? TOP_OFFSET_INITIAL + 50 : TOP_OFFSET_INITIAL;

  const height = selectedMessageLayout.height;
  const yOffset = selectedMessageLayout.y;
  const AVAILABLE_HEIGHT_FOR_OPTIONS = screen.height - TOP_OFFSET - height;
  const OPTION_BUBBLE_HEIGHT = isIOS
    ? isDeleted
      ? 130
      : 355
    : isDeleted
    ? 140
    : 375;
  const AVAILABLE_HEIGHT = screen.height - TOPBAR_HEIGHT;
  const REQUIRED_HEIGHT = REACTIONBAR_HEIGHT + OPTION_BUBBLE_HEIGHT + height;

  const message = messageObj;
  const isSender = message.sender;
  const INITIAL_VALUE = yOffset;
  const positionY = useRef(new Animated.Value(INITIAL_VALUE)).current;

  const initialStyle = {
    transform: [{translateY: positionY}],
  };
  const [showOptions, setShowOptions] = useState(false);
  const insets = useSafeAreaInsets();

  useMemo(() => {
    if (messageToEdit) {
      setShowOptions(false);
    }
  }, [messageToEdit]);

  useEffect(() => {
    let newPositionY = 0;
    if (INITIAL_VALUE < TOP_OFFSET) {
      newPositionY = TOP_OFFSET;
    } else {
      if (AVAILABLE_HEIGHT > REQUIRED_HEIGHT) {
        if (
          INITIAL_VALUE <
          screen.height + STATUSBAR_HEIGHT - OPTION_BUBBLE_HEIGHT - height
        ) {
          newPositionY = INITIAL_VALUE;
          setShowOptions(true);
        } else {
          newPositionY =
            screen.height + STATUSBAR_HEIGHT - OPTION_BUBBLE_HEIGHT - height;
        }
      } else {
        newPositionY = TOP_OFFSET;
      }
    }

    Animated.timing(positionY, {
      toValue: newPositionY,
      duration: 200,
      useNativeDriver: true,
    }).start();
    wait(200).then(() => setShowOptions(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        onCleanCloseFocus();
        setMessageToEdit(null);
        setText('');
        setSelectedMessages([]);
      }}
      style={{
        ...styles.mainContainer,
        width: screen.width,
        height: isIOS ? screen.height : screen.height + insets.top,
      }}>
      {!isIOS && <CustomStatusBar backgroundColor="#00000000" />}
      {messageToEdit && (
        <View
          style={{
            flex: 1,
            marginBottom: PortSpacing.secondary.bottom,
          }}>
          {isIOS ? (
            <KeyboardAvoidingView
              style={styles.main}
              behavior={isIOS ? 'padding' : 'height'}
              keyboardVerticalOffset={isIOS ? PortSpacing.secondary.bottom : 0}>
              <View
                style={{
                  marginLeft: PortSpacing.secondary.left,
                }}>
                <MessageBubble
                  message={message}
                  handleLongPress={() => {}}
                  swipeable={false}
                  selected={false}
                />

                <View
                  style={{
                    width: screen.width,
                    marginLeft: -PortSpacing.secondary.left,
                  }}>
                  <MessageBar />
                </View>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.main}>
              <View
                style={{
                  marginLeft: PortSpacing.secondary.left,
                }}>
                <MessageBubble
                  message={message}
                  handleLongPress={() => {}}
                  swipeable={false}
                  selected={false}
                />

                <View
                  style={{
                    width: screen.width,
                    marginLeft: -PortSpacing.secondary.left,
                  }}>
                  <MessageBar />
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {!messageToEdit && showOptions && (
        <Animated.View style={initialStyle}>
          <View
            style={{
              marginLeft: PortSpacing.secondary.left,
            }}>
            <MessageBubble
              message={message}
              handleLongPress={() => {}}
              swipeable={false}
              selected={false}
            />
          </View>
          <View style={{position: 'absolute', width: '100%'}}>
            <View
              style={{
                marginHorizontal: PortSpacing.secondary.uniform,
                marginTop: -TOPBAR_HEIGHT + 6,
                minHeight: TOPBAR_HEIGHT,
                alignSelf: isSender ? 'flex-end' : 'flex-start',
              }}>
              {!UnReactableMessageContentTypes.includes(message.contentType) &&
                isConnected &&
                message.contentType !== ContentType.deleted && (
                  <RenderReactionBar />
                )}
            </View>
            <View
              style={{
                marginTop:
                  AVAILABLE_HEIGHT_FOR_OPTIONS > OPTION_BUBBLE_HEIGHT
                    ? height
                    : screen.height -
                      STATUSBAR_HEIGHT -
                      TOPBAR_HEIGHT -
                      REACTIONBAR_HEIGHT -
                      OPTION_BUBBLE_HEIGHT,
                paddingHorizontal: PortSpacing.secondary.uniform,
                alignSelf: isSender ? 'flex-end' : 'flex-start',
              }}>
              <BubbleFocusOptions />
            </View>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000BF',
  },
  main: {
    flex: 1,
    width: screen.width,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
export default BlurViewModal;
