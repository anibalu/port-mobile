import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
//svg imports
import Scan from '../../../assets/icons/Scan.svg';
import ShareIcon from '../../../assets/icons/Share.svg';
import Logo from '../../../assets/icons/Logo.svg';
import Refresh from '../../../assets/icons/Refresh.svg';
import Nfc from '../../../assets/icons/nfc.svg';
//config imports
import {DEFAULT_NICKNAME, NICKNAME_LENGTH_LIMIT} from '../../configs/constants';
//store import
import store from '../../store/appStore';
//action imports
import {getQRData} from '../../actions/GetQRData';
import {convertQRtoLink} from '../../actions/ConvertQRtoLink';
//component imports
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../components/NumberlessText';
import {bundle} from '../../utils/bundles';
import {processNickname} from '../../utils/Nickname';
import Share from 'react-native-share';

function ConnectionDisplay() {
  const navigation = useNavigation();
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [generate, setGenerate] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [linkData, setLinkData] = useState('');
  const [label, setLabel] = useState('');
  const [qrCodeData, setQRCodeData] = useState<string>('{}');
  const viewWidth = Dimensions.get('window').width;

  useEffect(() => {
    setLabel('');
    setIsLoadingBundle(true);
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
  }, [generate]);
  const fetchLinkData = async () => {
    try {
      if (!isLoadingBundle) {
        const link = await convertQRtoLink(qrCodeData);
        setLinkData(link);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching Link:', error);
      return false;
    }
  };
  const handleShare = async () => {
    try {
      const canShare = await fetchLinkData();
      if (canShare) {
        const shareContent = {
          title: 'Create a new Port',
          message: linkData,
        };
        await Share.open(shareContent);
      } else {
        ToastAndroid.show(
          'Link could not be created. Check your internet connection.',
          ToastAndroid.SHORT,
        );
      }
    } catch (error) {
      console.log('Error sharing content: ', error);
    }
  };
  async function labelUpdate(newLabel: string) {
    try {
      setLabel(newLabel);
      //use this function to generate and fetch QR code data.
      if (!isLoadingBundle) {
        let data: bundle = JSON.parse(qrCodeData);
        data.bundles.label = processNickname(newLabel);
        if (data.bundles.label !== DEFAULT_NICKNAME) {
          setQRCodeData(JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Error editing bundle data:', error);
    }
  }
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
      <NumberlessMediumText style={styles.cardTitleText}>
        Create a new Port
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
            <QRCode value={qrCodeData} size={viewWidth * 0.5} />
            <View style={styles.logoBox}>
              <Logo width={viewWidth * 0.08} height={viewWidth * 0.08} />
            </View>
          </View>
        )}
      </View>
      <View
        style={{
          flexDirection: 'column',
          width: viewWidth * 0.6,
          marginTop: 20,
        }}>
        <TextInput
          style={styles.labelInput}
          maxLength={NICKNAME_LENGTH_LIMIT}
          placeholder={isFocused ? '' : 'Contact Name (Optional)'}
          placeholderTextColor="#BABABA"
          onChangeText={labelUpdate}
          value={label}
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <NumberlessRegularText style={styles.generalText}>
        This QR is only good for one scan and can't be used again.
      </NumberlessRegularText>
      <View style={styles.buttonsBoxContainer}>
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
            onPress={() => navigation.navigate('Scanner')}>
            <Scan width={24} height={24} />
            <NumberlessRegularText style={styles.buttonText}>
              Scan
            </NumberlessRegularText>
          </Pressable>
        </View>
      </View>
      <View style={styles.nfcEducation}>
        <Nfc width={24} height={24} />
        <NumberlessRegularText style={styles.nfcText}>
          {' '}
          If NFC is enabled, tap your device against theirs to instantly
          connect.
        </NumberlessRegularText>
      </View>
      <Pressable style={styles.generateButton} onPress={handleShare}>
        <ShareIcon width={24} height={24} />
        <NumberlessMediumText style={styles.generateText}>
          Share as a link
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
});

export default ConnectionDisplay;
