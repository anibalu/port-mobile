import {useEffect, useState} from 'react';
import {NumberlessText, FontSizeType, FontType} from './NumberlessText';
import {getRichReactions} from '@utils/Storage/reactions';
import React = require('react');

interface richReaction {
  senderName?: string;
  reaction: string;
}
export const RichREactionRibbon = ({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) => {
  /**
   * TODO
   * To delete my reactions, send a message of content type reaction with tombstone set to true
   */
  const [reactions, setReactions] = useState<richReaction[]>([]);
  useEffect(() => {
    (async () => {
      setReactions(await getRichReactions(chatId, messageId));
    })();
    //eslint-disable-next-line
  }, []);
  return (
    <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.sb}>
      {JSON.stringify(reactions)}
    </NumberlessText>
  );
};
