/**
 * Default chat tile displayed when there are no connections
 */
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {deleteGeneratedDirectConnectionBundle} from '@utils/Bundles/direct';
import {deleteConnection} from '@utils/Connections';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {getChatTileTimestamp} from '@utils/Time';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

const handleDelete = async (chatId: string) => {
  if (chatId.substring(0, 9) === 'linkId://') {
    const linkId = chatId.substring(9);
    await deleteGeneratedDirectConnectionBundle(linkId);
  } else {
    deleteConnection(chatId);
  }
};

function PendingChatTile(props: ConnectionInfo) {
  return (
    <Pressable style={styles.tile} onPress={() => {}}>
      <View style={styles.dpBox}>
        <GenericAvatar profileUri={'avatar://2'} avatarSize="small" />
      </View>
      <View style={styles.text}>
        <NumberlessSemiBoldText
          style={styles.nickname}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.name && props.name !== ''
            ? getChatTileTimestamp(props.timestamp) + ': ' + props.name
            : getChatTileTimestamp(props.timestamp) + ': ' + 'New Contact'}
        </NumberlessSemiBoldText>
        <NumberlessRegularText
          style={styles.content}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.chatId.substring(0, 9) === 'linkId://'
            ? 'Pending Handshake'
            : 'Pending Authentication'}
        </NumberlessRegularText>
      </View>
      <Pressable
        style={styles.metadata}
        onPress={() => handleDelete(props.chatId)}>
        <View style={styles.disconnectedBox}>
          <NumberlessMediumText style={styles.disconnectedText}>
            Delete
          </NumberlessMediumText>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: screen.width - 20,
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: '#FFF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingTop: 15,
  },
  newMessage: {
    backgroundColor: '#FFF',
  },
  dpBox: {
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectedText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#FFF',
    backgroundColor: PortColors.primary.red.error,
    padding: 10,
    borderRadius: 5,
  },
  newMessageContent: {
    color: PortColors.primary.grey.dark,
  },
  text: {
    width: screen.width - 20 - 80 - 100,
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  nickname: {
    ...FontSizes[15].medium,
    color: PortColors.primary.grey.dark,
    marginBottom: 3,
  },
  content: {
    ...FontSizes[12].medium,
    color: PortColors.primary.blue.app,
  },
  metadata: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 100,
    height: 50,
  },
  dateAndStatusBox: {
    maxWidth: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  disconnectedBox: {
    maxWidth: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
});

export default PendingChatTile;
