import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {readDirectMessages} from '../../utils/messagefs';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {DirectMessageBubble} from './DirectMessageBubble';
import Topbar from './Topbar';
import {getConnectionAsync, toggleRead} from '../../utils/Connection';
import {MessageBar} from './MessageBar';
import {directMessageContent} from '../../utils/DirectMessaging';
import store from '../../store/appStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

//render function for the flatlist
function renderMessage(message: directMessageContent) {
  return (
    <DirectMessageBubble
      messageId={message.messageId}
      messageType={message.messageType}
      data={message.data}
      sender={message.sender}
      sent={message.sent}
      timestamp={message.timestamp}
    />
  );
}

function DirectChat() {
  const route = useRoute();
  //gets lineId of chat
  const {lineId} = route.params;

  //messages to be displayed
  const [messages, setMessages] = useState<Array<directMessageContent>>([]);
  //nickname to be displayed in topbar
  const [nickname, setNickname] = useState('');
  //counter to initiate redraw when a message is sent
  const [renderCount, setRenderCount] = useState(0);
  //state changer to initiate redraw when a new message is recieved
  const [latestMessage, setLatestMessage] = useState({});

  //Animation to support partial side swipe
  const pan = React.useRef(new Animated.ValueXY()).current;
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, {dx: pan.x}], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -50) {
            Animated.timing(pan, {
              toValue: {x: -65, y: 0},
              duration: 200,
              useNativeDriver: false,
            }).start();
          } else {
            Animated.timing(pan, {
              toValue: {x: 0, y: 0},
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  //effect runs every time a new message is sent or recieved or when screen is focused
  //reads messages from corresponding messages file.
  //toggles messages as read.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setMessages(await readDirectMessages(lineId));
        await toggleRead(lineId);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestMessage, renderCount]),
  );
  //effect runs when screen is focused
  //retrieves nickname from profile file
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const connection = await getConnectionAsync(lineId);
        setNickname(connection.nickname);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  //sets up a subscriber to the message store when screen is focused.
  //updates latest message to initiate redraw whenever new message is recieved.
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = store.subscribe(() => {
        setLatestMessage(store.getState().latestMessage);
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
    }, []),
  );
  //A reference to the flatlist that displays messages
  const flatList = React.useRef(null);
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Topbar nickname={nickname} />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateX: pan.x}],
          },
        ]}
        {...panResponder.panHandlers}>
        <FlatList
          data={messages}
          renderItem={element => renderMessage(element.item)}
          keyExtractor={message => message.messageId}
          ref={flatList}
          onContentSizeChange={() => {
            //initiates a scroll to the end when a new message is sent or recieved
            if (messages.length > 1) {
              flatList.current.scrollToEnd({animated: false});
            }
          }}
        />
      </Animated.View>
      <MessageBar
        flatlistRef={flatList}
        renderCount={renderCount}
        setRenderCount={setRenderCount}
        lineId={lineId}
        listLen={messages.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    width: SCREEN_WIDTH + 65,
    paddingLeft: 15,
  },
});

export default DirectChat;
