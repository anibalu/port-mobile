import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import Lock from '@assets/icons/LockIconBlack.svg';

export const AuthenticatedStateBubble = (): ReactNode => {
  const {isAuthenticated, isConnected, name} = useChatContext();
  if (isConnected) {
    return (
      <View style={{width: screen.width, alignItems: 'center'}}>
        {isAuthenticated ? (
          <View style={styles.container}>
            <Lock height={16} width={16} />
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.primary}>
              This chat is now end-to-end encrypted.
            </NumberlessText>
          </View>
        ) : (
          <View style={styles.container}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.primary}>
              {`Your encrypted messages will be sent once ${name} reopens Port`}
            </NumberlessText>
          </View>
        )}
      </View>
    );
  } else {
    return <></>;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
    gap: PortSpacing.tertiary.uniform,
  },
});
