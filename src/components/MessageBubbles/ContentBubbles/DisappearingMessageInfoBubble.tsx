import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {getLabelByTimeDiff} from '@utils/ChatPermissions';
import {
  DisappearingMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';

export const DisappearingMessageInfoBubble = ({
  message,
}: {
  message: SavedMessageParams;
}): ReactNode => {
  const {name} = useChatContext();
  const displayName = message.sender ? 'You have ' : name + ' has ';
  const turnedOff =
    getLabelByTimeDiff(
      (message.data as DisappearingMessageParams).timeoutValue,
    ) === 'Off';
  return (
    <NumberlessText
      fontSizeType={FontSizeType.s}
      fontType={FontType.rg}
      style={{textAlign: 'center'}}
      textColor={PortColors.text.primary}>
      {turnedOff
        ? displayName + 'turned off disappearing messages'
        : displayName +
          'turned on disappearing messages. New messages will disappear from this chat in ' +
          getLabelByTimeDiff(
            (message.data as DisappearingMessageParams).timeoutValue,
          )}
    </NumberlessText>
  );
};
