/**
 * Default chat tile displayed when there are no connections
 */
import Cross from '@assets/icons/BlackCross.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericModal from '@components/Modals/GenericModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {AVATAR_ARRAY, DEFAULT_NAME} from '@configs/constants';
import {GroupMember, GroupMemberStrict} from '@utils/Groups/interfaces';
import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

function hashHexToNumber(hexString: string): number {
  // Ensure the string is 32 characters long
  if (hexString.length !== 32) {
    throw new Error('Hex string must be 32 characters long.');
  }

  // Initialize a variable to accumulate our result
  let hash = 0;

  // Process the string in chunks of characters
  for (let i = 0; i < hexString.length; i++) {
    // Convert each character into a decimal
    const value = parseInt(hexString[i], 16);

    // Accumulate the value into the hash (mod 15 at each step to keep it in range)
    hash = (hash * 16 + value) % 15;
  }

  return hash;
}

function UserTile({
  member,
  isAdmin,
  onPress,
}: {
  member: GroupMemberStrict;
  isAdmin: boolean;
  onPress: (member: GroupMember) => Promise<void>;
}) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const avatar = AVATAR_ARRAY[hashHexToNumber(member.memberId!)];
  return (
    <>
      <View style={styles.defaultTileContainer}>
        <AvatarBox
          onPress={() => {
            setVisible(true);
          }}
          profileUri={avatar}
          avatarSize="s+"
        />

        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          style={styles.defaultTileText}
          numberOfLines={1}>
          {member?.name ? member.name : DEFAULT_NAME}
        </NumberlessText>
      </View>
      <GenericModal
        onClose={() => setVisible(false)}
        visible={visible && isAdmin}>
        <View style={styles.modal}>
          <View style={styles.row}>
            <AvatarBox profileUri={avatar} avatarSize="s+" />

            <View style={styles.textColumn}>
              <NumberlessText
                fontType={FontType.sb}
                fontSizeType={FontSizeType.l}
                style={styles.bold}>
                {member?.name ? member.name : DEFAULT_NAME}
              </NumberlessText>
            </View>
            <Pressable onPress={() => setVisible(false)}>
              <Cross />
            </Pressable>
          </View>
          {member.memberId !== 'self' && (
            <GenericButton
              onPress={async () => {
                setLoading(true);
                await onPress(member);
                setLoading(false);
                setVisible(false);
              }}
              buttonStyle={styles.button}
              loading={loading}>
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
