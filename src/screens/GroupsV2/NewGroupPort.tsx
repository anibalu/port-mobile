import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import CrossButton from '@assets/icons/BlackCross.svg';
import PortCard from '@components/Reusable/ConnectionCards/PortCard';
import {expiryOptions} from '@utils/Time/interfaces';
import {useSelector} from 'react-redux';
import {DEFAULT_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';
import {generateBundle, getBundleClickableLink} from '@utils/Ports';
import {BundleTarget, GroupBundle} from '@utils/Ports/interfaces';

type Props = NativeStackScreenProps<AppStackParamList, 'NewGroupPort'>;
const NewGroupPort = ({route}: Props) => {
  const {groupId} = route.params;

  const navigation = useNavigation();
  const [isLoadingBundle, setIsLoadingBundle] = useState(true);
  const [generate, setGenerate] = useState(0);
  const [bundleGenError, setBundleGenError] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [selectedTime] = useState(expiryOptions[0]);
  const [linkData, setLinkData] = useState<string>('');
  const [name, setName] = useState(DEFAULT_NAME);
  const [groupData, setGroupData] = useState({name: DEFAULT_NAME});
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  useEffect(() => {
    (async () => {
      const group = new Group(groupId);
      const fetchedGroupData = await group.getData();
      if (fetchedGroupData) {
        setName(fetchedGroupData.name);
        setGroupData(fetchedGroupData);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

  //initial effect that generates initial connection bundle and displays it.
  useEffect(() => {
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
      }
    }
    throw new Error('Bundle incomplete');
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
    <>
      <CustomStatusBar backgroundColor={PortColors.primary.white} />
      <SafeAreaView style={styles.screen}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={CrossButton}
          heading={'Group Port'}
        />
        <ScrollView style={{width: '100%'}}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={styles.qrArea}>
              <PortCard
                isLoading={false}
                isLinkLoading={false}
                hasFailed={false}
                isSuperport={false}
                title={name}
                profileUri={groupData?.groupPicture}
                qrData={qrCodeData}
                onShareLinkClicked={fetchLinkData}
                onTryAgainClicked={fetchQRCodeData}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: PortColors.background,
    flex: 1,
  },
  qrArea: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    gap: PortSpacing.secondary.uniform,
    marginTop: 30 + PortSpacing.primary.top,
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

export default NewGroupPort;
