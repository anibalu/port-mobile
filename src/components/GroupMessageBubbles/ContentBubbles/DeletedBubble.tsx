import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';

import {RenderTimeStamp} from '../BubbleUtils';


export const DeletedBubble = ({
  message,
}: {
  message: LoadedGroupMessage;
}): ReactNode => {
  const text = 'This message was deleted';

  return (
    <View style={styles.textContainerRow}>
      <View style={styles.textBubbleRowContainer}>
        <NumberlessText
          style={{color: PortColors.primary.body}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {text}
        </NumberlessText>
        <RenderTimeStamp message={message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  textBubbleRowContainer: {
    flexDirection: 'row',
    columnGap: 4,
    justifyContent: 'center',
  },
});
