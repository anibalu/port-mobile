import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {ContentType, InfoParams} from '@utils/Messaging/interfaces';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

import {DisappearingMessageInfoBubble} from './ContentBubbles/DisappearingMessageInfoBubble';


export const InfoBubble = ({message}: {message: LoadedMessage}): ReactNode => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <>
      <View style={styles.container}>{renderInfoBubble(message)}</View>
    </>
  );
};

const renderInfoBubble = (message: LoadedMessage) => {
  const Colors = DynamicColors();
  switch (message.contentType) {
    case ContentType.disappearingMessages:
      return <DisappearingMessageInfoBubble message={message} />;
    default:
      return (
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={Colors.text.primary}>
          {(message.data as InfoParams).info}
        </NumberlessText>
      );
  }
};

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: screen.width - 64,
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      backgroundColor: colors.labels.fill,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary.stroke,
      marginBottom: PortSpacing.tertiary.uniform,
    },
  });
