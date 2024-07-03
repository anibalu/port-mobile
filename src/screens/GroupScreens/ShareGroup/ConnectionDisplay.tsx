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
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessItalicText,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';
import {generateBundle, getBundleClickableLink} from '@utils/Ports';
import {BundleTarget, GroupBundle} from '@utils/Ports/interfaces';
import {getProfileName} from '@utils/Profile';
import {expiryOptions} from '@utils/Time/interfaces';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';
import {GenericButton} from '@components/GenericButton';

function ConnectionDisplay({groupId}: {groupId: string}) {
  const navigation = useNavigation();
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [generate, setGenerate] = useState(0);
  const [bundleGenError, setBundleGenError] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [selectedTime] = useState(expiryOptions[0]);
  const latestNewConnection = useSelector(state => state.latestNewConnection);
  const [linkData, setLinkData] = useState<string>('');
  const [loadingShare, setLoadingShare] = useState(false);
  const [name, setName] = useState(DEFAULT_NAME);
  const [groupData, setGroupData] = useState({name: DEFAULT_NAME});

  useEffect(() => {
    (async () => {
      setName(await getProfileName());
      const group = new Group(groupId);
      const fetchedGroupData = await group.getData();
      if (fetchedGroupData) {
        setGroupData(fetchedGroupData);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //initial effect that generates initial connection bundle and displays it.
  useEffect(() => {
    const fetchQRCodeData = async () => {
      try {
        setBundleGenError(false);
        setIsLoadingBundle(true);
        //use this function to generate and fetch QR code data.
        const bundle = await generateBundle(
          BundleTarget.group,
          groupId,
          null,
          selectedTime,
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
    fetchQRCodeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]);

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    if (!isLoadingBundle && !bundleGenError && qrCodeData !== '') {
      if (linkData === '') {
        const bundle: GroupBundle = JSON.parse(qrCodeData);
        const link = await getBundleClickableLink(
          BundleTarget.group,
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
      let linkURL;
      linkURL = await fetchLinkData();
      if (linkURL != null) {
        const shareContent = {
          title: 'Join a Group on Port',
          message:
            `${name} would like to add you to the group ${groupData.name} with you on Port! Click the link to start chatting: \n` +
            linkURL,
        };
        await Share.open(shareContent);
      }
    } catch (error) {
      console.log('Error sharing content: ', error);
    } finally {
      setLoadingShare(false);
    }
  };

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
      <NumberlessText
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}
        style={styles.cardTitleText}>
        Share Group Invite
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
              <NumberlessText
                fontType={FontType.md}
                fontSizeType={FontSizeType.m}>
                {isLoadingBundle ? '' : groupData.name}
              </NumberlessText>
            </View>
          </View>
        )}
      </View>
      <NumberlessText
        fontType={FontType.rg}
        fontSizeType={FontSizeType.s}
        style={styles.generalText}>
        This QR is only good for one scan and can't be used again.
      </NumberlessText>
      <View style={styles.buttonsBoxContainer}>
        <View style={styles.buttonBox}>
          <Pressable
            style={styles.button}
            onPress={() => setGenerate(generate + 1)}>
            <Refresh height={24} width={24} />
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              textColor={PortColors.text.title}
              style={styles.buttonText}>
              New
            </NumberlessText>
          </Pressable>
        </View>
        <View style={styles.buttonBox}>
          <Pressable
            style={styles.button}
            onPress={() => {
              navigation.navigate('HomeTab');
            }}>
            <Scan width={24} height={24} />
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              textColor={PortColors.text.title}
              style={styles.buttonText}>
              Scan
            </NumberlessText>
          </Pressable>
        </View>
      </View>
      <View style={styles.nfcEducation}>
        <Nfc width={24} height={24} />
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}
          style={styles.nfcText}>
          If NFC is enabled, tap your device against theirs to instantly
          connect.
        </NumberlessText>
      </View>
      <GenericButton
        onPress={handleShare}
        disabled={bundleGenError}
        IconLeft={ShareIcon}
        iconStyleLeft={{alignItems: 'center'}}
        loading={loadingShare}
        buttonStyle={StyleSheet.compose(
          [styles.buttonShare, {width: screen.width - 82}],
          bundleGenError && styles.disabledbutton,
        )}>
        Share as a link
      </GenericButton>
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
  disabledbutton: {
    opacity: 0.7,
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
  buttonShare: {
    backgroundColor: PortColors.primary.blue.app,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
    borderRadius: 16,
    flexDirection: 'row',
  },
  buttonText: {
    marginLeft: 5,
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
    color: '#547CEF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 10,
    textAlign: 'center',
  },
  generalText: {
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
