/**
 * QR scanner used in the App.
 */
import TorchOff from '@assets/icons/TorchOff.svg';
import TorchOn from '@assets/icons/TorchOn.svg';
import Area from '@assets/miscellaneous/scanAreaBlue.svg';
import CloseWhite from '@assets/icons/closeWhite.svg';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {checkCameraPermission} from '@utils/AppPermissions';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {
  checkBundleValidity,
  processReadBundles,
  readBundle,
} from '@utils/Ports';
import {wait} from '@utils/Time';
import {safeModalCloseDuration} from '@configs/constants';
import DefaultLoader from '@components/Reusable/Loaders/DefaultLoader';
import {urlToJson} from '@utils/JsonToUrl';
import DynamicColors from '@components/DynamicColors';
import ImageIcon from '@assets/icons/GalleryIconWhite.svg';
import {launchImageLibrary} from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';

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
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (isScannerActive) {
        if (codes.length > 0 && codes[0].value) {
          setQrData(oldCode =>
            oldCode !== codes[0].value ? codes[0].value! : oldCode,
          );
          setIsScannerActive(false);
        }
      }
    },
  });

  const cleanScreen = () => {
    setQrData('');
    setTorchState('off');
    setUploadedImageUri(null);
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

  /**
   * read the qr code inside an image.
   */
  async function readQRinImage(imageUri: string): Promise<string> {
    try {
      const response = await RNQRGenerator.detect({
        uri: imageUri,
      });
      if (response.values[0]) {
        return response.values[0];
      } else {
        throw new Error('NotAQRCode');
      }
    } catch (error) {
      return 'ERROR: NO QR DETECTED';
    }
  }
  /**
   * Upload an image from gallery and read the qr code inside it.
   * @returns
   */
  async function uploadFromGallery() {
    setIsScannerActive(false);
    try {
      const selectedAssets = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      // setting uploaded uri for qr detection
      if (
        selectedAssets.assets &&
        selectedAssets.assets[0] &&
        selectedAssets.assets[0].uri
      ) {
        setUploadedImageUri(selectedAssets.assets[0].uri);
        setQrData(await readQRinImage(selectedAssets.assets[0].uri));
      } else {
        throw new Error('No uploaded image');
      }
      return;
    } catch (error) {
      console.error('Nothing selected', error);
      setUploadedImageUri(null);
    }
    setIsScannerActive(true);
  }

  useEffect(() => {
    (async () => {
      if (qrData !== '') {
        try {
          setIsLoading(true);
          const updatedCode = qrData.startsWith('https://')
            ? urlToJson(qrData)
            : JSON.parse(qrData);
          //qrData needs to be processed here.
          //check if Qr code is a legitimate Port Qr code
          const bundle = checkBundleValidity(JSON.stringify(updatedCode));
          //if code is legitimate, read it
          await readBundle(bundle);
          //try to use read bundles

          await processReadBundles();
          setIsLoading(false);
          //navigate to home screen
          navigation.navigate('HomeTab');
        } catch (error) {
          console.log('error scanning qr', error);
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
      <CustomStatusBar backgroundColor={Colors.primary.background} />
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
        {(uploadedImageUri && isFocused) ||
        (isCameraPermissionGranted && device && isFocused) ? (
          <View style={styles.cameraOptions}>
            {uploadedImageUri ? (
              <Image
                style={styles.camera}
                resizeMode={'contain'}
                source={{uri: uploadedImageUri}}
              />
            ) : (
              isCameraPermissionGranted &&
              device && (
                <Camera
                  device={device}
                  torch={torchState}
                  codeScanner={codeScanner}
                  isActive={isScannerActive}
                  style={styles.camera}
                />
              )
            )}
            <View style={styles.mainBlock}>
              <Pressable
                onPress={() => navigation.navigate('HomeTab')}
                style={styles.closeButtonWrapper}>
                <CloseWhite width={24} height={24} />
              </Pressable>
              {isLoading ? (
                <DefaultLoader color={Colors.primary.accent} />
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
                  <View style={styles.optionButtons}>
                    <View>
                      {isCameraPermissionGranted &&
                        device &&
                        !uploadedImageUri && (
                          <Torch
                            styles={styles}
                            state={torchState}
                            setState={setTorchState}
                          />
                        )}
                    </View>
                    <Pressable
                      style={styles.uploadButton}
                      onPress={uploadFromGallery}>
                      <ImageIcon width={24} height={24} />
                    </Pressable>
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
            <Pressable style={styles.uploadButton} onPress={uploadFromGallery}>
              <ImageIcon width={24} height={24} />
            </Pressable>
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
  styles,
}: {
  state: 'on' | 'off';
  setState: (state: 'on' | 'off') => void;
  styles: any;
}) {
  if (state === 'on') {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('off')}>
        <TorchOn width={24} height={24} />
      </Pressable>
    );
  } else {
    return (
      <Pressable style={styles.roundButton} onPress={() => setState('on')}>
        <TorchOff width={24} height={24} />
      </Pressable>
    );
  }
}

const styling = colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 0,
      backgroundColor: colors.primary.black,
    },
    closeButtonWrapper: {
      position: 'absolute',
      top: PortSpacing.intermediate.top,
      right: PortSpacing.intermediate.right,
    },
    permissionDenied: {
      backgroundColor: colors.primary.black,
      justifyContent: 'center',
      alignItems: 'center',
      padding: PortSpacing.secondary.uniform,
      width: '100%',
      height: '100%',
    },
    text: {
      color: colors.primary.white,
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
    uploadButton: {
      padding: PortSpacing.medium.uniform,
    },
    optionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
