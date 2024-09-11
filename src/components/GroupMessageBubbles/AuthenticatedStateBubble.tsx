import {PortSpacing, screen} from '@components/ComponentUtils';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatContext} from '@screens/GroupChat/ChatContext';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

export const AuthenticatedStateBubble = (): ReactNode => {
  const {isConnected} = useChatContext();
  const svgArray = [
    {
      assetName: 'LockIcon',
      light: require('@assets/light/icons/Lock.svg').default,
      dark: require('@assets/dark/icons/Lock.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const LockIcon = results.LockIcon;
  if (!isConnected) {
    return <></>;
  }
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View style={{width: screen.width, alignItems: 'center'}}>
      <View style={styles.container}>
        <LockIcon height={16} width={16} />
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={Colors.text.primary}>
          This chat is end-to-end encrypted.
        </NumberlessText>
      </View>
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: screen.width - 64,
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      backgroundColor: colors.labels.fill,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.labels.stroke,
      marginBottom: PortSpacing.tertiary.uniform,
      gap: PortSpacing.tertiary.uniform,
      marginTop: PortSpacing.tertiary.uniform,
    },
    retryButton: {
      flexDirection: 'row',
      gap: PortSpacing.tertiary.uniform,
      alignItems: 'center',
      marginTop: PortSpacing.tertiary.top,
    },
  });
