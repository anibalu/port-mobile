import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
//svg imports
import Logo from '@assets/icons/Logo.svg';
import Refresh from '@assets/icons/Refresh.svg';
import Scan from '@assets/icons/Scan.svg';
import ShareIcon from '@assets/icons/Share.svg';
import Nfc from '@assets/icons/nfc.svg';
//component imports
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {generateGroupConnectionBundle} from '@utils/Bundles/group';
import {convertBundleToLink} from '@utils/DeepLinking';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import {screen} from '@components/ComponentUtils';
import {useSelector} from 'react-redux';

function ConnectionDisplay({groupId}: {groupId: string}) {
  const navigation = useNavigation();
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [generate, setGenerate] = useState(0);
  const [bundleGenError, setBundleGenError] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  //initial effect that generates initial connection bundle and displays it.
  useEffect(() => {
    const fetchQRCodeData = async () => {
      try {
        setBundleGenError(false);
        setIsLoadingBundle(true);
        //use this function to generate and fetch QR code data.
        const bundle = await generateGroupConnectionBundle(groupId);
        setQRCodeData(JSON.stringify(bundle));
      } catch (error) {
        //set bundle generated error
        setBundleGenError(true);
      } finally {
        setIsLoadingBundle(false);
      }
    };
    fetchQRCodeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]);

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
        title: 'Join a Group',
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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = store.subscribe(() => {
  //       setStoreChange(storeChange + 1);
  //     });
  //     // Clean up the subscription when the screen loses focus
  //     return () => {
  //       unsubscribe();
  //     };
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []),
  // );
  //navigates to home if a qr is scanned while on new connection screen and device is connected to the internet.
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const state = store.getState();
  //     // generate new qr code if a member successfully gets added to the group.
  //     if (state.latestNewConnection.chatId === groupId) {
  //       setGenerate(generate + 1);
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [storeChange]),
  // );
  useEffect(() => {
    if (latestNewConnection) {
      if (latestNewConnection.chatId === groupId) {
        setGenerate(generate + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);
  return (
    <View style={styles.container}>
      <NumberlessMediumText style={styles.cardTitleText}>
        Share Group Invite
      </NumberlessMediumText>
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
                Error generating new Group connection instrument. Pre-generated
                instruments list empty. Connect to the internet again to
                generate more.
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
      <View>
        {bundleGenError ? (
          <View />
        ) : (
          <View
            style={{
              flexDirection: 'column',
              width: screen.width * 0.6,
              marginTop: 20,
            }}>
            <View style={styles.labelInput}>
              <NumberlessMediumText>
                {isLoadingBundle ? '' : getGroupName(qrCodeData)}
              </NumberlessMediumText>
            </View>
          </View>
        )}
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
            onPress={() => {
              navigation.navigate('HomeTab', {screen: 'ScanTab'});
            }}>
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

function getGroupName(qrCodeData: string) {
  try {
    const bundle = JSON.parse(qrCodeData);
    return bundle.data.name || '';
  } catch (error) {
    console.log('Error in getting group name: ', error);
    return '';
  }
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
});

export default ConnectionDisplay;
