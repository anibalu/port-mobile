import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
//svg imports
import Scan from '../../../assets/icons/Scan.svg';
import Share from '../../../assets/icons/Share.svg';
import Logo from '../../../assets/icons/Logo.svg';
import Refresh from '../../../assets/icons/Refresh.svg';
//config imports
import {LABEL_INPUT_LIMIT, SOFT_ALERT_DURATION} from '../../configs/constants';
//store import
import store from '../../store/appStore';
//action imports
import {getQRData} from '../../actions/GetQRData';
import {convertQRtoLink} from '../../actions/ConvertQRtoLink';
//component imports
import {
  NumberlessClickableText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../components/NumberlessText';
import OptionToggle from './OptionToggle';

function ConnectionDisplay({
  label,
  setLabel,
  qrCodeData,
  setQRCodeData,
  linkData,
  setLinkData,
}) {
  const navigation = useNavigation();
  const [isQR, setIsQR] = useState<boolean>(true);
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [viewWidth, setViewWidth] = useState(0);
  const [generate, setGenerate] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(true);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const onLayout = event => {
    const {width} = event.nativeEvent.layout;
    setViewWidth(width);
  };

  useEffect(() => {
    setLabel('');
    setIsLoadingBundle(true);
    setIsLoadingLink(true);
    const fetchQRCodeData = async () => {
      try {
        //use this function to generate and fetch QR code data.
        const data = await getQRData();
        setQRCodeData(data);
      } catch (error) {
        console.error('Error fetching QR code data:', error);
      } finally {
        setIsLoadingBundle(false);
      }
    };
    fetchQRCodeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]);
  //alert to show if link doesn't get generated because of network issues
  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        //use this function to convert qr data to clickable link.
        const link = await convertQRtoLink(qrCodeData);
        setLinkData(link);
      } catch (error) {
        console.error('Error fetching Link:', error);
      } finally {
        setIsLoadingLink(false);
      }
    };
    if (!isQR && !isLoadingBundle) {
      if (isLoadingLink) {
        fetchLinkData(); 
      } else {
        if (linkData === '') {
          fetchLinkData();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQR, isLoadingBundle]);
  useFocusEffect(
    React.useCallback(() => {
      const displayData = JSON.parse(qrCodeData);
      const unsubscribe = store.subscribe(() => {
        const state = store.getState();
        console.log(state);
        if (state && state.latestNewConnection) {
          const latestUsedLineLinkId = state.latestNewConnection.lineLinkId;
          // Use the latestState as needed
          console.log(
            'Checking if navigation is needed',
            displayData,
            latestUsedLineLinkId,
          );
          if (qrCodeData !== '') {
            if (displayData.bundles.data.linkId === latestUsedLineLinkId) {
              navigation.navigate('Home');
            }
          }
        }
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCodeData]),
  );

  return (
    <View style={styles.container}>
      <OptionToggle isQR={isQR} setIsQR={setIsQR} />
      <View style={styles.mainBox} onLayout={onLayout}>
        <TextInput
          style={styles.labelInput}
          maxLength={LABEL_INPUT_LIMIT}
          placeholder={isFocused ? '' : 'Label (Optional)'}
          placeholderTextColor="#A3A3A3"
          onChangeText={(newLabel: string) => setLabel(newLabel)}
          value={label}
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View
          style={{
            height: viewWidth * 0.9,
            width: viewWidth * 0.9,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isLoadingBundle ? (
            <ActivityIndicator size={'large'} color={'#000000'} />
          ) : isQR ? (
            <View style={styles.qrBox}>
              <QRCode value={qrCodeData} size={viewWidth * 0.65} />
              <View style={styles.logoBox}>
                <Logo width={viewWidth * 0.12} height={viewWidth * 0.12} />
              </View>
            </View>
          ) : (
            <View style={styles.linkBox}>
                  <View style={styles.fillContainer}>
                    {isLoadingLink ? (
                      <ActivityIndicator size={'large'} color={'#000000'} />
                    ) : (
                      <View style={styles.fillContainer}>
                        <View style={styles.softAlertParent}>
                          <SoftAlert setShowCopiedAlert={setShowCopiedAlert} showCopiedAlert={showCopiedAlert}/>
                        </View>
                        <NumberlessClickableText
                          style={styles.linkText}
                          onPress={() => {
                            Clipboard.setString(linkData);
                            setShowCopiedAlert(true);
                          }}>
                          {linkData === '' ? "Error getting link. Please make sure you have an active internet connection" : linkData}
                        </NumberlessClickableText>
                      </View>
                    )}
                  </View>
            </View>
          )}
        </View>
        <View style={styles.buttonsBox}>
          <View style={styles.buttonBoxLeft}>
            <Pressable
              style={styles.button}
              onPress={() => console.log('Share Pressed')}>
              <Share width={30} height={30} />
            </Pressable>
          </View>
          <View style={styles.buttonBoxRight}>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('Scanner')}>
              <Scan width={30} height={30} />
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable
        style={styles.generateButton}
        onPress={() => setGenerate(generate + 1)}>
        <Refresh height={24} width={24} />
        <NumberlessMediumText style={styles.generateText}>
          Generate New
        </NumberlessMediumText>
      </Pressable>
    </View>
  );
}

//soft alert to indicate link has been copied
function SoftAlert({showCopiedAlert, setShowCopiedAlert}) {
  setTimeout(() => {
    setShowCopiedAlert(false);
  }, SOFT_ALERT_DURATION);
  return (
    <View style={styles.softAlertContainer}>
      {showCopiedAlert && <NumberlessRegularText style={styles.softAlertMessage}>Copied to Clipboard</NumberlessRegularText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  mainBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '74%',
    marginTop: 30,
  },
  labelInput: {
    width: '100%',
    height: 60,
    fontSize: 17,
    fontFamily: 'Rubik-Medium',
    color: '#A3A3A3',
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#547CEF',
    borderRadius: 16,
    width: '100%',
  },
  buttonBoxLeft: {
    height: 60,
    paddingRight: 5,
    width: '50%',
  },
  buttonBoxRight: {
    height: 60,
    paddingLeft: 5,
    width: '50%',
  },
  qrBox: {
    height: '100%',
    width: '100%',
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
    width: '84%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 30,
  },
  generateText: {
    fontSize: 17,
    color: '#000000',
    marginLeft: 20,
  },
  linkText: {
    fontSize: 15,
    color: '#000000',
    textAlign: 'center',
  },
  softAlertParent: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingBottom: 30,
  },
  fillContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  softAlertContainer: {
    backgroundColor: '#E5E5E5',
    opacity: 0.5,
    borderRadius: 16,
  },
  softAlertMessage: {
    padding: 10,
    color: '#000000',
  },
});

export default ConnectionDisplay;
