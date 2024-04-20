import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  ContentType,
  InfoParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {DisappearingMessageInfoBubble} from './ContentBubbles/DisappearingMessageInfoBubble';

export const InfoBubble = ({
  message,
}: {
  message: SavedMessageParams;
}): ReactNode => {
  return (
    <>
      <View style={styles.container}>{renderInfoBubble(message)}</View>
    </>
  );
};

const renderInfoBubble = (message: SavedMessageParams) => {
  switch (message.contentType) {
    case ContentType.disappearingMessages:
      return <DisappearingMessageInfoBubble message={message} />;
    default:
      return (
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={PortColors.text.primary}>
          {(message.data as InfoParams).info}
        </NumberlessText>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: screen.width - 64,
    paddingVertical: PortSpacing.tertiary.uniform,
    paddingHorizontal: PortSpacing.secondary.uniform,
    backgroundColor: '#FFFCEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFF6C4',
    marginBottom: PortSpacing.tertiary.uniform,
  },
});
