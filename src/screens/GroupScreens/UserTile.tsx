/**
 * Default chat tile displayed when there are no connections
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  NumberlessBoldText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import Cross from '@assets/icons/cross.svg';
import {GroupMember} from '@utils/Groups/interfaces';
import {DEFAULT_NAME} from '@configs/constants';
import GenericModal from '@components/GenericModal';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {GenericAvatar} from '@components/GenericAvatar';
import {attemptRemoveMember} from '@utils/Groups';

function UserTile({
  member,
  groupId,
  isAdmin,
}: {
  member: GroupMember;
  groupId: string;
  isAdmin: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        style={styles.defaultTileContainer}
        onPress={() => setVisible(true)}>
        <GenericAvatar
          profileUri={
            member.profilePicture && member.profilePicture !== ''
              ? member.profilePicture
              : 'avatar://1'
          }
          avatarSize={'small'}
        />
        <NumberlessRegularText style={styles.defaultTileText} numberOfLines={1}>
          {member?.name ? member.name : DEFAULT_NAME}
        </NumberlessRegularText>
      </Pressable>
      <GenericModal
        onClose={() => setVisible(false)}
        visible={visible && isAdmin}>
        <View style={styles.modal}>
          <View style={styles.row}>
            <GenericAvatar
              profileUri={
                member.profilePicture ? member.profilePicture : 'avatar://1'
              }
              avatarSize={'small'}
            />
            <View style={styles.textColumn}>
              <NumberlessBoldText style={styles.bold}>
                {member?.name ? member.name : DEFAULT_NAME}
              </NumberlessBoldText>
            </View>
            <Pressable onPress={() => setVisible(false)}>
              <Cross />
            </Pressable>
          </View>
          {member.memberId !== 'self' && (
            <GenericButton
              onPress={async () => {
                await attemptRemoveMember(groupId, member.memberId);
                setVisible(false);
              }}
              buttonStyle={styles.button}>
              Remove Member
            </GenericButton>
          )}
        </View>
      </GenericModal>
    </>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    width: 80,
    marginBottom: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTileText: {
    color: '#8A8A8AB8',
    marginTop: 12,
  },
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingVertical: 30,
  },
  row: {
    flexDirection: 'row',
  },
  textColumn: {
    width: '60%',
    marginLeft: 10,
    marginTop: 5,
  },
  bold: {
    color: 'black',
  },
  button: {
    width: '90%',
    backgroundColor: PortColors.primary.red.error,
    marginTop: 20,
    height: 60,
  },
});

export default UserTile;
