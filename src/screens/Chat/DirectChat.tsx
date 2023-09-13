import React, {useState} from 'react';
import {StyleSheet, StatusBar, FlatList, ImageBackground} from 'react-native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {readDirectMessages} from '../../utils/messagefs';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {DirectMessageBubble} from './DirectMessageBubble';
import Topbar from './Topbar';
import {getConnectionAsync, toggleRead} from '../../utils/Connection';
import {MessageBar} from './MessageBar';
import {directMessageContent} from '../../utils/MessageInterface';
import store from '../../store/appStore';

/**
 * Render function for flatlist, displays message bubbles.
 * @param {directMessageContent} message Message content to be displayed.
 * @param {string} lineId lineId of chat
 * @returns {JSX.Element} The message bubble, rendered according to message data.
 */
function renderMessage(message: directMessageContent, lineId: string) {
  return <DirectMessageBubble message={message} lineId={lineId} />;
}

/**
 * Renders a chat screen.
 * @returns Component for rendered chat window
 */
function DirectChat() {
  const route = useRoute();
  //gets lineId of chat
  const {lineId} = route.params;

  //messages to be displayed
  const [messages, setMessages] = useState<Array<directMessageContent>>([]);
  const addMessage = (newMessage: directMessageContent) => {
    setMessages([...messages, newMessage]);
  };
  //nickname to be displayed in topbar
  const [nickname, setNickname] = useState('');
  //counter to initiate redraw when a message is sent
  const [renderCount, setRenderCount] = useState(0);
  //state changer to initiate redraw when a new message is recieved
  const [latestMessage, setLatestMessage] = useState({});

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
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar nickname={nickname} lineId={lineId}/>
      {/* TODO: Refactor this to follow the correct structure when directMessageContent is refactored */}
      <FlatList
        data={messages.sort((a, b) =>
          a.data.timestamp < b.data.timestamp
            ? -1
            : a.data.timestamp > b.data.timestamp
            ? 1
            : 0,
        )}
        renderItem={element => renderMessage(element.item, lineId)}
        keyExtractor={message => message.messageId}
        ref={flatList}
        onContentSizeChange={() => {
          //initiates a scroll to the end when a new message is sent or recieved
          if (messages.length > 1) {
            flatList.current.scrollToEnd({animated: false});
          }
        }}
      />
      <MessageBar
        flatlistRef={flatList}
        addMessage={addMessage}
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
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#EEE',
    opacity: 0.5,
    overflow: 'hidden',
  },
});

export default DirectChat;
