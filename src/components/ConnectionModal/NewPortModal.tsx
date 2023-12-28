import Logo from '@assets/icons/Logo.svg';
import ShareIcon from '@assets/icons/Share.svg';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import Cross from '@assets/icons/cross.svg';
import {useNavigation} from '@react-navigation/native';
//import store from '@store/appStore';
import Exclamation from '@assets/icons/exclamation.svg';
import {GenericButton} from '@components/GenericButton';
import GenericModalTopBar from '@components/GenericModalTopBar';
import {generateDirectConnectionBundle} from '@utils/Bundles/direct';
import {convertBundleToLink} from '@utils/DeepLinking';
import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import {PortColors, screen} from '../ComponentUtils';
import GenericInput from '../GenericInput';
import GenericModal from '../GenericModal';
import {FontSizeType, FontType, NumberlessText} from '../NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {getProfileName} from '@utils/Profile';

const NewPortModal: React.FC = () => {
  const {
    newPortModalVisible: modalVisible,
    hideNewPortModal: hideModal,
    showSuperportModal: showSuperportModal,
  } = useConnectionModal();
  const [label, setLabel] = useState('');
  const [name, setName] = useState(DEFAULT_NAME);
  //updates name with user set name
  async function setUserName() {
    setName(await getProfileName());
  }

  useEffect(() => {
    (async () => {
      setUserName();
    })();
  }, []);

  const [createPressed, setCreatePressed] = useState<boolean>(false);

  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [bundleGenError, setBundleGenError] = useState<boolean>(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [linkData, setLinkData] = useState<string>('');

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const navigation = useNavigation();

  const cleanupModal = () => {
    hideModal();
    setLabel('');
    setCreatePressed(false);
    setIsLoadingBundle(true);
    setBundleGenError(false);
    setQRCodeData('');
    setLinkData('');
  };

  const openSuperportModal = () => {
    cleanupModal();
    showSuperportModal();
  };

  const fetchQRCodeData = async () => {
    try {
      setCreatePressed(true);
      setBundleGenError(false);
      setIsLoadingBundle(true);
      //use this function to generate and fetch QR code data.
      const bundle = await generateDirectConnectionBundle(label);
      setQRCodeData(JSON.stringify(bundle));
    } catch (error) {
      //set bundle generated error
      setBundleGenError(true);
    } finally {
      setIsLoadingBundle(false);
    }
  };

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    if (!isLoadingBundle && !bundleGenError && qrCodeData !== '') {
      if (linkData === '') {
        const link = await convertBundleToLink(qrCodeData);
        setLinkData(link);
        return link;
      }
      const link = linkData;
      return link;
    }
    throw new Error('Bundle incomplete');
  };
  //handles sharing in link form
  const handleShare = async () => {
    try {
      const linkURL = await fetchLinkData();
      const shareContent = {
        title: 'Create a new Port',
        message:
          `${name} would like to connect with you on Port! Click the link to start chatting: \n` +
          linkURL,
      };
      await Share.open(shareContent);
    } catch (error) {
      console.log('Error sharing content: ', error);
    }
  };

  useEffect(() => {
    if (modalVisible && latestNewConnection) {
      const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
      if (qrCodeData !== '') {
        const displayData = JSON.parse(qrCodeData);
        if (displayData.data.linkId === latestUsedConnectionLinkId) {
          cleanupModal();
          navigation.navigate('HomeTab');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  return (
    <GenericModal visible={modalVisible} onClose={cleanupModal}>
      <View style={styles.modalView}>
        <GenericModalTopBar
          RightOptionalIcon={Cross}
          onBackPress={cleanupModal}
        />
        <NumberlessText
          fontType={FontType.sb}
          fontSizeType={FontSizeType.l}
          textColor={PortColors.text.title}>
          Open port with
        </NumberlessText>

        <View style={styles.generic}>
          {createPressed ? (
            <View style={styles.generic}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                textColor={PortColors.text.secondary}
                style={styles.savedLabel}
                fontType={FontType.md}>
                {label}
              </NumberlessText>

              <View
                style={{
                  flexDirection: 'column',
                  width: screen.width * 0.5,
                  height: screen.width * 0.5,
                }}>
                {isLoadingBundle ? (
                  <View style={styles.qrBox}>
                    <ActivityIndicator size={'large'} color={'#000000'} />
                  </View>
                ) : (
                  displayQR(bundleGenError, qrCodeData)
                )}
              </View>

              <GenericButton
                onPress={handleShare}
                disabled={bundleGenError}
                Icon={ShareIcon}
                textStyle={{flex: 1, textAlign: 'center'}}
                buttonStyle={StyleSheet.compose(
                  styles.button,
                  bundleGenError && styles.disabledbutton,
                )}>
                Share as a link
              </GenericButton>
            </View>
          ) : (
            handleContactName(label, setLabel, fetchQRCodeData)
          )}
        </View>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.secondary}>
          Open other port type:
        </NumberlessText>

        <View style={styles.buttonArea}>
          <GenericButton
            onPress={() => {
              navigation.navigate('GroupOnboarding');
              cleanupModal();
            }}
            buttonStyle={styles.morePortButton}
            textStyle={{
              textAlign: 'center',
              color: PortColors.text.title,
            }}>
            GroupPort
          </GenericButton>
          <GenericButton
            onPress={() => {
              openSuperportModal();
            }}
            buttonStyle={StyleSheet.compose(styles.morePortButton, {
              marginLeft: 12,
            })}
            textStyle={{
              textAlign: 'center',
              color: PortColors.text.title,
            }}>
            SuperPort
          </GenericButton>
        </View>
      </View>
    </GenericModal>
  );
};

/**
 *
 * @param label string for name
 * @param setLabel setstate call
 * @param onPress
 * @returns UI Component
 */
const handleContactName = (
  label: string,
  setLabel: React.Dispatch<React.SetStateAction<string>>,
  onPress: () => Promise<void>,
): ReactNode => {
  return (
    <View style={styles.generic}>
      <GenericInput
        inputStyle={{
          marginVertical: 12,
        }}
        text={label}
        setText={setLabel}
        placeholder="Contact Name"
      />
      <GenericButton
        onPress={onPress}
        disabled={label.trim().length === 0}
        Icon={WhiteArrowRight}
        iconPosition={'right'}
        iconSize={14}
        iconStyle={{right: 20}}
        textStyle={{flex: 1, textAlign: 'center'}}
        buttonStyle={StyleSheet.compose(
          styles.button,
          label.trim().length === 0 && styles.disabledbutton,
        )}>
        Create port
      </GenericButton>
    </View>
  );
};

/**
 *
 * @param hasError, boolean that denotes if an error is hit
 * @param qrData, string that needs to be displayed as a QR.
 * @returns {ReactNode}, UI element
 */
const displayQR = (hasError: boolean, qrData: string): ReactNode => {
  return (
    <View style={styles.qrBox}>
      {hasError ? (
        <View style={styles.errorBox}>
          <Exclamation />
          <NumberlessText
            fontType={FontType.md}
            style={{marginTop: 16}}
            fontSizeType={FontSizeType.s}
            textColor={PortColors.text.secondary}>
            Error generating code
          </NumberlessText>
        </View>
      ) : (
        <View style={styles.qrBox}>
          <QRCode value={qrData} size={screen.width * 0.5} />
          <View style={styles.logoBox}>
            <Logo width={screen.width * 0.08} height={screen.width * 0.08} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'center',
    paddingTop: 12,
    justifyContent: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  errorBox: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  morePortButton: {
    height: 60,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PortColors.primary.grey.light,
  },
  savedLabel: {
    height: 60,
    width: '85%',
    backgroundColor: PortColors.primary.grey.light,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 8,
    paddingTop: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  generic: {
    width: screen.width - 64,
    marginBottom: 18,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArea: {
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 10,
    width: screen.width - 64,
    marginBottom: 30,
  },
  button: {
    backgroundColor: PortColors.primary.blue.app,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderRadius: 8,
    flexDirection: 'row',
  },
  disabledbutton: {
    opacity: 0.7,
  },
  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    position: 'absolute',
    backgroundColor: '#000000',
    padding: 5,
    borderRadius: 10,
  },
});

export default NewPortModal;
