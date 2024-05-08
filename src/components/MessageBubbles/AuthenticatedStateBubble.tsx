import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import Lock from '@assets/icons/LockIconBlack.svg';
import RetryRed from '@assets/icons/retryRed.svg';
import * as API from '../../utils/DirectChats/APICalls';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {RETRY_INTERVAL} from '@configs/constants';
import {useErrorModal} from 'src/context/ErrorModalContext';

export const AuthenticatedStateBubble = (): ReactNode => {
  const {isAuthenticated, isConnected, chatId, name} = useChatContext();
  if (!isConnected) {
    return <></>;
  }

  return (
    <View style={{width: screen.width, alignItems: 'center'}}>
      {isAuthenticated ? (
        <View style={styles.container}>
          <Lock height={16} width={16} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={PortColors.text.primary}>
            This chat is end-to-end encrypted.
          </NumberlessText>
        </View>
      ) : (
        <UnAuthenticatedStateBubble lineId={chatId} name={name} />
      )}
    </View>
  );
};

const UnAuthenticatedStateBubble = ({
  lineId,
  name,
}: {
  lineId: string;
  name: string;
}): ReactNode => {
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {notifyUserOfConnectionError, unableToNotifyUserError} =
    useErrorModal();

  useEffect(() => {
    // Calculate the retry time from the 'createdOn' time
    const timeout = setTimeout(() => {
      setShowRetry(true);
    }, RETRY_INTERVAL);

    return () => clearTimeout(timeout);
  }, []);

  const onRetry = async () => {
    setIsLoading(true);
    if (lineId) {
      try {
        await API.retryDirectChatFromPort(lineId);
        notifyUserOfConnectionError();
        setShowRetry(false);
      } catch (error) {
        unableToNotifyUserError();
        console.error('Error while retrying:', error);
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      {showRetry ? (
        <Pressable
          onPress={onRetry}
          style={StyleSheet.compose(styles.container, {
            flexDirection: 'column',
          })}>
          <NumberlessText
            style={{textAlign: 'center'}}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={PortColors.text.primary}>
            This connection is taking longer to authenticate than expected. This
            could happen if {name} has been offline.
          </NumberlessText>
          <View style={styles.retryButton}>
            {isLoading ? (
              <ActivityIndicator color={PortColors.primary.blue.app} />
            ) : (
              <RetryRed />
            )}
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={PortColors.primary.red.error}>
              {isLoading ? 'Trying...' : 'Try Again'}
            </NumberlessText>
          </View>
        </Pressable>
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
    </>
  );
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
    marginVertical: PortSpacing.tertiary.uniform,
    gap: PortSpacing.tertiary.uniform,
  },
  retryButton: {
    flexDirection: 'row',
    gap: PortSpacing.tertiary.uniform,
    alignItems: 'center',
    marginTop: PortSpacing.tertiary.top,
  },
});
