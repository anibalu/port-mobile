import React, {useState} from 'react';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortSpacing} from './ComponentUtils';
import ConfirmationBottomSheet from './Reusable/BottomSheets/ConfirmationBottomSheet';
import {blockUser, unblockUser} from '@utils/UserBlocking';
import {AvatarBox} from './Reusable/AvatarBox/AvatarBox';
import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {BlockedUser} from '@utils/Storage/DBCalls/blockUser';
import DynamicColors from './DynamicColors';

interface BlockedContactProps extends BlockedUser {
  isLast: boolean;
}
const BlockedContactTile = (user: BlockedContactProps) => {
  const {name, pairHash, isLast} = user;
  const [isBlocked, setIsBlocked] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [confirmBlockUserSheet, setConfirmBlockUserSheet] = useState(false);
  const onPress = async () => {
    setConfirmBlockUserSheet(p => !p);
  };
  const blockUserClicked = async () => {
    try {
      await blockUser({
        name: name,
        pairHash: pairHash,
        time: new Date().toISOString(),
      });
      setIsBlocked(true);
      setIsSelected(false);
    } catch {
      console.log('Error in blocking user');
    }
  };

  const unblockUserClicked = async () => {
    try {
      await unblockUser(pairHash);
      setIsBlocked(false);
      setIsSelected(true);
    } catch {
      console.log('Error in unblocking user');
    }
  };
  const Colors = DynamicColors();
  const styles = styling(isLast, Colors);

  return (
    <Pressable onPress={() => onPress()} style={styles.card}>
      <View style={styles.row}>
        <AvatarBox
          avatarSize="s"
          profileUri={DEFAULT_PROFILE_AVATAR_INFO.fileUri}
        />
        <NumberlessText
          textColor={Colors.text.primary}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          {name}
        </NumberlessText>
      </View>

      <NumberlessText
        textColor={Colors.primary.red}
        fontType={FontType.md}
        fontSizeType={FontSizeType.s}>
        {isSelected ? 'Block' : 'Unblock'}
      </NumberlessText>
      <ConfirmationBottomSheet
        visible={confirmBlockUserSheet}
        onClose={() => setConfirmBlockUserSheet(false)}
        onConfirm={async () => {
          isBlocked ? await unblockUserClicked() : await blockUserClicked();
        }}
        title={
          isBlocked
            ? `Are you sure you want to unblock ${name}?`
            : `Are you sure you want to block ${name}?`
        }
        description={
          isBlocked
            ? `Unblocking ${name} gives them the ability to connect with you through Port and Superports`
            : `Blocking ${name} will prevent them from connecting with you over Ports, Superports or contact sharing until you unblock them.`
        }
        buttonText={isBlocked ? 'Unblock contact' : 'Block contact'}
        buttonColor="r"
      />
    </Pressable>
  );
};

const styling = (isLast: boolean, colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: PortSpacing.tertiary.uniform,
      marginHorizontal: PortSpacing.tertiary.uniform,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.primary.lightgrey,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: PortSpacing.tertiary.uniform,
    },
  });

export default BlockedContactTile;
