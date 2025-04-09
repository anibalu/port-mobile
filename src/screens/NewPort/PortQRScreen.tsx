import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, ScrollView, StyleSheet, View} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import {useSelector} from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import {useColors} from '@components/colorGuide';
import {GradientScreenView} from '@components/GradientScreenView';
import ExportableQRWithPicture from '@components/QR/ExportableQRWithPicture';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {Spacing} from '@components/spacingGuide';
import TopBarEmptyTitleAndDescription from '@components/Text/TopBarEmptyTitleAndDescription';
import PortLogoAndSettingsTopBar from '@components/TopBars/PortLogoAndSettingsTopBar';

import {DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

import {NewPortStackParamList} from '@navigation/AppStack/NewPortStack/NewPortStackTypes';

import {jsonToUrl} from '@utils/JsonToUrl';
import {PortBundle} from '@utils/Ports/interfaces';
import {Port} from '@utils/Ports/SingleUsePorts/Port';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getPermissions} from '@utils/Storage/permissions';
import {getExpiryTag} from '@utils/Time';

import ShareIcon from '@assets/dark/icons/Share.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

import DisplayablePortQRCard from './components/DisplayablePortQRCard';
import {usePortActions, usePortData} from './context/PortContext';



type Props = NativeStackScreenProps<NewPortStackParamList, 'PortQRScreen'>;

function PortQRScreen({route, navigation}: Props) {
  console.log('[Rendering PortQRScreen]');
  const {contactName, permissions, folderId, portId} = route.params;
  const {showToast} = useToast();
  // Set up port context
  const portActions = usePortActions();
  const {
    contactName: contextContactName,
    permissions: contextPermissions,
    folderId: contextFolderId,
    port,
  } = usePortData(state => state);

  //profile information
  const profile = useSelector((state: any) => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  const color = useColors();
  const styles = styling(color);

  //Port data is loading
  const [isLoading, setIsLoading] = useState(true);
  //Port data has failed to load
  const [hasFailed, setHasFailed] = useState(false);
  //Error message when port data is not loaded
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //Port data
  const [portData, setPortData] = useState<PortBundle | null>(null);
  //Link data
  const [linkData, setLinkData] = useState<string | null>(null);

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

  // Initialize port context with route params
  useEffect(() => {
    (async () => {
      try {
        if (portId) {
          // retrieve port data from portId
          console.log('Retrieving port data from portId');
          const portClass = await Port.generator.fromPortId(portId);
          const portClassData = portClass.getPort();
          const portPermissions = await getPermissions(
            portClassData.permissionsId,
          );
          portActions.setPermissions(portPermissions);
          portActions.setFolderId(portClassData.folderId);
          portActions.setContactName(portClassData.label || DEFAULT_NAME);
          portActions.setPort(portClass);
        } else if (permissions && contactName && folderId) {
          console.log('Creating new port from params');
          portActions.setPermissions(permissions);
          portActions.setFolderId(folderId);
          portActions.setContactName(contactName);
          await onCreatePort();
        }
      } catch (error: any) {
        console.log('Error initializing port qr screen', error);
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
        setErrorMessage('ddd');
        try {
          setLinkData(await port.getShareableLink(name));
        } catch (error) {
          console.log('Error fetching port link', error);
        }
      } catch (error: any) {
        console.log('Error fetching port data', error);
        setIsLoading(false);
        setHasFailed(true);
        setErrorMessage(
          'Error fetching Port: ' + error?.message || 'Unknown error',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [port]);

  const onCreatePort = async () => {
    console.log('Creating new port');
    if (port) {
      throw new Error('Port already exists');
    }
    if (
      !(contextContactName || contactName) ||
      !(contextFolderId || folderId) ||
      !(contextPermissions || permissions)
    ) {
      throw new Error('Missing required parameters to generate a Port');
    }
    const portClass = await Port.generator.create(
      (contextContactName || contactName) as string,
      (contextFolderId || folderId) as string,
      (contextPermissions || permissions) as PermissionsStrict,
    );
    portActions.setPort(portClass);
  };

  const onCopyClicked = () => {
    Clipboard.setString(linkData || '');
    showToast('Port link copied to clipboard', ToastType.success);
  };

  const onSettingsPress = () => {
    navigation.navigate('PortSettingsScreen');
  };

  const onClosePress = () => {
    // Reset the navigation state to go back to a common parent and then navigate to the desired screen
    (navigation as any).reset({
      index: 0,
      routes: [
        {
          name: 'HomeTab', // The common parent/root screen
        },
      ],
    });
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
            <DisplayablePortQRCard
              isLoading={isLoading}
              name={name}
              hasFailed={hasFailed}
              errorMessage={errorMessage}
              qrData={portData}
              link={linkData}
              onCopyClicked={onCopyClicked}
              onTryAgainClicked={onCreatePort}
              theme={color.theme}
              contactName={contextContactName}
              labelText={
                port ? `${getExpiryTag(port.getPort().expiryTimestamp)}` : ''
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
        <PrimaryButton
          Icon={ShareIcon}
          theme={color.theme}
          text={`Share Port with ${contextContactName || contactName}`}
          disabled={false}
          isLoading={shareLoading}
          onClick={captureAndShareQR}
        />
      </View>
      <View style={styles.hiddenContainer}>
        <ViewShot ref={viewShotRef} options={{quality: 1, format: 'png'}}>
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

export default PortQRScreen;
