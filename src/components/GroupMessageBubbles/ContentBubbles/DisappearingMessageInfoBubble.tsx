import React, {ReactNode} from 'react';
import {View} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {useChatContext} from '@screens/GroupChat/ChatContext';

import {DisappearingMessageParams} from '@utils/Messaging/interfaces';
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {getLabelByTimeDiff} from '@utils/Time';

export const DisappearingMessageInfoBubble = ({
  message,
}: {
  message: LoadedGroupMessage;
}): ReactNode => {
  const svgArray = [
    {
      assetName: 'ClockIcon',
      light: require('@assets/light/icons/ClockIcon.svg').default,
      dark: require('@assets/dark/icons/ClockIcon.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const ClockIcon = results.ClockIcon;

  const {name} = useChatContext();
  const displayName = message.sender ? 'You have ' : name + ' has ';
  const turnedOff =
    getLabelByTimeDiff(
      (message.data as DisappearingMessageParams).timeoutValue,
    ) === 'Off';
  const Colors = DynamicColors();
  return (
    <NumberlessText
      fontSizeType={FontSizeType.s}
      fontType={FontType.rg}
      style={{textAlign: 'center'}}
      textColor={Colors.text.primary}>
      <View
        style={{
          paddingRight: 4,
          transform: [{translateY: 1}],
        }}>
        <ClockIcon width={12} height={12} />
      </View>
      {turnedOff
        ? displayName + 'turned off disappearing messages'
        : displayName +
          'turned on disappearing messages. New messages will disappear from this chat in ' +
          getLabelByTimeDiff(
            (message.data as DisappearingMessageParams).timeoutValue,
          ) +
          '.'}
    </NumberlessText>
  );
};
