import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import { useSelector } from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useColors } from '@components/colorGuide';
import { isIOS } from '@components/ComponentUtils';
import { GradientScreenView } from '@components/GradientScreenView';
import ExportableQRWithPicture from '@components/QR/ExportableQRWithPicture';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import { Spacing, Width } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import TopBarEmptyTitleAndDescription from '@components/Text/TopBarEmptyTitleAndDescription';
import PortLogoAndSettingsTopBar from '@components/TopBars/PortLogoAndSettingsTopBar';

import { DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO } from '@configs/constants';

import { NewSuperPortStackParamList } from '@navigation/AppStack/NewSuperPortStack/NewSuperPortStackTypes';

import { hasCameraRollSavePermission } from '@utils/AppPermissions';
import { DirectSuperportBundle } from '@utils/Ports/interfaces';
import { getPermissions } from '@utils/Storage/permissions';

import ShareIcon from '@assets/dark/icons/Share.svg';

import { ToastType, useToast } from 'src/context/ToastContext';

import DisplayableSuperPortQRCard from './components/DisplayableSuperPortQRCard';
import { useSuperPortDispatch, useSuperPortState } from './context/SuperPortContext';


type Props = NativeStackScreenProps<
  NewSuperPortStackParamList,
  'SuperPortQRScreen'
>;

