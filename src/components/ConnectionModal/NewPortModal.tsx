import ShareIcon from '@assets/icons/Share.svg';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import {useNavigation} from '@react-navigation/native';
//import store from '@store/appStore';
import Groups from '@assets/icons/GroupsBlue.svg';
import SuperPorts from '@assets/icons/SuperportsBlue.svg';
import Person from '@assets/icons/personWhite.svg';
import {GenericButton} from '@components/GenericButton';
import {DEFAULT_NAME} from '@configs/constants';
import {getProfileName} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';
import {useConnectionModal} from '../../context/ConnectionModalContext';
import {PortColors, screen} from '../ComponentUtils';
import GenericInput from '../GenericInput';
import GenericModal from '../Modals/GenericModal';
import {FontSizeType, FontType, NumberlessText} from '../NumberlessText';
import {displayQR} from './QRUtils';
import {expiryOptions} from '@utils/Time/interfaces';
import {generateBundle, getBundleClickableLink} from '@utils/Ports';
import {BundleTarget, PortBundle} from '@utils/Ports/interfaces';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {PermissionPreset} from '@utils/ChatPermissionPresets/interfaces';
import {
  getAllPermissionPresets,
  getDefaultPermissionPreset,
} from '@utils/ChatPermissionPresets';
import Notch from './Notch';

