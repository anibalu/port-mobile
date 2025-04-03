import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {
  DEFAULT_AVATAR,
  DEFAULT_GROUP_NAME,
  safeModalCloseDuration,
} from '@configs/constants';
import {generateBundle, getBundleClickableLink} from '@utils/Ports';
import {wait} from '@utils/Time';
import Share from 'react-native-share';
import {GroupBundle} from '@utils/Ports/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';
import GroupPortCard from '@components/Reusable/ConnectionCards/GroupPortCard';
import Group from '@utils/Groups/Group';

type Props = NativeStackScreenProps<AppStackParamList, 'NewGroupPort'>;
const NewGroupPort = ({route}: Props) => {
  const {chatId, chatData} = route.params;

  const [name, setName] = useState(chatData.name || DEFAULT_GROUP_NAME);
  const [profileUri, setProfileUri] = useState(
    chatData.groupPicture || DEFAULT_AVATAR,
  );
  const [desc, setDesc] = useState(chatData.description || '');

  //effect runs when screen is focused
  //retrieves name of grouo
  // and display pic of grouo
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const dataHandler = new Group(chatId);
          const chatData = await dataHandler.getData();
          if (!chatData) {
            throw new Error('No chat data available');
          }

          setName(chatData.name);
          setProfileUri(
            chatData.groupPicture ? chatData.groupPicture : DEFAULT_AVATAR,
          );
          setDesc(chatData?.description || '');
        } catch (error) {
          console.error('No such chat or no available group members: ', error);
        }
      })();

      // eslint-disable-next-line
    }, []),
  );
  const navigation = useNavigation();
  //state of qr code generation
  const [isLoading, setIsLoading] = useState(true);
  //whether qr code generation has failed
  const [hasFailed, setHasFailed] = useState(false);
  //qr code data to display
  const [qrData, setQrData] = useState<GroupBundle | null>(null);
  //whether is link is being generated
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  //whether is error bottom sheet should open
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const Colors = DynamicColors();

  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const svgArray = [
    // 1.CrossButton
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;
  const fetchPort = async () => {
    console.log('fetching group port for: ', chatId);
    try {
      setIsLoading(true);
      setHasFailed(false);
      //use this function to generate and fetch QR code data.
      const bundle = await generateBundle(BundleTarget.group, chatData.groupId);
      if (bundle) {
        setQrData(bundle);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Failed to fetch group port: ', error);
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
      if (qrData && qrData.portId) {
        const link = await getBundleClickableLink(
          BundleTarget.group,
          qrData.portId,
          JSON.stringify(qrData),
        );
        setIsLoadingLink(false);
        try {
          const shareContent = {
            title: 'Share a group link',
            message:
              `Click the link to join the group ${name} on Port.\n` + link,
          };
          await Share.open(shareContent);
        } catch (error) {
          console.log('Link not shared', error);
        }
        return;
      }
      throw new Error('No qr data');
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLoadingLink(false);
      setOpenErrorModal(true);
    }
  };

  //initial effect that generates initial connection bundle and displays it.
  useEffect(() => {
    fetchPort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //navigates to home screen if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionGroupId = latestNewConnection.groupId;
        if (qrData) {
          if (chatData.groupId === latestUsedConnectionGroupId) {
            navigation.goBack();
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
        backgroundColor={Colors.primary.surface}
      />
      <SafeAreaView style={styles.screen}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={CrossButton}
          heading={'Group Port'}
        />
        <ScrollView
          style={{width: '100%', backgroundColor: Colors.primary.background}}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={styles.qrArea}>
              <GroupPortCard
                isLoading={isLoading}
                isLinkLoading={isLoadingLink}
                hasFailed={hasFailed}
                title={name}
                profileUri={profileUri}
                qrData={qrData}
                onShareLinkClicked={fetchLinkData}
                onTryAgainClicked={fetchPort}
                desc={desc}
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
