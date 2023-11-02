import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  FlatList,
  ImageBackground,
  View,
} from 'react-native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import DirectMessageBubble from './DirectMessageBubble';
import Topbar from './Topbar';
import {MessageBar} from './MessageBar';
import store from '../../store/appStore';
import {checkDateBoundary} from '../../utils/Time';
import {SavedMessageParams} from '../../utils/Messaging/interfaces';
import {getConnection, toggleRead} from '../../utils/Connections';
import {readMessages} from '../../utils/Storage/messages';
import {MessageActionsBar} from './MessageActionsBar';
import DeleteChatButton from '../../components/DeleteChatButton';

/**
 * Renders a chat screen.
 * @returns Component for rendered chat window
 */
function DirectChat() {
  const route = useRoute();
  //gets lineId of chat
  const {chatId} = route.params;

  //render function to display message bubbles
  function renderMessage(message: SavedMessageParams) {
    return (
      <DirectMessageBubble
        message={message}
        selected={selectedMessages}
        handlePress={handleMessageBubbleShortPress}
        handleLongPress={handleMessageBubbleLongPress}
      />
    );
  }
  //Name to be displayed in topbar
  const [name, setName] = useState('');
  const [messages, setMessages] = useState<Array<SavedMessageParams>>([]);
  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  // Track whether the connection is disconnected
  const [connectionConnected, setConnectionConnected] = useState(true);
  //handles selecting messages
  const handleMessageBubbleLongPress = (messageId: string) => {
    //adds messageId to selected messages on long press
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };
  const handleMessageBubbleShortPress = (messageId: string) => {
    // removes messageId from selected messages on short press
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(
        selectedMessages.filter(
          selectedMessageId => selectedMessageId !== messageId,
        ),
      );
    } else {
      //makes short press select a message if atleast one message is already selected.
      if (selectedMessages.length >= 1) {
        setSelectedMessages([...selectedMessages, messageId]);
      }
    }
  };
  //function that returns a date boundary added array.
  const dateParse = (messageArray: Array<SavedMessageParams>) => {
    return messageArray.map((element, index, array) => {
      if (index === 0) {
        let newItem = element;
        newItem.isDateBoundary = true;
        return newItem;
      } else {
        let newItem = element;
        newItem.isDateBoundary = checkDateBoundary(
          element.timestamp,
          array[index - 1].timestamp,
        );
        return newItem;
      }
    });
  };
  //effect runs when screen is focused
  //retrieves name of connection
  //toggles messages as read
  //reads intial messages from messages storage.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const connection = await getConnection(chatId);
        //set connection name
        setName(connection.name);
        //sets connection connected state
        setConnectionConnected(!connection.disconnected);
        //toggle chat as read
        await toggleRead(chatId);
        //set saved messages and do a date parse
        setMessages(dateParse(await readMessages(chatId)));
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  //sets up a subscriber to the message store when screen is focused.
  //subscriber runs every time a new message is sent or recieved.
  //chat is automatically toggled as read.
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = store.subscribe(async () => {
        //set latest messages
        setMessages(dateParse(await readMessages(chatId)));
        //toggle chat as read
        await toggleRead(chatId);
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Topbar
        name={name}
        chatId={chatId}
        selectedMessages={selectedMessages}
        setSelectedMessages={setSelectedMessages}
      />
      {/* TODO: Refactor this to follow the correct structure when directMessageContent is refactored */}
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
      {connectionConnected ? (
        <View style={styles.bottomBar}>
          {selectedMessages.length > 0 ? (
            <MessageActionsBar
              chatId={chatId}
              selectedMessages={selectedMessages}
            />
          ) : (
            <MessageBar
              chatId={chatId}
              flatlistRef={flatList}
              listLen={messages.length}
            />
          )}
        </View>
      ) : (
        <DeleteChatButton chatId={chatId} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
  chatBubble: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bottomBar: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default DirectChat;
