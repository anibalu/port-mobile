import {isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {GenericButton} from '@components/GenericButton';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useState} from 'react';
import {Animated, Pressable, StyleSheet, TextInput, View} from 'react-native';
const MESSAGE_INPUT_TEXT_WIDTH = screen.width - 111;

const TextComponent = ({
  togglePopUp,
  replyToMessage,
  text,
  setText,
  animatedStyle,
  inputRef,
  onPressSend,
  setMicrophoneClicked,
}: {
  togglePopUp: () => void;
  replyToMessage: SavedMessageParams | null; // message to be replied to
  text: string;
  setText: (val: string) => void;
  animatedStyle: any; //animation for opening popup component
  inputRef: any;
  onPressSend: () => void;
  setMicrophoneClicked: (p: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  // to focus on the text input
  const [isFocused, setIsFocused] = useState(false);
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
      light: require('@assets/icons/navigation/WhiteArrowUp.svg').default,
      dark: require('@assets/icons/navigation/WhiteArrowUp.svg').default,
    },
    {
      assetName: 'MicrophoneIcon',
      light: require('@assets/icons/MicrophoneFilled.svg').default,
      dark: require('@assets/icons/MicrophoneFilled.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);

  const PlusIcon = results.PlusIcon;
  const SendIcon = results.SendIcon;
  const MicrophoneIcon = results.MicrophoneIcon;

  // handles sending of text
  const onHandleClick = () => {
    if (text.length > 0) {
      onPressSend();
    } else {
      // toggles between showing audio recorder and text component
      setMicrophoneClicked(p => !p);
    }
  };
  return (
    <View style={{flexDirection: 'row'}}>
      <View
        style={StyleSheet.compose(
          styles.textInput,
          replyToMessage
            ? {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }
            : {},
        )}>
        <Animated.View style={[styles.plus, animatedStyle]}>
          <Pressable onPress={togglePopUp}>
            <PlusIcon height={24} width={24} />
          </Pressable>
        </Animated.View>

        <View style={styles.textBox}>
          <TextInput
            style={styles.inputText}
            ref={inputRef}
            textAlign="left"
            multiline
            placeholder={isFocused ? '' : 'Type your message here'}
            placeholderTextColor={Colors.primary.mediumgrey}
            onChangeText={onChangeText}
            value={text}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </View>
      <GenericButton
        iconSizeRight={text.length > 0 ? 14 : 20}
        buttonStyle={styles.send}
        IconRight={text.length > 0 ? SendIcon : MicrophoneIcon}
        onPress={onHandleClick}
      />
    </View>
  );
};
const styling = (colors: any) =>
  StyleSheet.create({
    textInput: {
      flexDirection: 'row',
      backgroundColor: colors.primary.surface,
      overflow: 'hidden',
      borderRadius: 20,
      alignItems: 'center',
      marginRight: 4,
    },

    plus: {
      width: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    send: {
      width: 40,
      height: 40,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.button.black,
    },

    textBox: {
      width: MESSAGE_INPUT_TEXT_WIDTH,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    inputText: {
      width: '97%',
      maxHeight: 110,
      height: undefined,
      minHeight: 40,
      color: colors.text.primary,
      //Remove additional padding on Android
      ...(!isIOS && {paddingBottom: 0, paddingTop: 0}),
      overflow: 'hidden',
      alignSelf: 'stretch',
      paddingRight: 5,
      borderRadius: 0,
      justifyContent: 'center',
      backgroundColor: colors.primary.surface,
      fontFamily: FontType.rg,
      fontSize: FontSizeType.l,
      fontWeight: getWeight(FontType.rg),
      ...(isIOS && {paddingTop: 9}),
    },
  });

export default TextComponent;
