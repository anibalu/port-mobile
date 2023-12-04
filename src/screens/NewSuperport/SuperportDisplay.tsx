import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
//svg imports
import Logo from '@assets/icons/Logo.svg';
import ShareIcon from '@assets/icons/Share.svg';
//config imports
import {NAME_LENGTH_LIMIT} from '@configs/constants';
//component imports
import GenericInput from '@components/GenericInput';
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {
  closeGeneratedSuperport,
  generateDirectSuperportConnectionBundle,
  loadGeneratedSuperport,
  updateGeneratedDirectSuperportConnectionBundleLabel,
} from '@utils/Bundles/directSuperport';
import {DirectSuperportConnectionBundle} from '@utils/Bundles/interfaces';
import {convertBundleToLink} from '@utils/DeepLinking';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

function SuperportDisplay({superportId}: {superportId: string}) {
  const navigation = useNavigation();
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [bundleGenError, setBundleGenError] = useState(false);
  const [label, setLabel] = useState<string>('');
  const [lastSaveLabel, setLastSaveLabel] = useState<string>('');
  const [saveVisible, setSaveVisible] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const viewWidth = Dimensions.get('window').width;

  //initial effect that generates initial connection bundle and displays it.
  useEffect(() => {
    const fetchQRCodeData = async () => {
      try {
        setBundleGenError(false);
        setLabel('');
        setIsLoadingBundle(true);
        //use this function to generate and fetch QR code data.
        if (superportId && superportId !== '') {
          const fullBundle = await loadGeneratedSuperport(superportId);
          const bundle: DirectSuperportConnectionBundle = fullBundle;
          setQRCodeData(JSON.stringify(bundle));
          setLabel(fullBundle.label || '');
        } else {
          const bundle = await generateDirectSuperportConnectionBundle();
          setQRCodeData(JSON.stringify(bundle));
        }
      } catch (error) {
        //set bundle generated error
        setBundleGenError(true);
      } finally {
        setIsLoadingBundle(false);
      }
    };
    fetchQRCodeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    if (!isLoadingBundle && !bundleGenError) {
      const link = await convertBundleToLink(qrCodeData);
      return link;
    }
    throw new Error('Bundle incomplete');
  };

  //handles sharing in link form
  const handleShare = async () => {
    try {
      const linkData = await fetchLinkData();
      const shareContent = {
        title: 'Create a new Port',
        message: linkData,
      };
      await Share.open(shareContent);
    } catch (error) {
      Toast.show({
        type: 'warning',
        text1: 'Error sharing content. Error fetching link',
      });
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
      navigation.navigate('HomeTab', {screen: 'ChatTab'});
    } catch (error) {
      console.log('Error closing superport: ', error);
      navigation.navigate('HomeTab', {screen: 'ChatTab'});
    }
  };

  //updates the label of the current generated bundle
  async function labelUpdate() {
    try {
      setSaveVisible(false);
      if (!isLoadingBundle) {
        await updateGeneratedDirectSuperportConnectionBundleLabel(
          JSON.parse(qrCodeData).data.linkId,
          label.trim().substring(0, NAME_LENGTH_LIMIT),
        );
      }
      setLastSaveLabel(label);
    } catch (error) {
      console.error('Error editing bundle data:', error);
    }
  }

  //shows save button if label changes to anything useable.
  const showSaveButton = (newLabel: string) => {
    setLabel(newLabel);
    if (newLabel.trim().substring(0, NAME_LENGTH_LIMIT) === lastSaveLabel) {
      setSaveVisible(false);
    } else {
      setSaveVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <NumberlessMediumText style={styles.cardTitleTextTop}>
        Share Superport
      </NumberlessMediumText>
      <NumberlessMediumText style={styles.cardTitleText}>
        (multi-use port)
      </NumberlessMediumText>
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
                Error generating new Superport connection instrument. Check your
                network connection and try again.
              </NumberlessItalicText>
            ) : (
              <View style={styles.qrBox}>
                <QRCode value={qrCodeData} size={viewWidth * 0.5} />
                <View style={styles.logoBox}>
                  <Logo width={viewWidth * 0.08} height={viewWidth * 0.08} />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
      <View>
        {bundleGenError ? (
          <View />
        ) : (
          <View
            style={{
              flexDirection: 'column',
              width: viewWidth * 0.6,
              marginTop: 20,
            }}>
            <GenericInput
              text={label}
              setText={showSaveButton}
              placeholder="Superport name (optional)"
            />

            <View style={styles.saveButtonBox}>
              {saveVisible ? (
                <Pressable style={styles.saveButton} onPress={labelUpdate}>
                  <NumberlessMediumText style={styles.saveButtonText}>
                    Save
                  </NumberlessMediumText>
                </Pressable>
              ) : (
                <View />
              )}
            </View>
          </View>
        )}
      </View>
      <NumberlessRegularText style={styles.generalText}>
        This Superport is good for multiple scans and can be used again.
      </NumberlessRegularText>
      <View style={styles.connectToDescription}>
        <NumberlessRegularText style={styles.connectsToText}>
          Connects to
        </NumberlessRegularText>
        <View style={styles.connectsToEntity}>
          <NumberlessRegularText>Me</NumberlessRegularText>
        </View>
      </View>
      {/* <View style={styles.buttonsBoxContainer}>
        <View style={styles.buttonBox}>
          <Pressable
            style={styles.button}
            onPress={() => setGenerate(generate + 1)}>
            <Refresh height={24} width={24} />
            <NumberlessRegularText style={styles.buttonText}>
              New
            </NumberlessRegularText>
          </Pressable>
        </View>
        <View style={styles.buttonBox}>
          <Pressable
            style={styles.button}
            onPress={() => {
              navigation.navigate('Scanner');
            }}>
            <Scan width={24} height={24} />
            <NumberlessRegularText style={styles.buttonText}>
              Scan
            </NumberlessRegularText>
          </Pressable>
        </View>
      </View> */}
      {/* <View style={styles.nfcEducation}>
        <Nfc width={24} height={24} />
        <NumberlessRegularText style={styles.nfcText}>
          {' '}
          If NFC is enabled, tap your device against theirs to instantly
          connect.
        </NumberlessRegularText>
      </View> */}
      <Pressable style={styles.generateButton} onPress={handleShare}>
        <ShareIcon width={24} height={24} />
        <NumberlessMediumText style={styles.generateText}>
          Share as a link
        </NumberlessMediumText>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={handleClose}>
        <NumberlessMediumText style={styles.generateText}>
          Close Superport
        </NumberlessMediumText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '85%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    marginTop: 20,
  },
  labelInput: {
    width: '100%',
    height: 60,
    fontSize: 15,
    fontFamily: 'Rubik-Medium',
    color: '#000000',
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonsBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    width: 100,
  },
  buttonText: {
    marginLeft: 5,
    color: '#547CEF',
  },
  buttonBox: {
    padding: 10,
  },
  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkBox: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    position: 'absolute',
    backgroundColor: '#000000',
    padding: 5,
    borderRadius: 10,
  },
  generateButton: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#547CEF',
    borderRadius: 16,
    marginTop: 20,
  },
  generateText: {
    fontSize: 15,
    color: '#FFF',
    marginLeft: 10,
  },
  cardTitleText: {
    fontSize: 17,
    color: '#547CEF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    textAlign: 'center',
  },
  cardTitleTextTop: {
    fontSize: 17,
    color: '#547CEF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    textAlign: 'center',
  },
  generalText: {
    fontSize: 13,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  nfcEducation: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
  },
  nfcText: {
    fontSize: 13,
    paddingLeft: 10,
    paddingRight: 10,
    color: '#547CEF',
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
  errorMessage: {
    fontSize: 14,
    color: '#E02C2C',
  },
  connectToDescription: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  connectsToText: {
    color: '#547CEF',
  },
  connectsToEntity: {
    backgroundColor: '#F6F6F6',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10,
    marginLeft: 20,
  },
  deleteButton: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EE786B',
    borderRadius: 16,
    marginTop: 20,
  },
});

export default SuperportDisplay;
