import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
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
import PurplePlus from '@assets/icons/PurplePlus.svg';
import PurpleKeyboard from '@assets/icons/Keyboard.svg';
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
  replyToMessage: LineMessageData | null; // message to be replied to
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
  const styles = styling(Colors);

  // to focus on the text input
  const [isFocused, setIsFocused] = useState(false);
  const {
    togglePopUp,
    isPopUpVisible,
    isEmojiSelectorVisible,
    setIsEmojiSelectorVisible,
  } = useChatContext();

  const onChangeText = (newText: string): void => {
    setText(newText);
  };

  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
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
      assetName: 'Plus',
      light: require('@assets/light/icons/GreyPlus.svg').default,
      dark: require('@assets/dark/icons/WhitePlus.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const MicrophoneIcon = results.MicrophoneIcon;
  const Emoji = results.Emoji;
  const SendIcon = results.SendIcon;
  const Plus = results.Plus;

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };

  // handles sending of text
  const onHandleClick = () => {
    if (text.length > 0) {
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
            <TouchableOpacity hitSlop={24} onPress={onPressPurpleActionButton}>
              {isPopUpVisible ? (
                <Animated.View style={[animatedStyleKeyboard]}>
                  <PurpleKeyboard height={24} width={24} />
                </Animated.View>
              ) : (
                <Animated.View style={[animatedStylePlus]}>
                  <PurplePlus height={24} width={24} />
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View
          style={
            replyToMessage || showPreview
              ? styles.replyInputBox
              : styles.inputBox
          }>
          <TextInput
            style={styles.inputText}
            ref={inputRef}
            textAlign="left"
            multiline
            placeholder={isFocused ? '' : 'Type your message here'}
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.tertiary.uniform,
              }}>
              <Pressable onPress={onEmojiKeyboardPressed} hitSlop={24}>
                <Emoji />
              </Pressable>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={onHandleClick}>
          {text.length > 0 || replyToMessage ? (
            <SendIcon />
          ) : (
            <MicrophoneIcon style={styles.microphone} />
          )}
        </TouchableOpacity>
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
const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      alignItems: 'center',
    },
    plus: {
      paddingLeft: PortSpacing.secondary.left,
      paddingRight: PortSpacing.tertiary.right,
    },
    inputBox: {
      backgroundColor: colors.primary.surface2,
      flexDirection: 'row',
      borderRadius: 24,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: PortSpacing.secondary.right,
    },

    replyInputBox: {
      width: screen.width - 70,
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
      height: undefined,
      minHeight: 45,
      paddingLeft: PortSpacing.secondary.left,
      color: colors.text.primary,
      //Remove additional padding on Android
      ...(!isIOS && {paddingBottom: 0, paddingTop: 0}),
      overflow: 'hidden',
      alignSelf: 'stretch',
      paddingRight: 5,
      width: screen.width - 142,

      justifyContent: 'center',
      fontFamily: FontType.rg,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
      ...(isIOS && {paddingTop: 12}),
    },
    microphone: {
      paddingLeft: PortSpacing.primary.right,
      paddingRight: PortSpacing.secondary.right,
    },
  });

export default TextComponent;
