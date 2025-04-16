import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
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
import { jsonToUrl } from '@utils/JsonToUrl';
import { DirectSuperportBundle } from '@utils/Ports/interfaces';
import { SuperPort } from '@utils/Ports/SuperPorts/SuperPort';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { getPermissions } from '@utils/Storage/permissions';

import ShareIcon from '@assets/dark/icons/Share.svg';

import { ToastType, useToast } from 'src/context/ToastContext';

import DisplayableSuperPortQRCard from './components/DisplayableSuperPortQRCard';
import {
  useSuperPortActions,
  useSuperPortData,
} from './context/SuperPortContext';


type Props = NativeStackScreenProps<
  NewSuperPortStackParamList,
  'SuperPortQRScreen'
>;

function SuperPortQRScreen({ route, navigation }: Props) {
  console.log('[Rendering SuperPortQRScreen]');
  const { portId, label, limit, permissions, folderId } = route.params;
  const { showToast } = useToast();
  // Set up superport context
  const superPortActions = useSuperPortActions();
  const {
    label: contextLabel,
    permissions: contextPermissions,
    folderId: contextFolderId,
    port,
    limit: contextLimit,
  } = useSuperPortData(state => state);

  //profile information
  const profile = useSelector((state: any) => state.profile.profile);
  const { name, avatar } = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

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

  //Port data is loading
  const [isLoading, setIsLoading] = useState(true);
  //Port data has failed to load
  const [hasFailed, setHasFailed] = useState(false);
  //Error message when port data is not loaded
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //Port data
  const [portData, setPortData] = useState<DirectSuperportBundle | null>(null);
  //Link data
  const [linkData, setLinkData] = useState<string | null>(null);

  const shouldGoBack = useMemo(() => {
    return portId ? true : false;
  }, [portId]);

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
        if (portId) {
          // retrieve superport data from portId
          console.log('Retrieving superport data from portId');
          const superPortClass = await SuperPort.generator.fromPortId(portId);
          const superPortClassData = superPortClass.getPort();
          const superPortPermissions = await getPermissions(
            superPortClassData.permissionsId,
          );
          superPortActions.setPermissions(superPortPermissions);
          superPortActions.setFolderId(superPortClassData.folderId);
          superPortActions.setLabel(superPortClassData.label || DEFAULT_NAME);
          superPortActions.setLimit(superPortClassData.connectionsLimit || 0);
          superPortActions.setPort(superPortClass);
        } else if (permissions && label && limit && folderId) {
          console.log('Creating new superport from params');
          superPortActions.setPermissions(permissions);
          superPortActions.setFolderId(folderId);
          superPortActions.setLabel(label);
          superPortActions.setLimit(limit || 0);
          await onCreateSuperPort();
        }
      } catch (error: any) {
        console.log('Error initializing superport qr screen', error);
        setIsLoading(false);
        setHasFailed(true);
        setErrorMessage(
          'Error fetching Port: ' + error?.message || 'Unknown error',
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(async () => {
    if (port) {
      try {
        const bundle = await port.getShareableBundle(name);
        setPortData(bundle);
        setLinkData(jsonToUrl(bundle as any));
        setIsLoading(false);
        try {
          setLinkData(await port.getShareableLink(name));
        } catch (error) {
          console.log('Error fetching superport link', error);
        }
      } catch (error: any) {
        console.log('Error fetching superport data', error);
        setIsLoading(false);
        setHasFailed(true);
        setErrorMessage(
          'Error fetching Port: ' + error?.message || 'Unknown error',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [port]);

  const onCreateSuperPort = async () => {
    console.log('Creating new superport');
    if (port) {
      throw new Error('SuperPort already exists');
    }
    if (
      !(contextLabel || label) ||
      !(contextLimit || limit) ||
      !(contextFolderId || folderId) ||
      !(contextPermissions || permissions)
    ) {
      throw new Error('Missing required parameters to generate a SuperPort');
    }
    const superPortClass = await SuperPort.generator.create(
      (contextLabel || label) as string,
      (contextLimit || limit) as number,
      (contextFolderId || folderId) as string,
      (contextPermissions || permissions) as PermissionsStrict,
    );
    superPortActions.setPort(superPortClass);
  };

  const onCopyClicked = () => {
    Clipboard.setString(linkData || '');
    showToast('Port link copied to clipboard', ToastType.success);
  };

  const onSettingsPress = () => {
    navigation.navigate('SuperPortSettingsScreen');
  };

  const onClosePress = () => {
    if (shouldGoBack) {
      navigation.goBack();
    } else {
      // Reset the navigation state to go back to a common parent and then navigate to the desired screen
      (navigation as any).reset({
        index: 0,
        routes: [
          {
            name: 'HomeTab', // The common parent/root screen
          },
        ],
      });
    }
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
      const uri = await (viewShotRef.current as any).capture();
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
      const uri = await (viewShotRef.current as any).capture();
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
              isLoading={isLoading}
              hasFailed={hasFailed}
              name={name}
              errorMessage={errorMessage}
              qrData={portData}
              link={linkData}
              onCopyClicked={onCopyClicked}
              onTryAgainClicked={onCreateSuperPort}
              theme={color.theme}
              superPortName={contextLabel}
              labelText={
                port
                  ? `Used ${port.getPort().connectionsMade}/${contextLimit || 'Unlimited'
                  }`
                  : ''
              }
            />
            <AvatarBox
              avatarSize="m"
              profileUri={
                (contextPermissions || permissions)?.displayPicture
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
        <ViewShot ref={viewShotRef} options={{ quality: 1, format: 'png' }}>
          <ExportableQRWithPicture
            qrData={portData}
            theme={color.theme}
            profileUri={
              (contextPermissions || permissions)?.displayPicture
                ? avatar.fileUri
                : null
            }
            name={name}
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
