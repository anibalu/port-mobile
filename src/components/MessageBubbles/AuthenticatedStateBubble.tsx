import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import RetryRed from '@assets/icons/RetryRed.svg';
import * as API from '../../utils/DirectChats/APICalls';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {RETRY_INTERVAL} from '@configs/constants';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {ToastType, useToast} from 'src/context/ToastContext';

export const AuthenticatedStateBubble = (): ReactNode => {
  const {isAuthenticated, isConnected, chatId, name} = useChatContext();
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
    <View
      style={{
        width: screen.width,
        alignItems: 'center',
        paddingTop: 110,
      }}>
      {isAuthenticated ? (
        <View style={styles.container}>
          <LockIcon height={16} width={16} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
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

  const {showToast} = useToast();

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
        showToast('Notification sent to user', ToastType.success);
        setShowRetry(false);
      } catch (error) {
        showToast('Error while notifying user', ToastType.error);
        console.error('Error while retrying:', error);
      }
    }
    setIsLoading(false);
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

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
            textColor={Colors.text.primary}>
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
              textColor={Colors.primary.red}>
              {isLoading ? 'Trying...' : 'Try Again'}
            </NumberlessText>
          </View>
        </Pressable>
      ) : (
        <View style={styles.container}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
            {`Your encrypted messages will be sent once ${name} reopens Port`}
          </NumberlessText>
        </View>
      )}
    </>
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
