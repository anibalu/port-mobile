import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import RNQRGenerator from 'rn-qr-generator';

import {useThemeColors} from '@components/colorGuide';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import DefaultLoader from '@components/Reusable/Loaders/DefaultLoader';
import {SafeAreaView} from '@components/SafeAreaView';
import {Spacing, Width} from '@components/spacingGuide';

import {safeModalCloseDuration} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import {checkCameraPermission} from '@utils/AppPermissions';
import {urlToJson} from '@utils/JsonToUrl';
import {
  checkBundleValidity,
  processReadBundles,
  readBundle,
} from '@utils/Ports';
import {wait} from '@utils/Time';

import CloseWhite from '@assets/icons/closeWhite.svg';
import ImageIcon from '@assets/icons/GalleryIconWhite.svg';
import TorchOff from '@assets/icons/TorchOff.svg';
import TorchOn from '@assets/icons/TorchOn.svg';
import Area from '@assets/miscellaneous/scanAreaBlue.svg';

type Props = NativeStackScreenProps<AppStackParamList, 'Scan'>;

function QRScanner({navigation}: Props) {
  //camera device
  const device = useCameraDevice('back');
  //show error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  //error message
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    null,
  );
  //camera permission status
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  //torch state
  const [torchState, setTorchState] = useState<'on' | 'off'>('off');
  //qr data
  const [qrData, setQrData] = useState('');
  //is focused
  const isFocused = useIsFocused();
  //is scanner active
  const [isScannerActive, setIsScannerActive] = useState(true);
  //is loading
  const [isLoading, setIsLoading] = useState(false);
  //uploaded image uri
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);

  const colors = useThemeColors('dark');
  const styles = styling(colors);

  //scan the QR and load up the data into qrData
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

  //clean the screen
  const cleanScreen = () => {
    setQrData('');
    setTorchState('off');
    setErrorMessage(null);
    setUploadedImageUri(null);
  };

  //retry the scan
  const onRetry = async () => {
    setShowErrorModal(false);
    setErrorMessage(null);
    await wait(safeModalCloseDuration);
    setIsScannerActive(true);
  };

  //on Error, show error bottom sheet with error message
  const onError = (errorMessage?: string | null) => {
    cleanScreen();
    setIsScannerActive(false);
    setErrorMessage(errorMessage);
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

  //process the qr data
  useEffect(() => {
    (async () => {
      if (qrData && qrData !== '') {
        try {
          setIsLoading(true);
          const updatedCode = qrData.startsWith('https://')
            ? urlToJson(qrData)
            : JSON.parse(qrData); //for really old qr codes
          //check if Qr code is a legitimate Port Qr code
          const bundle = checkBundleValidity(JSON.stringify(updatedCode));
          //if code is legitimate, read it
          await readBundle(bundle);
          //try to use read bundles
          await processReadBundles();
          setIsLoading(false);
          //navigate to home screen
          navigation.push('HomeTab');
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
      <CustomStatusBar
        theme={colors.theme}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        backgroundColor={colors.background}
        bottomNavigationBarColor={colors.background}
        modifyNavigationBarColor={true}>
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
                onPress={() => navigation.goBack()}
                style={styles.closeButtonWrapper}>
                <CloseWhite width={24} height={24} />
              </Pressable>
              {isLoading ? (
                <DefaultLoader color={colors.accent} />
              ) : (
                <View style={styles.scanBlock}>
                  <NumberlessText
                    fontWeight={FontWeight.rg}
                    fontSizeType={FontSizeType.m}
                    style={styles.text}>
                    Align a Port QR code within the frame
                  </NumberlessText>
                  <Area
                    width={Width.screen * 0.8}
                    height={Width.screen * 0.8}
                    style={styles.scanArea}
                  />
                  <View style={styles.optionButtons}>
                    <View>
                      {isCameraPermissionGranted &&
                        device &&
                        !uploadedImageUri && (
                          <Torch
                            torchState={torchState}
                            setTorchState={setTorchState}
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
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}
              style={styles.text}>
              Please provide camera permission
            </NumberlessText>
            <Pressable style={styles.uploadButton} onPress={uploadFromGallery}>
              <ImageIcon width={24} height={24} />
            </Pressable>
          </View>
        )}
        <ErrorBottomSheet
          visible={showErrorModal}
          title={'Invalid Port Scanned'}
          description={
            errorMessage ||
            'The QR code scanned is not a valid Port QR code. Please scan a Port QR code.'
          }
          onClose={onRetry}
          onTryAgain={onRetry}
        />
      </SafeAreaView>
    </>
  );
}

export default QRScanner;

/**
 * A component that renders a torch icon and a button to toggle the torch state.
 * @param torchState - The current state of the torch.
 * @param setTorchState - A function to set the torch state.
 * @param styles - The styles for the component.
 * @returns A component that renders a torch icon and a button to toggle the torch state.
 */
function Torch({
  torchState,
  setTorchState,
}: {
  torchState: 'on' | 'off';
  setTorchState: (state: 'on' | 'off') => void;
}) {
  return torchState === 'on' ? (
    <Pressable
      style={torchStyles.roundButton}
      onPress={() => setTorchState('off')}>
      <TorchOn width={24} height={24} />
    </Pressable>
  ) : (
    <Pressable
      style={torchStyles.roundButton}
      onPress={() => setTorchState('on')}>
      <TorchOff width={24} height={24} />
    </Pressable>
  );
}

const torchStyles = StyleSheet.create({
  roundButton: {
    padding: Spacing.m,
    opacity: 1,
  },
});

const styling = (colors: any) =>
  StyleSheet.create({
    closeButtonWrapper: {
      position: 'absolute',
      top: Spacing.xl,
      right: Spacing.xl,
    },
    permissionDenied: {
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.l,
      width: '100%',
      height: '100%',
    },
    text: {
      color: colors.white,
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
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    roundButton: {
      padding: Spacing.m,
      opacity: 1,
    },
    uploadButton: {
      padding: Spacing.l,
    },
    optionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
