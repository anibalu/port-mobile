/**
 * QR scanner used in the App.
 */
import TorchOff from '@assets/icons/TorchOff.svg';
import TorchOn from '@assets/icons/TorchOn.svg';
import Area from '@assets/miscellaneous/scanAreaBlue.svg';
import CloseWhite from '@assets/icons/closeWhite.svg';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {checkCameraPermission} from '@utils/AppPermissions';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {checkBundleValidity, readBundle, useReadBundles} from '@utils/Ports';
import {wait} from '@utils/Time';
import {safeModalCloseDuration} from '@configs/constants';
import DefaultLoader from '@components/Reusable/Loaders/DefaultLoader';
import {urlToJson} from '@utils/JsonToUrl';

export default function QRScanner() {
  const device = useCameraDevice('back');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  const [torchState, setTorchState] = useState<'on' | 'off'>('off');
  const [qrData, setQrData] = useState('');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (isScannerActive) {
        if (codes.length > 0 && codes[0].value) {
          const updatedCode = codes[0].value.startsWith('https://')
            ? urlToJson(codes[0].value)
            : codes[0].value;
          setQrData(oldCode =>
            oldCode !== codes[0].value ? updatedCode! : oldCode,
          );
          setIsScannerActive(false);
        }
      }
    },
  });

  const cleanScreen = () => {
    setQrData('');
    setTorchState('off');
  };

  const onRetry = async () => {
    setShowErrorModal(false);
    await wait(safeModalCloseDuration);
    setIsScannerActive(true);
  };

  //on Error, show error bottom sheet
  const onError = () => {
    cleanScreen();
    setIsScannerActive(false);
    setShowErrorModal(true);
  };

  useEffect(() => {
    (async () => {
      if (qrData !== '') {
        try {
          setIsLoading(true);
          console.log('running inner block');
          //qrData needs to be processed here.
          //check if Qr code is a legitimate Port Qr code
          const bundle = checkBundleValidity(JSON.stringify(qrData));
          //if code is legitimate, read it
          await readBundle(bundle);
          //try to use read bundles
          // eslint-disable-next-line react-hooks/rules-of-hooks
          await useReadBundles();
          setIsLoading(false);
          //navigate to home screen
          navigation.navigate('HomeTab');
        } catch (error) {
          setIsLoading(false);
          onError();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  useEffect(() => {
    checkCameraPermission(setIsCameraPermissionGranted);
  }, []);

  return (
    <>
      <CustomStatusBar
        barStyle="light-content"
        backgroundColor={PortColors.primary.black}
      />
      <SafeAreaView style={styles.container}>
        <ErrorBottomSheet
          visible={showErrorModal}
          title={'Incorrect QR code scanned'}
          description={
            'The QR code scanned is not a valid Port QR code. Please scan a Port QR code.'
          }
          onClose={onRetry}
          onTryAgain={onRetry}
        />
        {isCameraPermissionGranted && device && isFocused ? (
          <View style={styles.cameraOptions}>
            <Camera
              device={device}
              torch={torchState}
              codeScanner={codeScanner}
              isActive={isScannerActive}
              style={styles.camera}
            />
            <View style={styles.mainBlock}>
              <Pressable
                onPress={() => navigation.navigate('HomeTab')}
                style={styles.closeButtonWrapper}>
                <CloseWhite width={24} height={24} />
              </Pressable>
              {isLoading ? (
                <DefaultLoader color={PortColors.primary.blue.app} />
              ) : (
                <View style={styles.scanBlock}>
                  <NumberlessText
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}
                    style={styles.text}>
                    Align a Port QR code within the frame
                  </NumberlessText>
                  <Area
                    width={screen.width * 0.8}
                    height={screen.width * 0.8}
                    style={styles.scanArea}
                  />
                  <View>
                    <Torch state={torchState} setState={setTorchState} />
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.permissionDenied}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.closeButtonWrapper}>
              <CloseWhite width={24} height={24} />
            </Pressable>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              style={styles.text}>
              Please provide camera permission
            </NumberlessText>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
//Phone light toggle switch
function Torch({
  state,
  setState,
}: {
  state: 'on' | 'off';
  setState: (state: 'on' | 'off') => void;
}) {
  if (state === 'on') {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('off')}>
        <TorchOn />
      </Pressable>
    );
  } else {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('on')}>
        <TorchOff />
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
    backgroundColor: PortColors.primary.black,
  },
  closeButtonWrapper: {
    position: 'absolute',
    top: PortSpacing.intermediate.top,
    right: PortSpacing.intermediate.right,
  },
  permissionDenied: {
    backgroundColor: PortColors.primary.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PortSpacing.secondary.uniform,
    width: '100%',
    height: '100%',
  },
  text: {
    color: PortColors.primary.white,
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  scanBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBlock: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOptions: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scanArea: {
    borderRadius: 14,
    marginTop: PortSpacing.secondary.top,
    marginBottom: PortSpacing.secondary.bottom,
  },
  roundButton: {
    padding: 15,
    opacity: 1,
  },
});