function SuperPortQRScreen({ route, navigation }: Props) {
  console.log('[Rendering SuperPortQRScreen]');
  const { superPortClass, bundle, link } = route.params;
  const { showToast } = useToast();
  // Set up superport context
  const superPortActions = useSuperPortDispatch();
  const superPortState = useSuperPortState();

  //profile information
  const profile = useSelector((state: any) => state.profile.profile);
  const { name, avatar } = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  const latestNewConnection = useSelector(
    (state: any) => state.latestNewConnection,
  );

  const color = useColors();
  const styles = styling(color);

  const svgArray = [
    {
      assetName: 'Download',
      light: require('@assets/light/icons/DownloadArrow.svg').default,
      dark: require('@assets/dark/icons/DownloadArrow.svg').default,
    },
  ];
  const results = useSVG(svgArray, color.theme);

  const DownloadIcon = results.Download;

  //Port data
  const [portData] = useState<DirectSuperportBundle>(bundle);
  //Link data
  const [linkData, setLinkData] = useState<string>(link);

  //share loading
  const [shareLoading, setShareLoading] = useState(false);
  //download loading
  const [downloadLoading, setDownloadLoading] = useState(false);
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

  // Initialize superport context with route params
  useEffect(() => {
    (async () => {
      try {
        if (!superPortClass) {
          throw new Error('Re-usable Port is not defined');
        }
        // retrieve superport data from portId
        const superPortClassData = superPortClass.getPort();
        const superPortPermissions = await getPermissions(
          superPortClassData.permissionsId,
        );
        superPortActions({
          type: 'SET_CONTEXT',
          payload: {
            label: superPortClassData.label,
            limit: superPortClassData.connectionsLimit,
            folderId: superPortClassData.folderId,
            permissions: superPortPermissions,
            connectionsMade: superPortClassData.connectionsMade,
            port: superPortClass,
          },
        });
        try {
          setLinkData(await superPortClass.getShareableLink(name));
        } catch (error) {
          console.log('Error fetching superport link', error);
        }
      } catch (error: any) {
        console.log('Error initializing superport qr screen', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopyClicked = () => {
    Clipboard.setString(linkData || '');
    showToast('Port link copied to clipboard', ToastType.success);
  };

  const onSettingsPress = () => {
    navigation.navigate('SuperPortSettingsScreen');
  };

  const onClosePress = () => {
    navigation.goBack();
  };

  // Function to capture and share the QR code
  const captureAndShareQR = async () => {
    setShareLoading(true);
    if (!portData) {
      showToast('Port has not been generated yet', ToastType.error);
      return;
    } else if (!linkData) {
      showToast('Port link has not been generated yet', ToastType.error);
      return;
    } else if (!viewShotRef.current) {
      showToast('Image could not be generated', ToastType.error);
      return;
    }
    try {
      // Capture the component as an image
      const uri = await captureRef(viewShotRef, { quality: 1, format: 'png' })
      const shareMessage = `Let's chat on Port - here's a link to connect with me: ${linkData}`;
      // Share the image
      await Share.open({
        url: uri,
        title: `${name}'s Port`,
        message: shareMessage,
        type: 'image/png',
        subject: `${name}'s Port`,
      });
    } catch (error) {
      console.error('Error capturing or sharing QR code:', error);
    } finally {
      setShareLoading(false);
    }
  };

  // Function to download the SuperPort
  const downloadSuperPort = async () => {
    setDownloadLoading(true);
    if (!portData) {
      showToast('Port has not been generated yet', ToastType.error);
      return;
    } else if (!viewShotRef.current) {
      showToast('Image could not be generated', ToastType.error);
      return;
    }
    try {
      // Capture the component as an image
      const uri = await captureRef(viewShotRef, { quality: 1, format: 'png' })
      if (isIOS) {
        //additional catch block is needed due to a bug in react-native-camera-roll
        try {
          await CameraRoll.saveAsset(uri);
          showToast('Port saved to camera roll', ToastType.success);
        } catch (error) {
          const savePermission = await hasCameraRollSavePermission();
          if (savePermission) {
            showToast('Port saved to camera roll', ToastType.success);
          } else {
            throw new Error('Permission to save to camera roll denied');
          }
        }
      } else {
        const savePermission = await hasCameraRollSavePermission();
        if (savePermission) {
          await CameraRoll.saveAsset(uri);
          showToast('Port saved to camera roll', ToastType.success);
        } else {
          throw new Error('Permission to save to camera roll denied');
        }
      }
    } catch (error) {
      console.error('Error downloading SuperPort:', error);
      showToast('Permission to download Port denied', ToastType.error);
    } finally {
      setDownloadLoading(false);
    }
  };

  //navigates to home screen if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (portData) {
          if (portData.portId === latestUsedConnectionLinkId) {
            //increment connections made
            superPortActions({
              type: 'INCREMENT_CONNECTIONS_MADE',
              payload: undefined,
            })
          }
        }
      }
    } catch (error) {
      console.log('error autoclosing port screen: ', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestNewConnection]);

  return (
    <GradientScreenView
      color={color}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={color.black}
      containsEmptyTitleAndDescription={true}>
      <PortLogoAndSettingsTopBar
        onSettingsPress={onSettingsPress}
        onClosePress={onClosePress}
        theme={color.theme}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarEmptyTitleAndDescription theme={color.theme} />
          <View style={styles.scrollableElementsParent}>
            <DisplayableSuperPortQRCard
              isLoading={false}
              hasFailed={false}
              name={name}
              errorMessage={''}
              qrData={portData}
              link={linkData}
              onCopyClicked={onCopyClicked}
              onTryAgainClicked={() => {}}
              theme={color.theme}
              superPortName={superPortState.label || 're-usable port'}
              labelText={`Used ${superPortState.connectionsMade || 0}/${superPortState.limit || 'Unlimited'}`}
            />
            <AvatarBox
              avatarSize="m"
              profileUri={
                (superPortState.permissions)?.displayPicture
                  ? avatar.fileUri
                  : null
              }
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
        <SecondaryButton
          Icon={DownloadIcon}
          text="Download"
          theme={color.theme}
          isLoading={downloadLoading}
          disabled={!portData || !linkData}
          onClick={downloadSuperPort}
          buttonStyle={{
            width: Width.screen / 2 - (Spacing.s * 2 + Spacing.xs),
          }}
        />
        <PrimaryButton
          Icon={ShareIcon}
          theme={color.theme}
          text="Publish Port"
          isLoading={shareLoading}
          disabled={!portData || !linkData}
          onClick={captureAndShareQR}
          buttonStyle={{
            width: Width.screen / 2 - (Spacing.s * 2 + Spacing.xs),
          }}
        />
      </View>
      <View style={styles.hiddenContainer}>
        <View ref={viewShotRef} collapsable={false}>
          <ExportableQRWithPicture
            qrData={portData}
            theme={color.theme}
            profileUri={
              (superPortState.permissions)?.displayPicture
                ? avatar.fileUri
                : null
            }
            name={name}
          />
        </View>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
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

export default SuperPortQRScreen;
