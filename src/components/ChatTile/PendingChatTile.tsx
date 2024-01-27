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
          ellipsizeMode="tail"
          numberOfLines={1}
          fontType={FontType.md}
          style={{
            flex: 1,
            alignSelf: 'stretch',
            marginTop: 6,
          }}
          fontSizeType={FontSizeType.m}
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
            backgroundColor: PortColors.primary.red.error,
            paddingHorizontal: 10,
            paddingVertical: 5,
            color: 'white',
            borderRadius: 4,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: 82,
  },
  text: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
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
