import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import { GradientScreenView } from '@components/GradientScreenView';
import ExportableQRWithPicture from '@components/QR/ExportableQRWithPicture';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import { Spacing } from '@components/spacingGuide';
import TopBarEmptyTitleAndDescription from '@components/Text/TopBarEmptyTitleAndDescription';
import PortLogoTopBar from '@components/TopBars/PortLogoTopBar';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

import { DirectContactPortBundle } from '@utils/Ports/interfaces';

import ShareIcon from '@assets/dark/icons/Share.svg';

import { ToastType, useToast } from 'src/context/ToastContext';


import DisplayableContactPortQRCard from './components/DisplayableContactPortQRCard';


type Props = NativeStackScreenProps<
  AppStackParamList,
  'ContactPortQRScreen'
>;

function ContactPortQRScreen({ route, navigation }: Props) {
  console.log('[Rendering ContactPortQRScreen]');
  const { contactName, profileUri, contactPortClass, bundle, link } = route.params;
  const { showToast } = useToast();

  const color = useColors();
  const styles = styling(color);

  //Port data
  const [portData] = useState<DirectContactPortBundle>(bundle);
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
      console.log('contactPortQRScreen useEffect');
      try {
        if (!contactPortClass) {
          throw new Error("Contact Port is not defined");
        }
        try {
          setLinkData(await contactPortClass.getShareableLink());
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
      const shareMessage = `Chat with ${contactName} on Port - here's a link to connect with them: ${linkData}`;
      // Share the image
      await Share.open({
        url: uri,
        title: `${contactName}'s Port`,
        message: shareMessage,
        type: 'image/png',
        subject: `${contactName}'s Port`,
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
      <PortLogoTopBar
        onClosePress={onClosePress}
        theme={color.theme}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarEmptyTitleAndDescription theme={color.theme} />
          <View style={styles.scrollableElementsParent}>
            <DisplayableContactPortQRCard
              name={contactName}
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
              profileUri={profileUri}
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
          text={`Share ${contactName}'s Port`}
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
            profileUri={profileUri}
            name={contactName}
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

export default ContactPortQRScreen;
