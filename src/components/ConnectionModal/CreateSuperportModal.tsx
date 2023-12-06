import Cross from '@assets/icons/cross.svg';
import Back from '@assets/navigation/backButton.svg';
import Logo from '@assets/icons/Logo.svg';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import {FontSizes, PortColors, screen} from '../ComponentUtils';
import GenericInput from '../GenericInput';
import GenericModal from '../GenericModal';
import {
  NumberlessItalicText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '../NumberlessText';
import {GenericButton} from '@components/GenericButton';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import ShareIcon from '@assets/icons/Share.svg';
import QRCode from 'react-native-qrcode-svg';
import Delete from '@assets/icons/redTrash.svg';
import {
  closeGeneratedSuperport,
  generateDirectSuperportConnectionBundle,
  loadGeneratedSuperport,
} from '@utils/Bundles/directSuperport';
import {convertBundleToLink} from '@utils/DeepLinking';
import Share from 'react-native-share';
import {DirectSuperportConnectionBundle} from '@utils/Bundles/interfaces';

const CreateSuperportModal: React.FC = () => {
  const {
    superportCreateModalVisible: modalVisible,
    hideSuperportCreateModal: hideModal,
    showSuperportModal: showSuperportModal,
    connectionSuperportId: superportId,
    setConnectionSuperportId: setSuperportId,
  } = useConnectionModal();
  const [label, setLabel] = useState('');
  const [createPressed, setCreatePressed] = useState<boolean>(false);
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [bundleGenError, setBundleGenError] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [linkData, setLinkData] = useState<string>('');

  const connectionDirectionName = 'Connects to me';

  const cleanupModal = () => {
    hideModal();
    setSuperportId('');
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
      if (superportId && superportId !== '') {
        const fullBundle = await loadGeneratedSuperport(superportId);
        const bundle: DirectSuperportConnectionBundle = fullBundle;
        setQRCodeData(JSON.stringify(bundle));
        const newLabel =
          fullBundle.label && fullBundle.label !== ''
            ? fullBundle.label
            : 'unlabeled';
        setLabel(newLabel);
      } else {
        const newLabel = label.trim() !== '' ? label.trim() : 'unlabeled';
        setLabel(newLabel);
        const bundle = await generateDirectSuperportConnectionBundle(label);
        setQRCodeData(JSON.stringify(bundle));
      }
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
        title: 'Share a new Superport',
        message: linkURL,
      };
      await Share.open(shareContent);
    } catch (error) {
      console.log('Error sharing content: ', error);
    }
  };
  const handleClose = async () => {
    try {
      if (superportId && superportId !== '') {
        await closeGeneratedSuperport(superportId);
      } else {
        await closeGeneratedSuperport(JSON.parse(qrCodeData).data.linkId);
      }
      openSuperportModal();
    } catch (error) {
      console.log('Error closing superport: ', error);
      openSuperportModal();
    }
  };
  useEffect(() => {
    (async () => {
      if (superportId && superportId !== '') {
        await fetchQRCodeData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superportId]);
  return (
    <GenericModal visible={modalVisible} onClose={cleanupModal}>
      <View style={styles.modalView}>
        <View style={styles.superportTopBar}>
          <Pressable style={styles.closeButton} onPress={openSuperportModal}>
            <Back />
          </Pressable>
          <Pressable style={styles.closeButton} onPress={cleanupModal}>
            <Cross />
          </Pressable>
        </View>
        {!createPressed ? (
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessSemiBoldText
              style={{color: PortColors.primary.blue.app}}>
              Open Superport
            </NumberlessSemiBoldText>
            <GenericInput
              wrapperStyle={{
                width: screen.width,
                height: 60,
                paddingHorizontal: '8%',
              }}
              inputStyle={{...FontSizes[15].medium, borderRadius: 4}}
              text={label}
              setText={setLabel}
              placeholder="Enter superport label"
              alignment="center"
            />
            <GenericInput
              wrapperStyle={{
                width: screen.width,
                height: 60,
                marginTop: 8,
                marginBottom: 54,
                paddingHorizontal: '8%',
              }}
              editable={false}
              inputStyle={{borderRadius: 4}}
              text={connectionDirectionName}
              alignment="center"
            />
            <GenericButton
              buttonStyle={{
                flexDirection: 'row',
                width: '80%',
                height: 60,
                marginBottom: 38,
              }}
              textStyle={{flex: 1, textAlign: 'center'}}
              iconStyle={{right: 20}}
              Icon={WhiteArrowRight}
              iconPosition="right"
              onPress={fetchQRCodeData}>
              Create Superport
            </GenericButton>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessSemiBoldText
              style={{color: PortColors.primary.blue.app}}>
              Superport
            </NumberlessSemiBoldText>
            <GenericInput
              wrapperStyle={{
                width: screen.width,
                height: 60,
                marginTop: 20,
                paddingHorizontal: '8%',
              }}
              editable={false}
              inputStyle={{borderRadius: 4}}
              text={label}
              alignment="center"
            />
            <GenericInput
              wrapperStyle={{
                width: screen.width,
                height: 60,
                marginTop: 8,
                marginBottom: 20,
                paddingHorizontal: '8%',
              }}
              editable={false}
              inputStyle={{borderRadius: 4}}
              text={connectionDirectionName}
              alignment="center"
            />
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
                <View style={styles.qrBox}>
                  {bundleGenError ? (
                    <NumberlessItalicText style={styles.errorMessage}>
                      Error generating new Superport connection instrument.
                      Check your network connection and try again.
                    </NumberlessItalicText>
                  ) : (
                    <View style={styles.qrBox}>
                      <QRCode value={qrCodeData} size={screen.width * 0.5} />
                      <View style={styles.logoBox}>
                        <Logo
                          width={screen.width * 0.08}
                          height={screen.width * 0.08}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.genericView}>
              {!isLoadingBundle && !bundleGenError ? (
                <View style={styles.genericView}>
                  <NumberlessRegularText style={{marginVertical: 20}}>
                    Or
                  </NumberlessRegularText>
                  <GenericButton
                    buttonStyle={{
                      flexDirection: 'row',
                      width: '70%',
                      height: 60,
                      backgroundColor: PortColors.primary.white,
                      borderColor: PortColors.primary.red.error,
                      borderWidth: 1,
                      marginBottom: 18,
                    }}
                    textStyle={{
                      flex: 1,
                      color: PortColors.primary.red.error,
                      textAlign: 'center',
                    }}
                    Icon={Delete}
                    iconStyle={{left: '180%', bottom: 2}}
                    iconPosition="left"
                    onPress={handleClose}>
                    Close Superport
                  </GenericButton>

                  <GenericButton
                    buttonStyle={{
                      flexDirection: 'row',
                      width: '70%',
                      height: 60,
                      marginBottom: 38,
                    }}
                    textStyle={{flex: 1, textAlign: 'center'}}
                    Icon={ShareIcon}
                    iconStyle={{left: '100%', bottom: 2}}
                    iconPosition="left"
                    onPress={handleShare}>
                    Share as link instead
                  </GenericButton>
                </View>
              ) : (
                <View />
              )}
            </View>
          </View>
        )}
      </View>
    </GenericModal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  superportTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  BackButton: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    position: 'absolute',
    backgroundColor: '#000000',
    padding: 5,
    borderRadius: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#E02C2C',
  },
  genericView: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default CreateSuperportModal;
