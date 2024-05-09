/**
 * This screen displays a new port to connect over
 */
import {SafeAreaView} from '@components/SafeAreaView';
import React, {ReactNode, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ScanIcon from '@assets/icons/scanBlue.svg';
import CrossButton from '@assets/navigation/crossButton.svg';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import TertiaryButton from '@components/Reusable/LongButtons/TertiaryButton';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {CustomStatusBar} from '@components/CustomStatusBar';
import PortCard from '@components/Reusable/ConnectionCards/PortCard';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FileAttributes} from '@utils/Storage/interfaces';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  defaultFolderInfo,
  safeModalCloseDuration,
} from '@configs/constants';
import {
  generateBundle,
  getBundleClickableLink,
  getGeneratedPortData,
} from '@utils/Ports';
import {BundleTarget, PortBundle, PortData} from '@utils/Ports/interfaces';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import SharePortLink from '@components/Reusable/BottomSheets/SharePortLink';
import {wait} from '@utils/Time';
import {useSelector} from 'react-redux';
import {cleanDeleteGeneratedPort} from '@utils/Ports/direct';
import Share from 'react-native-share';
import {urlToJson} from '@utils/JsonToUrl';

type Props = NativeStackScreenProps<AppStackParamList, 'NewPortScreen'>;

function NewPortScreen({route, navigation}: Props): ReactNode {
  //we get user name and profile picture from route params
  const {name, avatar} = route.params;
  const displayName: string = name || DEFAULT_NAME;
  const profilePicAttr: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;
  //state of qr code generation
  const [isLoading, setIsLoading] = useState(true);
  //whether qr code generation has failed
  const [hasFailed, setHasFailed] = useState(false);
  //qr code data to display
  const [qrData, setQrData] = useState<string | null>(null);
  //link to share
  const [linkData, setLinkData] = useState<string | null>(null);
  //whether is link is being generated
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  //whether is share bottom sheet should open
  const [openShareModal, setOpenShareModal] = useState(false);
  //whether is error bottom sheet should open
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const [shareContactName, setShareContactName] = useState('');

  //checks latest new connection
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  //fetches a port
  const fetchPort = async () => {
    try {
      setIsLoading(true);
      setHasFailed(false);
      const bundle: string = JSON.stringify(
        await generateBundle(BundleTarget.direct),
      );
      if (JSON.parse(bundle).startsWith('https://')) {
        setQrData(JSON.parse(bundle));
      } else {
        setQrData(bundle);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Failed to fetch port: ', error);
      setHasFailed(true);
      setIsLoading(false);
      setQrData(null);
    }
  };

  //converts qr bundle into link.
  const fetchLinkData = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openErrorModal) {
      setOpenErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLoadingLink(true);
      if (qrData) {
        const bundle: PortBundle = qrData.startsWith('https://')
          ? urlToJson(qrData)
          : JSON.parse(qrData);
        const generatedPort: PortData = await getGeneratedPortData(
          bundle.portId,
        );
        const link = await getBundleClickableLink(
          BundleTarget.direct,
          bundle.portId,
          qrData,
        );
        setLinkData(link);
        setIsLoadingLink(false);
        if (
          generatedPort.label &&
          generatedPort.label !== '' &&
          generatedPort.label !== DEFAULT_NAME
        ) {
          try {
            const shareContent = {
              title: `Share a one-time use link with ${generatedPort.label}`,
              message:
                `Click the link to connect with ${displayName} on Port.\n` +
                linkData,
            };
            await Share.open(shareContent);
          } catch (error) {
            console.log('Link not shared', error);
          }
        } else {
          setOpenShareModal(true);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLoadingLink(false);
      setLinkData(null);
      setOpenErrorModal(true);
    }
  };

  useEffect(() => {
    fetchPort();
  }, []);

  //navigates to home screen if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (qrData && !linkData) {
          const bundle: PortBundle | Record<string, string | number> =
            urlToJson(qrData);
          if (bundle.portId === latestUsedConnectionLinkId) {
            navigation.navigate('HomeTab', {
              selectedFolder: {...defaultFolderInfo},
            });
            return;
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.screen}>
        <TopBarWithRightIcon
          onIconRightPress={async () => {
            if (linkData) {
              navigation.goBack();
              return;
            } else {
              if (qrData) {
                const bundle: PortBundle = qrData.startsWith('https://')
                  ? urlToJson(qrData)
                  : JSON.parse(qrData);
                await cleanDeleteGeneratedPort(bundle.portId);
              }
            }
            navigation.goBack();
            return;
          }}
          IconRight={CrossButton}
          heading={'New Port'}
        />
        <ScrollView style={{width: '100%'}}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={styles.qrArea}>
              <PortCard
                isLoading={isLoading}
                isLinkLoading={isLoadingLink}
                hasFailed={hasFailed}
                isSuperport={false}
                title={displayName}
                profileUri={profilePicAttr.fileUri}
                qrData={qrData}
                onShareLinkClicked={fetchLinkData}
                onTryAgainClicked={fetchPort}
              />
              <TertiaryButton
                tertiaryButtonColor={'b'}
                buttonText={'Scan instead'}
                Icon={ScanIcon}
                onClick={() => navigation.navigate('Scan')}
                disabled={false}
              />
            </View>
            <View style={styles.superportArea}>
              <NumberlessText
                style={{alignSelf: 'center'}}
                fontType={FontType.md}
                fontSizeType={FontSizeType.m}>
                Need to add multiple contacts ?
              </NumberlessText>
              <NumberlessText
                style={styles.subtitle}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.s}>
                To enable multiple connections with one Port, create a
                Superport. Share it on your website or social channels for easy
                access
              </NumberlessText>
              <SecondaryButton
                secondaryButtonColor={'b'}
                buttonText={'Create a Superport'}
                onClick={() =>
                  navigation.navigate('SuperportScreen', {
                    name: displayName,
                    avatar: profilePicAttr,
                  })
                }
              />
            </View>
          </View>
        </ScrollView>
        <ErrorBottomSheet
          visible={openErrorModal}
          title={'Link could not be created'}
          description={
            "Please ensure you're connected to the internet to create a one-time use link."
          }
          onClose={() => setOpenErrorModal(false)}
          onTryAgain={fetchLinkData}
        />
        <SharePortLink
          visible={openShareModal}
          onClose={() => setOpenShareModal(false)}
          title={'Share one-time use link'}
          description={
            'Enter the name of the contact to whom you are sending the Port.'
          }
          contactName={shareContactName}
          setContactName={setShareContactName}
          userName={displayName}
          linkData={linkData}
          qrData={qrData}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: PortColors.background,
    flex: 1,
  },
  qrArea: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    gap: PortSpacing.secondary.uniform,
    marginTop: 30 + PortSpacing.primary.top, //accounts for profile picture offset
  },
  superportArea: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.intermediate.top,
    paddingBottom: PortSpacing.secondary.bottom,
  },
  subtitle: {
    alignSelf: 'center',
    color: PortColors.subtitle,
    marginTop: PortSpacing.tertiary.top,
    marginBottom: PortSpacing.intermediate.bottom,
    textAlign: 'center',
  },
});

export default NewPortScreen;
