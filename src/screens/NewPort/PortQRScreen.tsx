import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import { useSelector } from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { GradientScreenView } from '@components/GradientScreenView';
import ExportableQRWithPicture from '@components/QR/ExportableQRWithPicture';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import { Spacing } from '@components/spacingGuide';
import TopBarEmptyTitleAndDescription from '@components/Text/TopBarEmptyTitleAndDescription';
import PortLogoAndSettingsTopBar from '@components/TopBars/PortLogoAndSettingsTopBar';

import { DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO } from '@configs/constants';

import { NewPortStackParamList } from '@navigation/AppStack/NewPortStack/NewPortStackTypes';

import { PortBundle } from '@utils/Ports/interfaces';
import { getPermissions } from '@utils/Storage/permissions';
import { getExpiryTag } from '@utils/Time';

import ShareIcon from '@assets/dark/icons/Share.svg';

import { ToastType, useToast } from 'src/context/ToastContext';

import DisplayablePortQRCard from './components/DisplayablePortQRCard';
import { usePortDispatch, usePortState } from './context/PortContext';


type Props = NativeStackScreenProps<NewPortStackParamList, 'PortQRScreen'>;

function PortQRScreen({ route, navigation }: Props) {
  console.log('[Rendering PortQRScreen]');
  const { portClass, bundle, link } = route.params;
  const { showToast } = useToast();
  // Set up port context
  const portActions = usePortDispatch();
  const portState = usePortState();

  //profile information
  const profile = useSelector((state: any) => state.profile.profile);
  const { name, avatar } = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  //checks latest new connection
  const latestNewConnection = useSelector(state => state.latestNewConnection);

  const color = useColors();
  const styles = styling(color);

  //Port data
  const [portData] = useState<PortBundle>(bundle);
  //Link data
  const [linkData, setLinkData] = useState<string>(link);

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
      console.log('PortQRScreen useEffect');
      try {
        if (!portClass) {
          throw new Error("Port is not defined");
        }
        const portClassData = portClass.getPort();
        const portPermissions = await getPermissions(
          portClassData.permissionsId,
        );
        portActions({payload: {
          permissions: portPermissions,
          folderId: portClassData.folderId,
          contactName: portClassData.label || DEFAULT_NAME,
          port: portClass,
        }, type: 'SET_CONTEXT'});
        try {
          setLinkData(await portClass.getShareableLink(name));
        } catch (error) {
          console.log('Error fetching port link', error);
        }
      } catch (error: any) {
        console.log('Error initializing port qr screen', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopyClicked = () => {
    Clipboard.setString(linkData || '');
    showToast('Port link copied to clipboard', ToastType.success);
  };

  const onSettingsPress = () => {
    navigation.navigate('PortSettingsScreen');
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

  //navigates to home screen if latest new connection Id matches port Id
  useEffect(() => {
    try {
      if (latestNewConnection) {
        const latestUsedConnectionLinkId = latestNewConnection.connectionLinkId;
        if (portData) {
          if (portData.portId === latestUsedConnectionLinkId) {
            // Reset the navigation state to go back to a common parent and then navigate to the desired screen
            (navigation as any).reset({
              index: 0,
              routes: [
                {
                  name: 'HomeTab', // The common parent/root screen
                },
              ],
            });
            return;
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
            <DisplayablePortQRCard
              isLoading={false}
              name={name}
              hasFailed={false}
              errorMessage={''}
              qrData={portData}
              link={linkData}
              onCopyClicked={onCopyClicked}
              onTryAgainClicked={() => {}}
              theme={color.theme}
              contactName={portState.contactName}
              labelText={
                portState.port ? `${getExpiryTag(portState.port.getPort().expiryTimestamp)}` : ''
              }
            />
            <AvatarBox
              avatarSize="m"
              profileUri={
                (portState.permissions)?.displayPicture
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
          text={`Share Port with ${portState.contactName}`}
          disabled={false}
          isLoading={shareLoading}
          onClick={captureAndShareQR}
        />
      </View>
      <View style={styles.hiddenContainer}>
        <ViewShot ref={viewShotRef} options={{ quality: 1, format: 'png' }}>
          <ExportableQRWithPicture
            qrData={portData}
            theme={color.theme}
            profileUri={
              (portState.permissions)?.displayPicture
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
