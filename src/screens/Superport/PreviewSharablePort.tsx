import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import CloseWhite from '@assets/icons/closeWhite.svg';
import Upload from '@assets/icons/Upload.svg';
import Download from '@assets/icons/BlackDownload.svg';
import GreenTick from '@assets/icons/GreenTick.svg';
import {SafeAreaView} from '@components/SafeAreaView';
import Logo from '@assets/miscellaneous/portBranding.svg';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import Share from 'react-native-share';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import ShareablePortCard from '@components/Reusable/ConnectionCards/ShareablePortCard';
import ViewShot from 'react-native-view-shot';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AppStackParamList, 'PreviewShareablePort'>;

const PreviewShareablePort = ({route, navigation}: Props) => {
  const {title, qrData, linkData, profileUri} = route.params;
  const viewShotRef = useRef();
  const [showSuccessDownloaded, setShowSuccessDownloaded] = useState(false);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef?.current.capture();
      const shareOptions = {
        title: 'Share a Superport',
        message:
          `${title} would like to connect with you on Port! Click the link or scan QR to start chatting: \n` +
          linkData,
        url: uri,
        failOnCancel: false,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing content: ', error);
    }
  };
  async function savePicture() {
    try {
      const uri = await viewShotRef?.current.capture();
      await CameraRoll.saveAsset(uri, {type: 'photo'});
      setShowSuccessDownloaded(true);
    } catch (error) {
      console.log('Error downloading content', error);
      setShowSuccessDownloaded(false);
    }
  }

  useEffect(() => {
    //   to make the view disappear in 1.5 seconds
    const timer = setTimeout(() => {
      setShowSuccessDownloaded(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showSuccessDownloaded]);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.blue.app}
      />
      <SafeAreaView style={styles.screen}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            alignSelf: 'flex-end',
            marginRight: PortSpacing.intermediate.right,
            marginTop: PortSpacing.intermediate.top,
          }}>
          <CloseWhite width={24} height={24} />
        </Pressable>
        <ViewShot
          style={{backgroundColor: PortColors.primary.blue.app}}
          ref={viewShotRef}
          options={{format: 'jpg', quality: 0.9}}>
          <Logo
            height={50}
            width={150}
            style={{
              alignSelf: 'center',
              marginTop: PortSpacing.intermediate.top,
            }}
          />
          <View style={styles.content}>
            <ShareablePortCard
              title={title}
              qrData={qrData}
              profileUri={profileUri}
            />
          </View>
        </ViewShot>
        <View style={styles.buttons}>
          <View style={{width: '50%', paddingRight: 4}}>
            <PrimaryButton
              Icon={Upload}
              primaryButtonColor="w"
              onClick={handleShare}
              buttonText="Share QR"
              disabled={false}
              isLoading={false}
            />
          </View>
          <View style={{width: '50%', paddingLeft: 4}}>
            <PrimaryButton
              Icon={Download}
              primaryButtonColor="w"
              onClick={async () => await savePicture()}
              buttonText="Download QR"
              disabled={false}
              isLoading={false}
            />
          </View>
        </View>
        {showSuccessDownloaded && (
          <View style={styles.successDownload}>
            <GreenTick style={{marginRight: 12}} />
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.s}>
              QR code has downloaded to your gallery
            </NumberlessText>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PortColors.primary.blue.app,
  },
  successDownload: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginTop: PortSpacing.primary.top,
  },
  content: {
    marginTop: 40,
    padding: PortSpacing.secondary.uniform,
  },
  card: {
    marginHorizontal: 12,
  },
});

export default PreviewShareablePort;
