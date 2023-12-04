import Logo from '@assets/icons/Logo.svg';
import ShareIcon from '@assets/icons/Share.svg';
import WhiteArrowRight from '@assets/icons/WhiteArrowRight.svg';
import Cross from '@assets/icons/cross.svg';
import Nfc from '@assets/icons/nfc.svg';
import {useNavigation} from '@react-navigation/native';
//import store from '@store/appStore';
import {generateDirectConnectionBundle} from '@utils/Bundles/direct';
import {convertBundleToLink} from '@utils/DeepLinking';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import {useNewPortModal} from '../context/NewPortModalContext';
import {screen} from './ComponentUtils';
import GenericInput from './GenericInput';
import GenericModal from './GenericModal';
import {
  NumberlessBoldText,
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from './NumberlessText';
import {useSelector} from 'react-redux';

const NewPortModal: React.FC = () => {
  const {modalVisible, hideModal} = useNewPortModal();
  const [label, setLabel] = useState('');
  const [createPressed, setCreatePressed] = useState<boolean>(false);

  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [bundleGenError, setBundleGenError] = useState(false);
  // const [lastSaveLabel, setLastSaveLabel] = useState<string>('');
  // const [saveVisible, setSaveVisible] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [linkData, setLinkData] = useState<string>('');
  const viewWidth = Dimensions.get('window').width;
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const navigation = useNavigation();
  const cleanupModal = () => {
    hideModal();
    setLabel('');
    setCreatePressed(false);
    setIsLoadingBundle(true);
    setBundleGenError(false);
    // setLastSaveLabel("");
    // setSaveVisible(false);
    setQRCodeData('');
    setLinkData('');
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
    if (!isLoadingBundle && !bundleGenError) {
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
        message: linkURL,
      };
      await Share.open(shareContent);
    } catch (error) {
      console.log('Error sharing content: ', error);
    }
  };

  //updates the label of the current generated bundle
  // async function labelUpdate() {
  //     try {
  //         setSaveVisible(false);
  //         if (!isLoadingBundle && !bundleGenError) {
  //             await updateGeneratedDirectConnectionBundleLabel(
  //                 JSON.parse(qrCodeData).data.linkId,
  //                 label.trim().substring(0, NAME_LENGTH_LIMIT),
  //             );
  //         }
  //         setLastSaveLabel(label);
  //     } catch (error) {
  //         console.error('Error editing bundle data:', error);
  //     }
  // }

  //shows save button if label changes to anything useable.
  // const showSaveButton = (newLabel: string) => {
  //     setLabel(newLabel);
  //     if (newLabel.trim().substring(0, NAME_LENGTH_LIMIT) === lastSaveLabel) {
  //         setSaveVisible(false);
  //     } else {
  //         setSaveVisible(true);
  //     }
  // };
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = store.subscribe(() => {
  //       console.log('store changed');
  //       const entireState = store.getState();
  //       const latestMessage = entireState.latestMessage.content;
  //       setStoreChange(latestMessage);
  //     });
  //     // Clean up the subscription when the screen loses focus
  //     return () => {
  //       unsubscribe();
  //     };
  //   }, []),
  // );
  //navigates to home if a qr is scanned while on new connection screen and device is connected to the internet.
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (modalVisible) {
  //       console.log('modal is visible');
  //       const entireState = store.getState();
  //       if (entireState.latestNewConnection) {
  //         const latestUsedConnectionLinkId =
  //           entireState.latestNewConnection.connectionLinkId;
  //         console.log(
  //           'latest connection link id: ',
  //           latestUsedConnectionLinkId,
  //         );
  //         if (qrCodeData !== '') {
  //           const displayData = JSON.parse(qrCodeData);
  //           if (displayData.data.linkId === latestUsedConnectionLinkId) {
  //             cleanupModal();
  //           }
  //         }
  //       }
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [storeChange]),
  // );
  useEffect(() => {
    if (modalVisible) {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrCodeData !== '') {
          const displayData = JSON.parse(qrCodeData);
          if (displayData.data.linkId === latestUsedConnectionLinkId) {
            cleanupModal();
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);
  return (
    <GenericModal visible={modalVisible} onClose={cleanupModal}>
      <View style={styles.modalView}>
        <Pressable style={styles.closeButton} onPress={cleanupModal}>
          <Cross />
        </Pressable>
        <NumberlessBoldText>Open port with</NumberlessBoldText>
        <View style={styles.generic}>
          {createPressed ? (
            <View style={styles.generic}>
              <View style={styles.generic}>
                {/* <TextInput
                                            style={styles.input}
                                            onChangeText={showSaveButton}
                                            value={label}
                                            placeholder={'Contact Name'}
                                            placeholderTextColor="#BABABA"
                                            maxLength={NAME_LENGTH_LIMIT}
                                        /> */}
                <View style={styles.savedInput}>
                  <NumberlessBoldText style={styles.savedInputText}>
                    {label}
                  </NumberlessBoldText>
                </View>
                {/* <View style={styles.saveButtonBox}>
                                            {saveVisible ? (
                                                <Pressable style={styles.saveButton} onPress={labelUpdate}>
                                                    <NumberlessMediumText style={styles.saveButtonText}>
                                                        Save
                                                    </NumberlessMediumText>
                                                </Pressable>
                                            ) : (
                                                <View />
                                            )}
                                        </View> */}
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  width: viewWidth * 0.5,
                  height: viewWidth * 0.5,
                }}>
                {isLoadingBundle ? (
                  <View style={styles.qrBox}>
                    <ActivityIndicator size={'large'} color={'#000000'} />
                  </View>
                ) : (
                  <View style={styles.qrBox}>
                    {bundleGenError ? (
                      <NumberlessItalicText style={styles.errorMessage}>
                        Error generating new Port connection instrument.
                        Pre-generated instruments list empty. Connect to the
                        internet again to generate more.
                      </NumberlessItalicText>
                    ) : (
                      <View style={styles.qrBox}>
                        <QRCode value={qrCodeData} size={viewWidth * 0.5} />
                        <View style={styles.logoBox}>
                          <Logo
                            width={viewWidth * 0.08}
                            height={viewWidth * 0.08}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {!bundleGenError && (
                <View style={styles.nfcEducation}>
                  <Nfc width={24} height={24} />
                  <NumberlessRegularText style={styles.nfcText}>
                    If NFC is enabled, tap your device against theirs to
                    instantly connect.
                  </NumberlessRegularText>
                </View>
              )}
              <Pressable
                style={bundleGenError ? styles.disabledbutton : styles.button}
                disabled={bundleGenError}
                onPress={handleShare}>
                <ShareIcon width={24} height={24} />
                <NumberlessMediumText style={styles.buttontext1}>
                  Share as a link
                </NumberlessMediumText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.generic}>
              <GenericInput
                wrapperStyle={{
                  height: 60,
                  marginVertical: 15,
                  paddingHorizontal: '8%',
                }}
                text={label}
                setText={setLabel}
                placeholder="Contact Name"
              />
              <Pressable
                style={
                  label.trim().length === 0
                    ? styles.disabledbutton
                    : styles.button
                }
                disabled={label.trim().length === 0}
                onPress={fetchQRCodeData}>
                <NumberlessMediumText style={styles.buttontext}>
                  Create port
                </NumberlessMediumText>
                <WhiteArrowRight />
              </Pressable>
            </View>
          )}
        </View>
        <NumberlessRegularText style={styles.porttypetext}>
          Open other port type:
        </NumberlessRegularText>
        <View style={styles.buttonArea}>
          <Pressable
            style={styles.otherPortsButton}
            onPress={() => {
              cleanupModal();
              navigation.navigate('GroupOnboarding');
            }}>
            <NumberlessMediumText style={styles.otherPortsText}>
              GroupPort
            </NumberlessMediumText>
          </Pressable>
          <Pressable
            style={styles.otherPortsButton}
            onPress={() => {
              cleanupModal();
              navigation.navigate('NewSuperport', {superportId: ''});
            }}>
            <NumberlessMediumText style={styles.otherPortsText}>
              SuperPort
            </NumberlessMediumText>
          </Pressable>
        </View>
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
  closeButton: {
    alignSelf: 'flex-end',
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '85%',
    height: 60,
    backgroundColor: '#F6F6F6',
    textAlign: 'center',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  savedInput: {
    width: '85%',
    height: 60,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 20,
  },
  savedInputText: {
    textAlign: 'center',
    color: '#000000',
  },
  generic: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  porttypetext: {
    marginTop: 30,
    fontSize: 15,
  },
  otherPortsButton: {
    backgroundColor: '#F6F6F6',
    width: 120,
    height: 60,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  otherPortsText: {
    color: '#547CEF',
    fontSize: 15,
    width: '80%',
    textAlign: 'center',
  },
  buttonArea: {
    flexDirection: 'row',
    width: '90%',
    alignContent: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  disabledbutton: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: 0.7,
    flexDirection: 'row',
  },
  buttontext: {
    color: 'white',
    fontSize: 15,
    width: '80%',
    textAlign: 'center',
  },
  buttontext1: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginLeft: 10,
  },
  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#E02C2C',
  },
  logoBox: {
    position: 'absolute',
    backgroundColor: '#000000',
    padding: 5,
    borderRadius: 10,
  },
  saveButtonBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButton: {
    height: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#547CEF',
    borderRadius: 16,
    width: 80,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 15,
    color: '#FFF',
  },
  nfcEducation: {
    flexDirection: 'row',
    width: '85%',
    marginTop: 20,
    marginBottom: 20,
    padding: 5,
    alignItems: 'center',
  },
  nfcText: {
    fontSize: 13,
    paddingLeft: 10,
    paddingRight: 10,
    color: '#547CEF',
  },
});

export default NewPortModal;
