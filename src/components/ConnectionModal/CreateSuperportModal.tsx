import ShareIcon from '@assets/icons/Share.svg';
import Superports from '@assets/icons/SuperPorts.svg';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import Cross from '@assets/icons/cross.svg';
import Delete from '@assets/icons/redTrash.svg';
import {GenericButton} from '@components/GenericButton';
import GenericModalTopBar from '@components/GenericModalTopBar';
import {
  cleanDeletePort,
  fetchSuperport,
  getBundleClickableLink,
} from '@utils/Ports';
import {
  BundleTarget,
  DirectSuperportBundle,
  PortTable,
} from '@utils/Ports/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import {PortColors, screen} from '../ComponentUtils';
import GenericInput from '../GenericInput';
import GenericModal from '../GenericModal';
import {FontSizeType, FontType, NumberlessText} from '../NumberlessText';
import {displayQR} from './QRUtils';

const LINK_ARRAY_LIMIT = [null, 5, 10, 50, 100];

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

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const [loadingOperation, setLoadingOperation] = useState(false);

  //Is null if the incoming limit after creation is null, which means that the user has unlimited scans.
  const [linkLimit, setLinkLimit] = useState<number | null>(2);
  const {unableToSharelinkError} = useErrorModal();
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
        const {bundle, superport} = await fetchSuperport(superportId);
        setQRCodeData(JSON.stringify(bundle));
        setLabel(superport.label ? superport.label : 'unlabeled');
        setLinkLimit(superport.connectionsPossible);
      } else if (linkLimit != null) {
        const newLabel = label.trim() !== '' ? label.trim() : 'unlabeled';
        setLabel(newLabel);
        const {bundle} = await fetchSuperport(
          null,
          newLabel,
          LINK_ARRAY_LIMIT[Math.abs(linkLimit) % 5],
        );
        setQRCodeData(JSON.stringify(bundle));
      }
    } catch (error) {
      //set bundle generated error
      setBundleGenError(true);
    } finally {
      setIsLoadingBundle(false);
    }
  };

  const updateConnectionCount = async () => {
    try {
      if (modalVisible && latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;

        if (qrCodeData !== '') {
          const {superport} = await fetchSuperport(latestUsedConnectionLinkId);
          setLinkLimit(superport.connectionsPossible);
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
  };

  useEffect(() => {
    updateConnectionCount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    if (!isLoadingBundle && !bundleGenError && qrCodeData !== '') {
      if (linkData === '') {
        const bundle: DirectSuperportBundle = JSON.parse(qrCodeData);
        const link = await getBundleClickableLink(
          BundleTarget.superportDirect,
          bundle.portId,
          qrCodeData,
        );
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
      setLoadingOperation(true);
      let linkURL = null;
      linkURL = await fetchLinkData();
      if (linkURL != null) {
        const shareContent = {
          title: 'Share a new Superport',
          message: linkURL,
        };
        await Share.open(shareContent);
      }
    } catch (error) {
      unableToSharelinkError();
      console.log('Error sharing content: ', error);
    } finally {
      setLoadingOperation(false);
    }
  };
  const handleClose = async () => {
    setLoadingOperation(true);
    try {
      if (superportId && superportId !== '') {
        await cleanDeletePort(superportId, PortTable.superport);
      } else {
        await cleanDeletePort(
          JSON.parse(qrCodeData).data.linkId,
          PortTable.superport,
        );
      }
      openSuperportModal();
    } catch (error) {
      console.log('Error closing superport: ', error);
      openSuperportModal();
    } finally {
      setLoadingOperation(false);
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

  const LimitInfoDisplay = (): ReactNode => {
    return (
      <>
        <NumberlessText
          fontSizeType={FontSizeType.l}
          fontType={FontType.sb}
          style={{marginTop: 23}}
          textColor={PortColors.text.title}>
          Set connections limit
        </NumberlessText>
      </>
    );
  };

  return (
    <GenericModal visible={modalVisible} onClose={cleanupModal}>
      <View style={styles.modalView}>
        <GenericModalTopBar
          RightOptionalIcon={Cross}
          onBackPress={cleanupModal}
        />
        {!createPressed ? (
          <>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.sb}
              textColor={PortColors.text.title}>
              Open Superport
            </NumberlessText>
            <GenericInput
              text={label}
              inputStyle={{
                marginVertical: 12,
                height: 50,
              }}
              setText={setLabel}
              placeholder="Enter superport label"
              alignment="center"
            />

            <LimitInfoDisplay />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <NumberlessText
                onPress={() => {
                  setLinkLimit(val => val! - 1);
                }}
                style={styles.fauxButtonStyle}
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                textColor={PortColors.text.title}>
                -
              </NumberlessText>
              <GenericInput
                text={
                  //Cannot be null here, as linkLimit is not set to null if the user is creating a port
                  Math.abs(linkLimit!) % 5 === 0
                    ? 'Unlimited'
                    : LINK_ARRAY_LIMIT[Math.abs(linkLimit!) % 5]!.toString()
                }
                inputStyle={{
                  width: 100,
                  marginHorizontal: 20,
                  marginVertical: 12,
                  height: 50,
                }}
                editable={false}
                alignment="center"
              />
              <NumberlessText
                onPress={() => {
                  setLinkLimit(val => val! + 1);
                }}
                style={styles.fauxButtonStyle}
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                textColor={PortColors.text.title}>
                +
              </NumberlessText>
            </View>

            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              style={{fontStyle: 'italic', textAlign: 'center', width: 230}}
              textColor={PortColors.text.title}>
              Only the entered number of connections can be made through this
              superport
            </NumberlessText>

            <GenericButton
              buttonStyle={{
                flexDirection: 'row',
                height: 60,
                marginVertical: 40,
              }}
              textStyle={{textAlign: 'center'}}
              IconLeft={Superports}
              iconSize={40}
              iconStyleLeft={{alignItems: 'flex-end', flex: 1}}
              iconStyleRight={{flex: 1, alignItems: 'flex-end'}}
              iconSizeRight={14}
              IconRight={WhiteArrowRight}
              onPress={fetchQRCodeData}>
              Create Superport
            </GenericButton>
          </>
        ) : (
          <>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontType={FontType.sb}
              textColor={PortColors.text.title}>
              Superport
            </NumberlessText>
            <GenericInput
              inputStyle={{
                marginVertical: 12,
                height: 50,
              }}
              editable={false}
              text={label}
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
                displayQR(bundleGenError, qrCodeData)
              )}
            </View>

            {!isLoadingBundle && !bundleGenError ? (
              <>
                <LimitInfoDisplay />
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  style={{
                    overflow: 'hidden',
                    backgroundColor: PortColors.primary.grey.light,
                    borderRadius: 8,
                    paddingVertical: 11,
                    marginTop: 18,
                    paddingHorizontal: 30,
                  }}
                  textColor={PortColors.text.secondary}>
                  {superportId
                    ? linkLimit != null
                      ? linkLimit
                      : 'Unlimited'
                    : Math.abs(linkLimit!) % 5 === 0
                    ? 'Unlimited'
                    : LINK_ARRAY_LIMIT[Math.abs(linkLimit!) % 5]!.toString()}
                </NumberlessText>
              </>
            ) : (
              <View />
            )}
            <NumberlessText
              fontSizeType={FontSizeType.m}
              style={{marginTop: 17}}
              fontType={FontType.rg}>
              Or
            </NumberlessText>
            <GenericButton
              buttonStyle={styles.deletePortButtonStyle}
              textStyle={{
                color: PortColors.primary.red.error,
                textAlign: 'center',
              }}
              IconLeft={Delete}
              loading={loadingOperation}
              iconStyleLeft={{alignItems: 'center'}}
              onPress={handleClose}>
              Close Superport
            </GenericButton>

            <GenericButton
              buttonStyle={{
                flexDirection: 'row',
                width: screen.width - 82,
                height: 60,
                marginBottom: 38,
              }}
              textStyle={{textAlign: 'center'}}
              IconLeft={ShareIcon}
              loading={loadingOperation}
              iconStyleLeft={{alignItems: 'center'}}
              onPress={handleShare}>
              Share as link instead
            </GenericButton>
          </>
        )}
      </View>
    </GenericModal>
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
    paddingHorizontal: 30,
  },
  fauxButtonStyle: {
    borderRadius: 28,
    padding: 8,
    height: 40,
    width: 40,
    textAlign: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(84, 124, 239, 0.12)',
  },
  deletePortButtonStyle: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: PortColors.primary.white,
    borderColor: PortColors.primary.red.error,
    borderWidth: 1,
    marginTop: 13,
    marginBottom: 18,
    width: screen.width - 82,
  },

  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateSuperportModal;
