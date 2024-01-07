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
import {StyleSheet, View} from 'react-native';

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
  return (
    <View style={styles.bar}>
      <View style={styles.backAndProfile}>
        <BackButton style={styles.backIcon} onPress={onBackPress} />
        {selectedMessagesLength == 0 && (
          <GenericAvatar
            onPress={onSettingsPressed}
            profileUri={profileURI}
            avatarSize={'extraSmall'}
          />
        )}
        <View style={styles.titleBar}>
          {selectedMessagesLength >= 1 ? (
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.md}
              ellipsizeMode="tail"
              style={styles.selectedCount}
              numberOfLines={1}>
              {selectedMessagesLength.toString() + ' selected'}
            </NumberlessText>
          ) : (
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.md}
              ellipsizeMode="tail"
              style={styles.title}
              onPress={onSettingsPressed}
              numberOfLines={1}>
              {name}
            </NumberlessText>
          )}
        </View>
      </View>

      {selectedMessagesLength >= 1 ? (
        <GenericButton
          buttonStyle={styles.crossBox}
          IconLeft={Cross}
          iconSize={38}
          onPress={onCancelPressed}
        />
      ) : (
        <GenericButton
          buttonStyle={styles.settingsBox}
          IconLeft={SettingsIcon}
          onPress={onSettingsPressed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 18,
    paddingLeft: 18,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 65,
  },
  titleBar: {
    marginLeft: 10,
    maxWidth: '60%',
  },
  selectedCount: {
    color: PortColors.primary.black,
    overflow: 'hidden',
    width: screen.width / 2,
  },
  title: {
    color: PortColors.primary.black,
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
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
    marginLeft: -20,
  },
  backAndProfile: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default ChatTopbar;
