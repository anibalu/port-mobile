import {BackButton} from '@components/BackButton';
import {isIOS, PortSpacing, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {useNavigation} from '@react-navigation/native';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import DirectChat from '@utils/DirectChats/DirectChat';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {ChatTopBarWithAccessControls} from './DragDownTopBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'src/context/ThemeContext';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {SharedValue} from 'react-native-reanimated';
import {DirectPermissions} from '@utils/Storage/DBCalls/permissions/interfaces';
import {createCallId} from '@utils/Calls/CallOSBridge';
import {useCallContext} from '@screens/Calls/CallContext';

/**
 * Handles top bar for chat
 * @returns {ReactNode} topbar for chat
 */
function ChatTopbar({
  chatTopBarRef,
  isScreenClickable,
  sliderOpen,
  permissionsId,
  permissions,
  setPermissions,
}: {
  chatTopBarRef: React.RefObject<{moveSliderIntermediateOpen: () => void}>;
  isScreenClickable: SharedValue<boolean>;
  sliderOpen: boolean;
  permissionsId: string | null | undefined;
  permissions: DirectPermissions | null | undefined;
  setPermissions: (x: DirectPermissions | null | undefined) => void;
}): ReactNode {
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
  const {dispatchCallAction} = useCallContext();

  const insets = useSafeAreaInsets();
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
    {
      assetName: 'AudioCallIcon',
      light: require('@assets/light/icons/AudioCall.svg').default,
      dark: require('@assets/dark/icons/AudioCall.svg').default,
    },
    {
      assetName: 'VideoCallIcon',
      light: require('@assets/light/icons/VideoCall.svg').default,
      dark: require('@assets/dark/icons/VideoCall.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;
  const AudioCallIcon = results.AudioCallIcon;
  const VideoCallIcon = results.VideoCallIcon;

  const onSettingsPressed = async () => {
    try {
      const dataHandler = new DirectChat(chatId);
      const chatData = await dataHandler.getChatData();
      navigation.push('ChatProfile', {
        chatId: chatId,
        chatData: chatData,
      });
    } catch (error) {
      console.error('Error navigating to contact profile page: ', error);
    }
  };

  const onBackPress = async (): Promise<void> => {
    navigation.goBack();
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

  const onCallPressed = async (initiatedVideoCall: boolean) => {
    try {
      const callId = createCallId();
      dispatchCallAction({
        type: 'outgoing_call',
        callId,
        chatId,
        initiatedVideoCall,
      });
    } catch (error) {
      console.error('Error navigating to call screen: ', error);
    }
  };

  const {themeValue} = useTheme();

  return (
    <View style={{...styles.bar, marginTop: isIOS ? 0 : insets.top}}>
      {!selectionMode && (
        <ChatTopBarWithAccessControls
          ref={chatTopBarRef}
          chatName={name}
          chatId={chatId}
          isScreenClickable={isScreenClickable}
          sliderOpen={sliderOpen}
          permissionsId={permissionsId}
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}
      <Pressable
        style={StyleSheet.compose(styles.mainBar, {
          height: selectionMode ? TOPBAR_HEIGHT : 56,

          backgroundColor:
            themeValue === 'dark'
              ? Colors.primary.surface
              : Colors.primary.surface2,
        })}
        onPress={handlePress}>
        <View style={styles.titleBar}>
          {selectionMode ? (
            <View style={styles.nameBarInSelection}>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                ellipsizeMode="tail"
                style={selectionMode ? styles.selected : styles.title}
                numberOfLines={1}>
                {'Selected (' + selectedMessages.length.toString() + ')'}
              </NumberlessText>
              <GenericButton
                buttonStyle={styles.crossBox}
                IconLeft={CloseIcon}
                onPress={handleCancellation}
              />
            </View>
          ) : (
            <View style={styles.profileBar}>
              <View style={styles.profileBarLeft}>
                <BackButton style={styles.backIcon} onPress={onBackPress} />
                <View style={styles.profile}>
                  <AvatarBox
                    avatarSize="s"
                    onPress={handlePress}
                    profileUri={profileUri}
                  />
                </View>
                <View style={styles.nameBar}>
                  <NumberlessText
                    fontSizeType={FontSizeType.l}
                    fontType={FontType.md}
                    ellipsizeMode="tail"
                    style={selectionMode ? styles.selected : styles.title}
                    numberOfLines={1}>
                    {name}
                  </NumberlessText>
                </View>
              </View>
              <View style={styles.callIcons}>
                <Pressable
                  onPress={async () => {
                    console.log('video call pressed');
                    await onCallPressed(true);
                  }}>
                  <VideoCallIcon />
                </Pressable>
                <Pressable
                  onPress={async () => {
                    console.log('audio call pressed');
                    await onCallPressed(false);
                  }}>
                  <AudioCallIcon />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    bar: {
      width: screen.width,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'absolute',
    },
    mainBar: {
      width: screen.width,
      flexDirection: 'row',
      flex: 1,
      position: 'absolute',
    },
    profileBar: {
      width: screen.width,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
    },
    profileBarLeft: {
      flex: screen.width - 98,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleBar: {
      flex: 1,
      width: screen.width,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    nameBar: {
      flexDirection: 'row',
      alignItems: 'center',
      width: screen.width - 98 - 48 - 50,
    },
    nameBarInSelection: {
      flex: 1,
      maxWidth: '60%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: PortSpacing.tertiary.uniform,
    },
    title: {
      color: colors.text.primary,
      flex: 1,
    },
    selected: {
      color: colors.text.primary,
      overflow: 'hidden',
      flex: 1,
      paddingLeft: 8,
    },
    backIcon: {
      alignItems: 'flex-end',
      height: 51,
      width: 48,
      paddingTop: 13,
      paddingRight: 8,
    },
    settingsBox: {
      backgroundColor: colors.primary.surface2,
      alignItems: 'flex-end',
      height: 40,
      top: 7,
      width: 40,
    },
    crossBox: {
      backgroundColor: 'transparent',
      alignItems: 'flex-end',
      height: 40,
      top: 7,
      width: 40,
    },
    clockIconWrapper: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      backgroundColor: colors.primary.surface,
      padding: 3,
      borderRadius: 50,
    },
    profile: {
      height: 50,
      width: 50,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      backgroundColor: colors.button.black,
      height: 40,
      borderRadius: 12,
      paddingHorizontal: PortSpacing.secondary.uniform,
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    callIcons: {
      width: 98,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingRight: 20,
      paddingLeft: 8,
      gap: 20,
    },
  });

export default ChatTopbar;
