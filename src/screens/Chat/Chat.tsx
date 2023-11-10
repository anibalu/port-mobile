import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  View,
  Image,
} from 'react-native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import Topbar from './Topbar';
import {MessageBar} from './MessageBar';
import store from '../../store/appStore';
import {SavedMessageParams} from '../../utils/Messaging/interfaces';
import {getConnection, toggleRead} from '../../utils/Connections';
import {readMessages} from '../../utils/Storage/messages';
import {MessageActionsBar} from './MessageActionsBar';
import DeleteChatButton from '../../components/DeleteChatButton';
import {ConnectionType} from '../../utils/Connections/interfaces';
import {getGroupInfo} from '../../utils/Storage/group';
import ChatList from './ChatList';
import DefaultImage from '../../../assets/avatars/avatar.png';

/**
 * Renders a chat screen.
 * @returns Component for rendered chat window
 */
function Chat() {
  const route = useRoute();
  //gets lineId of chat
  const {chatId} = route.params;
  //Name to be displayed in topbar
  const [name, setName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState({});
  const [messages, setMessages] = useState<Array<SavedMessageParams>>([]);
  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  // Track whether the connection is disconnected
  const [connectionConnected, setConnectionConnected] = useState(true);
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );

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
  //effect runs when screen is focused
  //retrieves name of connection
  //toggles messages as read
  //reads intial messages from messages storage.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const connection = await getConnection(chatId);
        if (connection.pathToDisplayPic && connection.pathToDisplayPic !== '') {
          setProfileURI(`file://${connection.pathToDisplayPic}`);
        }
        //set connection name
        setName(connection.name);
        if (connection.connectionType === ConnectionType.group) {
          setIsGroupChat(true);
          setGroupInfo(await getGroupInfo(chatId));
        }
        //sets connection connected state
        setConnectionConnected(!connection.disconnected);
        //toggle chat as read
        await toggleRead(chatId);
        //set saved messages
        setMessages(await readMessages(chatId));
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
        if (isGroupChat) {
          setGroupInfo(await getGroupInfo(chatId));
        }
        setMessages(await readMessages(chatId));
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
        profileURI={profileURI}
        selectedMessages={selectedMessages}
        setSelectedMessages={setSelectedMessages}
        isGroupChat={isGroupChat}
      />
      <ChatList
        messages={messages}
        flatList={flatList}
        selectedMessages={selectedMessages}
        handlePress={handleMessageBubbleShortPress}
        handleLongPress={handleMessageBubbleLongPress}
        isGroupChat={isGroupChat}
        groupInfo={groupInfo}
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
              isGroupChat={isGroupChat}
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

export default Chat;
