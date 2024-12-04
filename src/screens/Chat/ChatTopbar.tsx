import {BackButton} from '@components/BackButton';
import {isIOS, PortSpacing} from '@components/ComponentUtils';
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
      assetName: 'SettingsIcon',
      light: require('@assets/light/icons/Settings.svg').default,
      dark: require('@assets/dark/icons/Settings.svg').default,
    },
    {
      assetName: 'ClockIcon',
      light: require('@assets/light/icons/ClockIcon.svg').default,
      dark: require('@assets/dark/icons/ClockIcon.svg').default,
    },
    {
      assetName: 'ContactShareIcon',
      dark: require('@assets/light/icons/ContactShareIcon.svg').default,
      light: require('@assets/dark/icons/ContactShareIcon.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;
  const AngleRight = results.AngleRight;

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

  const {themeValue} = useTheme();

  return (
    <View style={{...styles.bar, marginTop: isIOS ? 0 : insets.top}}>
      {!selectionMode && (
        <ChatTopBarWithAccessControls
          ref={chatTopBarRef}
          chatId={chatId}
          isScreenClickable={isScreenClickable}
          sliderOpen={sliderOpen}
          permissionsId={permissionsId}
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}
      <Pressable
        style={StyleSheet.compose(styles.profileBar, {
          height: selectionMode ? TOPBAR_HEIGHT : 56,

          backgroundColor:
            themeValue === 'dark'
              ? Colors.primary.surface
              : Colors.primary.surface2,
        })}
        onPress={handlePress}>
        {!selectionMode && (
          <BackButton style={styles.backIcon} onPress={onBackPress} />
        )}
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
          {selectionMode ? (
            <View
              style={
                selectionMode ? styles.nameBarInSelection : styles.nameBar
              }>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                ellipsizeMode="tail"
                style={selectionMode ? styles.selected : styles.title}
                numberOfLines={1}>
                {'Selected (' + selectedMessages.length.toString() + ')'}
              </NumberlessText>
            </View>
          ) : (
            <View
              style={
                selectionMode ? styles.nameBarInSelection : styles.nameBar
              }>
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                ellipsizeMode="tail"
                style={selectionMode ? styles.selected : styles.title}
                numberOfLines={1}>
                {name}
              </NumberlessText>
              <AngleRight height={20} width={20} />
            </View>
          )}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectionMode && (
            <GenericButton
              buttonStyle={styles.crossBox}
              IconLeft={CloseIcon}
              onPress={handleCancellation}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styling = (colors: any) =>
  StyleSheet.create({
    bar: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'absolute',
    },
    profileBar: {
      width: '100%',
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      position: 'absolute',
    },
    titleBar: {
      flex: 1,
      maxWidth: '90%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: PortSpacing.tertiary.uniform,
    },
    nameBar: {
      flexDirection: 'row',
      alignItems: 'center',
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
      overflow: 'hidden',
    },
    selected: {
      color: colors.text.primary,
      overflow: 'hidden',
      flex: 1,
      paddingLeft: 8,
    },
    backIcon: {
      alignItems: 'center',
      height: 51,
      width: 40,
      paddingTop: 13,
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
      display: 'flex',
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
  });

export default ChatTopbar;
