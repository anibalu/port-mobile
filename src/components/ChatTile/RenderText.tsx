/**
 * Component to render text content within a chat tile.
 *
 * @param {ChatTileProps} newMessage - Object containing properties of the chat message
 * @returns {JSX.Element} - Rendered component with info text
 */

import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {View} from 'react-native';
import {ChatTileProps} from './ChatTile';

const RenderText = ({
  newMessage,
}: {
  newMessage: ChatTileProps | undefined | null;
}) => {
  const Colors = DynamicColors();

  const text = newMessage?.text;
  const italic = false;

  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={2}
        style={{width: screen.width - 160}}
        fontType={italic ? FontType.it : FontType.rg}
        fontSizeType={FontSizeType.m}
        textColor={Colors.text.subtitle}>
        {text}
      </NumberlessText>
    </View>
  );
};

export default RenderText;
