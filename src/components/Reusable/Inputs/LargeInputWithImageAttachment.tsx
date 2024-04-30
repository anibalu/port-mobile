//@sumaanta
/**
 * Large Text Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 * 4. Show limit
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {Image, StyleSheet, TextInput, View} from 'react-native';

const LargeInputWithImageAttachment = ({
  text,
  isEmpty = false,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  showLimit,
  bgColor = 'w',
  scrollToFocus = () => {},
  AttachedImg,
}: {
  isEmpty?: boolean;
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  showLimit?: boolean;
  bgColor?: 'w' | 'g';
  scrollToFocus?: any;
  AttachedImg?: any;
}) => {
  const onTextChange = (newText: string) => {
    if (text.length === 0 && newText === ' ') {
      return;
    } else {
      setText(newText);
    }
  };
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        paddingVertical: PortSpacing.secondary.bottom,
        ...{
          borderColor: isEmpty
            ? PortColors.primary.red.error
            : isFocused
            ? PortColors.primary.blue.app
            : PortColors.stroke,
          backgroundColor:
            bgColor && bgColor === 'g'
              ? PortColors.primary.grey.light
              : PortColors.primary.white,
        },
      }}>
      <TextInput
        style={styles.inputText}
        onFocus={async () => {
          setIsFocused(true);
          await scrollToFocus();
        }}
        onBlur={() => setIsFocused(false)}
        multiline
        placeholder={placeholderText}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        placeholderTextColor={PortColors.primary.grey.medium}
        onChangeText={onTextChange}
        textAlignVertical="top"
        value={text}
      />
      <View
        style={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: PortSpacing.secondary.uniform,
        }}>
        {AttachedImg && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: PortSpacing.secondary.right,
            }}>
            {typeof AttachedImg === 'string' ? (
              <Image
                style={{
                  height: 48,
                  width: 48,
                  borderRadius: PortSpacing.tertiary.uniform,
                }}
                source={{
                  uri: AttachedImg,
                }}
              />
            ) : (
              <View style={styles.audioMsgWrapper}>
                <AttachedImg width={30} height={30} />
              </View>
            )}
          </View>
        )}
        {showLimit && (
          <NumberlessText
            style={{flex: 1, textAlign: 'right'}}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}
            textColor={PortColors.text.secondary}>
            {text.length}/{maxLength}
          </NumberlessText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  audioMsgWrapper: {
    backgroundColor: '#FEB95A',
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PortSpacing.tertiary.uniform,
  },
  inputText: {
    paddingVertical: 0,
    alignSelf: 'stretch',
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
    color: PortColors.subtitle,
    maxHeight: 100,
    height: undefined,
    minHeight: 100,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
});

export default LargeInputWithImageAttachment;
