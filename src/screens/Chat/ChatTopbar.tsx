import SettingsIcon from '@assets/icons/contact-settings.svg';
import Cross from '@assets/icons/cross.svg';
import {BackButton} from '@components/BackButton';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_AVATAR} from '@configs/constants';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

/**
 * Handles top bar for chat
 * @param name, of user being interacted with, or group
 * @param chatId
 * @param selectedMessagesLength
 * @param profileURI, URI for the user/group.
 * @param onSettingsPressed
 * @param onBackPress
 * @param onCancelPressed
 * @returns {ReactNode} topbar for chat
 */
function ChatTopbar({
  name,
  selectedMessagesLength,
  onSettingsPressed,
  onBackPress,
  onCancelPressed,
  profileURI = DEFAULT_AVATAR,
}: {
  name: string;
  selectedMessagesLength: number;
  profileURI?: string | null;
  onSettingsPressed: () => void;
  onBackPress: () => void;
  onCancelPressed: () => void;
}): ReactNode {
  const handlePress = () => {
    if (selectedMessagesLength >= 1) {
      return;
    } else {
      onSettingsPressed();
    }
  };

  const handleCancellation = () => {
    if (selectedMessagesLength >= 1) {
      onCancelPressed();
    } else {
      onSettingsPressed();
    }
  };

  return (
    <View style={styles.bar}>
      {selectedMessagesLength == 0 && (
        <BackButton style={styles.backIcon} onPress={onBackPress} />
      )}

      <Pressable style={styles.profileBar} onPress={handlePress}>
        <View style={styles.titleBar}>
          {selectedMessagesLength == 0 && (
            <View style={styles.profile}>
              <GenericAvatar
                onPress={handlePress}
                profileUri={profileURI}
                avatarSize={'extraSmall'}
              />
            </View>
          )}
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}
            ellipsizeMode="tail"
            style={
              selectedMessagesLength >= 1 ? styles.selectedCount : styles.title
            }
            numberOfLines={1}>
            {selectedMessagesLength >= 1
              ? selectedMessagesLength.toString() + ' selected'
              : name}
          </NumberlessText>
        </View>
        <View>
          <GenericButton
            buttonStyle={
              selectedMessagesLength >= 1 ? styles.crossBox : styles.settingsBox
            }
            IconLeft={selectedMessagesLength >= 1 ? Cross : SettingsIcon}
            iconSize={selectedMessagesLength >= 1 ? 38 : 0}
            onPress={handleCancellation}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: 18,
    paddingLeft: 18,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 65,
  },
  profileBar: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBar: {
    flex: 1,
    marginLeft: 10,
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 7,
  },
  selectedCount: {
    color: PortColors.primary.black,
    overflow: 'hidden',
    width: screen.width / 2,
  },
  title: {
    color: PortColors.primary.black,
    overflow: 'hidden',
  },
  backIcon: {
    alignItems: 'flex-start',
  },
  settingsBox: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'flex-end',
    height: 42,
    top: 5,
    width: 42,
  },
  crossBox: {
    backgroundColor: PortColors.primary.white,
    width: 20,
    padding: 0,
  },
  profile: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginLeft: -14,
    display: 'flex',
    flexDirection: 'row',
    // backgroundColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatTopbar;
