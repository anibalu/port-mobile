import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import {renderTimeStamp} from '@screens/Chat/BubbleUtils';

export const DeletedBubble = ({
  message,
}: {
  message: SavedMessageParams;
}): ReactNode => {
  const text = 'You deleted this message';

  return (
    <View style={styles.textContainerRow}>
      <View style={styles.textBubbleRowContainer}>
        <NumberlessText
          style={{color: PortColors.primary.body}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {text}
        </NumberlessText>
        {renderTimeStamp(message)}
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