const NewPortModal: React.FC = () => {
  const {
    newPortModalVisible: modalVisible,
    hideNewPortModal: hideModal,
    showSuperportModal: showSuperportModal,
  } = useConnectionModal();
  const {unableToSharelinkError} = useErrorModal();
  const [label, setLabel] = useState('');
  const [name, setName] = useState(DEFAULT_NAME);
  //updates name with user set name
  async function setUserName() {
    setName(await getProfileName());
  }

  const [createPressed, setCreatePressed] = useState<boolean>(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [bundleGenError, setBundleGenError] = useState<boolean>(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [linkData, setLinkData] = useState<string>('');

  const [availablePresets, setAvailablePresets] = useState<PermissionPreset[]>(
    [],
  );
  const [selectedPreset, setSelectedPreset] = useState<PermissionPreset | null>(
    null,
  );
  const [selectedTime, setSelectedTime] = useState(expiryOptions[0]);

  useEffect(() => {
    (async () => {
      setUserName();
      setSelectedPreset(await getDefaultPermissionPreset());
      setAvailablePresets(await getAllPermissionPresets());
    })();
  }, [modalVisible]);

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const navigation = useNavigation<any>();

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
      const bundle = await generateBundle(
        BundleTarget.direct,
        null,
        label,
        selectedTime,
        null,
        selectedPreset ? selectedPreset.presetId : null,
      );
      setQRCodeData(JSON.stringify(bundle));
    } catch (error) {
      console.log('Error in QR generation: ', error);
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
        const bundle: PortBundle = JSON.parse(qrCodeData);
        const link = await getBundleClickableLink(
          BundleTarget.direct,
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
      setLoadingShare(true);
      let linkURL = null;
      linkURL = await fetchLinkData();
      if (linkURL != null) {
        const shareContent = {
          title: 'Create a new Port',
          message:
            `${name} would like to connect with you on Port! Click the link to start chatting: \n` +
            linkURL,
        };
        await Share.open(shareContent);
      }
    } catch (error) {
      unableToSharelinkError();
      console.log('Error sharing content: ', error);
    } finally {
      setLoadingShare(false);
    }
  };

  useEffect(() => {
    try {
      if (modalVisible && latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrCodeData !== '') {
          const displayData: PortBundle = JSON.parse(qrCodeData);
          if (displayData.portId === latestUsedConnectionLinkId) {
            cleanupModal();
            navigation.navigate('HomeTab');
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  const DisplayQRComponent = (): ReactNode => {
    return (
      <View style={styles.generic}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.secondary}
          style={styles.savedLabel}
          fontType={FontType.md}>
          {label}
        </NumberlessText>

        <View style={styles.customisePreviewStyle}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              textColor={PortColors.text.secondary}
              fontType={FontType.rg}>
              Permission preset
            </NumberlessText>
            {selectedPreset && (
              <NumberlessText
                style={{
                  backgroundColor: PortColors.primary.white,
                  padding: 8,
                  borderRadius: 8,
                  marginLeft: 18,
                  overflow: 'hidden',
                }}
                textColor={PortColors.text.title}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                {selectedPreset.name}
              </NumberlessText>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 5,
              alignSelf: 'stretch',
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              textColor={PortColors.text.secondary}
              fontType={FontType.rg}>
              Request expires
            </NumberlessText>
            {selectedTime != undefined && (
              <NumberlessText
                style={{
                  backgroundColor: PortColors.primary.white,
                  padding: 8,
                  overflow: 'hidden',
                  marginLeft: 29,
                  borderRadius: 8,
                }}
                textColor={PortColors.text.title}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                {selectedTime}
              </NumberlessText>
            )}
          </View>
        </View>

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

        <NumberlessText
          fontSizeType={FontSizeType.m}
          style={{marginTop: 17}}
          fontType={FontType.rg}>
          Or
        </NumberlessText>

        <GenericButton
          onPress={handleShare}
          disabled={bundleGenError}
          IconLeft={ShareIcon}
          iconStyleLeft={{alignItems: 'center'}}
          loading={loadingShare}
          buttonStyle={StyleSheet.compose(
            [styles.button, {width: screen.width - 82}],
            bundleGenError && styles.disabledbutton,
          )}>
          Share as a link
        </GenericButton>
      </View>
    );
  };

  return (
    <GenericModal
      avoidKeyboard={false}
      visible={modalVisible}
      onClose={cleanupModal}>
      <View style={styles.modalView}>
        <Notch />

        <NumberlessText
          fontType={FontType.sb}
          fontSizeType={FontSizeType.l}
          textColor={PortColors.text.title}>
          Open port with
        </NumberlessText>

        {createPressed ? (
          <DisplayQRComponent />
        ) : (
          //Component is kept here, as TextInput focusing will get screwed during re-renders otherwise.
          <View style={styles.generic}>
            <GenericInput
              inputStyle={{
                marginVertical: 12,
                paddingLeft: 20,
                height: 50,
              }}
              alignment="left"
              text={label}
              setText={setLabel}
              placeholder="Contact Name"
            />
            <View style={styles.customiseBoxStyle}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}
                textColor={PortColors.text.title}>
                Customise Port
              </NumberlessText>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}
                style={{marginTop: 16}}
                textColor={PortColors.text.secondary}>
                Permission preset set to:
              </NumberlessText>
              <View style={styles.tileContainerStyle}>
                {availablePresets.length > 0 &&
                  availablePresets.map(permission => {
                    return (
                      <Tile
                        key={permission.presetId}
                        title={permission.name}
                        cleanup={cleanupModal}
                        navigation={navigation}
                        isActive={
                          permission.presetId === selectedPreset?.presetId
                        }
                        onPress={() => {
                          setSelectedPreset(permission);
                        }}
                      />
                    );
                  })}
              </View>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}
                style={{marginTop: 16}}
                textColor={PortColors.text.secondary}>
                Request is valid for:
              </NumberlessText>
              <View style={styles.tileContainerStyle}>
                {expiryOptions.map(time => {
                  return (
                    <Tile
                      key={time}
                      title={time}
                      cleanup={cleanupModal}
                      navigation={navigation}
                      isActive={time === selectedTime}
                      onPress={() => {
                        setSelectedTime(time);
                      }}
                    />
                  );
                })}
              </View>
            </View>

            <GenericButton
              onPress={fetchQRCodeData}
              disabled={label.trim().length === 0}
              IconLeft={Person}
              iconStyleLeft={{alignItems: 'flex-end', flex: 1}}
              IconRight={WhiteArrowRight}
              iconSizeRight={18}
              iconStyleRight={{flex: 1, alignItems: 'flex-end'}}
              textStyle={{textAlign: 'center'}}
              buttonStyle={StyleSheet.compose(
                styles.button,
                label.trim().length === 0 && styles.disabledbutton,
              )}>
              Create port
            </GenericButton>
          </View>
        )}

        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.secondary}>
          Other options:
        </NumberlessText>

        <View style={styles.buttonArea}>
          <GenericButton
            onPress={() => {
              cleanupModal();
              navigation.navigate('GroupOnboarding');
            }}
            buttonStyle={styles.morePortButton}
            IconLeft={Groups}
            textStyle={{
              textAlign: 'center',
              color: PortColors.text.title,
            }}>
            Group
          </GenericButton>
          <GenericButton
            onPress={() => {
              openSuperportModal();
            }}
            buttonStyle={StyleSheet.compose(styles.morePortButton, {
              marginLeft: 12,
            })}
            IconLeft={SuperPorts}
            textStyle={{
              textAlign: 'center',
              color: PortColors.text.title,
            }}>
            Superport
          </GenericButton>
        </View>
      </View>
    </GenericModal>
  );
};

const Tile = ({
  title,
  isActive,
  onPress,
  navigation,
  cleanup,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
  navigation: any;
  cleanup: any;
}): ReactNode => {
  return title === 'new' ? (
    <NumberlessText
      onPress={() => {
        cleanup();
        navigation.navigate('Presets');
      }}
      style={{
        padding: 8,
        borderRadius: 8,
        overflow: 'hidden',
        borderColor: PortColors.primary.blue.app,
        borderWidth: 1.25,
      }}
      fontSizeType={FontSizeType.m}
      fontType={FontType.rg}
      textColor={PortColors.text.title}>
      + Add new
    </NumberlessText>
  ) : (
    <NumberlessText
      onPress={onPress}
      key={title}
      style={{
        backgroundColor: isActive
          ? PortColors.primary.blue.app
          : PortColors.primary.white,
        padding: 8,
        overflow: 'hidden',
        borderRadius: 8,
      }}
      fontSizeType={FontSizeType.m}
      fontType={FontType.md}
      textColor={
        isActive ? PortColors.text.primaryWhite : PortColors.text.title
      }>
      {title}
    </NumberlessText>
  );
};

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'center',
    paddingTop: 8,
    flexDirection: 'column',
    width: screen.width,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    paddingHorizontal: 30,
  },
  customiseBoxStyle: {
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginTop: 8,
    padding: 24,
    borderRadius: 13,
  },
  customisePreviewStyle: {
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    padding: 10,
    borderRadius: 13,
    marginBottom: 32,
  },
  tileContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    columnGap: 8,
    rowGap: 8,
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
    width: screen.width - 82,
    backgroundColor: PortColors.primary.grey.light,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    paddingTop: 20,
    marginVertical: 20,
    marginTop: 15,
  },
  generic: {
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
    marginTop: 17,
    borderRadius: 16,
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
