/**
 * custom text bar for Numberless that uses Rubik font
 */
import React from 'react';
import {
  ColorValue,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
} from 'react-native';
import Autolink from 'react-native-autolink';
import {PortColors} from './ComponentUtils';

export enum FontType {
  'sb' = 'Rubik-SemiBold',
  'md' = 'Rubik-Medium',
  'rg' = 'Rubik-Regular',
}

export enum FontSizeType {
  'xl' = 21,
  'l' = 17,
  'm' = 15,
  's' = 12,
  'xs' = 10,
}

export const getWeight = (fontType: FontType): '400' | '500' | '600' => {
  switch (fontType) {
    case FontType.sb: {
      return '600';
    }
    case FontType.md: {
      return '500';
    }
    case FontType.rg: {
      return '400';
    }
  }
};

type TypographyProps = TextProps & {
  fontType: FontType;
  fontSizeType: FontSizeType;
  textColor?: ColorValue;
};

/**
 *
 * @param children- Only string is allowed
 * @returns
 */
export const NumberlessLinkText: React.FC<
  TypographyProps & {children: string}
> = ({
  children,
  style,
  fontType,
  fontSizeType,
  textColor = PortColors.text.primary,
  numberOfLines = 0,
  ...rest
}) => (
  <Autolink
    text={children}
    url
    numberOfLines={numberOfLines}
    email
    renderText={text => (
      <NumberlessText
        fontSizeType={fontSizeType}
        textColor={textColor}
        fontType={fontType}
        style={style}
        {...rest}>
        {text}
      </NumberlessText>
    )}
  />
);

/**
 *
 * @param children - String or ReactNode components that can be placed inside
 * @param style -  adjust padding or bounding boxes. Do not pass in color or font sizes here.
 * @returns
 */
export const NumberlessText: React.FC<TypographyProps> = ({
  children,
  style,
  fontType,
  fontSizeType,
  textColor = PortColors.text.primary,
  ...rest
}) => (
  <Text
    style={StyleSheet.compose(
      {
        fontFamily: fontType,
        fontSize: fontSizeType,
        fontWeight: getWeight(fontType),
        color: textColor,
      },
      style,
    )}
    {...rest}>
    {children}
  </Text>
);

export const NumberlessRegularText: React.FC<TextProps> = ({
  children,
  style,
  ...rest
}) => (
  <Text style={StyleSheet.compose(styles.regular, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessItalicText: React.FC<TextProps> = ({
  children,
  style,
  ...rest
}) => (
  <Text style={StyleSheet.compose(styles.italic, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessBoldText: React.FC<TextProps> = ({
  children,
  style,
  ...rest
}) => (
  <Text style={StyleSheet.compose(styles.bold, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessClickableText: React.FC<TextProps> = ({
  children,
  style,
  onPress,
  ...rest
}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={StyleSheet.compose(styles.clickable, style)} {...rest}>
      {children}
    </Text>
  </TouchableOpacity>
);

export const NumberlessMediumText: React.FC<TextProps> = ({
  children,
  style,
  ...rest
}) => (
  <Text style={StyleSheet.compose(styles.medium, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessSemiBoldText: React.FC<TextProps> = ({
  children,
  style,
  ...rest
}) => (
  <Text style={StyleSheet.compose(styles.semibold, style)} {...rest}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  regular: {
    color: '#747474',
    fontFamily: 'Rubik-Regular',
    fontSize: 15,
  },
  bold: {
    color: '#547CEF',
    fontFamily: 'Rubik-Bold',
    fontSize: 17,
  },
  medium: {
    color: '#000000',
    fontFamily: 'Rubik-Medium',
    fontSize: 17,
  },
  semibold: {
    color: '#18191F',
    fontFamily: 'Rubik-SemiBold',
    fontSize: 17,
  },
  clickable: {
    color: '#747474',
    fontFamily: 'Rubik-Regular',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  italic: {
    color: '#000000',
    fontFamily: 'Rubik-LightItalic',
    fontSize: 17,
  },
});
