import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { useSelector } from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useColors } from '@components/colorGuide';
import { GradientScreenView } from '@components/GradientScreenView';
import ExportableQRWithPictureAndDescription from '@components/QR/ExportableQRWithPictureAndDescription';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import { Spacing } from '@components/spacingGuide';
import TopBarEmptyTitleAndDescription from '@components/Text/TopBarEmptyTitleAndDescription';
import PortLogoTopBar from '@components/TopBars/PortLogoTopBar';

import { GROUP_MEMBER_LIMIT } from '@configs/constants';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

import Group from '@utils/Groups/GroupClass';
import { GroupSuperPort } from '@utils/Ports/GroupSuperPorts/GroupSuperPort';
import { GroupSuperportBundle } from '@utils/Ports/interfaces';

import ShareIcon from '@assets/dark/icons/Share.svg';

import { ToastType, useToast } from 'src/context/ToastContext';

import DisplayableGroupSuperPortQRCard from './components/DisplayableGroupSuperPortQRCard';






type Props = NativeStackScreenProps<
  AppStackParamList,
  'GroupSuperPortQRScreen'
>;

function GroupSuperPortQRScreen({ route, navigation }: Props) {
  console.log('[Rendering GroupSuperPortQRScreen]');
  const { chatId, groupData, memberCount, bundle, link } = route.params;
  const { showToast } = useToast();

  const color = useColors();
  const styles = styling(color);

  //Port data
  const [portData, setPortData] = useState<GroupSuperportBundle>(bundle);
  //Link data
  const [linkData, setLinkData] = useState<string>(link);
  const [label, setLabel] = useState<string>(`Group Port | ${memberCount}/${GROUP_MEMBER_LIMIT}`);
  const [resetLoading, setResetLoading] = useState(false);

  //reset group port
  const onResetClicked = async () => {
    setResetLoading(true);
    try {
      const newGroupPort = await GroupSuperPort.generator.create(groupData.groupId, true);
      setPortData(await newGroupPort.getShareableBundle());
      setLinkData(await newGroupPort.getShareableLink());
    } catch (error) {
      console.log('Error resetting group port', error);
      showToast('Error resetting group port. Check your network connection and try again.', ToastType.error);
    } 
    setResetLoading(false);
  };

  //share loading
  const [shareLoading, setShareLoading] = useState(false);
  // Create a ref for the ViewShot component
  const viewShotRef = useRef(null);

  // Prevent default back behavior on android
  useEffect(() => {
    const backAction = () => {
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  const onCopyClicked = () => {
    Clipboard.setString(linkData || '');
    showToast('Group Port link copied to clipboard', ToastType.success);
  };

  const onClosePress = () => {
    navigation.goBack();
  };

  // Function to capture and share the QR code
  const captureAndShareQR = async () => {
    setShareLoading(true);
    if (!portData) {
      showToast('Group Port has not been generated yet', ToastType.error);
      return;
    } else if (!linkData) {
      showToast('Group Port link has not been generated yet', ToastType.error);
      return;
    } else if (!viewShotRef.current) {
      showToast('Image could not be generated', ToastType.error);
      return;
    }
    try {
      // Capture the component as an image
      const uri = await (viewShotRef.current as any).capture();
      const shareMessage = `Join the group "${groupData.name}" on Port - here's a link to join: ${linkData}`;
      // Share the image
      await Share.open({
        url: uri,
        title: `Group Port for ${groupData.name}`,
        message: shareMessage,
        type: 'image/png',
        subject: `Group Port for ${groupData.name}`,
      });
    } catch (error) {
      console.error('Error capturing or sharing QR code:', error);
    } finally {
      setShareLoading(false);
    }
  };


  //redux trigger for when a new person joins the group using this group superport
  const latestNewConnection = useSelector(
    (state: any) => state.latestNewConnection,
  );

  //updates connections made if new connection happens while on superport screen
  const updateConnectionCount = async () => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionGroupId = latestNewConnection.groupId;
        if (portData) {
          if (groupData.groupId === latestUsedConnectionGroupId) {
            const group = await Group.load(chatId);
            setLabel(`Group Port | ${group.getGroupMemberCount()}/${GROUP_MEMBER_LIMIT}`);
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
    <GradientScreenView
      color={color}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={color.black}
      containsEmptyTitleAndDescription={true}>
      <PortLogoTopBar
        onClosePress={onClosePress}
        theme={color.theme}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarEmptyTitleAndDescription theme={color.theme} />
          <View style={styles.scrollableElementsParent}>
            <DisplayableGroupSuperPortQRCard
              name={groupData.name}
              description={groupData.description}
              label={label}
              hasFailed={false}
              errorMessage={''}
              qrData={portData}
              link={linkData}
              onCopyClicked={onCopyClicked}
              onTryAgainClicked={() => {}}
              theme={color.theme}
            />
            <AvatarBox
              avatarSize="m"
              profileUri={groupData.groupPicture}
              style={{
                borderWidth: 2,
                borderColor: color.surface,
                borderRadius: 100,
                marginTop: -45,
                position: 'absolute',
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          Icon={ShareIcon}
          theme={color.theme}
          text={`Share Group Port`}
          disabled={false}
          isLoading={shareLoading}
          onClick={captureAndShareQR}
        />
        <SecondaryButton
          theme={color.theme}
          text={`Reset Group Port`}
          disabled={false}
          isLoading={resetLoading}
          onClick={onResetClicked}
        />
      </View>
      <View style={styles.hiddenContainer}>
        <ViewShot ref={viewShotRef} options={{ quality: 1, format: 'png' }}>
          <ExportableQRWithPictureAndDescription
            qrData={portData}
            theme={color.theme}
            profileUri={groupData.groupPicture}
            name={groupData.name}
            description={groupData.description}
          />
        </ViewShot>
      </View>
    </GradientScreenView>
  );
}
const styling = (color: any) =>
  StyleSheet.create({
    mainContainer: {
      backgroundColor: color.purple,
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.s,
    },
    scrollContainer: {
      backgroundColor: color.background,
    },
    scrollableElementsParent: {
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: -Spacing.ll,
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    footer: {
      backgroundColor: color.surface,
      padding: Spacing.l,
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: Spacing.s,
    },
    hiddenContainer: {
      position: 'absolute',
      left: -9999, // Position far off-screen
      top: 0,
      opacity: 0, // Make it invisible (belt and suspenders)
      elevation: -1, // Place below other elements (Android)
      zIndex: -1, // Place below other elements (iOS)
    },
  });

export default GroupSuperPortQRScreen;
