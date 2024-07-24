import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {
  SelectedMessageType,
  useChatContext,
} from '@screens/DirectChat/ChatContext';
import BubbleFocusOptions from '@components/MessageBubbles/BubbleFocusOptions';
import {RenderReactionBar} from '@components/MessageBubbles/Reactions';
import {MessageBubble} from '@components/MessageBubbles/MessageBubble';
import {wait} from '@utils/Time';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  ContentType,
  UnReactableMessageContentTypes,
} from '@utils/Messaging/interfaces';

const BlurViewModal = () => {
  const {onCleanCloseFocus, selectedMessage, isConnected} = useChatContext();
  const messageObj = selectedMessage as SelectedMessageType;
  const isDeleted = messageObj.message.contentType === ContentType.deleted;
  const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
  const TOPBAR_HEIGHT = 56;
  const REACTIONBAR_HEIGHT = isDeleted ? 0 : 56;
  const TOP_OFFSET_INITIAL =
    STATUSBAR_HEIGHT + TOPBAR_HEIGHT + REACTIONBAR_HEIGHT;
  const TOP_OFFSET = isIOS ? TOP_OFFSET_INITIAL + 50 : TOP_OFFSET_INITIAL;

  const AVAILABLE_HEIGHT_FOR_OPTIONS =
    screen.height - TOP_OFFSET - messageObj.height;
  const OPTION_BUBBLE_HEIGHT = isIOS
    ? isDeleted
      ? 130
      : 355
    : isDeleted
    ? 140
    : 375;
  const AVAILABLE_HEIGHT = screen.height - TOPBAR_HEIGHT;
  const REQUIRED_HEIGHT =
    REACTIONBAR_HEIGHT + OPTION_BUBBLE_HEIGHT + messageObj.height;

  const message = messageObj.message;
  const isSender = message.sender;
  //initial value is same as current location
  const INITIAL_VALUE = messageObj.pageY;
  const positionY = useRef(new Animated.Value(INITIAL_VALUE)).current;

  const initialStyle = {
    transform: [{translateY: positionY}],
  };
  const [showOptions, setShowOptions] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let newPositionY = 0;
    if (INITIAL_VALUE < TOP_OFFSET) {
      newPositionY = TOP_OFFSET;
    } else {
      //pageY is now a value between top offset and screen height.
      if (AVAILABLE_HEIGHT > REQUIRED_HEIGHT) {
        if (
          INITIAL_VALUE <
          screen.height +
            STATUSBAR_HEIGHT -
            OPTION_BUBBLE_HEIGHT -
            messageObj.height
        ) {
          //dont move
          newPositionY = INITIAL_VALUE;
          setShowOptions(true);
        } else {
          //move to new position
          newPositionY =
            screen.height +
            STATUSBAR_HEIGHT -
            OPTION_BUBBLE_HEIGHT -
            messageObj.height;
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
      onPress={onCleanCloseFocus}
      style={{
        ...styles.mainContainer,
        width: screen.width,
        height: isIOS ? screen.height : screen.height + insets.top,
      }}>
      {!isIOS && <CustomStatusBar backgroundColor="#00000000" />}
      <Animated.View style={initialStyle}>
        <View style={{marginLeft: PortSpacing.secondary.left}}>
          <MessageBubble
            message={message}
            handleLongPress={() => {}}
            swipeable={false}
          />
        </View>
        {showOptions && (
          <View style={{position: 'absolute', width: '100%'}}>
            <View
              style={{
                marginHorizontal: PortSpacing.secondary.uniform,
                marginTop: -56,
                minHeight: 56,
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
                    ? messageObj.height
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
        )}
      </Animated.View>
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
});

export default BlurViewModal;
