import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useMemo, useState} from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import KeyboardIcon from '@assets/icons/Keyboard.svg';
import PopUpActions from './PopUpActions';
import EmojiKeyboard from './EmojiKeyboard';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {wait} from '@utils/Time';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';
import DisabledSend from '@assets/dark/icons/DisabledSend.svg';
import Plus from '@assets/dark/icons/WhitePlus.svg';

// this component is reponsible for textinput for message bar in direct chat
const TextComponent = ({
  replyToMessage,
  text,
  setText,
  inputRef,
  onPressSend,
  setMicrophoneClicked,
  chatId,
  isGroupChat,
  showPreview,
  setEmojiSelected,
  setCounter,
}: {
  replyToMessage: GroupMessageData | null; // message to be replied to
  text: string;
  setText: (val: string) => void;
  inputRef: any;
  onPressSend: () => void;
  setMicrophoneClicked: (p: boolean) => void;
  chatId: string;
  isGroupChat: boolean;
  showPreview: boolean;
  setEmojiSelected: (e: string) => void;
  setCounter: (e: any) => void;
}) => {
  const Colors = DynamicColors();

  // to focus on the text input
  const [isFocused, setIsFocused] = useState(false);
  const {
    togglePopUp,
    isPopUpVisible,
    isEmojiSelectorVisible,
    setIsEmojiSelectorVisible,
    setMessageToEdit,
    messageToEdit,
    onCleanCloseFocus,
  } = useChatContext();

  const styles = styling(Colors, messageToEdit);

  const onChangeText = (newText: string): void => {
    setText(newText);
  };

  const svgArray = [
    {
      assetName: 'SendIcon',
      light: require('@assets/light/icons/BlackArrowUp.svg').default,
      dark: require('@assets/dark/icons/PurpleArrowUp.svg').default,
    },
    {
      assetName: 'MicrophoneIcon',
      light: require('@assets/light/icons/MicrophoneFilled.svg').default,
      dark: require('@assets/dark/icons/MicrophoneFilled.svg').default,
    },
    {
      assetName: 'Emoji',
      light: require('@assets/light/icons/Emoji.svg').default,
      dark: require('@assets/dark/icons/Emoji.svg').default,
    },
    {
      assetName: 'Cross',
      light: require('@assets/light/icons/CrossWhite.svg').default,
      dark: require('@assets/icons/GreyCrossLight.svg').default,
    },
    {
      assetName: 'EditIcon',
      light: require('@assets/light/icons/EditLight.svg').default,
      dark: require('@assets/dark/icons/EditIcon.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const MicrophoneIcon = results.MicrophoneIcon;
  const Emoji = results.Emoji;
  const SendIcon = results.SendIcon;
  const Cross = results.Cross;
  const EditIcon = results.EditIcon;

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };

  // handles sending of text
  const onHandleClick = () => {
    if (text.length > 0 || replyToMessage) {
      onPressSend();
    } else {
      RNReactNativeHapticFeedback.trigger('impactHeavy', options);
      // toggles between showing audio recorder and text component
      setMicrophoneClicked(p => !p);
    }
  };

  const onPressPurpleActionButton = async () => {
    RNReactNativeHapticFeedback.trigger('impactMedium', options);
    // close emoji keyboard if its on
    if (isEmojiSelectorVisible) {
      setIsEmojiSelectorVisible(p => !p);
    }
    setMessageToEdit(null);
    setText('');
    // close keyboard and open popup actions
    if (!isPopUpVisible) {
      Keyboard.dismiss();
      await wait(300);
      togglePopUp();
    } else {
      // open native keyboard and focus on textinput
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // util for text input focus
  const onInputFocus = async () => {
    setIsFocused(true);
    // if popup actions visible, close it
    if (isPopUpVisible) {
      togglePopUp();
    }
    // if emoji keyboard visible, close it
    if (isEmojiSelectorVisible) {
      setIsEmojiSelectorVisible(p => !p);
    }
  };

  const onPlusPressed = async () => {
    RNReactNativeHapticFeedback.trigger('impactMedium', options);
    // dismiss keyboard and open popup
    Keyboard.dismiss();
    await wait(100);
    togglePopUp();
  };

  const onEmojiKeyboardPressed = async () => {
    RNReactNativeHapticFeedback.trigger('impactMedium', options);
    Keyboard.dismiss();
    await wait(300);
    // if popup actions visible, close it
    if (isPopUpVisible) {
      togglePopUp();
    }
    await wait(300);
    // open emoji keyboard
    setIsEmojiSelectorVisible(p => !p);
  };

  const onEmojiSelected = async (emoji: string) => {
    setCounter(p => p + 1);
    setEmojiSelected(emoji);
  };

  // to animate transition between keyboard icon and plus icon
  const scaleKeyboard = useSharedValue(isPopUpVisible ? 1 : 0);
  const scalePlus = useSharedValue(isPopUpVisible ? 0 : 1);

  const animatedStyleKeyboard = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleKeyboard.value}],
      opacity: interpolate(scaleKeyboard.value, [0, 1], [0, 1]),
    };
  });

  const animatedStylePlus = useAnimatedStyle(() => {
    return {
      transform: [{scale: scalePlus.value}],
      opacity: interpolate(scalePlus.value, [0, 1], [0, 1]),
    };
  });
  useMemo(() => {
    scaleKeyboard.value = withTiming(isPopUpVisible ? 1 : 0, {duration: 300});
    scalePlus.value = withTiming(isPopUpVisible ? 0 : 1, {duration: 300});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPopUpVisible]);

  return (
    <>
      <View style={styles.mainContainer}>
        {!replyToMessage && !showPreview && (
          <View style={styles.plus}>
            {messageToEdit ? (
              <TouchableOpacity
                hitSlop={32}
                onPress={() => {
                  setMessageToEdit(null);
                  setText('');
                  onCleanCloseFocus();
                }}>
                <Cross />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                hitSlop={32}
                onPress={onPressPurpleActionButton}>
                {isPopUpVisible ? (
                  <Animated.View
                    style={[
                      animatedStyleKeyboard,
                      {
                        backgroundColor: Colors.primary.surface2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        borderRadius: 100,
                      },
                    ]}>
                    <KeyboardIcon height={24} width={24} />
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      animatedStylePlus,
                      {
                        backgroundColor: Colors.primary.surface2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        borderRadius: 100,
                      },
                    ]}>
                    {messageToEdit ? (
                      <Cross height={24} width={24} />
                    ) : (
                      <Plus height={24} width={24} />
                    )}
                  </Animated.View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View
          style={
            replyToMessage || showPreview
              ? styles.replyInputBox
              : styles.inputBox
          }>
          <View style={{flex: 1}}>
            {messageToEdit && (
              <View
                style={{
                  flexDirection: 'row',
                  paddingLeft: PortSpacing.secondary.left,
                  paddingTop: PortSpacing.tertiary.top,
                  paddingBottom: 4,
                }}>
                <EditIcon height={16} width={16} />
                <NumberlessText
                  style={{marginLeft: 4}}
                  textColor={Colors.text.subtitle}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.m}>
                  Edit message
                </NumberlessText>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TextInput
                style={styles.inputText}
                ref={inputRef}
                textAlign="left"
                multiline
                placeholder={isFocused ? '' : 'Message'}
                placeholderTextColor={Colors.primary.mediumgrey}
                onChangeText={onChangeText}
                value={text}
                onFocus={onInputFocus}
                onBlur={() => setIsFocused(false)}
              />
              {replyToMessage || showPreview ? (
                <Pressable onPress={onPlusPressed} hitSlop={24}>
                  <Plus />
                </Pressable>
              ) : (
                <Pressable onPress={onEmojiKeyboardPressed} hitSlop={24}>
                  <Emoji height={24} width={24} />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View style={styles.send}>
          {text.length > 0 || replyToMessage || messageToEdit ? (
            <TouchableOpacity
              disabled={messageToEdit && text.length === 0}
              hitSlop={40}
              onPress={onHandleClick}>
              {messageToEdit && text.length === 0 ? (
                <DisabledSend />
              ) : (
                <SendIcon />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity hitSlop={40} onPress={onHandleClick}>
              <View style={styles.microphone}>
                <MicrophoneIcon />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* opens emoji keyboard */}
      {isEmojiSelectorVisible && (
        <EmojiKeyboard onEmojiSelected={onEmojiSelected} />
      )}

      {/* opens popup actions */}
      {isPopUpVisible && (
        <PopUpActions
          chatId={chatId}
          togglePopUp={togglePopUp}
          isGroupChat={isGroupChat}
        />
      )}
    </>
  );
};
const styling = (colors: any, messageToEdit: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      width: screen.width,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plus: {
      paddingLeft: PortSpacing.secondary.left,
      paddingRight: PortSpacing.tertiary.right,
    },
    send: {
      paddingLeft: PortSpacing.tertiary.right,
      paddingRight: PortSpacing.secondary.left,
    },
    inputBox: {
      flex: 1,
      backgroundColor: colors.primary.surface2,
      flexDirection: 'row',
      borderRadius: 24,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: PortSpacing.secondary.right,
    },
    replyInputBox: {
      width: screen.width - 80,
      backgroundColor: colors.primary.surface2,
      flexDirection: 'row',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: PortSpacing.secondary.right,
      marginLeft: PortSpacing.secondary.right,
    },
    inputText: {
      maxHeight: 110,
      flex: 1,
      height: undefined,
      minHeight: 40,
      paddingLeft: PortSpacing.secondary.left,
      color: colors.text.primary,
      overflow: 'hidden',
      alignSelf: 'stretch',
      paddingRight: 5,
      width: screen.width - 142,
      justifyContent: 'center',
      fontFamily: FontType.rg,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
      ...(isIOS && !messageToEdit && {paddingTop: 10}),
      paddingBottom: 8,
    },
    microphone: {
      padding: PortSpacing.tertiary.uniform,
      borderRadius: 100,
    },
  });

export default TextComponent;
