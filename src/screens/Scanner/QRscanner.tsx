/**
 * QR scanner used in the App.
 */
import TorchOff from '@assets/icons/TorchOff.svg';
import TorchOn from '@assets/icons/TorchOn.svg';
import Cross from '@assets/icons/cross.svg';
import SuccessQR from '@assets/icons/successqr.svg';
import Area from '@assets/miscellaneous/scanArea.svg';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import GenericInput from '@components/GenericInput';
import GenericModal from '@components/GenericModal';
import {
  NumberlessBoldText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {checkCameraPermission} from '@utils/AppPermissions';
import {
  checkConnectionBundleDataFormat,
  processConnectionBundle,
} from '@utils/Bundles';
import {BundleReadResponse, ConnectionBundle} from '@utils/Bundles/interfaces';
import {ConnectionType} from '@utils/Connections/interfaces';
import React, {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, View} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import {useConnectionModal} from 'src/context/ConnectionModalContext';

export default function QRScanner() {
  const {newPortModalVisible: modalVisible} = useConnectionModal();
  const navigation = useNavigation();
  const [label, setLabel] = useState('');
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(false);
  useEffect(() => {
    checkCameraPermission(setIsCameraPermissionGranted);
  }, []);
  const [viewWidth, setViewWidth] = useState(0);
  const [qrData, setQrData] = useState('');
  const [torchState, setTorchState] = useState('off');
  const [scanCode, setScanCode] = useState(true);
  const [showScannedModal, setShowScannedModal] = useState<boolean>(false);
  const [qrParsed, setQrParsed] = useState<ConnectionBundle | undefined>(
    undefined,
  );
  const isFocused = useIsFocused();

  const cleanScanModal = () => {
    setLabel('');
    setQrData('');
    setTorchState('off');
    setQrParsed(undefined);
    setShowScannedModal(false);
    setScanCode(true);
  };
  //shows an alert if there is an issue creating a new Port after scanning a QR code.
  const showAlertAndWait = (bundleReadResponse: BundleReadResponse) => {
    if (bundleReadResponse === BundleReadResponse.networkError) {
      Alert.alert(
        'Network Error in creating new Port.',
        'QR code data has been saved and a connection will be attempted again when network improves.',
        [
          {
            text: 'OK',
            onPress: () => {
              cleanScanModal();
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        'Incorrect OR data format',
        'QR code not a numberless QR code',
        [
          {
            text: 'OK',
            onPress: () => {
              cleanScanModal();
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  //navigate to back to home screen is scan succeeds and an unauthenticated port is created.
  useEffect(() => {
    if (qrData !== '') {
      //this makes scan happen only once
      try {
        const newBundle = checkConnectionBundleDataFormat(qrData);
        setQrParsed(newBundle);
        setShowScannedModal(true);
      } catch (error) {
        showAlertAndWait(BundleReadResponse.formatError);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);
  const onLayout = event => {
    const {width} = event.nativeEvent.layout;
    setViewWidth(width);
  };
  const saveNewConnection = async () => {
    if (qrParsed) {
      const saveResponse = await processConnectionBundle(qrParsed, label);
      if (saveResponse === BundleReadResponse.networkError) {
        showAlertAndWait(BundleReadResponse.networkError);
      }
      if (saveResponse === BundleReadResponse.success) {
        navigation.navigate('HomeTab', {screen: 'ChatTab'});
        cleanScanModal();
      }
    } else {
      showAlertAndWait(BundleReadResponse.formatError);
    }
  };
  const checkSavePossible = () => {
    if (qrParsed) {
      switch (qrParsed.connectionType) {
        case ConnectionType.direct:
          if (label.trim().length > 0) {
            return true;
          }
          return false;
        case ConnectionType.group:
          return true;
        case ConnectionType.superport:
          if (label.trim().length > 0) {
            return true;
          }
          return false;
        default:
          return false;
      }
    }
    return false;
  };
  return (
    <View style={styles.container} onLayout={onLayout}>
      {isCameraPermissionGranted && isFocused ? (
        <Camera
          cameraType="back"
          flashMode="off"
          focusMode="on"
          zoomMode="on"
          torchMode={torchState}
          saveToCameraRoll={false}
          style={styles.camera}
          scanBarcode={scanCode && !modalVisible}
          onReadCode={event => {
            setScanCode(false);
            setQrData(event.nativeEvent.codeStringValue);
          }}
        />
      ) : (
        <View style={styles.permissionDenied}>
          <NumberlessRegularText style={styles.text}>
            Please provide camera permission
          </NumberlessRegularText>
        </View>
      )}
      <View style={styles.cameraOptions}>
        <Area
          width={viewWidth * 0.7}
          height={viewWidth * 0.7}
          style={styles.scanArea}
        />
      </View>
      <View style={styles.torch}>
        <Torch state={torchState} setState={setTorchState} />
      </View>
      <GenericModal visible={showScannedModal} onClose={cleanScanModal}>
        <View style={styles.successIndicatorArea}>
          <Pressable
            style={styles.closeButton}
            onPress={() => cleanScanModal()}>
            <Cross />
          </Pressable>
          <SuccessQR />
          <NumberlessRegularText style={styles.scanSuccessText}>
            Scan successful
          </NumberlessRegularText>
          <View style={styles.newPortArea}>
            <NumberlessBoldText>
              {(() => {
                if (qrParsed) {
                  switch (qrParsed.connectionType) {
                    case ConnectionType.direct:
                      return 'Connecting over Port with';
                    case ConnectionType.group:
                      return 'Joining group';
                    case ConnectionType.superport:
                      return 'Connecting over SuperPort with';
                    default:
                      return 'Connection type unknown';
                  }
                } else {
                  return 'Connection type unknown';
                }
              })()}
            </NumberlessBoldText>
            {qrParsed !== undefined &&
              qrParsed.connectionType === ConnectionType.group && (
                <View style={styles.savedInput}>
                  <NumberlessBoldText style={styles.savedInputText}>
                    {qrParsed.data.name || 'group'}
                  </NumberlessBoldText>
                </View>
              )}
            {qrParsed !== undefined &&
              qrParsed.connectionType !== ConnectionType.group && (
                <GenericInput
                  text={label}
                  wrapperStyle={{marginVertical: 15, paddingHorizontal: '8%'}}
                  inputStyle={{...FontSizes[15].medium}}
                  setText={setLabel}
                  placeholder="Contact Name"
                />
              )}
            {qrParsed !== undefined &&
              qrParsed.connectionType === ConnectionType.group && (
                <View style={styles.savedDescription}>
                  <NumberlessRegularText
                    style={styles.savedDescriptionText}
                    numberOfLines={5}
                    ellipsizeMode="tail">
                    {qrParsed.data.description || 'No description available'}
                  </NumberlessRegularText>
                </View>
              )}
            <Pressable
              style={
                !checkSavePossible() ? styles.disabledbutton : styles.button
              }
              disabled={!checkSavePossible()}
              onPress={saveNewConnection}>
              <NumberlessMediumText style={styles.buttontext}>
                Save
              </NumberlessMediumText>
            </Pressable>
          </View>
        </View>
      </GenericModal>
    </View>
  );
}
//Phone light toggle switch
function Torch({state, setState}) {
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
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  permissionDenied: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '5%',
    paddingRight: '5%',
    paddingBottom: 100,
    width: '100%',
  },
  successIndicatorArea: {
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    backgroundColor: PortColors.primary.grey.light,
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanSuccessText: {
    color: PortColors.primary.success,
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  newPortArea: {
    backgroundColor: PortColors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 30,
    paddingBottom: 30,
  },
  groupName: {
    textAlign: 'center',
    color: '#547CEF',
  },
  text: {
    color: '#FFFFFF',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  cameraOptions: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    marginBottom: 100,
    borderRadius: 14,
  },
  torch: {
    position: 'absolute',
    paddingBottom: 150,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  input: {
    width: '85%',
    height: 60,
    ...FontSizes[17].bold,
    backgroundColor: '#F6F6F6',
    textAlign: 'center',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  roundButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 50,
    opacity: 0.5,
  },
  popUpArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  saveButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  disabledbutton: {
    backgroundColor: '#547CEF',
    width: '85%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: 0.7,
    flexDirection: 'row',
  },
  buttontext: {
    color: 'white',
    fontSize: 15,
    width: '80%',
    textAlign: 'center',
  },
  savedInput: {
    width: '85%',
    height: 60,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
  },
  savedInputText: {
    textAlign: 'center',
    color: '#000000',
  },
  savedDescription: {
    width: '85%',
    height: 150,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  savedDescriptionText: {
    textAlign: 'center',
    color: '#000000',
    height: '100%',
    padding: 15,
  },
});
