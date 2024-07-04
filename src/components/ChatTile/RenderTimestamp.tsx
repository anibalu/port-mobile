/**
 * Component to render message timestamp within a chat tile.
 *
 * @param {ChatTileProps} props - Object containing properties of the chat tile message
 * @returns {JSX.Element} - Rendered component with timestamp
 */

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {View} from 'react-native';
import {getChatTileTimestamp} from '@utils/Time';
import {PortSpacing} from '@components/ComponentUtils';
import {ChatTileProps} from './ChatTile';

const RenderTimestamp = ({props}: {props: ChatTileProps}) => {
  const Colors = DynamicColors();

  return (
    <View>
      <NumberlessText
        numberOfLines={1}
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        textColor={Colors.primary.mediumgrey}
        style={{
          paddingRight: PortSpacing.secondary.right,
          paddingLeft: PortSpacing.tertiary.left,
        }}>
        {props.text !== '' && getChatTileTimestamp(props.timestamp)}
      </NumberlessText>
    </View>
  );
};

export default RenderTimestamp;
