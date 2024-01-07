/**
 * Default chat tile displayed when there are no connections
 */
import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {deleteConnection} from '@utils/Connections';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {getReadableTimestamp} from '@utils/Time';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

const handleDelete = async (chatId: string): Promise<void> => {
  deleteConnection(chatId);
};

function PendingChatTile(props: ConnectionInfo): ReactNode {
  return (
    <Pressable style={styles.tile} onPress={() => {}}>
      <GenericAvatar profileUri={'avatar://2'} avatarSize="small" />
      <View style={styles.text}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.name && props.name !== '' ? props.name : 'New Contact'}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          style={{marginTop: 2}}
          textColor={PortColors.text.secondary}>
          {getReadableTimestamp(props.timestamp)}
        </NumberlessText>

        <NumberlessText
          ellipsizeMode="tail"
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          style={{marginTop: 2}}
          textColor={PortColors.text.title}>
          {props.chatId.substring(0, 9) === 'linkId://'
            ? 'Pending Handshake'
            : 'Pending Authentication'}
        </NumberlessText>
      </View>
      <Pressable
        style={styles.metadata}
        onPress={() => handleDelete(props.chatId)}>
        <NumberlessText
          style={{
            marginHorizontal: 6,
            marginRight: 12,
            paddingHorizontal: 8,
            borderRadius: 4,
            backgroundColor: PortColors.primary.red.error,
            paddingVertical: 3,
          }}
          textColor={PortColors.text.primaryWhite}
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}>
          DELETE
        </NumberlessText>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingLeft: 15,
    paddingTop: 15,
  },
  text: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 19,
    alignContent: 'flex-start',
  },
  metadata: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    paddingLeft: 5,
  },
});

export default PendingChatTile;
