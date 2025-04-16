import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';

import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import GroupSuperPortCard from '@components/GroupSuperPortCard';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';

import {safeModalCloseDuration} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import Group from '@utils/Groups/GroupClass';
import { GroupSuperPort } from '@utils/Ports/GroupSuperPorts/GroupSuperPort';
import GroupSuperPortGenerator from '@utils/Ports/GroupSuperPorts/GroupSuperPortGenerator/GroupSuperPortGenerator';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {wait} from '@utils/Time';


import RedPause from '@assets/icons/RedPause.svg';

import {ToastType, useToast} from 'src/context/ToastContext';









type Props = NativeStackScreenProps<AppStackParamList, 'NewGroupSuperPort'>;

const NewGroupSuperPort = ({route, navigation}: Props) => {
  //route params
  const {portData, chatData, chatId} = route.params;

  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {showToast} = useToast();

  //redux trigger for when a new person joins the group using this group superport
  const latestNewConnection = useSelector(
    (state: any) => state.latestNewConnection,
  );

  //SVGs used in the screen
  const svgArray = [
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
    {
      assetName: 'LinkIcon',
      light: require('@assets/light/icons/LinkGrey.svg').default,
      dark: require('@assets/dark/icons/LinkGrey.svg').default,
    },
    {
      assetName: 'ShareIcon',
      light: require('@assets/light/icons/ShareGrey.svg').default,
      dark: require('@assets/dark/icons/ShareGrey.svg').default,
    },
    {
      assetName: 'PausePort',
      light: require('@assets/light/icons/PausePort.svg').default,
      dark: require('@assets/light/icons/PausePort.svg').default,
    },
    {
      assetName: 'UnPausePort',
      light: require('@assets/dark/icons/PausePort.svg').default,
      dark: require('@assets/dark/icons/PausePort.svg').default,
    },
    {
      assetName: 'Regenerate',
      light: require('@assets/light/icons/Regenerate.svg').default,
      dark: require('@assets/light/icons/Regenerate.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;
  const Regenerate = results.Regenerate;
  const PausePort = results.PausePort;
  const UnPausePort = results.UnPausePort;

  //controls error modal that shows up when there is an error copying a link.
  const [openLinkCopyErrorModal, setLinkCopyErrorModal] = useState(false);
  //loader for when the link is being created and copied.
  const [isCopyLinkLoading, setIsCopyLinkLoading] = useState<boolean>(false);
  //loader for when the link is being created and shared.
  const [isLinkLoading, setIsLinkLoading] = useState<boolean>(false);
  //whether group superport is paused.
  const [isGroupSuperPortPaused, setIsGroupSuperPortPaused] = useState(false);
  //loaded groupsuperport class
  const [groupSuperportClass, setGroupSuperportClass] =
    useState<GroupSuperPortGenerator | null>(null);
  //display bundle data
  const [qrData, setQrData] = useState<any>(null);
  //whether display bundle generation has failed
  const [hasFailed, setHasFailed] = useState(false);
  //loader for when display bundle is loading
  const [isLoading, setIsLoading] = useState(true);
  //number of members in the group
  const [connectionsMade, setConnectionsMade] = useState(0);

  //loads display bundle
  const loadQRData = async () => {
    try {
      setIsLoading(true);
      setHasFailed(false);
      if (!groupSuperportClass) {
        throw new Error('Group superport class not yet initialised.');
      }
      // loads qr data to be displayed on screen
      setQrData(
        await groupSuperportClass.getShareableBundle(),
      );
      setIsLoading(false);
    } catch (err) {
      setHasFailed(true);
      setIsLoading(false);
    }
  };

  //method to create and copy group superport link to clipboard.
  const onCopyLink = async () => {
    //close error modal if open
    if (openLinkCopyErrorModal) {
      setLinkCopyErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsCopyLinkLoading(true);
      if (!groupSuperportClass) {
        throw new Error('Group superport class not yet initialised.');
      }
      // gets a clickable link
      const link = await groupSuperportClass.getShareableLink();
      setIsLinkLoading(false);
      Clipboard.setString(link);
      setIsCopyLinkLoading(false);
      showToast('Group Link Copied!', ToastType.success);
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsCopyLinkLoading(false);
      setLinkCopyErrorModal(true);
    }
    return;
  };

  //converts qr bundle into link.
  const onShareLink = async () => {
    //If error sheet is opened when this function is called, wait for the error sheet to close.
    if (openLinkCopyErrorModal) {
      setLinkCopyErrorModal(false);
      await wait(safeModalCloseDuration);
    }
    try {
      setIsLinkLoading(true);
      if (!groupSuperportClass) {
        throw new Error('Group superport class not yet initialised.');
      }
      // gets a clickable link to share
      const link = await groupSuperportClass.getShareableLink();
      setIsLinkLoading(false);
      try {
        const shareContent = {
          title: 'Share a Group link',
          message:
            `Click the link to join the group "${chatData.name}" on Port.\n` +
            link,
        };
        await Share.open(shareContent);
      } catch (error) {
        console.log('Link not shared', error);
      }
      return;
    } catch (error) {
      console.log('Failed to fetch port link: ', error);
      setIsLinkLoading(false);
      setLinkCopyErrorModal(true);
    }
  };

  //sets up the initial group superport class and gets number of group members
  useEffect(() => {
    (async () => {
      try {
        // sets connections made from group data plus 1 to count yourself
        const groupHandler = await Group.load(chatId);
        setConnectionsMade(groupHandler.getGroupMembers().length + 1);
        const newGroupSuperportClass = GroupSuperPort.generator.load(portData);
        setGroupSuperportClass(newGroupSuperportClass);
      } catch (error) {
        console.error('Error initialising group superport class: ', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //updates display bundle if group superport class changes.
  useEffect(() => {
    (async () => {
      if (groupSuperportClass) {
        // loads qr data to be displayed on screen
        await loadQRData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupSuperportClass]);

  //updates connections made if new connection happens while on superport screen
  const updateConnectionCount = async () => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionGroupId = latestNewConnection.groupId;
        if (qrData) {
          if (chatData?.groupId === latestUsedConnectionGroupId) {
            setConnectionsMade(connectionsMade + 1);
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing modal: ', error);
    }
  };

  useEffect(() => {
    updateConnectionCount();
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
          heading={'Group Port'}
          IconRight={CrossButton}
        />
        <ScrollView
          style={{width: '100%', backgroundColor: Colors.primary.background}}>
          <GroupSuperPortCard
            qrData={qrData}
            chatData={chatData}
            isCopyLinkLoading={isCopyLinkLoading}
            isGroupSuperPortPaused={isGroupSuperPortPaused}
            onCopyLink={onCopyLink}
            isLinkLoading={isLinkLoading}
            fetchLinkData={onShareLink}
            connectionsLimit={64}
            connectionsMade={connectionsMade}
            hasFailed={hasFailed}
            isLoading={isLoading}
          />

          <View
            style={{
              marginVertical: PortSpacing.secondary.uniform,
              gap: PortSpacing.tertiary.uniform,
              marginHorizontal: PortSpacing.secondary.uniform,
            }}>
            {isGroupSuperPortPaused ? (
              <SimpleCard
                style={{
                  gap: PortSpacing.tertiary.uniform,
                  alignItems: 'center',
                  padding: PortSpacing.secondary.uniform,
                }}>
                <RedPause />
                <NumberlessText
                  textColor={Colors.primary.brightRed}
                  fontType={FontType.md}
                  fontSizeType={FontSizeType.l}>
                  Group Port Paused
                </NumberlessText>
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.s}>
                  This Group Port has been paused. People with the port link or
                  QR will not be able to join this group until you un-pause it.
                </NumberlessText>
                <PrimaryButton
                  Icon={UnPausePort}
                  primaryButtonColor="b"
                  buttonText="Unpause Group Port"
                  disabled={false}
                  isLoading={false}
                  onClick={async () => {
                    try {
                      if (!groupSuperportClass) {
                        throw new Error(
                          'Group superport class not yet initialised.',
                        );
                      }
                      await groupSuperportClass.resume();
                      setIsGroupSuperPortPaused(false);
                    } catch (err) {
                      showToast(
                        'Unable to resume Port, please check your network connection!',
                        ToastType.error,
                      );
                      console.log('err', err);
                    }
                  }}
                />
              </SimpleCard>
            ) : (
              <PrimaryButton
                Icon={PausePort}
                primaryButtonColor="w"
                buttonText="Pause Group Port"
                disabled={false}
                isLoading={false}
                onClick={async () => {
                  try {
                    if (!groupSuperportClass) {
                      throw new Error(
                        'Group superport class not yet initialised.',
                      );
                    }
                    await groupSuperportClass.pause();
                    setIsGroupSuperPortPaused(true);
                  } catch (err) {
                    showToast(
                      'Unable to pause Port, please check your network connection!',
                      ToastType.error,
                    );
                    console.log(err);
                  }
                }}
              />
            )}

            <View
              style={{
                opacity: isGroupSuperPortPaused ? 0.6 : 1,
              }}>
              <PrimaryButton
                Icon={Regenerate}
                primaryButtonColor="w"
                buttonText="Reset Group Port"
                disabled={connectionsMade === 64}
                isLoading={false}
                onClick={async () => {
                  try {
                    if (!groupSuperportClass) {
                      throw new Error(
                        'Group superport class not yet initialised.',
                      );
                    }
                    // regenerates a new superport
                    const newClass = await GroupSuperPort.generator.create(
                      chatData.groupId,
                      true,
                    );
                    // sets the new class as the groupsuperport class
                    setGroupSuperportClass(newClass);
                  } catch (err) {
                    console.log('err', err);
                    showToast(
                      'Unable to reset Port, please check your network connection!',
                      ToastType.error,
                    );
                  }
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: screen.width,
      backgroundColor: colors.primary.background,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 0, //overrides simple card default padding

      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
      marginHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.uniform,
    },
    contentBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.secondary.uniform,
    },
    errorBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.secondary.uniform,
    },
    shareBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.secondary.bottom,
      gap: PortSpacing.tertiary.uniform,
    },
    card: {
      width: '100%',
      borderRadius: 12,
      gap: PortSpacing.medium.uniform,
    },
  });

export default NewGroupSuperPort;
