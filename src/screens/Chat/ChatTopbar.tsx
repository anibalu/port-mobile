import SettingsIcon from '@assets/icons/Settings.svg';
import Cross from '@assets/icons/cross.svg';
import {BackButton} from '@components/BackButton';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {DEFAULT_AVATAR} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {toggleRead} from '@utils/Connections';
import DirectChat from '@utils/DirectChats/DirectChat';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

/**
 * Handles top bar for chat
 * @returns {ReactNode} topbar for chat
 */
function ChatTopbar(): ReactNode {
  //setup navigation
  const navigation = useNavigation();
  //chat screen context
  const {
    chatId,
    name,
    profileUri,
    selectionMode,
    setSelectionMode,
    selectedMessages,
    setSelectedMessages,
  } = useChatContext();

  const onSettingsPressed = async () => {
    const dataHandler = new DirectChat(chatId);
    const chatData = await dataHandler.getChatData();
    navigation.navigate('ContactProfile', {
      chatId: chatId,
      name: name,
      profileUri: profileUri || DEFAULT_AVATAR,
      permissionsId: chatData.permissionsId,
    });
  };

  const onBackPress = async (): Promise<void> => {
    await toggleRead(chatId);
    navigation.navigate('HomeTab');
  };

  const onCancelPressed = () => {
    setSelectedMessages([]);
    setSelectionMode(false);
  };

  const handlePress = () => {
    if (selectedMessages.length >= 1) {
      return;
    } else {
      onSettingsPressed();
    }
  };

  const handleCancellation = () => {
    onCancelPressed();
  };

  const handleSettings = () => {
    onSettingsPressed();
  };

  return (
    <View style={styles.bar}>
      {!selectionMode && (
        <BackButton style={styles.backIcon} onPress={onBackPress} />
      )}

      <Pressable style={styles.profileBar} onPress={handlePress}>
        <View style={styles.titleBar}>
          {!selectionMode && (
            <View style={styles.profile}>
              <AvatarBox
                avatarSize="s"
                onPress={handlePress}
                profileUri={profileUri}
              />
            </View>
          )}
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}
            ellipsizeMode="tail"
            style={
              selectedMessages.length >= 1 ? styles.selectedCount : styles.title
            }
            numberOfLines={1}>
            {selectionMode
              ? 'Selected (' + selectedMessages.length.toString() + ')'
              : name}
          </NumberlessText>
        </View>
        <View>
          <GenericButton
            buttonStyle={selectionMode ? styles.crossBox : styles.settingsBox}
            IconLeft={selectionMode ? Cross : SettingsIcon}
            onPress={selectionMode ? handleCancellation : handleSettings}
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
    paddingHorizontal: 8,
    backgroundColor: PortColors.primary.white,
    height: 56,
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
    gap: PortSpacing.tertiary.uniform,
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
    alignItems: 'center',
    height: 51,
    width: 40,
    paddingTop: 13,
  },
  settingsBox: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'flex-end',
    height: 40,
    top: 7,
    width: 40,
  },
  crossBox: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'flex-end',
    height: 40,
    top: 7,
    width: 40,
  },
  profile: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginLeft: -14,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatTopbar;
