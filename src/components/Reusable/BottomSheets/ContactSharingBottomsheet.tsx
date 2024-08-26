import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import PrimaryButton from '../LongButtons/PrimaryButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import SecondaryButton from '../LongButtons/SecondaryButton';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {convertAuthorizedContactPortToShareablePort} from '@utils/Ports/contactport';
import {getBundleClickableLink} from '@utils/Ports';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import Share from 'react-native-share';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import {ContentType} from '@utils/Messaging/interfaces';

/**
 * 1. On contact share pressed, we start try to share contact.
 * 2. If no network, we show retry sheet
 * 3. If permission not available, or if contact port not available, we show request permission sheet.
 * 4. If contact port found and permission available, we share contact.
 */

enum ErrorState {
  InitialState = 1,
  NetworkError = 2,
  NoPermissionError = 3,
  NoContactPortError = 4,
  NoContactError = 5,
  UnknownError = 6,
}

const ContactSharingBottomsheet = ({
  visible,
  onClose,
  contactShareParams,
}: {
  visible: boolean;
  onClose: () => void;
  contactShareParams: {
    name: string;
    pairHash: string;
  };
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<ErrorState>(
    ErrorState.InitialState,
  );

  const onModalClose = () => {
    setIsLoading(true);
    setErrorState(ErrorState.InitialState);
    onClose();
  };

  const onLoad = async () => {
    setIsLoading(true);
    try {
      const bundle = await convertAuthorizedContactPortToShareablePort(
        contactShareParams.pairHash,
      );
      const bundleLink = await getBundleClickableLink(
        BundleTarget.contactPort,
        bundle.portId,
        JSON.stringify(bundle),
      );
      const shareContent = {
        title: `Sharing ${contactShareParams.name}'s a contact`,
        message: `Click on this link to connect with ${contactShareParams.name} on Port \n ${bundleLink}`,
      };
      Share.open(shareContent).catch(e =>
        console.log('Contact link not shared: ', e),
      );
    } catch (error: any) {
      console.log('Unable to share contact: ', error);
      if (error && error.message) {
        if (error.message === 'NoValidChat') {
          setErrorState(ErrorState.NoContactError);
        } else if (error.message === 'NoAuthorizedContactPort') {
          setErrorState(ErrorState.NoContactPortError);
        } else if (error.message === 'PermissionError') {
          setErrorState(ErrorState.NoPermissionError);
        } else if (error.message === 'APIError') {
          setErrorState(ErrorState.NetworkError);
        } else {
          setErrorState(ErrorState.UnknownError);
        }
      } else {
        setErrorState(ErrorState.UnknownError);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'Retry',
      light: require('@assets/light/icons/Retry.svg').default,
      dark: require('@assets/dark/icons/Retry.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Retry = results.Retry;
  return (
    <PrimaryBottomSheet
      showClose={true}
      visible={visible}
      title={`Share ${contactShareParams.name}'s contact`}
      titleStyle={styles.title}
      onClose={onModalClose}>
      {isLoading ? (
        //If port link generation is in progress, show loader
        <View style={{paddingVertical: PortSpacing.secondary.uniform}}>
          <ActivityIndicator size={'small'} color={Colors.primary.accent} />
        </View>
      ) : errorState === ErrorState.InitialState ? (
        <View
          style={{
            paddingVertical: PortSpacing.secondary.uniform,
            width: '100%',
          }}
        />
      ) : (
        <View
          style={{
            paddingVertical: PortSpacing.secondary.uniform,
            width: '100%',
          }}>
          {errorState === ErrorState.NetworkError && (
            <View style={styles.mainWrapper}>
              <NumberlessText
                style={styles.description}
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Network error in trying to share contact. Please check your
                network connection and try again.
              </NumberlessText>
              <SecondaryButton
                buttonText={'Try Again'}
                secondaryButtonColor={'black'}
                Icon={Retry}
                iconSize={'s'}
                onClick={onLoad}
              />
            </View>
          )}
          {(errorState === ErrorState.UnknownError ||
            errorState === ErrorState.NoContactError) && (
            <View style={styles.mainWrapper}>
              <NumberlessText
                style={styles.description}
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Error in trying to share contact. Please try again later.
              </NumberlessText>
              <SecondaryButton
                buttonText={'Try Again'}
                secondaryButtonColor={'black'}
                Icon={Retry}
                iconSize={'s'}
                onClick={onLoad}
              />
            </View>
          )}
          {errorState === ErrorState.NoContactPortError && (
            <>
              <View
                style={{
                  marginBottom: PortSpacing.secondary.bottom,
                  width: '100%',
                }}>
                <NumberlessText
                  style={{color: Colors.text.subtitle}}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}>
                  {`You don't have permission to share ${contactShareParams.name}'s contact or they are on an older version of Port that does not support sharing their contact. Click the button below to request their permission.`}
                </NumberlessText>
              </View>
              <PrimaryButton
                buttonText={'Request permission'}
                primaryButtonColor={'b'}
                isLoading={isLoading}
                disabled={false}
                onClick={async () => {
                  try {
                    const chatId = await getChatIdFromPairHash(
                      contactShareParams.pairHash,
                    );
                    if (!chatId) {
                      throw new Error('No chat Id found');
                    }
                    const sender = new SendMessage(
                      chatId,
                      ContentType.contactPortRequest,
                      {},
                    );
                    await sender.send();
                  } catch (error) {
                    console.error('Error requesting contact port: ', error);
                  }
                  onModalClose();
                }}
              />
            </>
          )}
          {errorState === ErrorState.NoPermissionError && (
            <>
              <View
                style={{
                  marginBottom: PortSpacing.secondary.bottom,
                  width: '100%',
                }}>
                <NumberlessText
                  style={{color: Colors.text.subtitle}}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.rg}>
                  {`You don't have permission to share ${contactShareParams.name}'s contact. Click the button below to request their permission.`}
                </NumberlessText>
              </View>
              <PrimaryButton
                buttonText={'Request permission'}
                primaryButtonColor={'b'}
                isLoading={isLoading}
                disabled={false}
                onClick={async () => {
                  try {
                    const chatId = await getChatIdFromPairHash(
                      contactShareParams.pairHash,
                    );
                    if (!chatId) {
                      throw new Error('No chat Id found');
                    }
                    const sender = new SendMessage(
                      chatId,
                      ContentType.contactPortPermissionRequest,
                      {},
                    );
                    await sender.send();
                  } catch (error) {
                    console.error(
                      'Error requesting contact port permission: ',
                      error,
                    );
                  }
                  onModalClose();
                }}
              />
            </>
          )}
          {errorState === ErrorState.UnknownError && (
            <View style={{paddingVertical: PortSpacing.secondary.uniform}} />
          )}
        </View>
      )}
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
  },
  description: {
    width: '100%',
    marginBottom: PortSpacing.intermediate.bottom,
  },
});

export default ContactSharingBottomsheet;
